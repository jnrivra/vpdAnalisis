import React, { useMemo, useState } from 'react';
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
import { VPDData, WeekConfig, DayPeriod, IslandSelection, TimeBlock } from '../types/vpd-types';
import { format, parseISO } from 'date-fns';
import { useVPDData } from '../hooks/useVPDData';

interface VPDTemporalAnalysisProps {
  data: VPDData;
  selectedIslands: IslandSelection;
  weekConfig: WeekConfig;
}

const VPDTemporalAnalysis: React.FC<VPDTemporalAnalysisProps> = ({
  data,
  selectedIslands,
  weekConfig
}) => {
  // Estado local para el período
  const [localPeriod, setLocalPeriod] = useState<DayPeriod>('full');
  const [localTimeBlock, setLocalTimeBlock] = useState<TimeBlock | null>(null);
  const [showEnergyData, setShowEnergyData] = useState(true);

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

    // Filtrar por período
    if (localPeriod === 'day') {
      filteredData = data.data.filter(record => {
        const hour = record.hour;
        return hour >= 23 || hour < 17;
      });
    } else if (localPeriod === 'night') {
      filteredData = data.data.filter(record => {
        const hour = record.hour;
        return hour >= 17 && hour < 23;
      });
    }

    // Filtrar por bloque temporal si está seleccionado
    if (localTimeBlock) {
      filteredData = filteredData.filter(record => {
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
    const stats: any = {};
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
          v >= weekConfig.optimalMin && v <= weekConfig.optimalMax
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
  }, [processedData, selectedIslands, weekConfig]);

  // Renderizar controles locales
  const renderLocalControls = () => (
    <div className="temporal-controls">
      <div className="control-group">
        <label>Período de Análisis</label>
        <div className="period-buttons">
          <button
            className={localPeriod === 'full' ? 'active' : ''}
            onClick={() => {
              setLocalPeriod('full');
              setLocalTimeBlock(null);
            }}
          >
            🕐 24 Horas
          </button>
          <button
            className={localPeriod === 'day' ? 'active' : ''}
            onClick={() => {
              setLocalPeriod('day');
              setLocalTimeBlock(null);
            }}
          >
            ☀️ Día Planta
          </button>
          <button
            className={localPeriod === 'night' ? 'active' : ''}
            onClick={() => {
              setLocalPeriod('night');
              setLocalTimeBlock(null);
            }}
          >
            🌙 Noche Planta
          </button>
        </div>
      </div>

      <div className="control-group">
        <label>Bloques Temporales</label>
        <div className="timeblock-buttons">
          <button
            className={localTimeBlock === null ? 'active' : ''}
            onClick={() => setLocalTimeBlock(null)}
          >
            Todos
          </button>
          <button
            className={localTimeBlock === 'dawn_cold' ? 'active' : ''}
            onClick={() => setLocalTimeBlock('dawn_cold')}
            title="23:00 - 02:00"
          >
            🌙 Madrugada
          </button>
          <button
            className={localTimeBlock === 'night_deep' ? 'active' : ''}
            onClick={() => setLocalTimeBlock('night_deep')}
            title="02:01 - 08:00"
          >
            🌌 Noche Profunda
          </button>
          <button
            className={localTimeBlock === 'morning' ? 'active' : ''}
            onClick={() => setLocalTimeBlock('morning')}
            title="08:01 - 12:00"
          >
            🌅 Amanecer
          </button>
          <button
            className={localTimeBlock === 'day_active' ? 'active' : ''}
            onClick={() => setLocalTimeBlock('day_active')}
            title="12:01 - 17:00"
          >
            ☀️ Día Activo
          </button>
          <button
            className={localTimeBlock === 'night_plant' ? 'active' : ''}
            onClick={() => setLocalTimeBlock('night_plant')}
            title="17:01 - 22:59"
          >
            🌃 Noche
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
    <div className="statistics-grid">
      {Object.entries(statistics).map(([island, stats]) => (
        <div key={island} className="stat-card">
          <h4 style={{ color: islandColors[island as keyof typeof islandColors] }}>
            {island}
          </h4>
          <div className="stat-row">
            <span>VPD Promedio:</span>
            <strong>{stats.avg} kPa</strong>
          </div>
          <div className="stat-row">
            <span>Rango:</span>
            <strong>{stats.min} - {stats.max} kPa</strong>
          </div>
          <div className="stat-row">
            <span>Tiempo óptimo:</span>
            <strong className={parseFloat(stats.optimalPercentage) > 80 ? 'good' : 'warning'}>
              {stats.optimalPercentage}%
            </strong>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="vpd-temporal-analysis">
      <div className="analysis-header">
        <h2>📈 Análisis Temporal de VPD</h2>
        <p>Evolución del VPD a lo largo del tiempo con control por bloques temporales</p>
      </div>

      {renderLocalControls()}
      {renderStatistics()}

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
              y={weekConfig.optimalMin} 
              stroke="#27ae60" 
              strokeDasharray="5 5" 
              label="Min Óptimo"
            />
            <ReferenceLine 
              yAxisId="left"
              y={weekConfig.optimalMax} 
              stroke="#27ae60" 
              strokeDasharray="5 5" 
              label="Max Óptimo"
            />

            {/* Área de referencia para rango óptimo */}
            <ReferenceArea
              yAxisId="left"
              y1={weekConfig.optimalMin}
              y2={weekConfig.optimalMax}
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

      <div className="analysis-footer">
        <p>💡 Rango óptimo {weekConfig.name}: {weekConfig.vpdRange} kPa</p>
        <p>🎯 Enfoque: {weekConfig.focus}</p>
      </div>
    </div>
  );
};

export default VPDTemporalAnalysis;