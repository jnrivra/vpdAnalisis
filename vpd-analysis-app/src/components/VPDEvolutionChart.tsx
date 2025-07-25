import React, { useMemo } from 'react';
import {
  LineChart,
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
import { VPDData, WeekConfig, DayPeriod, IslandSelection } from '../types/vpd-types';
import { format, parseISO } from 'date-fns';

interface VPDEvolutionChartProps {
  data: VPDData;
  selectedIslands: IslandSelection;
  selectedPeriod: DayPeriod;
  weekConfig: WeekConfig;
}

const VPDEvolutionChart: React.FC<VPDEvolutionChartProps> = ({
  data,
  selectedIslands,
  selectedPeriod,
  weekConfig
}) => {
  // Colores para cada isla
  const islandColors = {
    I1: '#27ae60',
    I2: '#3498db',
    I3: '#e74c3c',
    I4: '#f39c12',
    I5: '#9b59b6',
    I6: '#1abc9c'
  };

  // Procesar datos según período seleccionado
  const processedData = useMemo(() => {
    let filteredData = data.data;

    // Filtrar por período según el nuevo sistema de bloques
    if (selectedPeriod === 'day') {
      // Día planta completo: 23:00 a 17:00 del día siguiente
      filteredData = data.data.filter(record => {
        const hour = record.hour;
        return hour >= 23 || hour < 17;
      });
    } else if (selectedPeriod === 'night' || selectedPeriod === 'night_plant') {
      // Noche planta: 17:01 a 22:59
      filteredData = data.data.filter(record => {
        const hour = record.hour;
        return hour >= 17 && hour < 23;
      });
    } else if (selectedPeriod === 'dawn_cold') {
      // Madrugada Fría: 23:00 a 02:00
      filteredData = data.data.filter(record => {
        const hour = record.hour;
        return hour >= 23 || hour <= 2;
      });
    } else if (selectedPeriod === 'night_deep') {
      // Noche Profunda: 02:01 a 08:00
      filteredData = data.data.filter(record => {
        const hour = record.hour;
        return hour > 2 && hour <= 8;
      });
    } else if (selectedPeriod === 'morning') {
      // Amanecer: 08:01 a 12:00
      filteredData = data.data.filter(record => {
        const hour = record.hour;
        return hour > 8 && hour <= 12;
      });
    } else if (selectedPeriod === 'day_active') {
      // Día Activo: 12:01 a 17:00
      filteredData = data.data.filter(record => {
        const hour = record.hour;
        return hour > 12 && hour < 17;
      });
    }

    // Transformar datos para el gráfico
    return filteredData.map(record => {
      const timeObj = parseISO(record.time);
      const formattedTime = format(timeObj, 'HH:mm');
      
      const result: any = {
        time: formattedTime,
        hour: record.hour,
        fullTime: record.time,
      };

      // Agregar datos de VPD, temperatura y humedad para islas seleccionadas
      Object.entries(selectedIslands).forEach(([islandId, isSelected]) => {
        if (isSelected) {
          const islandData = record.islands[islandId as keyof typeof record.islands];
          if (islandData) {
            result[`${islandId}_VPD`] = islandData.vpd;
            result[`${islandId}_Temp`] = islandData.temperature;
            result[`${islandId}_Humidity`] = islandData.humidity;
          }
        }
      });

      // Calcular promedio de deshumidificadores activos
      const activeDehumidifiers = Object.entries(record.dehumidifiers).filter(([key, value]) => {
        const islandMatch = Object.keys(selectedIslands).some(island => 
          key.includes(island) && selectedIslands[island as keyof IslandSelection]
        );
        return islandMatch && value > 0;
      });
      
      if (activeDehumidifiers.length > 0) {
        result.avgDehumidifier = activeDehumidifiers.reduce((sum, [, value]) => sum + value, 0) / activeDehumidifiers.length;
      } else {
        result.avgDehumidifier = 0;
      }

      return result;
    });
  }, [data, selectedIslands, selectedPeriod]);

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const record = processedData.find(d => d.time === label);
      return (
        <div className="custom-tooltip">
          <p className="tooltip-time">{`Hora: ${label}`}</p>
          {payload.filter((entry: any) => entry.dataKey.includes('_VPD')).map((entry: any, index: number) => {
            const islandId = entry.dataKey.replace('_VPD', '');
            const islandRecord = record && record[`${islandId}_VPD`];
            const temp = record && record[`${islandId}_Temp`];
            const humidity = record && record[`${islandId}_Humidity`];
            
            if (!islandRecord || typeof islandRecord !== 'number') return null;
            
            return (
              <div key={index} className="tooltip-island">
                <p style={{ color: entry.color }}>
                  <strong>{islandId}:</strong>
                </p>
                <p>VPD: {islandRecord.toFixed(3)} kPa</p>
                <p>Temp: {typeof temp === 'number' ? temp.toFixed(1) : 'N/A'}°C</p>
                <p>HR: {typeof humidity === 'number' ? humidity.toFixed(1) : 'N/A'}%</p>
              </div>
            );
          })}
          {record?.avgDehumidifier && record.avgDehumidifier > 0 && (
            <p className="tooltip-dehumidifier">
              Deshumidificadores: {record.avgDehumidifier.toFixed(0)}W
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const selectedIslandsList = Object.entries(selectedIslands)
    .filter(([, isSelected]) => isSelected)
    .map(([islandId]) => islandId);

  // Función para obtener el nombre del período seleccionado
  const getPeriodName = (period: DayPeriod): string => {
    const periodNames: { [key in DayPeriod]: string } = {
      'full': '24 Horas',
      'day': 'Día Planta (23:00-17:00)',
      'night': 'Noche Planta (17:01-22:59)',
      'night_plant': 'Noche Planta (17:01-22:59)',
      'dawn_cold': 'Madrugada Fría (23:00-02:00)',
      'night_deep': 'Noche Profunda (02:01-08:00)', 
      'morning': 'Amanecer (08:01-12:00)',
      'day_active': 'Día Activo (12:01-17:00)',
      'thermal_warmup': 'Calentamiento Inicial (23:00-08:00)',
      'thermal_rebound': 'Rebote Térmico (08:01-12:00)',
      'thermal_stabilization': 'Estabilización (12:01-17:00)',
      'night_stable': 'Noche Estable (17:01-22:59)'
    };
    return periodNames[period];
  };

  // Agrupar islas por semana de cultivo
  const islandsByWeek = {
    1: ['I3', 'I6'], // Semana 1 - Establecimiento radicular
    2: ['I2'],       // Semana 2 - Desarrollo foliar
    3: ['I1', 'I4']  // Semana 3 - Máxima biomasa
  };

  const weekConfigs = {
    1: {
      name: 'Semana 1',
      icon: '🌱',
      vpdRange: '1.00-1.05',
      focus: 'Establecimiento radicular',
      optimalMin: 1.00,
      optimalMax: 1.05,
      color: '#27ae60',
      // Rangos recomendados para temperatura y humedad
      tempMin: 22,
      tempMax: 24,
      humidityMin: 60,
      humidityMax: 70
    },
    2: {
      name: 'Semana 2',
      icon: '🌿',
      vpdRange: '0.95-1.00',
      focus: 'Desarrollo foliar',
      optimalMin: 0.95,
      optimalMax: 1.00,
      color: '#f39c12',
      tempMin: 23,
      tempMax: 25,
      humidityMin: 65,
      humidityMax: 75
    },
    3: {
      name: 'Semana 3',
      icon: '🥬',
      vpdRange: '0.80-1.00',
      focus: 'Máxima biomasa',
      optimalMin: 0.80,
      optimalMax: 1.00,
      color: '#3498db',
      tempMin: 24,
      tempMax: 26,
      humidityMin: 70,
      humidityMax: 80
    }
  };

  // Función para renderizar franjas verticales y áreas sombreadas de bloques temporales
  const renderTimeBlockDivisions = () => {
    // Solo mostrar divisiones cuando se visualiza día completo, día planta o noche planta
    if (!['full', 'day', 'night_plant'].includes(selectedPeriod)) {
      return null;
    }

    const timeBlocks = [
      { 
        start: 23, end: 2, 
        name: 'Madrugada Fría', 
        color: '#2c3e50', 
        fillColor: 'rgba(44, 62, 80, 0.08)',
        icon: '🌙'
      },
      { 
        start: 2, end: 8, 
        name: 'Noche Profunda', 
        color: '#34495e', 
        fillColor: 'rgba(52, 73, 94, 0.08)',
        icon: '🌌'
      },
      { 
        start: 8, end: 12, 
        name: 'Amanecer', 
        color: '#f39c12', 
        fillColor: 'rgba(243, 156, 18, 0.08)',
        icon: '🌅'
      },
      { 
        start: 12, end: 17, 
        name: 'Día Activo', 
        color: '#e67e22', 
        fillColor: 'rgba(230, 126, 34, 0.08)',
        icon: '☀️'
      },
      { 
        start: 17, end: 23, 
        name: 'Noche Planta', 
        color: '#8e44ad', 
        fillColor: 'rgba(142, 68, 173, 0.08)',
        icon: '🌃'
      }
    ];

    const elements: React.ReactElement[] = [];

    // Agregar áreas sombreadas por bloque
    timeBlocks.forEach((block, index) => {
      let startTime, endTime;
      
      if (block.start > block.end) {
        // Bloque que cruza medianoche (23:00-02:00)
        startTime = processedData.find(record => record.hour === block.start)?.time;
        endTime = processedData.find(record => record.hour === block.end && record.hour <= 2)?.time;
      } else {
        startTime = processedData.find(record => record.hour === block.start)?.time;
        endTime = processedData.find(record => record.hour === block.end)?.time;
      }

      if (startTime && endTime) {
        elements.push(
          <ReferenceArea
            key={`area-${index}`}
            x1={startTime}
            x2={endTime}
            fill={block.fillColor}
            fillOpacity={0.3}
          />
        );
      }
    });

    // Agregar líneas divisorias
    const blockDivisions = [
      { hour: 2, name: 'Transición', color: '#2c3e50' },
      { hour: 8, name: 'Transición', color: '#34495e' },
      { hour: 12, name: 'Transición', color: '#f39c12' },
      { hour: 17, name: 'Transición', color: '#e67e22' },
      { hour: 23, name: 'Transición', color: '#8e44ad' }
    ];

    blockDivisions.forEach(division => {
      const timePoint = processedData.find(record => record.hour === division.hour);
      if (timePoint) {
        elements.push(
          <ReferenceLine 
            key={`line-${division.hour}`}
            x={timePoint.time}
            stroke={division.color}
            strokeWidth={1.5}
            strokeDasharray="4 2"
            strokeOpacity={0.6}
          />
        );
      }
    });

    return elements;
  };

  const renderWeekChart = (weekNumber: number) => {
    const weekIslands = islandsByWeek[weekNumber as keyof typeof islandsByWeek];
    const weekConf = weekConfigs[weekNumber as keyof typeof weekConfigs];
    
    return (
      <div key={weekNumber} className="week-analysis-container">
        <div className="week-header">
          <h2 className="week-title">
            <span className="week-icon" style={{ color: weekConf.color }}>{weekConf.icon}</span>
            {weekConf.name} - {weekConf.focus}
          </h2>
          <div className="week-info">
            <span>Islas: <strong>{weekIslands.join(', ')}</strong></span>
            <span>Target VPD: <strong style={{ color: weekConf.color }}>{weekConf.vpdRange} kPa</strong></span>
          </div>
        </div>
        
        {/* Gráfico VPD */}
        <div className="clean-chart-container">
          <div className="chart-header-clean">
            <h3 className="chart-title-clean">
              📊 VPD - Déficit de Presión de Vapor
            </h3>
            {(['full', 'day', 'night_plant'].includes(selectedPeriod)) && (
              <div className="time-blocks-legend">
                <small>
                  🌙 Madrugada Fría (23:00-02:00) | 🌌 Noche Profunda (02:01-08:00) | 
                  🌅 Amanecer (08:01-12:00) | ☀️ Día Activo (12:01-17:00) | 🌃 Noche Planta (17:01-22:59)
                </small>
              </div>
            )}
          </div>
          
          <div className="chart-wrapper-clean">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart 
                data={processedData}
                margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  domain={['dataMin - 0.05', 'dataMax + 0.05']}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                  label={{ 
                    value: 'VPD (kPa)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fontSize: '12px', fill: '#475569' }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {/* Líneas de referencia */}
                <ReferenceLine 
                  y={weekConf.optimalMin} 
                  stroke={weekConf.color} 
                  strokeWidth={3}
                  strokeDasharray="8 4" 
                  strokeOpacity={0.8}
                />
                <ReferenceLine 
                  y={weekConf.optimalMax} 
                  stroke={weekConf.color} 
                  strokeWidth={3}
                  strokeDasharray="8 4" 
                  strokeOpacity={0.8}
                />

                {/* Divisiones temporales por bloques */}
                {renderTimeBlockDivisions()}

                {weekIslands.map(islandId => (
                  <Line
                    key={islandId}
                    type="monotone"
                    dataKey={`${islandId}_VPD`}
                    stroke={islandColors[islandId as keyof typeof islandColors]}
                    strokeWidth={2.5}
                    name={`${islandId} VPD`}
                    connectNulls={false}
                    dot={false}
                    activeDot={{ 
                      r: 4, 
                      fill: islandColors[islandId as keyof typeof islandColors],
                      stroke: '#ffffff',
                      strokeWidth: 2
                    }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Panel de Recomendaciones Inteligentes */}
        <div className="recommendations-panel">
          <div className="recommendations-header">
            <h3 className="recommendations-title">
              🎯 Recomendaciones de Ajuste - {weekConf.name}
            </h3>
            <p className="recommendations-subtitle">
              Acciones específicas para optimizar VPD - Período: {getPeriodName(selectedPeriod)}
            </p>
          </div>

          <div className="recommendations-grid">
            {weekIslands.map(islandId => {
              // Calcular estadísticas del período seleccionado
              let periodData = processedData.map(record => ({
                vpd: record[`${islandId}_VPD`],
                temp: record[`${islandId}_Temp`],
                humidity: record[`${islandId}_Humidity`]
              })).filter(record => record.vpd !== undefined && record.temp !== undefined && record.humidity !== undefined);

              if (periodData.length === 0) return null;

              // Calcular consumo de deshumidificadores para esta isla PRIMERO
              const islandDehumidifiers = processedData.map(record => {
                const orienteKey = `${islandId}_Oriente`;
                const ponenteKey = `${islandId}_Poniente`;
                
                const oriente = data.data.find(d => d.time === record.fullTime)?.dehumidifiers?.[orienteKey] || 0;
                const poniente = data.data.find(d => d.time === record.fullTime)?.dehumidifiers?.[ponenteKey] || 0;
                
                return { oriente, poniente, total: oriente + poniente };
              }).filter(d => d.total > 0);

              const avgOriente = islandDehumidifiers.length > 0 
                ? islandDehumidifiers.reduce((sum, d) => sum + d.oriente, 0) / islandDehumidifiers.length 
                : 0;
              const avgPoniente = islandDehumidifiers.length > 0 
                ? islandDehumidifiers.reduce((sum, d) => sum + d.poniente, 0) / islandDehumidifiers.length 
                : 0;
              const avgTotal = avgOriente + avgPoniente;

              // Calcular tiempo de actividad por deshumidificador
              const calculateActivityTime = (consumptionData: { oriente: number; poniente: number }[]) => {
                if (consumptionData.length === 0) return { oriente: { active: 0, defrost: 0, off: 0 }, poniente: { active: 0, defrost: 0, off: 0 } };
                
                const totalRecords = consumptionData.length;
                const orienteStats = { active: 0, defrost: 0, off: 0 };
                const ponenteStats = { active: 0, defrost: 0, off: 0 };
                
                consumptionData.forEach(record => {
                  // Clasificar Oriente
                  if (record.oriente > 4000) orienteStats.active++;
                  else if (record.oriente >= 400 && record.oriente <= 800) orienteStats.defrost++;
                  else if (record.oriente >= 0 && record.oriente <= 50) orienteStats.off++;
                  
                  // Clasificar Poniente
                  if (record.poniente > 4000) ponenteStats.active++;
                  else if (record.poniente >= 400 && record.poniente <= 800) ponenteStats.defrost++;
                  else if (record.poniente >= 0 && record.poniente <= 50) ponenteStats.off++;
                });
                
                // Convertir a porcentajes
                return {
                  oriente: {
                    active: Math.round((orienteStats.active / totalRecords) * 100),
                    defrost: Math.round((orienteStats.defrost / totalRecords) * 100),
                    off: Math.round((orienteStats.off / totalRecords) * 100)
                  },
                  poniente: {
                    active: Math.round((ponenteStats.active / totalRecords) * 100),
                    defrost: Math.round((ponenteStats.defrost / totalRecords) * 100),
                    off: Math.round((ponenteStats.off / totalRecords) * 100)
                  }
                };
              };

              // Obtener todos los datos de consumo para el período
              const allDehumidifierData = processedData.map(record => {
                const orienteKey = `${islandId}_Oriente`;
                const ponenteKey = `${islandId}_Poniente`;
                
                const oriente = data.data.find(d => d.time === record.fullTime)?.dehumidifiers?.[orienteKey] || 0;
                const poniente = data.data.find(d => d.time === record.fullTime)?.dehumidifiers?.[ponenteKey] || 0;
                
                return { oriente, poniente };
              });

              const activityAnalysis = calculateActivityTime(allDehumidifierData);

              // Determinar estado de consumo
              const consumptionStatus = avgTotal > 8000 ? 'critical' : avgTotal > 6000 ? 'high' : avgTotal > 4000 ? 'moderate' : avgTotal > 0 ? 'low' : 'off';
              const consumptionLabel = consumptionStatus === 'critical' ? 'CRÍTICO' : 
                                     consumptionStatus === 'high' ? 'ALTO' : 
                                     consumptionStatus === 'moderate' ? 'MODERADO' : 
                                     consumptionStatus === 'low' ? 'BAJO' : 'APAGADO';

              // Calcular promedios del período actual
              const currentVPD = periodData.reduce((sum, record) => sum + record.vpd, 0) / periodData.length;
              const currentTemp = periodData.reduce((sum, record) => sum + record.temp, 0) / periodData.length;
              const currentHumidity = periodData.reduce((sum, record) => sum + record.humidity, 0) / periodData.length;
              
              // Calcular tiempo en rango óptimo para el período
              const inOptimalRange = periodData.filter(record => 
                record.vpd >= weekConf.optimalMin && record.vpd <= weekConf.optimalMax
              ).length;
              const optimalTimePercentage = (inOptimalRange / periodData.length) * 100;
              
              // VPD objetivo para esta semana
              const targetVPDMin = weekConf.optimalMin;
              const targetVPDMax = weekConf.optimalMax;
              const targetVPD = (targetVPDMin + targetVPDMax) / 2;
              
              // Función para calcular VPD
              const calculateVPD = (temp: number, humidity: number) => {
                const svp = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
                return svp * (1 - humidity / 100);
              };

              // Calcular ajustes necesarios
              const recommendations = [];
              
              if (currentVPD < targetVPDMin) {
                // VPD muy bajo - necesita subir
                const tempIncrease = 2.0; // Subir 2°C
                const vpdWithTempIncrease = calculateVPD(currentTemp + tempIncrease, currentHumidity);
                
                const humidityDecrease = 10; // Bajar 10%
                const vpdWithHumidityDecrease = calculateVPD(currentTemp, currentHumidity - humidityDecrease);
                
                // Calcular impacto energético
                const tempEnergyImpact = avgTotal > 6000 ? 'Deshumidificadores podrían aumentar +200W' : 
                                       avgTotal > 4000 ? 'Deshumidificadores podrían aumentar +300W' : 
                                       'Impacto energético bajo';
                
                const humidityEnergyImpact = avgTotal > 6000 ? 'Deshumidificadores podrían reducir -800W' : 
                                           avgTotal > 4000 ? 'Deshumidificadores podrían reducir -500W' : 
                                           avgTotal > 0 ? 'Deshumidificadores podrían reducir -200W' : 
                                           'Deshumidificadores apagados - Sin impacto';

                // Determinar prioridad basada en consumo actual
                const energyPriority = avgTotal > 7000 ? '💰 AHORRO CRÍTICO' : avgTotal > 5000 ? '💡 AHORRO ALTO' : '⚡ AHORRO POSIBLE';

                recommendations.push({
                  status: 'low',
                  priority: avgTotal > 7000 ? 'critical' : 'high',
                  issue: `VPD muy bajo (${currentVPD.toFixed(2)} kPa) ${avgTotal > 6000 ? '- Alto consumo energético' : ''}`,
                  energyStatus: energyPriority,
                  options: [
                    {
                      action: `Subir temperatura +${tempIncrease}°C`,
                      detail: `${currentTemp.toFixed(1)}°C → ${(currentTemp + tempIncrease).toFixed(1)}°C`,
                      result: `VPD resultante: ${vpdWithTempIncrease.toFixed(2)} kPa`,
                      energyImpact: tempEnergyImpact,
                      feasibility: tempIncrease <= 3 ? 'fácil' : 'moderado',
                      type: 'temperature',
                      energyEfficient: avgTotal > 6000
                    },
                    {
                      action: `Reducir humedad -${humidityDecrease}%`,
                      detail: `${currentHumidity.toFixed(1)}% → ${(currentHumidity - humidityDecrease).toFixed(1)}%`,
                      result: `VPD resultante: ${vpdWithHumidityDecrease.toFixed(2)} kPa`,
                      energyImpact: humidityEnergyImpact,
                      feasibility: currentHumidity - humidityDecrease > 50 ? 'fácil' : 'difícil',
                      type: 'humidity',
                      energyEfficient: avgTotal < 4000
                    }
                  ]
                });
              } else if (currentVPD > targetVPDMax) {
                // VPD muy alto - necesita bajar
                const tempDecrease = 2.0; // Bajar 2°C
                const vpdWithTempDecrease = calculateVPD(currentTemp - tempDecrease, currentHumidity);
                
                const humidityIncrease = 10; // Subir 10%
                const vpdWithHumidityIncrease = calculateVPD(currentTemp, currentHumidity + humidityIncrease);
                
                // Calcular impacto energético para VPD alto
                const tempEnergyImpact = avgTotal > 6000 ? 'Deshumidificadores podrían reducir -400W' : 
                                       avgTotal > 4000 ? 'Deshumidificadores podrían reducir -200W' : 
                                       'Impacto energético mínimo';
                
                const humidityEnergyImpact = avgTotal > 6000 ? 'Deshumidificadores podrían aumentar +600W' : 
                                           avgTotal > 4000 ? 'Deshumidificadores podrían aumentar +400W' : 
                                           avgTotal > 0 ? 'Deshumidificadores podrían aumentar +200W' : 
                                           'Deshumidificadores apagados - Sin impacto';

                const energyPriority = avgTotal > 7000 ? '⚡ OPTIMIZAR CONSUMO' : avgTotal > 5000 ? '💡 MONITOREAR CONSUMO' : '🔋 CONSUMO CONTROLADO';

                recommendations.push({
                  status: 'high',
                  priority: 'high',
                  issue: `VPD muy alto (${currentVPD.toFixed(2)} kPa) ${avgTotal > 6000 ? '- Optimizar eficiencia' : ''}`,
                  energyStatus: energyPriority,
                  options: [
                    {
                      action: `Reducir temperatura -${tempDecrease}°C`,
                      detail: `${currentTemp.toFixed(1)}°C → ${(currentTemp - tempDecrease).toFixed(1)}°C`,
                      result: `VPD resultante: ${vpdWithTempDecrease.toFixed(2)} kPa`,
                      energyImpact: tempEnergyImpact,
                      feasibility: currentTemp - tempDecrease > 18 ? 'fácil' : 'difícil',
                      type: 'temperature',
                      energyEfficient: avgTotal > 5000
                    },
                    {
                      action: `Aumentar humedad +${humidityIncrease}%`,
                      detail: `${currentHumidity.toFixed(1)}% → ${(currentHumidity + humidityIncrease).toFixed(1)}%`,
                      result: `VPD resultante: ${vpdWithHumidityIncrease.toFixed(2)} kPa`,
                      energyImpact: humidityEnergyImpact,
                      feasibility: currentHumidity + humidityIncrease < 90 ? 'fácil' : 'difícil',
                      type: 'humidity',
                      energyEfficient: avgTotal < 3000
                    }
                  ]
                });
              } else {
                // VPD en rango óptimo
                const energyEfficiencyStatus = avgTotal > 7000 ? '⚠️ Alto consumo - Revisar configuración' : 
                                             avgTotal > 5000 ? '💡 Consumo moderado - Monitorear' : 
                                             avgTotal > 2000 ? '✅ Consumo eficiente' : 
                                             avgTotal > 0 ? '🟢 Consumo bajo' : '⚫ Deshumidificadores apagados';

                recommendations.push({
                  status: 'optimal',
                  priority: avgTotal > 7000 ? 'medium' : 'low',
                  issue: `VPD óptimo (${currentVPD.toFixed(2)} kPa)`,
                  energyStatus: energyEfficiencyStatus,
                  options: [
                    {
                      action: 'Mantener condiciones actuales',
                      detail: `Temperatura: ${currentTemp.toFixed(1)}°C, Humedad: ${currentHumidity.toFixed(1)}%`,
                      result: avgTotal > 7000 ? 'Monitorear consumo energético' : 'Condiciones ideales - Continuar monitoreo',
                      energyImpact: `Consumo estable: ${avgTotal.toFixed(0)}W`,
                      feasibility: 'fácil',
                      type: 'maintain',
                      energyEfficient: avgTotal < 5000
                    }
                  ]
                });
              }

              return (
                <div key={islandId} className="island-recommendation-card">
                  <div className="island-header">
                    <h4 className="island-title" style={{ color: islandColors[islandId as keyof typeof islandColors] }}>
                      🏝️ Isla {islandId}
                    </h4>
                    <div className="dehumidifier-info">
                      <div className="power-consumption">
                        <span className="power-icon">💡</span>
                        <span className="power-value">{avgTotal.toFixed(0)}W promedio</span>
                        <span className={`consumption-badge ${consumptionStatus}`}>
                          {consumptionStatus === 'critical' ? '🔴' : 
                           consumptionStatus === 'high' ? '🟠' : 
                           consumptionStatus === 'moderate' ? '🟡' : 
                           consumptionStatus === 'low' ? '🟢' : '⚫'}
                          {consumptionLabel}
                        </span>
                      </div>
                      {avgTotal > 0 && (
                        <div className="power-breakdown">
                          <small>Oriente: {avgOriente.toFixed(0)}W | Poniente: {avgPoniente.toFixed(0)}W</small>
                        </div>
                      )}
                    </div>
                  </div>

                  {recommendations.map((rec, recIndex) => (
                    <div key={recIndex} className={`recommendation-content ${rec.status}`}>
                      <div className="recommendation-issue">
                        <span className={`status-badge ${rec.status}`}>
                          {rec.status === 'low' ? '⬇️' : rec.status === 'high' ? '⬆️' : '✅'}
                        </span>
                        <span className="issue-text">{rec.issue}</span>
                      </div>

                      {rec.energyStatus && (
                        <div className="energy-status">
                          <span className="energy-label">Estado Energético:</span>
                          <span className="energy-value">{rec.energyStatus}</span>
                        </div>
                      )}

                      <div className="recommendation-options">
                        {rec.options.map((option, optIndex) => (
                          <div key={optIndex} className={`option-card ${option.type} ${option.energyEfficient ? 'energy-efficient' : ''}`}>
                            <div className="option-header">
                              <span className="option-action">
                                {option.energyEfficient && '⚡'} {option.action}
                              </span>
                              <div className="option-badges">
                                {option.energyEfficient && (
                                  <span className="efficiency-badge">
                                    💚 Eficiente
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="option-details">
                              <p className="option-detail">{option.detail}</p>
                              <p className="option-result">{option.result}</p>
                              {option.energyImpact && (
                                <p className="option-energy-impact">
                                  💡 {option.energyImpact}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Análisis de Tiempo de Actividad */}
                  <div className="activity-analysis">
                    <div className="activity-header">
                      <h4 className="activity-title">
                        ⏱️ Tiempo de Actividad - Período: {getPeriodName(selectedPeriod)}
                      </h4>
                    </div>
                    
                    <div className="dehumidifier-activity">
                      <div className="oriente-activity">
                        <div className="activity-label">
                          <span className="orientation-icon">🌅</span>
                          <span className="orientation-name">Oriente:</span>
                        </div>
                        <div className="activity-bars">
                          <div className="activity-item active">
                            <span className="activity-indicator">🟢</span>
                            <span className="activity-text">Activo: {activityAnalysis.oriente.active}%</span>
                            <div className="activity-bar">
                              <div 
                                className="activity-fill active" 
                                style={{ width: `${activityAnalysis.oriente.active}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="activity-item defrost">
                            <span className="activity-indicator">🟡</span>
                            <span className="activity-text">Defrost: {activityAnalysis.oriente.defrost}%</span>
                            <div className="activity-bar">
                              <div 
                                className="activity-fill defrost" 
                                style={{ width: `${activityAnalysis.oriente.defrost}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="activity-item off">
                            <span className="activity-indicator">⚫</span>
                            <span className="activity-text">Apagado: {activityAnalysis.oriente.off}%</span>
                            <div className="activity-bar">
                              <div 
                                className="activity-fill off" 
                                style={{ width: `${activityAnalysis.oriente.off}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="poniente-activity">
                        <div className="activity-label">
                          <span className="orientation-icon">🌇</span>
                          <span className="orientation-name">Poniente:</span>
                        </div>
                        <div className="activity-bars">
                          <div className="activity-item active">
                            <span className="activity-indicator">🟢</span>
                            <span className="activity-text">Activo: {activityAnalysis.poniente.active}%</span>
                            <div className="activity-bar">
                              <div 
                                className="activity-fill active" 
                                style={{ width: `${activityAnalysis.poniente.active}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="activity-item defrost">
                            <span className="activity-indicator">🟡</span>
                            <span className="activity-text">Defrost: {activityAnalysis.poniente.defrost}%</span>
                            <div className="activity-bar">
                              <div 
                                className="activity-fill defrost" 
                                style={{ width: `${activityAnalysis.poniente.defrost}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="activity-item off">
                            <span className="activity-indicator">⚫</span>
                            <span className="activity-text">Apagado: {activityAnalysis.poniente.off}%</span>
                            <div className="activity-bar">
                              <div 
                                className="activity-fill off" 
                                style={{ width: `${activityAnalysis.poniente.off}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gráfico Temperatura */}
        <div className="clean-chart-container">
          <div className="chart-header-clean">
            <h3 className="chart-title-clean">
              🌡️ Temperatura
            </h3>
            {(['full', 'day', 'night_plant'].includes(selectedPeriod)) && (
              <div className="time-blocks-legend">
                <small>
                  🌙 Madrugada Fría (23:00-02:00) | 🌌 Noche Profunda (02:01-08:00) | 
                  🌅 Amanecer (08:01-12:00) | ☀️ Día Activo (12:01-17:00) | 🌃 Noche Planta (17:01-22:59)
                </small>
              </div>
            )}
          </div>
          
          <div className="chart-wrapper-clean">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart 
                data={processedData}
                margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                  label={{ 
                    value: 'Temperatura (°C)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fontSize: '12px', fill: '#475569' }
                  }}
                />
                <Tooltip />
                <Legend />
                
                {/* Líneas de referencia para temperatura óptima */}
                <ReferenceLine 
                  y={weekConf.tempMin} 
                  stroke="#e74c3c" 
                  strokeWidth={3}
                  strokeDasharray="8 4" 
                  strokeOpacity={0.9}
                  label={{ 
                    value: `Temp Min: ${weekConf.tempMin}°C`, 
                    position: 'top',
                    style: { fontSize: '11px', fill: '#e74c3c', fontWeight: 'bold' }
                  }}
                />
                <ReferenceLine 
                  y={weekConf.tempMax} 
                  stroke="#e74c3c" 
                  strokeWidth={3}
                  strokeDasharray="8 4" 
                  strokeOpacity={0.9}
                  label={{ 
                    value: `Temp Max: ${weekConf.tempMax}°C`, 
                    position: 'top',
                    style: { fontSize: '11px', fill: '#e74c3c', fontWeight: 'bold' }
                  }}
                />

                {/* Divisiones temporales por bloques */}
                {renderTimeBlockDivisions()}

                {weekIslands.map(islandId => (
                  <Line
                    key={islandId}
                    type="monotone"
                    dataKey={`${islandId}_Temp`}
                    stroke={islandColors[islandId as keyof typeof islandColors]}
                    strokeWidth={2.5}
                    name={`${islandId} Temp`}
                    connectNulls={false}
                    dot={false}
                    activeDot={{ 
                      r: 4, 
                      fill: islandColors[islandId as keyof typeof islandColors],
                      stroke: '#ffffff',
                      strokeWidth: 2
                    }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico Humedad */}
        <div className="clean-chart-container">
          <div className="chart-header-clean">
            <h3 className="chart-title-clean">
              💧 Humedad Relativa
            </h3>
            {(['full', 'day', 'night_plant'].includes(selectedPeriod)) && (
              <div className="time-blocks-legend">
                <small>
                  🌙 Madrugada Fría (23:00-02:00) | 🌌 Noche Profunda (02:01-08:00) | 
                  🌅 Amanecer (08:01-12:00) | ☀️ Día Activo (12:01-17:00) | 🌃 Noche Planta (17:01-22:59)
                </small>
              </div>
            )}
          </div>
          
          <div className="chart-wrapper-clean">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart 
                data={processedData}
                margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  domain={['dataMin - 2', 'dataMax + 2']}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                  label={{ 
                    value: 'Humedad (%)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fontSize: '12px', fill: '#475569' }
                  }}
                />
                <Tooltip />
                <Legend />
                
                {/* Líneas de referencia para humedad óptima */}
                <ReferenceLine 
                  y={weekConf.humidityMin} 
                  stroke="#3498db" 
                  strokeWidth={3}
                  strokeDasharray="8 4" 
                  strokeOpacity={0.9}
                  label={{ 
                    value: `HR Min: ${weekConf.humidityMin}%`, 
                    position: 'top',
                    style: { fontSize: '11px', fill: '#3498db', fontWeight: 'bold' }
                  }}
                />
                <ReferenceLine 
                  y={weekConf.humidityMax} 
                  stroke="#3498db" 
                  strokeWidth={3}
                  strokeDasharray="8 4" 
                  strokeOpacity={0.9}
                  label={{ 
                    value: `HR Max: ${weekConf.humidityMax}%`, 
                    position: 'top',
                    style: { fontSize: '11px', fill: '#3498db', fontWeight: 'bold' }
                  }}
                />

                {/* Divisiones temporales por bloques */}
                {renderTimeBlockDivisions()}

                {weekIslands.map(islandId => (
                  <Line
                    key={islandId}
                    type="monotone"
                    dataKey={`${islandId}_Humidity`}
                    stroke={islandColors[islandId as keyof typeof islandColors]}
                    strokeWidth={2.5}
                    name={`${islandId} HR`}
                    connectNulls={false}
                    dot={false}
                    activeDot={{ 
                      r: 4, 
                      fill: islandColors[islandId as keyof typeof islandColors],
                      stroke: '#ffffff',
                      strokeWidth: 2
                    }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="vpd-evolution-chart">
      {/* Análisis completo por semana */}
      {[1, 2, 3].map(weekNumber => renderWeekChart(weekNumber))}
    </div>
  );
};

export default VPDEvolutionChart;