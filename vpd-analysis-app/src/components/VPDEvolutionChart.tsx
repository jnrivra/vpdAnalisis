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
  Bar
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

    // Filtrar por período si no es 'full'
    // Día planta: 23:00 a 17:00 del día siguiente
    // Noche planta: 17:01 a 23:59
    if (selectedPeriod === 'day') {
      filteredData = data.data.filter(record => {
        const hour = record.hour;
        return hour >= 23 || hour < 17; // 23:00-23:59 y 00:00-16:59
      });
    } else if (selectedPeriod === 'night') {
      filteredData = data.data.filter(record => {
        const hour = record.hour;
        return hour >= 17 && hour < 23; // 17:00-22:59
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
      color: '#27ae60'
    },
    2: {
      name: 'Semana 2',
      icon: '🌿',
      vpdRange: '0.95-1.00',
      focus: 'Desarrollo foliar',
      optimalMin: 0.95,
      optimalMax: 1.00,
      color: '#f39c12'
    },
    3: {
      name: 'Semana 3',
      icon: '🥬',
      vpdRange: '0.80-1.00',
      focus: 'Máxima biomasa',
      optimalMin: 0.80,
      optimalMax: 1.00,
      color: '#3498db'
    }
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
                  strokeWidth={1.5}
                  strokeDasharray="5 5" 
                  strokeOpacity={0.6}
                />
                <ReferenceLine 
                  y={weekConf.optimalMax} 
                  stroke={weekConf.color} 
                  strokeWidth={1.5}
                  strokeDasharray="5 5" 
                  strokeOpacity={0.6}
                />

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

        {/* Gráfico Temperatura */}
        <div className="clean-chart-container">
          <div className="chart-header-clean">
            <h3 className="chart-title-clean">
              🌡️ Temperatura
            </h3>
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

        {/* Panel de Recomendaciones Inteligentes */}
        <div className="recommendations-panel">
          <div className="recommendations-header">
            <h3 className="recommendations-title">
              🎯 Recomendaciones de Ajuste - {weekConf.name}
            </h3>
            <p className="recommendations-subtitle">
              Acciones específicas para optimizar VPD - Período: {selectedPeriod === 'full' ? '24 Horas' : selectedPeriod === 'day' ? 'Día Planta (23:00-17:00)' : 'Noche Planta (17:01-22:59)'}
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
                
                recommendations.push({
                  status: 'low',
                  priority: 'high',
                  issue: `VPD muy bajo (${currentVPD.toFixed(2)} kPa)`,
                  options: [
                    {
                      action: `Subir temperatura +${tempIncrease}°C`,
                      detail: `${currentTemp.toFixed(1)}°C → ${(currentTemp + tempIncrease).toFixed(1)}°C`,
                      result: `VPD resultante: ${vpdWithTempIncrease.toFixed(2)} kPa`,
                      feasibility: tempIncrease <= 3 ? 'fácil' : 'moderado',
                      type: 'temperature'
                    },
                    {
                      action: `Reducir humedad -${humidityDecrease}%`,
                      detail: `${currentHumidity.toFixed(1)}% → ${(currentHumidity - humidityDecrease).toFixed(1)}%`,
                      result: `VPD resultante: ${vpdWithHumidityDecrease.toFixed(2)} kPa`,
                      feasibility: currentHumidity - humidityDecrease > 50 ? 'fácil' : 'difícil',
                      type: 'humidity'
                    }
                  ]
                });
              } else if (currentVPD > targetVPDMax) {
                // VPD muy alto - necesita bajar
                const tempDecrease = 2.0; // Bajar 2°C
                const vpdWithTempDecrease = calculateVPD(currentTemp - tempDecrease, currentHumidity);
                
                const humidityIncrease = 10; // Subir 10%
                const vpdWithHumidityIncrease = calculateVPD(currentTemp, currentHumidity + humidityIncrease);
                
                recommendations.push({
                  status: 'high',
                  priority: 'high',
                  issue: `VPD muy alto (${currentVPD.toFixed(2)} kPa)`,
                  options: [
                    {
                      action: `Reducir temperatura -${tempDecrease}°C`,
                      detail: `${currentTemp.toFixed(1)}°C → ${(currentTemp - tempDecrease).toFixed(1)}°C`,
                      result: `VPD resultante: ${vpdWithTempDecrease.toFixed(2)} kPa`,
                      feasibility: currentTemp - tempDecrease > 18 ? 'fácil' : 'difícil',
                      type: 'temperature'
                    },
                    {
                      action: `Aumentar humedad +${humidityIncrease}%`,
                      detail: `${currentHumidity.toFixed(1)}% → ${(currentHumidity + humidityIncrease).toFixed(1)}%`,
                      result: `VPD resultante: ${vpdWithHumidityIncrease.toFixed(2)} kPa`,
                      feasibility: currentHumidity + humidityIncrease < 85 ? 'fácil' : 'moderado',
                      type: 'humidity'
                    }
                  ]
                });
              } else {
                // VPD en rango óptimo
                recommendations.push({
                  status: 'optimal',
                  priority: 'low',
                  issue: `VPD en rango óptimo (${currentVPD.toFixed(2)} kPa)`,
                  options: [
                    {
                      action: 'Mantener condiciones actuales',
                      detail: `Temp: ${currentTemp.toFixed(1)}°C, HR: ${currentHumidity.toFixed(1)}%`,
                      result: 'Condiciones ideales para el crecimiento',
                      feasibility: 'fácil',
                      type: 'maintain'
                    }
                  ]
                });
              }

              return (
                <div key={islandId} className={`recommendation-card status-${recommendations[0]?.status}`}>
                  <div className="rec-card-header">
                    <h4 className="rec-island-title">
                      <span className="rec-island-icon" style={{ color: islandColors[islandId as keyof typeof islandColors] }}>
                        🏝️
                      </span>
                      {islandId}
                    </h4>
                    <div className={`rec-priority priority-${recommendations[0]?.priority}`}>
                      {recommendations[0]?.priority === 'high' ? '🔴 Alta' : 
                       recommendations[0]?.priority === 'medium' ? '🟡 Media' : '🟢 Baja'}
                    </div>
                  </div>

                  <div className="rec-current-status">
                    <div className="rec-metric">
                      <span className="rec-label">VPD Actual:</span>
                      <span className={`rec-value ${recommendations[0]?.status}`}>
                        {currentVPD.toFixed(2)} kPa
                      </span>
                    </div>
                    <div className="rec-metric">
                      <span className="rec-label">Objetivo:</span>
                      <span className="rec-value target">
                        {weekConf.vpdRange} kPa
                      </span>
                    </div>
                  </div>

                  <div className="rec-issue">
                    <span className="rec-issue-text">{recommendations[0]?.issue}</span>
                  </div>

                  <div className="rec-options">
                    <h5 className="rec-options-title">Opciones de Ajuste:</h5>
                    {recommendations[0]?.options.map((option, idx) => (
                      <div key={idx} className={`rec-option feasibility-${option.feasibility}`}>
                        <div className="rec-option-header">
                          <span className="rec-option-action">{option.action}</span>
                          <span className={`rec-feasibility ${option.feasibility}`}>
                            {option.feasibility === 'fácil' ? '✅ Fácil' :
                             option.feasibility === 'moderado' ? '⚠️ Moderado' : '❌ Difícil'}
                          </span>
                        </div>
                        <div className="rec-option-detail">{option.detail}</div>
                        <div className="rec-option-result">{option.result}</div>
                      </div>
                    ))}
                  </div>

                  <div className="rec-time-impact">
                    <small>
                      📊 Tiempo en rango óptimo ({selectedPeriod === 'full' ? '24h' : selectedPeriod === 'day' ? 'día planta' : 'noche planta'}): {optimalTimePercentage.toFixed(1)}%
                    </small>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumen de acciones por semana */}
          <div className="week-summary-actions">
            <h4>📋 Resumen de Acciones Prioritarias - {weekConf.name}</h4>
            <div className="summary-actions-grid">
              {weekIslands.map(islandId => {
                // Usar las estadísticas calculadas del período actual
                let periodData = processedData.map(record => ({
                  vpd: record[`${islandId}_VPD`]
                })).filter(record => record.vpd !== undefined);

                if (periodData.length === 0) return null;

                const currentVPD = periodData.reduce((sum, record) => sum + record.vpd, 0) / periodData.length;
                const actionNeeded = currentVPD < weekConf.optimalMin ? 'Subir VPD' :
                                   currentVPD > weekConf.optimalMax ? 'Bajar VPD' : 'Mantener';
                
                return (
                  <div key={islandId} className="summary-action-item">
                    <span className="summary-island">{islandId}:</span>
                    <span className={`summary-action ${actionNeeded.toLowerCase().replace(' ', '-')}`}>
                      {actionNeeded}
                    </span>
                  </div>
                );
              })}
            </div>
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