import React, { useState, useMemo } from 'react';
import { VPDData, WeekConfig, IslandSelection } from '../types/vpd-types';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  Cell 
} from 'recharts';

interface VPDOptimizerProps {
  data: VPDData;
  selectedIslands: IslandSelection;
  weekConfig: WeekConfig;
}

const VPDOptimizer: React.FC<VPDOptimizerProps> = ({ data, selectedIslands, weekConfig }) => {
  // Configuración de semanas por isla
  const islandWeekAssignments = {
    I1: 3, // Week 3 - Máxima biomasa (Albahaca 100% ocupada)
    I2: 2, // Week 2 - Desarrollo foliar (Albahaca 100% ocupada)
    I3: 1, // Week 1 - Establecimiento radicular (Mixto, parcialmente vacía)
    I4: 3, // Week 3 - Máxima biomasa (Mixto, parcialmente vacía)
    I5: 0, // VACÍA - Sin cultivo activo
    I6: 1  // Week 1 - Establecimiento radicular (Mixto 100% ocupada)
  };

  const weekConfigs = {
    0: { name: 'Sin Cultivo', icon: '🏝️', vpdRange: 'N/A', color: '#95a5a6' },
    1: { name: 'Semana 1', icon: '🌱', vpdRange: '1.00-1.05', color: '#27ae60' },
    2: { name: 'Semana 2', icon: '🌿', vpdRange: '0.95-1.00', color: '#f39c12' },
    3: { name: 'Semana 3', icon: '🥬', vpdRange: '0.80-1.00', color: '#3498db' }
  };

  // Estados para el optimizador
  const [selectedIsland, setSelectedIsland] = useState<string>('I3');
  const [currentTemp, setCurrentTemp] = useState<number>(23.0);
  const [targetVPD, setTargetVPD] = useState<number>(1.0);
  const [showScenarios, setShowScenarios] = useState<boolean>(true);

  // Función para calcular VPD
  const calculateVPD = (temperature: number, humidity: number): number => {
    const svp = 0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3));
    return svp * (1 - humidity / 100);
  };

  // Función para calcular humedad necesaria dado temp y VPD objetivo
  const calculateRequiredHumidity = (temperature: number, targetVPD: number): number => {
    const svp = 0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3));
    return (1 - targetVPD / svp) * 100;
  };

  // Generar datos para el gráfico de superficie VPD
  const surfaceData = useMemo(() => {
    const data = [];
    for (let temp = 18; temp <= 26; temp += 0.5) {
      for (let humidity = 55; humidity <= 85; humidity += 2) {
        const vpd = calculateVPD(temp, humidity);
        let category = 'out_of_range';
        
        if (vpd >= weekConfig.optimalMin && vpd <= weekConfig.optimalMax) {
          category = 'optimal';
        } else if (vpd >= weekConfig.acceptableMin && vpd <= weekConfig.acceptableMax) {
          category = 'acceptable';
        } else if (vpd < weekConfig.acceptableMin) {
          category = 'too_low';
        } else {
          category = 'too_high';
        }

        data.push({
          temperature: temp,
          humidity: humidity,
          vpd: vpd,
          category: category
        });
      }
    }
    return data;
  }, [weekConfig]);

  // Datos de la isla seleccionada (para uso futuro)
  // const islandData = useMemo(() => {
  //   return data.data.map(record => {
  //     const island = record.islands[selectedIsland as keyof typeof record.islands];
  //     return {
  //       time: record.time,
  //       temperature: island.temperature,
  //       humidity: island.humidity,
  //       vpd: island.vpd,
  //       hour: record.hour
  //     };
  //   });
  // }, [data, selectedIsland]);

  // Calcular escenarios de optimización
  const optimizationScenarios = useMemo(() => {
    const scenarios = [];
    
    // Escenario actual
    const currentHumidityOptions = [60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80];
    
    for (const humidity of currentHumidityOptions) {
      const vpd = calculateVPD(currentTemp, humidity);
      let status = 'suboptimal';
      
      if (vpd >= weekConfig.optimalMin && vpd <= weekConfig.optimalMax) {
        status = 'optimal';
      } else if (vpd >= weekConfig.acceptableMin && vpd <= weekConfig.acceptableMax) {
        status = 'acceptable';
      }

      scenarios.push({
        temperature: currentTemp,
        humidity: humidity,
        vpd: vpd,
        status: status,
        difference: Math.abs(vpd - targetVPD)
      });
    }

    // Ordenar por cercanía al VPD objetivo
    return scenarios.sort((a, b) => a.difference - b.difference);
  }, [currentTemp, targetVPD, weekConfig]);

  // Calcular humedad óptima para temperatura actual
  const optimalHumidity = useMemo(() => {
    return calculateRequiredHumidity(currentTemp, targetVPD);
  }, [currentTemp, targetVPD]);

  const getColorForCategory = (category: string) => {
    switch (category) {
      case 'optimal': return '#27ae60';
      case 'acceptable': return '#f39c12';
      case 'too_low': return '#3498db';
      case 'too_high': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="optimizer-tooltip">
          <p>Temp: {data.temperature}°C</p>
          <p>HR: {data.humidity}%</p>
          <p>VPD: {data.vpd.toFixed(3)} kPa</p>
          <p>Estado: {data.category === 'optimal' ? '✅ Óptimo' : 
                     data.category === 'acceptable' ? '⚠️ Aceptable' : 
                     data.category === 'too_low' ? '🔵 Bajo' : '🔴 Alto'}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="vpd-optimizer">
      <div className="optimizer-header">
        <h2>🎯 Optimizador VPD - Escenarios de Control</h2>
      </div>

      {/* Panel de Control */}
      <div className="optimizer-controls">
        <div className="control-section">
          <h3>🎛️ Configuración del Escenario</h3>
          <div className="control-grid">
            <div className="control-group">
              <label htmlFor="island-select">Isla de Referencia:</label>
              <select 
                id="island-select"
                value={selectedIsland}
                onChange={(e) => setSelectedIsland(e.target.value)}
              >
                {Object.keys(data.statistics).filter(id => id !== 'I5').map(islandId => {
                  const islandWeek = islandWeekAssignments[islandId as keyof typeof islandWeekAssignments];
                  const weekConf = weekConfigs[islandWeek as keyof typeof weekConfigs];
                  return (
                    <option key={islandId} value={islandId}>
                      {weekConf.icon} {islandId} ({weekConf.name}) - VPD: {data.statistics[islandId as keyof typeof data.statistics].vpd.avg.toFixed(3)} kPa | Target: {weekConf.vpdRange} kPa
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="control-group">
              <label htmlFor="temp-input">Temperatura Actual (°C):</label>
              <input
                id="temp-input"
                type="number"
                value={currentTemp}
                onChange={(e) => setCurrentTemp(parseFloat(e.target.value))}
                min="18"
                max="30"
                step="0.1"
              />
            </div>

            <div className="control-group">
              <label htmlFor="target-vpd">VPD Objetivo (kPa):</label>
              <input
                id="target-vpd"
                type="number"
                value={targetVPD}
                onChange={(e) => setTargetVPD(parseFloat(e.target.value))}
                min="0.4"
                max="1.5"
                step="0.05"
              />
            </div>

            <div className="control-group">
              <label>
                <input
                  type="checkbox"
                  checked={showScenarios}
                  onChange={(e) => setShowScenarios(e.target.checked)}
                />
                Mostrar escenarios en gráfico
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Resultado del Cálculo Óptimo */}
      <div className="optimization-result">
        <h3>💡 Resultado del Optimizador</h3>
        <div className="result-card optimal-result">
          <div className="result-main">
            <h4>Para alcanzar VPD = {targetVPD} kPa con T = {currentTemp}°C:</h4>
            <div className="result-value">
              <span className="result-label">Humedad Relativa Necesaria:</span>
              <span className="result-number">{optimalHumidity.toFixed(1)}%</span>
            </div>
            
            {optimalHumidity < 55 && (
              <div className="result-warning">
                ⚠️ Humedad muy baja ({optimalHumidity.toFixed(1)}%) - Difícil de mantener
              </div>
            )}
            {optimalHumidity > 85 && (
              <div className="result-warning">
                ⚠️ Humedad muy alta ({optimalHumidity.toFixed(1)}%) - Riesgo de condensación
              </div>
            )}
          </div>
          
          <div className="current-vs-optimal">
            <div className="comparison-item">
              <span className="comp-label">Condición Actual Isla {selectedIsland}:</span>
              <span className="comp-value current">
                {data.statistics[selectedIsland as keyof typeof data.statistics].temperature.avg.toFixed(1)}°C / 
                {data.statistics[selectedIsland as keyof typeof data.statistics].humidity.avg.toFixed(1)}% = 
                {data.statistics[selectedIsland as keyof typeof data.statistics].vpd.avg.toFixed(3)} kPa
              </span>
            </div>
            <div className="comparison-item">
              <span className="comp-label">Condición Óptima:</span>
              <span className="comp-value optimal">
                {currentTemp}°C / {optimalHumidity.toFixed(1)}% = {targetVPD} kPa
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Escenarios */}
      <div className="scenarios-table">
        <h3>📊 Escenarios de Humedad (Temp fija: {currentTemp}°C)</h3>
        <div className="scenarios-grid">
          {optimizationScenarios.slice(0, 8).map((scenario, index) => (
            <div 
              key={index} 
              className={`scenario-card ${scenario.status}`}
            >
              <div className="scenario-header">
                <span className="scenario-humidity">{scenario.humidity}% HR</span>
                <span className={`scenario-status ${scenario.status}`}>
                  {scenario.status === 'optimal' ? '🎯' : 
                   scenario.status === 'acceptable' ? '✅' : '⚠️'}
                </span>
              </div>
              <div className="scenario-vpd">
                VPD: {scenario.vpd.toFixed(3)} kPa
              </div>
              <div className="scenario-difference">
                Δ{scenario.difference.toFixed(3)} del objetivo
              </div>
              {scenario.status === 'optimal' && (
                <div className="scenario-badge">¡ÓPTIMO!</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tabla clásica VPD */}
      <div className="vpd-table-classic">
        <h3>🗺️ Tabla de Condiciones VPD</h3>
        <p>
          Tabla VPD clásica mostrando las combinaciones de temperatura y humedad con código de colores para identificar condiciones óptimas.
        </p>
        
        <div className="vpd-table-container">
          <table className="vpd-conditions-table">
            <thead>
              <tr>
                <th>Temp\HR</th>
                {[55, 60, 65, 70, 75, 80, 85].map(humidity => (
                  <th key={humidity}>{humidity}%</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[18, 19, 20, 21, 22, 23, 24, 25, 26].map(temperature => (
                <tr key={temperature}>
                  <td className="temp-header">{temperature}°C</td>
                  {[55, 60, 65, 70, 75, 80, 85].map(humidity => {
                    const vpd = calculateVPD(temperature, humidity);
                    
                    // Obtener configuración de la isla seleccionada
                    const selectedIslandWeek = islandWeekAssignments[selectedIsland as keyof typeof islandWeekAssignments];
                    const selectedWeekConf = weekConfigs[selectedIslandWeek as keyof typeof weekConfigs];
                    
                    let cellClass = 'vpd-cell';
                    let cellColor = '#95a5a6'; // default gray
                    
                    if (selectedIslandWeek > 0) { // Si no es isla vacía
                      if (selectedIslandWeek === 1) { // Semana 1: 1.00-1.05
                        if (vpd >= 1.00 && vpd <= 1.05) {
                          cellClass += ' optimal';
                          cellColor = '#27ae60'; // verde
                        } else if (vpd >= 0.95 && vpd <= 1.10) {
                          cellClass += ' acceptable';
                          cellColor = '#f39c12'; // naranja
                        } else if (vpd < 0.95) {
                          cellClass += ' low';
                          cellColor = '#3498db'; // azul
                        } else {
                          cellClass += ' high';
                          cellColor = '#e74c3c'; // rojo
                        }
                      } else if (selectedIslandWeek === 2) { // Semana 2: 0.95-1.00
                        if (vpd >= 0.95 && vpd <= 1.00) {
                          cellClass += ' optimal';
                          cellColor = '#27ae60';
                        } else if (vpd >= 0.90 && vpd <= 1.05) {
                          cellClass += ' acceptable';
                          cellColor = '#f39c12';
                        } else if (vpd < 0.90) {
                          cellClass += ' low';
                          cellColor = '#3498db';
                        } else {
                          cellClass += ' high';
                          cellColor = '#e74c3c';
                        }
                      } else if (selectedIslandWeek === 3) { // Semana 3: 0.80-1.00
                        if (vpd >= 0.80 && vpd <= 1.00) {
                          cellClass += ' optimal';
                          cellColor = '#27ae60';
                        } else if (vpd >= 0.75 && vpd <= 1.05) {
                          cellClass += ' acceptable';
                          cellColor = '#f39c12';
                        } else if (vpd < 0.75) {
                          cellClass += ' low';
                          cellColor = '#3498db';
                        } else {
                          cellClass += ' high';
                          cellColor = '#e74c3c';
                        }
                      }
                    }
                    
                    const isCurrentPoint = temperature === currentTemp && Math.abs(humidity - optimalHumidity) < 5;
                    
                    return (
                      <td 
                        key={`${temperature}-${humidity}`}
                        className={cellClass}
                        style={{ 
                          backgroundColor: cellColor,
                          color: 'white',
                          fontWeight: 'bold',
                          border: isCurrentPoint ? '3px solid #000' : '1px solid #ddd',
                          position: 'relative'
                        }}
                        title={`${temperature}°C, ${humidity}% HR = ${vpd.toFixed(3)} kPa`}
                      >
                        {vpd.toFixed(2)}
                        {isCurrentPoint && <span style={{position: 'absolute', top: '-2px', right: '-2px', fontSize: '16px'}}>⭐</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="table-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#27ae60' }}></div>
            <span>Óptimo</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#f39c12' }}></div>
            <span>Aceptable</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#3498db' }}></div>
            <span>VPD Bajo</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#e74c3c' }}></div>
            <span>VPD Alto</span>
          </div>
          <div className="legend-item">
            <span>⭐ Punto actual aproximado</span>
          </div>
        </div>
      </div>

      {/* Recomendaciones de Control */}
      <div className="control-recommendations">
        <h3>🔧 Recomendaciones de Control</h3>
        <div className="recommendations-grid">
          <div className="recommendation-card">
            <h4>📈 Para Aumentar VPD</h4>
            <ul>
              <li>Aumentar temperatura (+1-2°C)</li>
              <li>Reducir humedad relativa (-5-10%)</li>
              <li>Activar deshumidificadores</li>
              <li>Mejorar ventilación</li>
            </ul>
          </div>
          
          <div className="recommendation-card">
            <h4>📉 Para Reducir VPD</h4>
            <ul>
              <li>Reducir temperatura (-1-2°C)</li>
              <li>Aumentar humedad relativa (+5-10%)</li>
              <li>Reducir ventilación</li>
              <li>Nebulización controlada</li>
            </ul>
          </div>
          
          <div className="recommendation-card">
            <h4>⚖️ Control Balanceado</h4>
            <ul>
              <li>Monitorear continuamente VPD</li>
              <li>Ajustar gradualmente (±0.05 kPa)</li>
              <li>Considerar períodos día/noche</li>
              <li>Validar con múltiples sensores</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VPDOptimizer;