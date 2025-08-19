import React, { useState, useCallback } from 'react';
import { VPDData, WeekConfig } from '../types/vpd-types';
import VPDTemporalAnalysis from './VPDTemporalAnalysis';
import VPDConfigPanel from './VPDConfigPanel';
import { SectorDaySelector } from './SectorDaySelector';
import { setExcelData, setDataSource, getCurrentDataSource, type DataSource } from '../services/dataService';
import './VPDDashboard.css';

interface VPDDashboardProps {
  data: VPDData;
}

const VPDDashboard: React.FC<VPDDashboardProps> = ({ data }) => {
  // Estado principal simplificado
  const [configPanelOpen, setConfigPanelOpen] = useState<boolean>(false);
  const [currentDataSource, setCurrentDataSource] = useState<DataSource>(getCurrentDataSource());
  const [currentData, setCurrentData] = useState<VPDData>(data);
  
  // Estado de configuración VPD global (solo para panel de configuración)
  const [selectedWeek] = useState<number>(3);
  const [customWeekConfig, setCustomWeekConfig] = useState<WeekConfig | null>(null);
  
  // Manejar carga de datos desde Excel
  const handleDataLoaded = useCallback((newData: VPDData) => {
    setExcelData(newData);
    setCurrentData(newData);
  }, []);
  
  // Manejar cambio de fuente de datos
  const handleSourceChange = useCallback((source: DataSource) => {
    setDataSource(source);
    setCurrentDataSource(source);
    if (source === 'json') {
      setCurrentData(data);
    }
  }, [data]);


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

  // Handlers para el panel de configuración
  const handleConfigChange = (newConfig: Partial<WeekConfig>) => {
    const updatedConfig = { ...currentWeekConfig, ...newConfig };
    setCustomWeekConfig(updatedConfig);
  };

  const toggleConfigPanel = () => {
    setConfigPanelOpen(!configPanelOpen);
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

      {/* Selector de Sector y Día */}
      <SectorDaySelector 
        onDataLoaded={handleDataLoaded}
        currentDataSource={currentDataSource}
        onSourceChange={handleSourceChange}
      />

      {/* Header simplificado */}
      <div className="dashboard-header">
        <h1>🌱 AgroVPD Analytics - Sistema Inteligente de Monitoreo</h1>
        <div className="header-info">
          <span className="date-info">📅 {currentData.metadata.date}</span>
          <span className="records-info">📊 {currentData.metadata.totalRecords} registros</span>
          {currentDataSource === 'excel' && currentData.metadata.sector && (
            <span className="sector-info">📍 {currentData.metadata.sector}</span>
          )}
        </div>
      </div>

      {/* Botón flotante para abrir configuración */}
      {!configPanelOpen && (
        <button className="floating-config-button" onClick={toggleConfigPanel}>
          ⚙️
        </button>
      )}

      {/* Contenido principal - Solo Análisis Temporal */}
      <div className="main-content">
        <VPDTemporalAnalysis data={currentData} />
      </div>

      {/* Footer actualizado */}
      <div className="dashboard-footer">
        <p>💡 <strong>Sistema VPD Simplificado</strong> - Análisis temporal con controles integrados</p>
        <p>🔄 Panel de configuración disponible | ⚡ Modo eficiencia energética activo</p>
      </div>
    </div>
  );
};

export default VPDDashboard;