// Servicio de almacenamiento persistente para configuraciones de islas
import { IslandId } from '../types/vpd-types';

export interface IslandConfig {
  cropType: string;
  week: number;
}

export interface SectorConfig {
  [key: string]: IslandConfig; // key es IslandId
}

export interface StoredConfigs {
  [sector: string]: SectorConfig; // sector es "Parcela 1", "Parcela 2", etc.
}

class ConfigStorageService {
  private static instance: ConfigStorageService;
  private readonly STORAGE_KEY = 'vpd_island_configs';
  
  private constructor() {}
  
  static getInstance(): ConfigStorageService {
    if (!ConfigStorageService.instance) {
      ConfigStorageService.instance = new ConfigStorageService();
    }
    return ConfigStorageService.instance;
  }
  
  // Obtener configuración para un sector específico
  getSectorConfig(sector: string): SectorConfig | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;
      
      const configs: StoredConfigs = JSON.parse(stored);
      return configs[sector] || null;
    } catch (error) {
      console.error('Error loading sector config:', error);
      return null;
    }
  }
  
  // Guardar configuración para un sector específico
  saveSectorConfig(sector: string, config: SectorConfig): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const configs: StoredConfigs = stored ? JSON.parse(stored) : {};
      
      configs[sector] = config;
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configs));
      console.log(`Configuración guardada para ${sector}:`, config);
    } catch (error) {
      console.error('Error saving sector config:', error);
    }
  }
  
  // Actualizar configuración de una isla específica en un sector
  updateIslandConfig(
    sector: string, 
    islandId: IslandId, 
    cropType: string, 
    week: number
  ): void {
    try {
      const currentConfig = this.getSectorConfig(sector) || {};
      
      currentConfig[islandId] = { cropType, week };
      
      this.saveSectorConfig(sector, currentConfig);
    } catch (error) {
      console.error('Error updating island config:', error);
    }
  }
  
  // Obtener configuración de una isla específica
  getIslandConfig(sector: string, islandId: IslandId): IslandConfig | null {
    const sectorConfig = this.getSectorConfig(sector);
    return sectorConfig?.[islandId] || null;
  }
  
  // Limpiar configuración de un sector
  clearSectorConfig(sector: string): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return;
      
      const configs: StoredConfigs = JSON.parse(stored);
      delete configs[sector];
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configs));
      console.log(`Configuración limpiada para ${sector}`);
    } catch (error) {
      console.error('Error clearing sector config:', error);
    }
  }
  
  // Limpiar todas las configuraciones
  clearAllConfigs(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('Todas las configuraciones han sido limpiadas');
    } catch (error) {
      console.error('Error clearing all configs:', error);
    }
  }
  
  // Obtener todas las configuraciones almacenadas
  getAllConfigs(): StoredConfigs {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error getting all configs:', error);
      return {};
    }
  }
}

export const configStorageService = ConfigStorageService.getInstance();