/**
 * Convertidor de Excel a formato JSON VPD
 * Mantiene compatibilidad total con el sistema actual
 */

import * as XLSX from 'xlsx';

export interface ExcelRow {
  Time: number; // Excel date number
  'I1 Temperatura Promedio'?: number;
  'I2 Temperatura Promedio'?: number;
  'I3 Temperatura Promedio'?: number;
  'I4 Temperatura Promedio'?: number;
  'I5 Temperatura Promedio'?: number;
  'I6 Temperatura Promedio'?: number;
  'I1 Humedad Promedio'?: number;
  'I2 Humedad Promedio'?: number;
  'I3 Humedad Promedio'?: number;
  'I4 Humedad Promedio'?: number;
  'I5 Humedad Promedio'?: number;
  'I6 Humedad Promedio'?: number;
  'I1 VPD'?: number;
  'I2 VPD'?: number;
  'I3 VPD'?: number;
  'I4 VPD'?: number;
  'I5 VPD'?: number;
  'I6 VPD'?: number;
  'CO2 Promedio'?: number;
  'I1 Estado Luz'?: number;
  'I2 Estado Luz'?: number;
  'I3 Estado Luz'?: number;
  'I4 Estado Luz'?: number;
  'I5 Estado Luz'?: number;
  'I6 Estado Luz'?: number;
  'Week Number'?: number;
}

export interface ConversionOptions {
  sector: 'Parcela 1' | 'Parcela 2' | 'Parcela 3' | 'Almacigo';
  date?: string; // Formato YYYY-MM-DD, si no se especifica toma todos los días
}

/**
 * Convierte tiempo Excel a fecha JavaScript
 */
function excelDateToJS(excelDate: number): Date {
  // Excel almacena fechas como días desde 1900-01-01
  // Ajuste para el bug de Excel que cuenta 1900 como año bisiesto
  const EXCEL_EPOCH = new Date(1899, 11, 30);
  const msPerDay = 24 * 60 * 60 * 1000;
  return new Date(EXCEL_EPOCH.getTime() + excelDate * msPerDay);
}

/**
 * Formatea fecha a ISO string local (sin cambio de zona horaria)
 */
function formatLocalISOString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/**
 * Convierte datos del Excel al formato VPD actual
 */
export async function convertExcelToVPDFormat(
  file: File | ArrayBuffer,
  options: ConversionOptions
) {
  // Leer el archivo Excel
  const data = file instanceof File ? await file.arrayBuffer() : file;
  const workbook = XLSX.read(data, { type: 'array', cellDates: false });
  
  // Verificar que el sector existe
  if (!workbook.SheetNames.includes(options.sector)) {
    throw new Error(`Sector "${options.sector}" no encontrado en el archivo`);
  }
  
  // Obtener la hoja del sector seleccionado
  const worksheet = workbook.Sheets[options.sector];
  const rawData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);
  
  // Filtrar por fecha si se especifica
  let filteredData = rawData;
  if (options.date) {
    const targetDate = new Date(options.date);
    const targetDateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
    
    filteredData = rawData.filter(row => {
      const rowDate = excelDateToJS(row.Time);
      const rowDateStr = `${rowDate.getFullYear()}-${String(rowDate.getMonth() + 1).padStart(2, '0')}-${String(rowDate.getDate()).padStart(2, '0')}`;
      return rowDateStr === targetDateStr;
    });
  }
  
  // Determinar las islas disponibles según el sector
  const availableIslands = options.sector === 'Almacigo' 
    ? ['I1', 'I2', 'I3', 'I4'] 
    : ['I1', 'I2', 'I3', 'I4', 'I5', 'I6'];
  
  // Convertir al formato VPD
  const vpdRecords = filteredData.map(row => {
    const date = excelDateToJS(row.Time);
    const hour = date.getHours();
    const minute = date.getMinutes();
    
    // Construir objeto de islas
    const islands: any = {};
    availableIslands.forEach(island => {
      const temp = row[`${island} Temperatura Promedio` as keyof ExcelRow];
      const humidity = row[`${island} Humedad Promedio` as keyof ExcelRow];
      const vpd = row[`${island} VPD` as keyof ExcelRow];
      
      if (temp !== undefined && humidity !== undefined && vpd !== undefined) {
        islands[island] = {
          temperature: Number(temp),
          humidity: Number(humidity),
          vpd: Number(vpd)
        };
      }
    });
    
    // Para mantener compatibilidad, llenar islas faltantes con valores por defecto
    const allIslands = ['I1', 'I2', 'I3', 'I4', 'I5', 'I6'];
    allIslands.forEach(island => {
      if (!islands[island]) {
        islands[island] = {
          temperature: 0,
          humidity: 0,
          vpd: 0
        };
      }
    });
    
    // Construir objeto de deshumidificadores (vacío por ahora, no está en el Excel)
    const dehumidifiers: any = {};
    allIslands.forEach(island => {
      dehumidifiers[`${island}_Oriente`] = 0;
      dehumidifiers[`${island}_Poniente`] = 0;
    });
    
    return {
      time: formatLocalISOString(date),
      hour,
      minute,
      islands,
      dehumidifiers,
      // Campos adicionales del Excel
      co2: row['CO2 Promedio'] || 0,
      weekNumber: row['Week Number'] || 0,
      lightStatus: {
        I1: row['I1 Estado Luz'] || 0,
        I2: row['I2 Estado Luz'] || 0,
        I3: row['I3 Estado Luz'] || 0,
        I4: row['I4 Estado Luz'] || 0,
        I5: row['I5 Estado Luz'] || 0,
        I6: row['I6 Estado Luz'] || 0,
      }
    };
  });
  
  // Obtener metadata
  const firstDate = vpdRecords.length > 0 ? vpdRecords[0].time.split('T')[0] : '';
  const lastDate = vpdRecords.length > 0 ? vpdRecords[vpdRecords.length - 1].time.split('T')[0] : '';
  
  // Definir todas las islas
  const allIslands = ['I1', 'I2', 'I3', 'I4', 'I5', 'I6'];
  
  // Construir el objeto final compatible con VPDData
  const vpdData = {
    metadata: {
      date: firstDate,
      endDate: lastDate, // Campo adicional para rango
      sector: options.sector, // Campo adicional para identificar el sector
      totalRecords: vpdRecords.length,
      timeInterval: '5 minutes',
      islands: allIslands,
      processedAt: new Date().toISOString()
    },
    data: vpdRecords
  };
  
  return vpdData;
}

/**
 * Obtiene las fechas únicas disponibles en un sector del Excel
 */
export async function getAvailableDates(
  file: File | ArrayBuffer,
  sector: string
): Promise<string[]> {
  const data = file instanceof File ? await file.arrayBuffer() : file;
  const workbook = XLSX.read(data, { type: 'array', cellDates: false });
  
  if (!workbook.SheetNames.includes(sector)) {
    return [];
  }
  
  const worksheet = workbook.Sheets[sector];
  const rawData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);
  
  // Extraer fechas únicas
  const datesSet = new Set<string>();
  rawData.forEach(row => {
    const date = excelDateToJS(row.Time);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    datesSet.add(dateStr);
  });
  
  return Array.from(datesSet).sort();
}

/**
 * Obtiene los sectores disponibles en el archivo Excel
 */
export async function getAvailableSectors(
  file: File | ArrayBuffer
): Promise<string[]> {
  const data = file instanceof File ? await file.arrayBuffer() : file;
  const workbook = XLSX.read(data, { type: 'array' });
  return workbook.SheetNames;
}