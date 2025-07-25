import React from 'react';
import { WeekConfig } from '../types/vpd-types';
import './VPDConfigPanel.css';

interface ControlPanelProps {
  weekConfig: WeekConfig;
  onConfigChange: (newConfig: Partial<WeekConfig>) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  weekConfig, 
  onConfigChange, 
  isOpen, 
  onToggle 
}) => {
  const handleRangeChange = (field: keyof WeekConfig, value: number) => {
    onConfigChange({ [field]: value });
  };

  const parseTemperatureRange = (tempRange: string) => {
    const match = tempRange.match(/(\d+)-(\d+)/);
    if (match) {
      return { min: parseInt(match[1]), max: parseInt(match[2]) };
    }
    return { min: 20, max: 25 };
  };

  const parseHumidityRange = (humidityRange: string) => {
    const match = humidityRange.match(/(\d+)-(\d+)/);
    if (match) {
      return { min: parseInt(match[1]), max: parseInt(match[2]) };
    }
    return { min: 60, max: 70 };
  };

  const dayTemp = parseTemperatureRange(weekConfig.dayTemp);
  const dayRH = parseHumidityRange(weekConfig.dayRH);
  const nightTemp = parseTemperatureRange(weekConfig.nightTemp);
  const nightRH = parseHumidityRange(weekConfig.nightRH);

  const updateTemperatureRange = (type: 'day' | 'night', minOrMax: 'min' | 'max', value: number) => {
    const currentRange = type === 'day' ? dayTemp : nightTemp;
    const newRange = { ...currentRange, [minOrMax]: value };
    const fieldName = type === 'day' ? 'dayTemp' : 'nightTemp';
    onConfigChange({ [fieldName]: `${newRange.min}-${newRange.max}°C` });
  };

  const updateHumidityRange = (type: 'day' | 'night', minOrMax: 'min' | 'max', value: number) => {
    const currentRange = type === 'day' ? dayRH : nightRH;
    const newRange = { ...currentRange, [minOrMax]: value };
    const fieldName = type === 'day' ? 'dayRH' : 'nightRH';
    onConfigChange({ [fieldName]: `${newRange.min}-${newRange.max}%` });
  };

  return (
    <>
      <div className={`control-panel ${isOpen ? 'open' : 'closed'}`}>
        <div className="control-panel-header">
          <h3>🎛️ Panel de Control</h3>
          <button className="close-btn" onClick={onToggle}>
            {isOpen ? '◀' : '▶'}
          </button>
        </div>

        {isOpen && (
          <div className="control-panel-content">
            {/* Configuración VPD */}
            <div className="control-section">
              <h4>📊 Rangos VPD</h4>
              <div className="control-group">
                <label>VPD Óptimo Mínimo</label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={weekConfig.optimalMin}
                  onChange={(e) => handleRangeChange('optimalMin', parseFloat(e.target.value))}
                />
                <span className="value-display">{weekConfig.optimalMin.toFixed(2)} kPa</span>
              </div>

              <div className="control-group">
                <label>VPD Óptimo Máximo</label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={weekConfig.optimalMax}
                  onChange={(e) => handleRangeChange('optimalMax', parseFloat(e.target.value))}
                />
                <span className="value-display">{weekConfig.optimalMax.toFixed(2)} kPa</span>
              </div>

              <div className="control-group">
                <label>VPD Aceptable Mínimo</label>
                <input
                  type="range"
                  min="0.3"
                  max="2.0"
                  step="0.05"
                  value={weekConfig.acceptableMin}
                  onChange={(e) => handleRangeChange('acceptableMin', parseFloat(e.target.value))}
                />
                <span className="value-display">{weekConfig.acceptableMin.toFixed(2)} kPa</span>
              </div>

              <div className="control-group">
                <label>VPD Aceptable Máximo</label>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.05"
                  value={weekConfig.acceptableMax}
                  onChange={(e) => handleRangeChange('acceptableMax', parseFloat(e.target.value))}
                />
                <span className="value-display">{weekConfig.acceptableMax.toFixed(2)} kPa</span>
              </div>
            </div>

            {/* Configuración Temperatura Día */}
            <div className="control-section">
              <h4>🌡️ Temperatura Día</h4>
              <div className="control-group">
                <label>Temperatura Mínima</label>
                <input
                  type="range"
                  min="15"
                  max="30"
                  step="1"
                  value={dayTemp.min}
                  onChange={(e) => updateTemperatureRange('day', 'min', parseInt(e.target.value))}
                />
                <span className="value-display">{dayTemp.min}°C</span>
              </div>

              <div className="control-group">
                <label>Temperatura Máxima</label>
                <input
                  type="range"
                  min="15"
                  max="35"
                  step="1"
                  value={dayTemp.max}
                  onChange={(e) => updateTemperatureRange('day', 'max', parseInt(e.target.value))}
                />
                <span className="value-display">{dayTemp.max}°C</span>
              </div>
            </div>

            {/* Configuración Humedad Día */}
            <div className="control-section">
              <h4>💧 Humedad Día</h4>
              <div className="control-group">
                <label>Humedad Mínima</label>
                <input
                  type="range"
                  min="40"
                  max="90"
                  step="5"
                  value={dayRH.min}
                  onChange={(e) => updateHumidityRange('day', 'min', parseInt(e.target.value))}
                />
                <span className="value-display">{dayRH.min}%</span>
              </div>

              <div className="control-group">
                <label>Humedad Máxima</label>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={dayRH.max}
                  onChange={(e) => updateHumidityRange('day', 'max', parseInt(e.target.value))}
                />
                <span className="value-display">{dayRH.max}%</span>
              </div>
            </div>

            {/* Configuración Temperatura Noche */}
            <div className="control-section">
              <h4>🌙 Temperatura Noche</h4>
              <div className="control-group">
                <label>Temperatura Mínima</label>
                <input
                  type="range"
                  min="15"
                  max="30"
                  step="1"
                  value={nightTemp.min}
                  onChange={(e) => updateTemperatureRange('night', 'min', parseInt(e.target.value))}
                />
                <span className="value-display">{nightTemp.min}°C</span>
              </div>

              <div className="control-group">
                <label>Temperatura Máxima</label>
                <input
                  type="range"
                  min="15"
                  max="30"
                  step="1"
                  value={nightTemp.max}
                  onChange={(e) => updateTemperatureRange('night', 'max', parseInt(e.target.value))}
                />
                <span className="value-display">{nightTemp.max}°C</span>
              </div>
            </div>

            {/* Configuración Humedad Noche */}
            <div className="control-section">
              <h4>🌃 Humedad Noche</h4>
              <div className="control-group">
                <label>Humedad Mínima</label>
                <input
                  type="range"
                  min="40"
                  max="90"
                  step="5"
                  value={nightRH.min}
                  onChange={(e) => updateHumidityRange('night', 'min', parseInt(e.target.value))}
                />
                <span className="value-display">{nightRH.min}%</span>
              </div>

              <div className="control-group">
                <label>Humedad Máxima</label>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={nightRH.max}
                  onChange={(e) => updateHumidityRange('night', 'max', parseInt(e.target.value))}
                />
                <span className="value-display">{nightRH.max}%</span>
              </div>
            </div>

            {/* Resumen de configuración actual */}
            <div className="control-section summary">
              <h4>📋 Resumen Actual</h4>
              <div className="config-summary">
                <p><strong>Semana:</strong> {weekConfig.name} {weekConfig.icon}</p>
                <p><strong>Enfoque:</strong> {weekConfig.focus}</p>
                <p><strong>VPD Óptimo:</strong> {weekConfig.optimalMin.toFixed(2)} - {weekConfig.optimalMax.toFixed(2)} kPa</p>
                <p><strong>Rango VPD:</strong> {weekConfig.vpdRange}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overlay para cerrar el panel en móvil */}
      {isOpen && <div className="control-panel-overlay" onClick={onToggle} />}
    </>
  );
};

export default ControlPanel;