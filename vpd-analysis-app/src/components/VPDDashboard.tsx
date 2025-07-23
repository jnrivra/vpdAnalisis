import React, { useState } from 'react';
import { VPDData, WeekConfig, DayPeriod, IslandSelection } from '../types/vpd-types';
import VPDEvolutionChart from './VPDEvolutionChart';
import VPDAnalysisTable from './VPDAnalysisTable';
import VPDOptimizer from './VPDOptimizer';
import './VPDDashboard.css';

interface VPDDashboardProps {
  data: VPDData;
}

const VPDDashboard: React.FC<VPDDashboardProps> = ({ data }) => {
  // Estados
  const [selectedWeek, setSelectedWeek] = useState<number>(3);
  const [selectedPeriod, setSelectedPeriod] = useState<DayPeriod>('full');
  const [selectedIslands, setSelectedIslands] = useState<IslandSelection>({
    I1: true,
    I2: true,
    I3: true,
    I4: true,
    I5: true,
    I6: true,
  });
  const [activeTab, setActiveTab] = useState<'evolution' | 'analysis' | 'optimizer'>('evolution');

  // Configuración de semanas (basado en tu HTML)
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

  const currentWeekConfig = weekConfigs[selectedWeek];

  // Handlers
  const handleWeekChange = (week: number) => {
    setSelectedWeek(week);
  };


  return (
    <div className="vpd-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>🌱 Análisis VPD - 21 Julio 2025</h1>
        <p>Evolución temporal de {data.metadata.totalRecords} registros cada 5 minutos</p>
      </div>

      {/* Control Panel */}
      <div className="control-panel">
        {/* Period Selector */}
        <div className="period-selector">
          <h3>Período de Análisis</h3>
          <div className="period-buttons">
            <button
              className={selectedPeriod === 'day' ? 'active' : ''}
              onClick={() => setSelectedPeriod('day')}
            >
              ☀️ Día Planta (23:00-17:00)
            </button>
            <button
              className={selectedPeriod === 'night' ? 'active' : ''}
              onClick={() => setSelectedPeriod('night')}
            >
              🌙 Noche Planta (17:01-22:59)
            </button>
            <button
              className={selectedPeriod === 'full' ? 'active' : ''}
              onClick={() => setSelectedPeriod('full')}
            >
              🕐 24 Horas
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={activeTab === 'evolution' ? 'active' : ''}
          onClick={() => setActiveTab('evolution')}
        >
          📈 Evolución Temporal
        </button>
        <button
          className={activeTab === 'analysis' ? 'active' : ''}
          onClick={() => setActiveTab('analysis')}
        >
          📊 Análisis por Isla
        </button>
        <button
          className={activeTab === 'optimizer' ? 'active' : ''}
          onClick={() => setActiveTab('optimizer')}
        >
          🎯 Optimizador VPD
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'evolution' && (
          <VPDEvolutionChart
            data={data}
            selectedIslands={selectedIslands}
            selectedPeriod={selectedPeriod}
            weekConfig={currentWeekConfig}
          />
        )}

        {activeTab === 'analysis' && (
          <VPDAnalysisTable
            data={data}
            weekConfig={currentWeekConfig}
          />
        )}

        {activeTab === 'optimizer' && (
          <VPDOptimizer
            data={data}
            weekConfig={currentWeekConfig}
          />
        )}
      </div>
    </div>
  );
};

export default VPDDashboard;