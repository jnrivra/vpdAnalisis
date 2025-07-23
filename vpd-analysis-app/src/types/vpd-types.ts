// Tipos para la aplicación VPD

export interface IslandData {
  temperature: number;
  humidity: number;
  vpd: number;
}

export interface DehumidifierData {
  [key: string]: number; // e.g., "I1_Oriente": 4200
}

export interface VPDRecord {
  time: string; // ISO timestamp
  hour: number;
  minute: number;
  islands: {
    I1: IslandData;
    I2: IslandData;
    I3: IslandData;
    I4: IslandData;
    I5: IslandData;
    I6: IslandData;
  };
  dehumidifiers: DehumidifierData;
}

export interface IslandStatistics {
  temperature: {
    min: number;
    max: number;
    avg: number;
  };
  humidity: {
    min: number;
    max: number;
    avg: number;
  };
  vpd: {
    min: number;
    max: number;
    avg: number;
  };
  optimal_time_percentage: number; // percentage
  problems: string[];
}

export interface VPDStatistics {
  I1: IslandStatistics;
  I2: IslandStatistics;
  I3: IslandStatistics;
  I4: IslandStatistics;
  I5: IslandStatistics;
  I6: IslandStatistics;
}

export interface VPDMetadata {
  date: string;
  totalRecords: number;
  timeInterval: string;
  islands: string[];
}

export interface VPDData {
  metadata: VPDMetadata;
  data: VPDRecord[];
  statistics: VPDStatistics;
}

// Tipos para configuración de semanas (basado en tu HTML)
export interface WeekConfig {
  name: string;
  icon: string;
  vpdRange: string;
  focus: string;
  optimalMin: number;
  optimalMax: number;
  acceptableMin: number;
  acceptableMax: number;
  dayTemp: string;
  dayRH: string;
  nightTemp: string;
  nightRH: string;
  nightVPD: string;
  color: string;
}

export interface WeekConfigs {
  [key: number]: WeekConfig;
}

// Tipos para análisis VPD
export interface VPDAnalysisResult {
  island: string;
  currentVPD: number;
  targetVPD: number;
  recommendedHumidity: number;
  currentTemperature: number;
  humidityAdjustment: number;
  status: 'optimal' | 'acceptable' | 'needs_adjustment';
}

// Tipos para períodos del día
export type DayPeriod = 'day' | 'night' | 'full';

// Tipos para selección de islas
export type IslandId = 'I1' | 'I2' | 'I3' | 'I4' | 'I5' | 'I6';

export type IslandSelection = {
  [key in IslandId]: boolean;
};

// Configuración de semanas por isla basado en el estado real del cultivo
export const islandWeekAssignments = {
  I1: 3, // Week 3 - Máxima biomasa (Albahaca 100% ocupada)
  I2: 2, // Week 2 - Desarrollo foliar (Albahaca 100% ocupada)
  I3: 1, // Week 1 - Establecimiento radicular (Mixto, parcialmente vacía)
  I4: 3, // Week 3 - Máxima biomasa (Mixto, parcialmente vacía)
  I5: 0, // VACÍA - Sin cultivo activo
  I6: 1  // Week 1 - Establecimiento radicular (Mixto 100% ocupada)
};