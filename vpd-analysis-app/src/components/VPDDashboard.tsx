import React, { useState } from 'react';
import { Clock, Table, Target, Thermometer } from 'lucide-react';
import { VPDData, IslandSelection, WeekConfig } from '../types/vpd-types';
import VPDTemporalAnalysis from './VPDTemporalAnalysis';
import VPDAnalysisTable from './VPDAnalysisTable';
import VPDOptimizer from './VPDOptimizer';
import ThermalAnalysisPanel from './ThermalAnalysisPanel';
import VPDConfigPanel from './VPDConfigPanel';
import './VPDDashboard.css';

interface VPDDashboardProps {
  data: VPDData;
}

type TabId = 'temporal' | 'analysis' | 'optimizer' | 'thermal';

const VPDDashboard: React.FC<VPDDashboardProps> = ({ data }) => {
  // Estados principales del dashboard
  const [selectedIslands, setSelectedIslands] = useState<IslandSelection>({
    I1: true,
    I2: true,
    I3: true,
    I4: true,
    I5: true,
    I6: true,
  });
  const [activeTab, setActiveTab] = useState<TabId>('temporal');
  const [configPanelOpen, setConfigPanelOpen] = useState<boolean>(false);
  
  // Estado de configuración de semanas
  const [selectedWeek, setSelectedWeek] = useState<number>(3);
  const [customWeekConfig, setCustomWeekConfig] = useState<WeekConfig | null>(null);

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

  const currentWeekConfig = customWeekConfig || weekConfigs[selectedWeek];

  // Handlers
  const handleConfigChange = (newConfig: Partial<WeekConfig>) => {
    const updatedConfig = { ...currentWeekConfig, ...newConfig };
    setCustomWeekConfig(updatedConfig);
  };

  const toggleConfigPanel = () => {
    setConfigPanelOpen(!configPanelOpen);
  };

  const handleWeekChange = (week: number) => {
    setSelectedWeek(week);
    setCustomWeekConfig(null); // Reset custom config when changing weeks
  };

  // Definición de las pestañas
  const tabs = [
    { id: 'temporal' as const, label: 'Análisis Temporal', icon: Clock },
    { id: 'analysis' as const, label: 'Tabla de Análisis', icon: Table },
    { id: 'optimizer' as const, label: 'Optimizador VPD', icon: Target },
    { id: 'thermal' as const, label: 'Análisis Térmico', icon: Thermometer },
  ];

  // Renderizar contenido de la pestaña activa
  const renderTabContent = () => {
    switch (activeTab) {
      case 'temporal':
        return (
          <VPDTemporalAnalysis
            data={data}
            selectedIslands={selectedIslands}
            weekConfig={currentWeekConfig}
          />
        );
      case 'analysis':
        return (
          <VPDAnalysisTable
            data={data}
            selectedIslands={selectedIslands}
            weekConfig={currentWeekConfig}
          />
        );
      case 'optimizer':
        return (
          <VPDOptimizer
            data={data}
            selectedIslands={selectedIslands}
            weekConfig={currentWeekConfig}
          />
        );
      case 'thermal':
        return (
          <ThermalAnalysisPanel
            selectedIslands={selectedIslands}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="vpd-dashboard">
      {/* Panel de configuración VPD */}
      <VPDConfigPanel
        weekConfig={currentWeekConfig}
        onConfigChange={handleConfigChange}
        isOpen={configPanelOpen}
        onToggle={toggleConfigPanel}
      />

      {/* Header principal */}
      <div className="dashboard-header">
        <h1>🌱 Sistema de Control VPD - Granja Vertical</h1>
        <div className="header-info">
          <span className="date-info">📅 {data.metadata.date}</span>
          <span className="records-info">📊 {data.metadata.totalRecords} registros</span>
        </div>
      </div>

      {/* Controles principales */}
      <div className="main-controls">
        {/* Selector de semanas */}
        <div className="week-selector">
          <h3>📆 Semana de Cultivo</h3>
          <div className="week-buttons">
            {Object.entries(weekConfigs).map(([week, config]) => (
              <button
                key={week}
                className={`week-button ${selectedWeek === parseInt(week) ? 'active' : ''}`}
                onClick={() => handleWeekChange(parseInt(week))}
                style={{ borderColor: config.color }}
              >
                <span className="week-icon">{config.icon}</span>
                <span className="week-name">{config.name}</span>
                <span className="week-vpd">{config.vpdRange} kPa</span>
              </button>
            ))}
          </div>
          <button className="config-toggle" onClick={toggleConfigPanel}>
            ⚙️ Configurar Rangos
          </button>
        </div>

        {/* Selector de islas */}
        <div className="island-selector">
          <h3>🏝️ Islas de Cultivo</h3>
          <div className="island-checkboxes">
            {Object.keys(selectedIslands).map((island) => (
              <label key={island} className="island-checkbox">
                <input
                  type="checkbox"
                  checked={selectedIslands[island as keyof IslandSelection]}
                  onChange={(e) => {
                    setSelectedIslands({
                      ...selectedIslands,
                      [island]: e.target.checked,
                    });
                  }}
                />
                <span className={`island-label island-${island.toLowerCase()}`}>
                  {island}
                  <span className="island-week">
                    {weekConfigs[islandWeekAssignments[island as keyof typeof islandWeekAssignments]].icon}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Pestañas de análisis */}
      <div className="analysis-tabs">
        <div className="tab-header">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        
        <div className="tab-content">
          {renderTabContent()}
        </div>
      </div>

      {/* Footer con información */}
      <div className="dashboard-footer">
        <p>💡 Cada pestaña tiene sus propios controles de período y filtros temporales</p>
        <p>🔄 Los datos se actualizan cada 5 minutos | ⚡ Modo eficiencia energética activo</p>
      </div>
    </div>
  );
};

export default VPDDashboard;