import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer, Area } from 'recharts';
import { Thermometer, TrendingUp, Activity, AlertCircle, Clock, Target } from 'lucide-react';
import { useVPDData, useThermalAnalysisData } from '../hooks/useVPDData';
import { DayPeriod, TimeBlock, IslandSelection, IslandId } from '../types/vpd-types';
import './ThermalAnalysisPanel.css';

interface ThermalAnalysisPanelProps {
  selectedIslands: IslandSelection;
}

const ThermalAnalysisPanel: React.FC<ThermalAnalysisPanelProps> = ({ selectedIslands }) => {
  // Estado local para los controles de esta pestaña
  const [localPeriod, setLocalPeriod] = useState<DayPeriod>('full');
  const [localTimeBlock, setLocalTimeBlock] = useState<TimeBlock | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<'temperature' | 'gradient' | 'integral'>('temperature');
  
  // Obtener datos
  const { data: fullData, loading, error } = useVPDData();
  
  // Filtrar las islas seleccionadas
  const activeIslands = Object.entries(selectedIslands)
    .filter(([_, selected]) => selected)
    .map(([island]) => island);
  
  // Obtener datos de análisis térmico para la primera isla seleccionada
  const primaryIsland = (activeIslands[0] || 'I1') as IslandId;
  const { data: thermalData } = useThermalAnalysisData(primaryIsland);

  // Procesar datos según el período seleccionado
  const processedData = useMemo(() => {
    if (!fullData || !thermalData) return [];
    
    let filtered = thermalData;
    
    // Filtrar por período
    if (localPeriod === 'day') {
      filtered = filtered.filter(record => record.hour >= 23 || record.hour < 17);
    } else if (localPeriod === 'night') {
      filtered = filtered.filter(record => record.hour >= 17 && record.hour < 23);
    }
    
    // Filtrar por bloque temporal si está seleccionado
    if (localTimeBlock) {
      filtered = filtered.filter(record => {
        const hour = record.hour;
        switch (localTimeBlock) {
          case 'dawn_cold':
            return hour >= 23 || hour <= 2;
          case 'night_deep':
            return hour > 2 && hour <= 8;
          case 'morning':
            return hour > 8 && hour <= 12;
          case 'day_active':
            return hour > 12 && hour < 17;
          case 'night_plant':
            return hour >= 17 && hour < 23;
          default:
            return true;
        }
      });
    }
    
    return filtered;
  }, [fullData, thermalData, localPeriod, localTimeBlock]);

  // Calcular estadísticas térmicas
  const thermalStats = useMemo(() => {
    if (!processedData || processedData.length === 0) return null;
    
    const temperatures = processedData.map(d => d.islands[primaryIsland]?.temperature || 0);
    const gradients = processedData.map(d => d.gradient || 0);
    
    const avgTemp = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
    const maxTemp = Math.max(...temperatures);
    const minTemp = Math.min(...temperatures);
    const amplitude = maxTemp - minTemp;
    
    const maxGradient = Math.max(...gradients);
    const minGradient = Math.min(...gradients);
    
    // Calcular integral térmica (grados-hora)
    const integralThermal = temperatures.reduce((sum, temp, index) => {
      if (index === 0) return sum;
      const duration = 5 / 60; // 5 minutos en horas
      return sum + (temp * duration);
    }, 0);
    
    return {
      avgTemp: avgTemp.toFixed(1),
      maxTemp: maxTemp.toFixed(1),
      minTemp: minTemp.toFixed(1),
      amplitude: amplitude.toFixed(1),
      maxGradient: maxGradient.toFixed(2),
      minGradient: minGradient.toFixed(2),
      integralThermal: integralThermal.toFixed(0)
    };
  }, [processedData, primaryIsland]);

  // Renderizar controles locales
  const renderLocalControls = () => (
    <div className="thermal-controls">
      <div className="control-group">
        <label>Período de Análisis</label>
        <div className="period-selector">
          <button 
            className={localPeriod === 'full' ? 'active' : ''}
            onClick={() => setLocalPeriod('full')}
          >
            🕐 24 Horas
          </button>
          <button 
            className={localPeriod === 'day' ? 'active' : ''}
            onClick={() => setLocalPeriod('day')}
          >
            ☀️ Día Planta
          </button>
          <button 
            className={localPeriod === 'night' ? 'active' : ''}
            onClick={() => setLocalPeriod('night')}
          >
            🌙 Noche Planta
          </button>
        </div>
      </div>

      <div className="control-group">
        <label>Bloque Temporal</label>
        <div className="timeblock-selector">
          <button 
            className={localTimeBlock === null ? 'active' : ''}
            onClick={() => setLocalTimeBlock(null)}
          >
            Todos
          </button>
          <button 
            className={localTimeBlock === 'dawn_cold' ? 'active' : ''}
            onClick={() => setLocalTimeBlock('dawn_cold')}
          >
            🌙 Madrugada
          </button>
          <button 
            className={localTimeBlock === 'morning' ? 'active' : ''}
            onClick={() => setLocalTimeBlock('morning')}
          >
            🌅 Amanecer
          </button>
          <button 
            className={localTimeBlock === 'day_active' ? 'active' : ''}
            onClick={() => setLocalTimeBlock('day_active')}
          >
            ☀️ Día Activo
          </button>
          <button 
            className={localTimeBlock === 'night_plant' ? 'active' : ''}
            onClick={() => setLocalTimeBlock('night_plant')}
          >
            🌃 Noche
          </button>
        </div>
      </div>

      <div className="control-group">
        <label>Métrica Principal</label>
        <div className="metric-selector">
          <button 
            className={selectedMetric === 'temperature' ? 'active' : ''}
            onClick={() => setSelectedMetric('temperature')}
          >
            🌡️ Temperatura
          </button>
          <button 
            className={selectedMetric === 'gradient' ? 'active' : ''}
            onClick={() => setSelectedMetric('gradient')}
          >
            📈 Gradiente
          </button>
          <button 
            className={selectedMetric === 'integral' ? 'active' : ''}
            onClick={() => setSelectedMetric('integral')}
          >
            ∫ Integral
          </button>
        </div>
      </div>
    </div>
  );

  // Renderizar estadísticas
  const renderStatistics = () => (
    <div className="thermal-statistics">
      <div className="stat-card">
        <Thermometer className="stat-icon" />
        <div className="stat-content">
          <h4>Temperatura</h4>
          <div className="stat-value">{thermalStats?.avgTemp}°C</div>
          <div className="stat-range">
            {thermalStats?.minTemp}°C - {thermalStats?.maxTemp}°C
          </div>
          <div className="stat-label">Amplitud: {thermalStats?.amplitude}°C</div>
        </div>
      </div>

      <div className="stat-card">
        <TrendingUp className="stat-icon" />
        <div className="stat-content">
          <h4>Gradiente Térmico</h4>
          <div className="stat-value">{thermalStats?.maxGradient}°C/h</div>
          <div className="stat-range">
            Min: {thermalStats?.minGradient}°C/h
          </div>
          <div className="stat-label">
            {Math.abs(parseFloat(thermalStats?.maxGradient || '0')) > 1 ? 
              <span className="warning">⚠️ Cambio rápido</span> : 
              <span className="ok">✅ Estable</span>
            }
          </div>
        </div>
      </div>

      <div className="stat-card">
        <Activity className="stat-icon" />
        <div className="stat-content">
          <h4>Integral Térmica</h4>
          <div className="stat-value">{thermalStats?.integralThermal}</div>
          <div className="stat-label">Grados-hora acumulados</div>
        </div>
      </div>
    </div>
  );

  // Renderizar gráfico principal
  const renderChart = () => {
    const chartData = processedData.map(record => ({
      time: new Date(record.time).toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      hour: record.hour,
      temperature: record.islands[primaryIsland]?.temperature || 0,
      gradient: record.gradient || 0,
      stage: record.thermalStage
    }));

    return (
      <div className="thermal-chart-container">
        <h3>
          {selectedMetric === 'temperature' && '🌡️ Evolución Térmica'}
          {selectedMetric === 'gradient' && '📈 Gradiente Térmico (°C/hora)'}
          {selectedMetric === 'integral' && '∫ Integral Térmica Acumulada'}
        </h3>
        
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ 
                value: selectedMetric === 'temperature' ? '°C' : '°C/h', 
                angle: -90, 
                position: 'insideLeft' 
              }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid #ccc',
                borderRadius: '8px'
              }}
              formatter={(value: any) => {
                if (typeof value === 'number') {
                  return selectedMetric === 'temperature' ? 
                    `${value.toFixed(1)}°C` : 
                    `${value.toFixed(2)}°C/h`;
                }
                return value;
              }}
            />
            <Legend />

            {/* Líneas de referencia para gradientes */}
            {selectedMetric === 'gradient' && (
              <>
                <ReferenceLine y={1} stroke="#ff9800" strokeDasharray="5 5" label="Límite recomendado" />
                <ReferenceLine y={-1} stroke="#ff9800" strokeDasharray="5 5" />
                <ReferenceLine y={0} stroke="#666" />
              </>
            )}

            {/* Áreas de fondo para etapas térmicas */}
            {selectedMetric === 'temperature' && (
              <>
                <Area
                  dataKey="temperature"
                  fill="#3498db"
                  fillOpacity={0.1}
                  stroke="none"
                />
              </>
            )}

            <Line
              type="monotone"
              dataKey={selectedMetric === 'gradient' ? 'gradient' : 'temperature'}
              stroke="#3498db"
              strokeWidth={2}
              dot={false}
              name={selectedMetric === 'gradient' ? 'Gradiente' : 'Temperatura'}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Renderizar alertas y recomendaciones
  const renderAlerts = () => {
    const alerts = [];
    
    if (thermalStats && Math.abs(parseFloat(thermalStats.maxGradient)) > 1) {
      alerts.push({
        type: 'warning',
        icon: <AlertCircle />,
        message: 'Gradiente térmico elevado detectado. Revisar sistema de climatización.',
        action: 'Reducir velocidad de cambio de temperatura'
      });
    }
    
    if (thermalStats && parseFloat(thermalStats.amplitude) > 8) {
      alerts.push({
        type: 'info',
        icon: <Activity />,
        message: 'Amplitud térmica alta. Puede afectar el desarrollo del cultivo.',
        action: 'Considerar estabilización de temperatura'
      });
    }

    return alerts.length > 0 ? (
      <div className="thermal-alerts">
        <h3>⚠️ Alertas y Recomendaciones</h3>
        {alerts.map((alert, index) => (
          <div key={index} className={`alert alert-${alert.type}`}>
            {alert.icon}
            <div className="alert-content">
              <p className="alert-message">{alert.message}</p>
              <p className="alert-action">→ {alert.action}</p>
            </div>
          </div>
        ))}
      </div>
    ) : null;
  };

  if (loading) return <div className="loading">Cargando análisis térmico...</div>;
  if (error) return <div className="error">Error al cargar datos: {error.message}</div>;

  return (
    <div className="thermal-analysis-panel">
      <div className="panel-header">
        <h2>🌡️ Análisis Térmico Avanzado</h2>
        <p>Monitoreo del ciclo térmico diario y gradientes de temperatura</p>
      </div>

      {renderLocalControls()}
      {renderStatistics()}
      {renderChart()}
      {renderAlerts()}

      <div className="thermal-info">
        <h3>📊 Etapas del Ciclo Térmico</h3>
        <div className="thermal-stages">
          <div className="stage">
            <Clock /> <strong>Calentamiento Matutino (5:00-10:00)</strong>
            <p>Tasa ideal: +0.5-0.8°C/hora</p>
          </div>
          <div className="stage">
            <Target /> <strong>Estabilidad Diurna (10:00-14:00)</strong>
            <p>Variación máxima: ±0.5°C</p>
          </div>
          <div className="stage">
            <TrendingUp /> <strong>Enfriamiento Vespertino (14:00-21:00)</strong>
            <p>Tasa ideal: -0.3-0.5°C/hora</p>
          </div>
          <div className="stage">
            <Activity /> <strong>Estabilidad Nocturna (21:00-5:00)</strong>
            <p>Variación máxima: ±0.3°C</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThermalAnalysisPanel;