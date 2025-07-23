import React, { useMemo } from 'react';
import { VPDData, WeekConfig } from '../types/vpd-types';

interface VPDAnalysisTableProps {
  data: VPDData;
  weekConfig: WeekConfig;
}

const VPDAnalysisTable: React.FC<VPDAnalysisTableProps> = ({ data, weekConfig }) => {
  // Configuración de semanas por isla basado en el estado real del cultivo
  const islandWeekAssignments = {
    I1: 3, // Week 3 - Máxima biomasa (Albahaca 100% ocupada)
    I2: 2, // Week 2 - Desarrollo foliar (Albahaca 100% ocupada)
    I3: 1, // Week 1 - Establecimiento radicular (Mixto, parcialmente vacía)
    I4: 3, // Week 3 - Máxima biomasa (Mixto, parcialmente vacía)
    I5: 0, // VACÍA - Sin cultivo activo
    I6: 1  // Week 1 - Establecimiento radicular (Mixto 100% ocupada)
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

  // Análisis detallado por isla
  const islandAnalysis = useMemo(() => {
    return Object.entries(data.statistics).map(([islandId, stats]) => {
      // Obtener configuración específica para esta isla
      const islandWeek = islandWeekAssignments[islandId as keyof typeof islandWeekAssignments];
      const islandWeekConfig = weekConfigs[islandWeek];
      
      // Determinar problemas específicos
      const problems: string[] = [];
      const recommendations: string[] = [];

      // Análisis VPD específico para la semana de esta isla
      if (stats.vpd.avg < islandWeekConfig.optimalMin) {
        problems.push(`VPD promedio por debajo del rango óptimo para ${islandWeekConfig.name}`);
        recommendations.push('Aumentar temperatura o reducir humedad relativa');
      } else if (stats.vpd.avg > islandWeekConfig.optimalMax) {
        problems.push(`VPD promedio por encima del rango óptimo para ${islandWeekConfig.name}`);
        recommendations.push('Reducir temperatura o aumentar humedad relativa');
      }

      // Análisis de variabilidad
      const vpdRange = stats.vpd.max - stats.vpd.min;
      if (vpdRange > 0.6) {
        problems.push('Alta variabilidad VPD durante el día');
        recommendations.push('Mejorar control ambiental para mayor estabilidad');
      }

      // Análisis tiempo en rango
      const optimalTime = (stats as any).optimal_time_percentage || 0;
      if (optimalTime < 80) {
        problems.push('Poco tiempo en rango VPD óptimo');
        recommendations.push('Ajustar setpoints de control ambiental');
      }

      // Análisis temperatura
      const tempRange = stats.temperature.max - stats.temperature.min;
      if (tempRange > 6) {
        problems.push('Fluctuaciones excesivas de temperatura');
        recommendations.push('Revisar control de calefacción/refrigeración');
      }

      // Análisis humedad
      const humidityRange = stats.humidity.max - stats.humidity.min;
      if (humidityRange > 20) {
        problems.push('Fluctuaciones excesivas de humedad');
        recommendations.push('Verificar funcionamiento de deshumidificadores');
      }

      // Clasificación de estado general
      let status: 'excellent' | 'good' | 'acceptable' | 'needs_improvement' = 'excellent';
      
      if (optimalTime >= 95 && vpdRange <= 0.4) {
        status = 'excellent';
      } else if (optimalTime >= 85 && vpdRange <= 0.5) {
        status = 'good';
      } else if (optimalTime >= 70 && vpdRange <= 0.6) {
        status = 'acceptable';
      } else {
        status = 'needs_improvement';
      }

      return {
        islandId,
        stats,
        problems,
        recommendations,
        status,
        vpdRange,
        tempRange,
        humidityRange,
        islandWeekConfig,
        islandWeek
      };
    });
  }, [data.statistics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return '#27ae60';
      case 'good': return '#2ecc71';
      case 'acceptable': return '#f39c12';
      case 'needs_improvement': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'excellent': return '🌟 Excelente';
      case 'good': return '✅ Bueno';
      case 'acceptable': return '⚠️ Aceptable';
      case 'needs_improvement': return '❌ Necesita Mejora';
      default: return '❓ Sin Clasificar';
    }
  };

  return (
    <div className="vpd-analysis-table">
      <div className="analysis-header">
        <h2>📊 Análisis Detallado por Isla - 21 Julio 2025</h2>
        <p>
          Evaluación basada en objetivos específicos por semana de cultivo de cada isla
        </p>
        <div className="island-week-summary">
          <strong>Estado de las Islas:</strong>
          <span style={{ color: weekConfigs[3].color }}> I1, I4 (🥬 Semana 3)</span> •
          <span style={{ color: weekConfigs[2].color }}> I2 (🌿 Semana 2)</span> •
          <span style={{ color: weekConfigs[1].color }}> I3, I6 (🌱 Semana 1)</span> •
          <span style={{ color: weekConfigs[0].color }}> I5 (🏝️ Sin cultivo)</span>
        </div>
      </div>

      {/* Tabla resumen */}
      <div className="summary-table">
        <h3>📋 Resumen General</h3>
        <table className="analysis-summary-table">
          <thead>
            <tr>
              <th>Isla</th>
              <th>Semana</th>
              <th>Estado</th>
              <th>VPD Promedio</th>
              <th>Rango VPD</th>
              <th>Tiempo Óptimo</th>
              <th>Temp Promedio</th>
              <th>HR Promedio</th>
              <th>Problemas</th>
            </tr>
          </thead>
          <tbody>
            {islandAnalysis.map((analysis) => (
              <tr key={analysis.islandId}>
                <td className="island-cell">
                  <strong>{analysis.islandId}</strong>
                </td>
                <td className="week-cell">
                  <span style={{ color: analysis.islandWeekConfig.color }}>
                    {analysis.islandWeekConfig.icon} {analysis.islandWeekConfig.name}
                  </span>
                  <br />
                  <small>Target: {analysis.islandWeekConfig.vpdRange} kPa</small>
                </td>
                <td 
                  className="status-cell"
                  style={{ color: getStatusColor(analysis.status) }}
                >
                  {getStatusText(analysis.status)}
                </td>
                <td className="vpd-cell">
                  <span 
                    className={
                      analysis.stats.vpd.avg >= analysis.islandWeekConfig.optimalMin && 
                      analysis.stats.vpd.avg <= analysis.islandWeekConfig.optimalMax 
                        ? 'optimal-value' 
                        : 'suboptimal-value'
                    }
                  >
                    {analysis.stats.vpd.avg.toFixed(3)} kPa
                  </span>
                </td>
                <td className="range-cell">
                  {analysis.stats.vpd.min.toFixed(3)} - {analysis.stats.vpd.max.toFixed(3)}
                  <br />
                  <small>Δ{analysis.vpdRange.toFixed(3)} kPa</small>
                </td>
                <td 
                  className="time-optimal-cell"
                  style={{ 
                    color: (analysis.stats as any).optimal_time_percentage >= 95 
                      ? '#27ae60' 
                      : (analysis.stats as any).optimal_time_percentage >= 80 
                        ? '#f39c12' 
                        : '#e74c3c' 
                  }}
                >
                  {(analysis.stats as any).optimal_time_percentage?.toFixed(1) || 'N/A'}%
                </td>
                <td className="temp-cell">
                  {analysis.stats.temperature.avg.toFixed(1)}°C
                  <br />
                  <small>Δ{analysis.tempRange.toFixed(1)}°C</small>
                </td>
                <td className="humidity-cell">
                  {analysis.stats.humidity.avg.toFixed(1)}%
                  <br />
                  <small>Δ{analysis.humidityRange.toFixed(1)}%</small>
                </td>
                <td className="problems-cell">
                  {analysis.problems.length}
                  {analysis.problems.length > 0 && (
                    <span className="problems-indicator">⚠️</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Análisis detallado por isla */}
      <div className="detailed-analysis">
        <h3>🔍 Análisis Detallado por Isla</h3>
        <div className="island-analysis-cards">
          {islandAnalysis.map((analysis) => (
            <div key={analysis.islandId} className="island-analysis-card">
              <div className="card-header">
                <h4>
                  {analysis.islandWeekConfig.icon} {analysis.islandId} 
                  <small style={{ color: analysis.islandWeekConfig.color }}>
                    ({analysis.islandWeekConfig.name})
                  </small>
                </h4>
                <div 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(analysis.status) }}
                >
                  {getStatusText(analysis.status)}
                </div>
              </div>

              <div className="card-content">
                {/* Métricas principales */}
                <div className="metrics-section">
                  <h5>📊 Métricas Principales</h5>
                  <div className="metrics-grid">
                    <div className="metric">
                      <span className="metric-label">VPD Promedio:</span>
                      <span className={
                        analysis.stats.vpd.avg >= analysis.islandWeekConfig.optimalMin && 
                        analysis.stats.vpd.avg <= analysis.islandWeekConfig.optimalMax 
                          ? 'metric-value optimal' 
                          : 'metric-value suboptimal'
                      }>
                        {analysis.stats.vpd.avg.toFixed(3)} kPa
                      </span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Target VPD:</span>
                      <span className="metric-value" style={{ color: analysis.islandWeekConfig.color }}>
                        {analysis.islandWeekConfig.vpdRange} kPa
                      </span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Rango VPD:</span>
                      <span className="metric-value">
                        {analysis.stats.vpd.min.toFixed(3)} - {analysis.stats.vpd.max.toFixed(3)} kPa
                      </span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Tiempo Óptimo:</span>
                      <span className={
                        (analysis.stats as any).optimal_time_percentage >= 95 
                          ? 'metric-value excellent'
                          : (analysis.stats as any).optimal_time_percentage >= 80 
                            ? 'metric-value good' 
                            : 'metric-value needs-improvement'
                      }>
                        {(analysis.stats as any).optimal_time_percentage?.toFixed(1) || 'N/A'}%
                      </span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Variabilidad VPD:</span>
                      <span className={analysis.vpdRange <= 0.4 ? 'metric-value excellent' : 'metric-value needs-improvement'}>
                        {analysis.vpdRange.toFixed(3)} kPa
                      </span>
                    </div>
                  </div>
                </div>

                {/* Problemas identificados */}
                {analysis.problems.length > 0 && (
                  <div className="problems-section">
                    <h5>⚠️ Problemas Identificados</h5>
                    <ul className="problems-list">
                      {analysis.problems.map((problem, index) => (
                        <li key={index} className="problem-item">
                          {problem}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recomendaciones */}
                {analysis.recommendations.length > 0 && (
                  <div className="recommendations-section">
                    <h5>💡 Recomendaciones</h5>
                    <ul className="recommendations-list">
                      {analysis.recommendations.map((recommendation, index) => (
                        <li key={index} className="recommendation-item">
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Condiciones ambientales detalladas */}
                <div className="environmental-section">
                  <h5>🌡️ Condiciones Ambientales</h5>
                  <div className="env-metrics">
                    <div className="env-metric">
                      <span className="env-label">Temperatura:</span>
                      <span className="env-value">
                        {analysis.stats.temperature.avg.toFixed(1)}°C 
                        (Rango: {analysis.stats.temperature.min.toFixed(1)}°C - {analysis.stats.temperature.max.toFixed(1)}°C)
                      </span>
                    </div>
                    <div className="env-metric">
                      <span className="env-label">Humedad Relativa:</span>
                      <span className="env-value">
                        {analysis.stats.humidity.avg.toFixed(1)}% 
                        (Rango: {analysis.stats.humidity.min.toFixed(1)}% - {analysis.stats.humidity.max.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recomendaciones generales */}
      <div className="general-recommendations">
        <h3>🎯 Recomendaciones Generales del Sistema</h3>
        <div className="general-rec-content">
          <div className="rec-category">
            <h4>🏆 Islas con Mejor Rendimiento</h4>
            <ul>
              {islandAnalysis
                .filter(analysis => analysis.status === 'excellent' || analysis.status === 'good')
                .map(analysis => (
                  <li key={analysis.islandId}>
                    <strong>{analysis.islandId}</strong>: {(analysis.stats as any).optimal_time_percentage?.toFixed(1) || 'N/A'}% tiempo óptimo
                  </li>
                ))}
            </ul>
          </div>

          <div className="rec-category">
            <h4>⚠️ Islas que Requieren Atención</h4>
            <ul>
              {islandAnalysis
                .filter(analysis => analysis.status === 'needs_improvement' || analysis.status === 'acceptable')
                .map(analysis => (
                  <li key={analysis.islandId}>
                    <strong>{analysis.islandId}</strong>: {analysis.problems.length} problema(s) identificado(s)
                  </li>
                ))}
            </ul>
          </div>

          <div className="rec-category">
            <h4>📈 Acciones Prioritarias</h4>
            <ul>
              <li>Revisar calibración de sensores en islas con alta variabilidad VPD</li>
              <li>Ajustar setpoints de deshumidificadores según target específico de cada isla</li>
              <li>Implementar control más estricto durante transiciones día/noche</li>
              <li>Considerar mejoras en el sistema de distribución de aire</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VPDAnalysisTable;