/**
 * Servicio Centralizado de Datos VPD
 * 
 * Este servicio maneja todas las consultas de datos de manera eficiente,
 * evitando múltiples lecturas del archivo JSON y proporcionando
 * una interfaz unificada para todos los componentes.
 */

import { VPDData, VPDRecord, TimeBlock, IslandId } from '../types/vpd-types';

class VPDDataService {
  private static instance: VPDDataService;
  private cachedData: VPDData | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  private constructor() {}

  static getInstance(): VPDDataService {
    if (!VPDDataService.instance) {
      VPDDataService.instance = new VPDDataService();
    }
    return VPDDataService.instance;
  }

  /**
   * Obtiene los datos completos con caché inteligente
   */
  async getData(): Promise<VPDData> {
    const now = Date.now();
    
    // Si tenemos datos en caché y no han expirado, los devolvemos
    if (this.cachedData && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.cachedData;
    }

    // Si no, hacemos fetch de los datos
    try {
      const response = await fetch('/vpd-data.json');
      const data = await response.json();
      
      // Procesamos y enriquecemos los datos una sola vez
      this.cachedData = this.processData(data);
      this.lastFetch = now;
      
      return this.cachedData;
    } catch (error) {
      console.error('Error loading VPD data:', error);
      throw error;
    }
  }

  /**
   * Procesa los datos para añadir campos calculados
   */
  private processData(rawData: any): VPDData {
    const processedData = {
      ...rawData,
      data: rawData.data.map((record: any) => ({
        ...record,
        // Añadimos campos calculados que se usan frecuentemente
        dayPeriod: this.getDayPeriod(record.hour),
        timeBlock: this.getTimeBlock(record.hour),
        formattedTime: this.formatTime(record.time),
      }))
    };
    
    return processedData;
  }

  /**
   * Determina el período del día basado en la hora
   */
  private getDayPeriod(hour: number): 'day' | 'night' {
    return (hour >= 23 || hour < 17) ? 'day' : 'night';
  }

  /**
   * Determina el bloque temporal basado en la hora
   */
  private getTimeBlock(hour: number): TimeBlock {
    if (hour >= 17 && hour <= 23) return 'noche_planta';
    return 'dia_planta';
  }

  /**
   * Formatea el tiempo para mostrar
   */
  private formatTime(time: string): string {
    const date = new Date(time);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  /**
   * Obtiene datos filtrados por período
   */
  async getDataByPeriod(period: 'day' | 'night' | 'full'): Promise<VPDRecord[]> {
    const data = await this.getData();
    
    if (period === 'full') {
      return data.data;
    }
    
    return data.data.filter(record => {
      const hour = record.hour;
      if (period === 'day') {
        return hour >= 23 || hour < 17;
      } else {
        return hour >= 17 && hour < 23;
      }
    });
  }

  /**
   * Obtiene datos filtrados por bloque temporal
   */
  async getDataByTimeBlock(block: TimeBlock): Promise<VPDRecord[]> {
    const data = await this.getData();
    
    return data.data.filter(record => {
      const hour = record.hour;
      switch (block) {
        case 'noche_planta':
          return hour >= 17 && hour <= 23;
        case 'dia_planta':
          return hour >= 0 && hour < 17;
        default:
          return true;
      }
    });
  }

  /**
   * Obtiene estadísticas precalculadas para un conjunto de datos
   */
  calculateStatistics(records: VPDRecord[], islandIds: IslandId[]) {
    const stats: any = {};
    
    islandIds.forEach(islandId => {
      const values = records.map(r => r.islands[islandId]);
      const vpdValues = values.map(v => v.vpd).filter(v => v !== undefined);
      const tempValues = values.map(v => v.temperature).filter(v => v !== undefined);
      const humidityValues = values.map(v => v.humidity).filter(v => v !== undefined);
      
      stats[islandId] = {
        vpd: {
          avg: this.average(vpdValues),
          min: Math.min(...vpdValues),
          max: Math.max(...vpdValues),
          std: this.standardDeviation(vpdValues)
        },
        temperature: {
          avg: this.average(tempValues),
          min: Math.min(...tempValues),
          max: Math.max(...tempValues),
          std: this.standardDeviation(tempValues)
        },
        humidity: {
          avg: this.average(humidityValues),
          min: Math.min(...humidityValues),
          max: Math.max(...humidityValues),
          std: this.standardDeviation(humidityValues)
        }
      };
    });
    
    return stats;
  }

  /**
   * Calcula el promedio de un array de números
   */
  private average(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  /**
   * Calcula la desviación estándar
   */
  private standardDeviation(arr: number[]): number {
    if (arr.length === 0) return 0;
    const avg = this.average(arr);
    const squareDiffs = arr.map(value => Math.pow(value - avg, 2));
    return Math.sqrt(this.average(squareDiffs));
  }

  /**
   * Limpia la caché (útil para forzar recarga)
   */
  clearCache(): void {
    this.cachedData = null;
    this.lastFetch = 0;
  }

}

// Exportamos una instancia única del servicio
export const vpdDataService = VPDDataService.getInstance();

// También exportamos funciones de conveniencia
export const getData = () => vpdDataService.getData();
export const getDataByPeriod = (period: 'day' | 'night' | 'full') => 
  vpdDataService.getDataByPeriod(period);
export const getDataByTimeBlock = (block: TimeBlock) => 
  vpdDataService.getDataByTimeBlock(block);
export const calculateStatistics = (records: VPDRecord[], islandIds: IslandId[]) =>
  vpdDataService.calculateStatistics(records, islandIds);
