import React, { useMemo, useState } from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
  Bar,
  ReferenceArea
} from 'recharts';
import { VPDData, WeekConfig, DayPeriod, IslandSelection, TimeBlock } from '../types/vpd-types';
import { format, parseISO } from 'date-fns';

interface VPDTemporalAnalysisProps {
  data: VPDData;
}

const VPDTemporalAnalysis: React.FC<VPDTemporalAnalysisProps> = ({
  data
}) => {
  // Estados locales para controles independientes
  const [localPeriod, setLocalPeriod] = useState<DayPeriod>('full');
  const [localTimeBlock, setLocalTimeBlock] = useState<TimeBlock | null>(null);
  const [showEnergyData, setShowEnergyData] = useState(true);
  
  // Estado local para semanas e islas (ya no se usa selectedWeek global)
  // const [selectedWeek, setSelectedWeek] = useState<number>(3);
  const [selectedIslands, setSelectedIslands] = useState<IslandSelection>({
    I1: true,
    I2: true,
    I3: true,
    I4: true,
    I5: true,
    I6: true,
  });
  const [customWeekConfig] = useState<WeekConfig | null>(null);

  // Configuración de semanas por isla (estado dinámico)
  const [islandWeekAssignments, setIslandWeekAssignments] = useState({
    I1: 3, // Week 3 - Máxima biomasa (Albahaca 100% ocupada)
    I2: 2, // Week 2 - Desarrollo foliar (Albahaca 100% ocupada)
    I3: 1, // Week 1 - Establecimiento radicular (Mixto, parcialmente vacía)
    I4: 3, // Week 3 - Máxima biomasa (Mixto, parcialmente vacía)
    I5: 0, // VACÍA - Sin cultivo activo
    I6: 1  // Week 1 - Establecimiento radicular (Mixto 100% ocupada)
  });

  // Configuración de tipo de cultivo por isla
  const [islandCropTypes, setIslandCropTypes] = useState({
    I1: 'albahaca' as 'albahaca' | 'lechuga' | 'mixto',
    I2: 'albahaca' as 'albahaca' | 'lechuga' | 'mixto',
    I3: 'mixto' as 'albahaca' | 'lechuga' | 'mixto',
    I4: 'mixto' as 'albahaca' | 'lechuga' | 'mixto',
    I5: 'mixto' as 'albahaca' | 'lechuga' | 'mixto', // VACÍA pero mantenemos default
    I6: 'mixto' as 'albahaca' | 'lechuga' | 'mixto'
  });

  // Función para cambiar la semana de una isla específica
  const updateIslandWeek = (island: string, week: number) => {
    setIslandWeekAssignments({
      ...islandWeekAssignments,
      [island]: week
    });
  };

  // Función para cambiar el tipo de cultivo de una isla específica
  const updateIslandCropType = (island: string, cropType: 'albahaca' | 'lechuga' | 'mixto') => {
    setIslandCropTypes({
      ...islandCropTypes,
      [island]: cropType
    });
  };

  // Configuraciones específicas por tipo de cultivo
  const cropTypeConfigs = {
    albahaca: {
      name: 'Albahaca',
      icon: '🌿',
      color: '#27ae60',
      weeks: {
        0: { vpdRange: 'N/A', optimalMin: 0.5, optimalMax: 1.5, focus: 'Sin cultivo' },
        1: { vpdRange: '1.05-1.15', optimalMin: 1.05, optimalMax: 1.15, focus: 'Germinación albahaca' },
        2: { vpdRange: '0.95-1.10', optimalMin: 0.95, optimalMax: 1.10, focus: 'Crecimiento vegetativo' },
        3: { vpdRange: '0.85-1.05', optimalMin: 0.85, optimalMax: 1.05, focus: 'Máxima producción aromática' }
      }
    },
    lechuga: {
      name: 'Lechuga',
      icon: '🥬',
      color: '#2ecc71',
      weeks: {
        0: { vpdRange: 'N/A', optimalMin: 0.5, optimalMax: 1.5, focus: 'Sin cultivo' },
        1: { vpdRange: '0.95-1.05', optimalMin: 0.95, optimalMax: 1.05, focus: 'Germinación lechuga' },
        2: { vpdRange: '0.85-0.95', optimalMin: 0.85, optimalMax: 0.95, focus: 'Formación de hojas' },
        3: { vpdRange: '0.75-0.90', optimalMin: 0.75, optimalMax: 0.90, focus: 'Cogollo compacto' }
      }
    },
    mixto: {
      name: 'Mixto',
      icon: '🌱',
      color: '#f39c12',
      weeks: {
        0: { vpdRange: 'N/A', optimalMin: 0.5, optimalMax: 1.5, focus: 'Sin cultivo' },
        1: { vpdRange: '1.00-1.10', optimalMin: 1.00, optimalMax: 1.10, focus: 'Establecimiento general' },
        2: { vpdRange: '0.90-1.00', optimalMin: 0.90, optimalMax: 1.00, focus: 'Desarrollo equilibrado' },
        3: { vpdRange: '0.80-0.95', optimalMin: 0.80, optimalMax: 0.95, focus: 'Producción mixta' }
      }
    }
  };

  const weekConfigs: { [key: number]: WeekConfig } = {
    0: {
      name: 'Sin Cultivo',
      icon: '🏝️',
      vpdRange: 'N/A',
      focus: 'Isla vacía - Modo ahorro energético',
      optimalMin: 0.5,
      optimalMax: 1.5,
      acceptableMin: 0.3,
      acceptableMax: 2.0,
      dayTemp: 'Variable',
      dayRH: 'Variable',
      nightTemp: 'Variable',
      nightRH: 'Variable',
      nightVPD: 'N/A',
      color: '#95a5a6'
    },
    1: {
      name: 'Semana 1',
      icon: '🌱',
      vpdRange: '1.00-1.05',
      focus: 'Establecimiento radicular',
      optimalMin: 1.00,
      optimalMax: 1.05,
      acceptableMin: 0.95,
      acceptableMax: 1.10,
      dayTemp: '22-26°C',
      dayRH: '55-70%',
      nightTemp: '22-23°C',
      nightRH: '60-65%',
      nightVPD: '0.90-1.10',
      color: '#27ae60'
    },
    2: {
      name: 'Semana 2',
      icon: '🌿',
      vpdRange: '0.95-1.00',
      focus: 'Desarrollo foliar',
      optimalMin: 0.95,
      optimalMax: 1.00,
      acceptableMin: 0.90,
      acceptableMax: 1.05,
      dayTemp: '20-24°C',
      dayRH: '60-70%',
      nightTemp: '21-22°C',
      nightRH: '62-66%',
      nightVPD: '0.85-1.05',
      color: '#f39c12'
    },
    3: {
      name: 'Semana 3',
      icon: '🥬',
      vpdRange: '0.80-1.00',
      focus: 'Máxima biomasa',
      optimalMin: 0.80,
      optimalMax: 1.00,
      acceptableMin: 0.75,
      acceptableMax: 1.05,
      dayTemp: '18-22°C',
      dayRH: '60-80%',
      nightTemp: '20-21°C',
      nightRH: '64-68%',
      nightVPD: '0.80-1.00',
      color: '#3498db'
    }
  };

  // Calcular configuración promedio basada en islas seleccionadas
  const currentWeekConfig = useMemo(() => {
    const activeIslands = Object.entries(selectedIslands)
      .filter(([_, selected]) => selected)
      .map(([island]) => island);
    
    if (activeIslands.length === 0) {
      return weekConfigs[3]; // Default fallback
    }
    
    // Calcular rangos promedio de las islas activas
    const configurations = activeIslands.map(island => {
      const cropType = islandCropTypes[island as keyof typeof islandCropTypes];
      const week = islandWeekAssignments[island as keyof typeof islandWeekAssignments];
      const cropConfig = cropTypeConfigs[cropType];
      const weekConfig = cropConfig.weeks[week as keyof typeof cropConfig.weeks];
      return weekConfig;
    });
    
    const avgOptimalMin = configurations.reduce((sum, config) => sum + config.optimalMin, 0) / configurations.length;
    const avgOptimalMax = configurations.reduce((sum, config) => sum + config.optimalMax, 0) / configurations.length;
    
    return {
      ...weekConfigs[3],
      optimalMin: avgOptimalMin,
      optimalMax: avgOptimalMax,
      vpdRange: `${avgOptimalMin.toFixed(2)}-${avgOptimalMax.toFixed(2)}`,
      name: 'Configuración Mixta',
      focus: 'Basado en islas seleccionadas'
    };
  }, [selectedIslands, islandCropTypes, islandWeekAssignments, cropTypeConfigs, weekConfigs]);

  // Colores para cada isla
  const islandColors = {
    I1: '#27ae60',
    I2: '#3498db',
    I3: '#e74c3c',
    I4: '#f39c12',
    I5: '#9b59b6',
    I6: '#1abc9c'
  };

  // Función para obtener ícono de isla
  const getIslandIcon = (island: string) => {
    const icons: { [key: string]: string } = {
      I1: '🌿', // Albahaca
      I2: '🌿', // Albahaca  
      I3: '🌱', // Mixto
      I4: '🌱', // Mixto
      I5: '🏝️', // Vacía
      I6: '🌱'  // Mixto
    };
    return icons[island] || '🌿';
  };

  // Procesar datos según período seleccionado
  const processedData = useMemo(() => {
    let filteredData = data.data;

    // Filtrar por período corregido
    if (localPeriod === 'day') {
      filteredData = data.data.filter(record => {
        const hour = record.hour;
        // Día: 6:05am - 16:55pm (6-17)
        return hour >= 6 && hour < 17;
      });
    } else if (localPeriod === 'night') {
      filteredData = data.data.filter(record => {
        const hour = record.hour;
        // Noche planta: 17:00 - 23:00
        return hour >= 17 && hour < 23;
      });
    }

    // Filtrar por bloque temporal si está seleccionado
    if (localTimeBlock) {
      console.log(`Filtering by time block: ${localTimeBlock}`);
      filteredData = filteredData.filter(record => {
        const hour = record.hour;
        switch (localTimeBlock) {
          case 'noche_planta':
            // Noche planta: 17:00 - 23:00
            return hour >= 17 && hour <= 23;
          case 'dia_planta':
            // Día planta: 00:00 - 16:55
            return hour >= 0 && hour < 17;
          default:
            return true;
        }
      });
    }

    // Mapear datos para el gráfico
    return filteredData.map(record => {
      const chartData: any = {
        time: format(parseISO(record.time), 'HH:mm'),
        hour: record.hour,
      };

      // Agregar datos de VPD para islas seleccionadas
      Object.entries(selectedIslands).forEach(([island, selected]) => {
        if (selected) {
          chartData[`${island}_VPD`] = record.islands[island as keyof typeof record.islands]?.vpd;
        }
      });

      // Agregar consumo total de deshumidificadores
      if (showEnergyData) {
        const totalConsumption = Object.values(record.dehumidifiers || {})
          .reduce((sum, value) => sum + (value || 0), 0);
        chartData.totalConsumption = totalConsumption / 1000; // Convertir a kW
      }

      return chartData;
    });
  }, [data.data, selectedIslands, localPeriod, localTimeBlock, showEnergyData]);

  // Calcular estadísticas
  const statistics = useMemo(() => {
    const stats: { [key: string]: { avg: string; min: string; max: string; optimalPercentage: string } } = {};
    const activeIslands = Object.entries(selectedIslands)
      .filter(([_, selected]) => selected)
      .map(([island]) => island);

    activeIslands.forEach(island => {
      const vpdValues = processedData
        .map(d => d[`${island}_VPD`])
        .filter(v => v !== undefined && v !== null);

      if (vpdValues.length > 0) {
        const avg = vpdValues.reduce((a, b) => a + b, 0) / vpdValues.length;
        const optimalCount = vpdValues.filter(v => 
          v >= currentWeekConfig.optimalMin && v <= currentWeekConfig.optimalMax
        ).length;
        const optimalPercentage = (optimalCount / vpdValues.length) * 100;

        stats[island] = {
          avg: avg.toFixed(2),
          min: Math.min(...vpdValues).toFixed(2),
          max: Math.max(...vpdValues).toFixed(2),
          optimalPercentage: optimalPercentage.toFixed(1)
        };
      }
    });

    return stats;
  }, [processedData, selectedIslands, currentWeekConfig]);

  // Renderizar controles locales
  const renderLocalControls = () => (
    <div className="temporal-controls">
      {/* Configurador Completo por Isla */}
      <div className="control-section">
        <label>Configuración Completa por Isla</label>
        <div className="island-week-config">
          {Object.keys(selectedIslands).map((island) => {
            const currentCropType = islandCropTypes[island as keyof typeof islandCropTypes];
            const currentWeek = islandWeekAssignments[island as keyof typeof islandWeekAssignments];
            const cropConfig = cropTypeConfigs[currentCropType];
            const weekConfig = cropConfig.weeks[currentWeek as keyof typeof cropConfig.weeks];
            
            return (
              <div key={island} className="island-complete-selector">
                {/* Header con checkbox e información */}
                <div className="island-header-complete">
                  <div className="island-checkbox-header">
                    <input
                      type="checkbox"
                      id={`island-${island}`}
                      checked={selectedIslands[island as keyof IslandSelection]}
                      onChange={(e) => {
                        setSelectedIslands({
                          ...selectedIslands,
                          [island]: e.target.checked,
                        });
                      }}
                    />
                    <label htmlFor={`island-${island}`} className={`island-name-complete island-${island.toLowerCase()}`}>
                      {island}
                    </label>
                  </div>
                  <div className="current-config-info">
                    <span className="crop-type-info">
                      {cropConfig.icon} {cropConfig.name}
                    </span>
                    <span className="week-info-complete">
                      S{currentWeek} - {weekConfig.vpdRange} kPa
                    </span>
                  </div>
                </div>

                {/* Selector de Tipo de Cultivo */}
                <div className="crop-type-selector">
                  <label className="control-label-small">Tipo de Cultivo:</label>
                  <div className="crop-type-buttons">
                    {Object.entries(cropTypeConfigs).map(([cropType, config]) => (
                      <button
                        key={cropType}
                        className={`crop-type-btn ${
                          currentCropType === cropType ? 'active' : ''
                        }`}
                        onClick={() => updateIslandCropType(island, cropType as 'albahaca' | 'lechuga' | 'mixto')}
                        style={{ 
                          borderColor: config.color,
                          backgroundColor: currentCropType === cropType 
                            ? config.color + '20' : 'transparent'
                        }}
                        title={config.name}
                      >
                        <span className="crop-icon">{config.icon}</span>
                        <span className="crop-name">{config.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selector de Semana */}
                <div className="week-selector-complete">
                  <label className="control-label-small">Semana de Cultivo:</label>
                  <div className="week-buttons-complete">
                    {Object.entries(cropConfig.weeks).map(([week, weekConf]) => (
                      <button
                        key={week}
                        className={`week-btn-complete ${
                          currentWeek === parseInt(week) ? 'active' : ''
                        }`}
                        onClick={() => updateIslandWeek(island, parseInt(week))}
                        style={{ 
                          borderColor: cropConfig.color,
                          backgroundColor: currentWeek === parseInt(week) 
                            ? cropConfig.color + '20' : 'transparent'
                        }}
                        title={`Semana ${week} - ${weekConf.vpdRange} kPa - ${weekConf.focus}`}
                      >
                        <span className="week-icon-complete">
                          {week === '0' ? '🏝️' : 
                           week === '1' ? '🌱' : 
                           week === '2' ? '🌿' : '🥬'}
                        </span>
                        <span className="week-details">
                          <span className="week-number-complete">S{week}</span>
                          <span className="week-vpd-complete">{weekConf.vpdRange}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bloques Temporales */}
      <div className="control-group">
        <label>Bloques Temporales</label>
        <div className="timeblock-buttons">
          <button
            className={localTimeBlock === null ? 'active' : ''}
            onClick={() => {
              setLocalTimeBlock(null);
              setLocalPeriod('full');
            }}
          >
            🕐 Todos
          </button>
          <button
            className={localTimeBlock === 'noche_planta' ? 'active' : ''}
            onClick={() => {
              setLocalTimeBlock('noche_planta');
              setLocalPeriod('full');
            }}
            title="17:00 - 23:00"
          >
            🌙 Noche Planta
          </button>
          <button
            className={localTimeBlock === 'dia_planta' ? 'active' : ''}
            onClick={() => {
              setLocalTimeBlock('dia_planta');
              setLocalPeriod('full');
            }}
            title="00:00 - 16:55"
          >
            ☀️ Día Planta
          </button>
        </div>
      </div>

      <div className="control-group">
        <label>
          <input
            type="checkbox"
            checked={showEnergyData}
            onChange={(e) => setShowEnergyData(e.target.checked)}
          />
          Mostrar Consumo Energético
        </label>
      </div>
    </div>
  );

  // Renderizar estadísticas
  const renderStatistics = () => (
    <div className="island-stats-container">
      <h3 className="stats-title">📊 Estadísticas por Isla</h3>
      <div className="island-stats-horizontal">
        {Object.entries(statistics).map(([island, stats]) => (
          <div 
            key={island} 
            className="island-stat-card"
            style={{ borderLeft: `4px solid ${islandColors[island as keyof typeof islandColors]}` }}
          >
            <div className="island-header">
              <span 
                className="island-name"
                style={{ color: islandColors[island as keyof typeof islandColors] }}
              >
                {island}
              </span>
              <span className="island-week-badge">
                {weekConfigs[islandWeekAssignments[island as keyof typeof islandWeekAssignments]].icon}
              </span>
            </div>
            
            <div className="island-metrics">
              <div className="metric-item">
                <span className="metric-label">Promedio</span>
                <span className="metric-value primary">{stats.avg} kPa</span>
              </div>
              
              <div className="metric-item">
                <span className="metric-label">Rango</span>
                <span className="metric-value">{stats.min} - {stats.max} kPa</span>
              </div>
              
              <div className="metric-item">
                <span className="metric-label">Tiempo Óptimo</span>
                <span 
                  className={`metric-value ${parseFloat(stats.optimalPercentage) > 80 ? 'success' : parseFloat(stats.optimalPercentage) > 60 ? 'warning' : 'danger'}`}
                >
                  {stats.optimalPercentage}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Función para agrupar islas por semana asignada
  const getIslandsByWeek = (week: number) => {
    return Object.entries(islandWeekAssignments)
      .filter(([_, assignedWeek]) => assignedWeek === week)
      .map(([island]) => island)
      .filter(island => selectedIslands[island as keyof IslandSelection]);
  };

  // Función para obtener configuración promedio de una semana específica
  const getWeekConfig = (week: number) => {
    const islandsInWeek = getIslandsByWeek(week);
    if (islandsInWeek.length === 0) {
      return weekConfigs[week];
    }

    const configurations = islandsInWeek.map(island => {
      const cropType = islandCropTypes[island as keyof typeof islandCropTypes];
      const cropConfig = cropTypeConfigs[cropType];
      return cropConfig.weeks[week as keyof typeof cropConfig.weeks];
    });
    
    const avgOptimalMin = configurations.reduce((sum, config) => sum + config.optimalMin, 0) / configurations.length;
    const avgOptimalMax = configurations.reduce((sum, config) => sum + config.optimalMax, 0) / configurations.length;
    
    return {
      ...weekConfigs[week],
      optimalMin: avgOptimalMin,
      optimalMax: avgOptimalMax,
      vpdRange: `${avgOptimalMin.toFixed(2)}-${avgOptimalMax.toFixed(2)}`
    };
  };

  // Función para procesar datos específicos de una semana
  const getWeekData = (week: number) => {
    const islandsInWeek = getIslandsByWeek(week);
    if (islandsInWeek.length === 0) {
      return [];
    }

    // Usar los datos filtrados (processedData) pero necesitamos reconstruir con temperaturas y humedad
    let filteredData = data.data;

    // Aplicar los mismos filtros que processedData
    if (localPeriod === 'day') {
      filteredData = data.data.filter(record => {
        const hour = record.hour;
        // Día: 6:05am - 16:55pm (6-17)
        return hour >= 6 && hour < 17;
      });
    } else if (localPeriod === 'night') {
      filteredData = data.data.filter(record => {
        const hour = record.hour;
        // Noche planta: 17:00 - 23:00
        return hour >= 17 && hour < 23;
      });
    }

    if (localTimeBlock) {
      filteredData = filteredData.filter(record => {
        const hour = record.hour;
        switch (localTimeBlock) {
          case 'noche_planta':
            // Noche planta: 17:00 - 23:00
            return hour >= 17 && hour <= 23;
          case 'dia_planta':
            // Día planta: 00:00 - 16:55
            return hour >= 0 && hour < 17;
          default:
            return true;
        }
      });
    }

    const result = filteredData.map(record => {
      const weekData: any = {
        time: format(parseISO(record.time), 'HH:mm'),
        hour: record.hour,
      };

      islandsInWeek.forEach(island => {
        const islandData = record.islands[island as keyof typeof record.islands];
        if (islandData) {
          weekData[`${island}_temperature`] = islandData.temperature;
          weekData[`${island}_humidity`] = islandData.humidity;
          weekData[`${island}_vpd`] = islandData.vpd;
        }
      });

      return weekData;
    }).filter(record => {
      // Solo incluir registros que tengan al menos una isla con datos
      return Object.keys(record).some(key => key.includes('_temperature') || key.includes('_humidity') || key.includes('_vpd'));
    });
    
    return result;
  };

  // Renderizar gráfico individual para una métrica específica
  const renderMetricChart = (week: number, metric: 'temperature' | 'humidity' | 'vpd', title: string, unit: string, yAxisId: string = 'left') => {
    const weekData = getWeekData(week);
    const islandsInWeek = getIslandsByWeek(week);
    const weekConfig = getWeekConfig(week);
    
    if (islandsInWeek.length === 0) {
      return (
        <div className="empty-week-chart">
          <p>No hay islas asignadas a {weekConfigs[week].name}</p>
        </div>
      );
    }

    const getDomain = () => {
      if (weekData.length === 0) {
        switch (metric) {
          case 'temperature': return [15, 30];
          case 'humidity': return [40, 90];
          case 'vpd': return [0, 2];
          default: return [0, 100];
        }
      }

      // Calcular valores dinámicos basados en los datos reales
      const values: number[] = [];
      weekData.forEach(record => {
        islandsInWeek.forEach(island => {
          const value = record[`${island}_${metric}`];
          if (typeof value === 'number' && !isNaN(value)) {
            values.push(value);
          }
        });
      });

      if (values.length === 0) {
        switch (metric) {
          case 'temperature': return [15, 30];
          case 'humidity': return [40, 90];
          case 'vpd': return [0, 2];
          default: return [0, 100];
        }
      }

      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min;
      
      console.log(`${metric} - Min: ${min}, Max: ${max}, Range: ${range}`);
      
      switch (metric) {
        case 'temperature': 
          // Rango mínimo de 10°C para mejor visualización
          const tempMargin = Math.max(5, range * 0.2);
          const tempDomain = [Math.max(0, min - tempMargin), max + tempMargin];
          console.log(`Temperature domain: [${tempDomain[0].toFixed(1)}, ${tempDomain[1].toFixed(1)}]`);
          return tempDomain;
        case 'humidity': 
          // Rango mínimo de 20% para mejor visualización
          const humidityMargin = Math.max(10, range * 0.3);
          const humidityDomain = [Math.max(0, min - humidityMargin), Math.min(100, max + humidityMargin)];
          console.log(`Humidity domain: [${humidityDomain[0].toFixed(1)}, ${humidityDomain[1].toFixed(1)}]`);
          return humidityDomain;
        case 'vpd': 
          // VPD se mueve entre 0.5 a 1.3 máximo
          const vpdMin = Math.max(0.5, min - 0.1);
          const vpdMax = Math.min(1.3, max + 0.1);
          const vpdDomain = [vpdMin, vpdMax];
          console.log(`VPD domain: [${vpdDomain[0].toFixed(2)}, ${vpdDomain[1].toFixed(2)}]`);
          return vpdDomain;
        default: 
          return [min * 0.9, max * 1.1];
      }
    };

    return (
      <div className="metric-chart">
        <h4>{title}</h4>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={weekData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              yAxisId={yAxisId}
              label={{ value: unit, angle: -90, position: 'insideLeft' }}
              domain={getDomain()}
              tick={{ fontSize: 10 }}
              type="number"
              scale="linear"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontSize: '12px'
              }}
              formatter={(value: any, name: string) => {
                if (metric === 'vpd') return [`${value?.toFixed(2)} ${unit}`, name];
                return [`${value?.toFixed(1)} ${unit}`, name];
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />

            {/* Líneas de rango VPD recomendado */}
            {metric === 'vpd' ? (
              // En gráfico VPD: líneas normales
              <>
                <ReferenceLine 
                  yAxisId={yAxisId}
                  y={weekConfig.optimalMin} 
                  stroke="#e67e22" 
                  strokeDasharray="5 5" 
                  strokeWidth={2}
                  label={`VPD Min: ${weekConfig.optimalMin}`}
                />
                <ReferenceLine 
                  yAxisId={yAxisId}
                  y={weekConfig.optimalMax} 
                  stroke="#e67e22" 
                  strokeDasharray="5 5" 
                  strokeWidth={2}
                  label={`VPD Max: ${weekConfig.optimalMax}`}
                />
              </>
            ) : (
              // En gráficos de temperatura/humedad: agregar eje VPD secundario con datos reales
              <>
                {/* Eje Y secundario para VPD */}
                <YAxis 
                  yAxisId="vpdSecondary"
                  orientation="right"
                  label={{ value: 'VPD (kPa)', angle: 90, position: 'insideRight' }}
                  domain={[0.5, 1.3]}
                  tick={{ fontSize: 10, fill: '#e67e22' }}
                  type="number"
                  scale="linear"
                  tickFormatter={(value) => value.toFixed(1)}
                  axisLine={{ stroke: '#e67e22' }}
                  tickLine={{ stroke: '#e67e22' }}
                />
                {/* Líneas VPD óptimas */}
                <ReferenceLine 
                  yAxisId="vpdSecondary"
                  y={weekConfig.optimalMin} 
                  stroke="#e67e22" 
                  strokeDasharray="5 5" 
                  strokeWidth={2}
                  label={`VPD Min: ${weekConfig.optimalMin}`}
                />
                <ReferenceLine 
                  yAxisId="vpdSecondary"
                  y={weekConfig.optimalMax} 
                  stroke="#e67e22" 
                  strokeDasharray="5 5" 
                  strokeWidth={2}
                  label={`VPD Max: ${weekConfig.optimalMax}`}
                />
              </>
            )}

            {/* Líneas para cada isla en la semana */}
            {islandsInWeek.map(island => (
              <Line
                key={`${island}_${metric}`}
                yAxisId={yAxisId}
                type="monotone"
                dataKey={`${island}_${metric}`}
                stroke={islandColors[island as keyof typeof islandColors]}
                strokeWidth={2}
                dot={false}
                name={`${island} ${title}`}
              />
            ))}

            {/* En gráficos de temperatura/humedad: agregar líneas VPD de cada isla */}
            {metric !== 'vpd' && islandsInWeek.map(island => (
              <Line
                key={`${island}_vpd_overlay`}
                yAxisId="vpdSecondary"
                type="monotone"
                dataKey={`${island}_vpd`}
                stroke={islandColors[island as keyof typeof islandColors]}
                strokeWidth={1}
                strokeDasharray="2 2"
                dot={false}
                name={`${island} VPD`}
                opacity={0.7}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Renderizar secciones por semana
  const renderWeekSections = () => {
    const weeks = [1, 2, 3];
    
    return (
      <div className="week-sections">
        {weeks.map(week => {
          const weekConfig = weekConfigs[week];
          const islandsInWeek = getIslandsByWeek(week);
          
          return (
            <div key={week} className="week-section">
              <div className="week-header">
                <h3>
                  {weekConfig.icon} {weekConfig.name}
                  <span className="week-subtitle">({weekConfig.focus})</span>
                </h3>
                <div className="week-info">
                  <span className="islands-count">
                    Islas activas: {islandsInWeek.join(', ') || 'Ninguna'}
                  </span>
                  <span className="vpd-range">
                    VPD objetivo: {getWeekConfig(week).vpdRange} kPa
                  </span>
                  
                  {/* Estadísticas integradas en el header */}
                  {islandsInWeek.length > 0 && (
                    <div className="week-stats-inline">
                      {islandsInWeek.map(island => {
                        const stats = statistics?.[island];
                        if (!stats) return null;

                        return (
                          <span key={island} className="island-stat-inline">
                            {getIslandIcon(island)} {island}: {stats.avg} kPa ({stats.optimalPercentage})
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="week-charts">
                {renderMetricChart(week, 'temperature', 'Temperatura', '°C')}
                {renderMetricChart(week, 'humidity', 'Humedad', '%')}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="vpd-temporal-analysis">
      <div className="analysis-header">
        <h2>📈 Análisis Temporal de VPD</h2>
        <p>Evolución del VPD a lo largo del tiempo con control completo de parámetros</p>
      </div>

      {renderLocalControls()}

      {/* Secciones por semana con estadísticas integradas */}
      {renderWeekSections()}

      {/* Gráfico completo al final */}
      <div className="complete-chart-section">
        <h3>📊 Vista Completa - Todas las Islas</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                yAxisId="left"
                label={{ value: 'VPD (kPa)', angle: -90, position: 'insideLeft' }}
                domain={[0, 2]}
                tick={{ fontSize: 12 }}
              />
              {showEnergyData && (
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  label={{ value: 'Consumo (kW)', angle: 90, position: 'insideRight' }}
                  tick={{ fontSize: 12 }}
                />
              )}
              
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #ccc',
                  borderRadius: '8px'
                }}
                formatter={(value: any, name: string) => {
                  if (name.includes('VPD')) return [`${value?.toFixed(2)} kPa`, name];
                  if (name === 'totalConsumption') return [`${value?.toFixed(1)} kW`, 'Consumo'];
                  return [value, name];
                }}
              />
              <Legend />

              {/* Líneas de referencia para rangos óptimos */}
              <ReferenceLine 
                yAxisId="left"
                y={currentWeekConfig.optimalMin} 
                stroke="#27ae60" 
                strokeDasharray="5 5" 
                label="Min Óptimo"
              />
              <ReferenceLine 
                yAxisId="left"
                y={currentWeekConfig.optimalMax} 
                stroke="#27ae60" 
                strokeDasharray="5 5" 
                label="Max Óptimo"
              />

              {/* Área de referencia para rango óptimo */}
              <ReferenceArea
                yAxisId="left"
                y1={currentWeekConfig.optimalMin}
                y2={currentWeekConfig.optimalMax}
                stroke="none"
                fill="#27ae60"
                fillOpacity={0.1}
              />

              {/* Barras de consumo energético */}
              {showEnergyData && (
                <Bar
                  yAxisId="right"
                  dataKey="totalConsumption"
                  fill="#95a5a6"
                  fillOpacity={0.3}
                  name="Consumo Total"
                />
              )}

              {/* Líneas de VPD para cada isla seleccionada */}
              {Object.entries(selectedIslands).map(([island, selected]) => {
                if (!selected) return null;
                return (
                  <Line
                    key={island}
                    yAxisId="left"
                    type="monotone"
                    dataKey={`${island}_VPD`}
                    stroke={islandColors[island as keyof typeof islandColors]}
                    strokeWidth={2}
                    dot={false}
                    name={`${island} VPD`}
                  />
                );
              })}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="analysis-footer">
        <p>💡 Rango óptimo {currentWeekConfig.name}: {currentWeekConfig.vpdRange} kPa</p>
        <p>🎯 Enfoque: {currentWeekConfig.focus}</p>
      </div>
    </div>
  );
};

export default VPDTemporalAnalysis;