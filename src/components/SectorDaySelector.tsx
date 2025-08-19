/**
 * Componente para seleccionar sector y día desde el archivo Excel
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Database, Check, AlertCircle, ChevronDown } from 'lucide-react';
import { convertExcelToVPDFormat, getAvailableDates, getAvailableSectors } from '../utils/excelToJsonConverter';
import './SectorDaySelector.css';

interface SectorDaySelectorProps {
  onDataLoaded: (data: any) => void;
  currentDataSource: 'json' | 'excel';
  onSourceChange: (source: 'json' | 'excel') => void;
}

export const SectorDaySelector: React.FC<SectorDaySelectorProps> = ({
  onDataLoaded,
  currentDataSource,
  onSourceChange
}) => {
  const [selectedSector, setSelectedSector] = useState<string>('Parcela 1');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableSectors, setAvailableSectors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDates, setLoadingDates] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [excelFile, setExcelFile] = useState<ArrayBuffer | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [minDate, setMinDate] = useState<string>('');
  const [maxDate, setMaxDate] = useState<string>('');

  // Cargar el archivo Excel al montar el componente
  useEffect(() => {
    loadExcelFile();
  }, []);

  const loadExcelFile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/dataSemanal.xlsx');
      const buffer = await response.arrayBuffer();
      setExcelFile(buffer);
      
      // Obtener sectores disponibles
      const sectors = await getAvailableSectors(buffer);
      setAvailableSectors(sectors);
      
      // Cargar fechas del primer sector por defecto
      if (sectors.length > 0) {
        const dates = await getAvailableDates(buffer, sectors[0]);
        setAvailableDates(dates);
        // Establecer rango de fechas para el calendario
        if (dates.length > 0) {
          setMinDate(dates[0]);
          setMaxDate(dates[dates.length - 1]);
          // Seleccionar la última fecha por defecto (últimas 24h)
          setSelectedDate(dates[dates.length - 1]);
          // NO cargar automáticamente para evitar lentitud inicial
        }
      }
    } catch (err) {
      console.error('Error loading Excel file:', err);
      setError('Error al cargar el archivo Excel');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar fechas cuando cambia el sector (pero sin cargar datos automáticamente)
  const handleSectorChange = async (newSector: string) => {
    setSelectedSector(newSector);
    if (excelFile && newSector) {
      try {
        setLoadingDates(true);
        const dates = await getAvailableDates(excelFile, newSector);
        setAvailableDates(dates);
        // Actualizar rango de fechas
        if (dates.length > 0) {
          setMinDate(dates[0]);
          setMaxDate(dates[dates.length - 1]);
          // Si la fecha actual no está disponible, seleccionar la última
          if (!dates.includes(selectedDate)) {
            setSelectedDate(dates[dates.length - 1]);
          }
        }
      } catch (err) {
        console.error('Error updating dates:', err);
      } finally {
        setLoadingDates(false);
      }
    }
  };

  const updateAvailableDates = async () => {
    if (!excelFile) return;
    
    try {
      setLoadingDates(true);
      const dates = await getAvailableDates(excelFile, selectedSector);
      setAvailableDates(dates);
      // Actualizar rango de fechas
      if (dates.length > 0) {
        setMinDate(dates[0]);
        setMaxDate(dates[dates.length - 1]);
        // Si la fecha actual no está disponible, seleccionar la última
        if (!dates.includes(selectedDate)) {
          setSelectedDate(dates[dates.length - 1]);
        }
      }
    } catch (err) {
      console.error('Error updating dates:', err);
    } finally {
      setLoadingDates(false);
    }
  };

  const handleLoadData = async () => {
    if (!excelFile || !selectedSector || !selectedDate) {
      setError('Por favor selecciona un sector y una fecha');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const vpdData = await convertExcelToVPDFormat(excelFile, {
        sector: selectedSector as any,
        date: selectedDate
      });
      
      onDataLoaded(vpdData);
      onSourceChange('excel');
      setIsExpanded(false); // Colapsar después de cargar
    } catch (err) {
      console.error('Error converting data:', err);
      setError('Error al procesar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleUseJsonData = () => {
    onSourceChange('json');
    setIsExpanded(false);
  };

  // Formatear fecha para mostrar
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-CL', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="sector-day-selector">
      <div className="selector-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="data-source-indicator">
          <Database size={16} />
          <span>
            {currentDataSource === 'json' ? 'Datos JSON (21 Jul)' : `Excel: ${selectedSector} - ${selectedDate ? formatDate(selectedDate) : ''}`}
          </span>
        </div>
        <ChevronDown 
          size={20} 
          className={`expand-icon ${isExpanded ? 'expanded' : ''}`}
        />
      </div>

      {isExpanded && (
        <div className="selector-content">
          <div className="selector-controls">
            <div className="control-group">
              <label htmlFor="sector-select">
                <Database size={16} />
                Sector
              </label>
              <select 
                id="sector-select"
                value={selectedSector} 
                onChange={(e) => handleSectorChange(e.target.value)}
                disabled={loading || loadingDates}
              >
                {availableSectors.map(sector => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label htmlFor="date-input">
                <Calendar size={16} />
                Fecha
              </label>
              <input 
                type="date"
                id="date-input"
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                min={minDate}
                max={maxDate}
                disabled={loading || loadingDates}
                className="date-input"
              />
            </div>

            <div className="button-group">
              <button 
                onClick={() => handleLoadData()}
                disabled={loading || !selectedSector || !selectedDate}
                className="load-button primary"
              >
                {loading ? (
                  <>Cargando...</>
                ) : (
                  <>
                    <Check size={16} />
                    Cargar Datos
                  </>
                )}
              </button>

              <button 
                onClick={handleUseJsonData}
                disabled={loading}
                className="load-button secondary"
              >
                <Database size={16} />
                Usar JSON
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="data-info">
            {loadingDates ? (
              <div className="info-item">
                <span className="info-label">Actualizando fechas disponibles...</span>
              </div>
            ) : (
              <>
                <div className="info-item">
                  <span className="info-label">Registros disponibles:</span>
                  <span className="info-value">{availableDates.length} días</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Rango:</span>
                  <span className="info-value">
                    {availableDates.length > 0 && 
                      `${formatDate(minDate)} - ${formatDate(maxDate)}`
                    }
                  </span>
                </div>
                {currentDataSource === 'excel' && (
                  <div className="info-item">
                    <span className="info-label">📍 Mostrando:</span>
                    <span className="info-value">{selectedSector} - {selectedDate && formatDate(selectedDate)}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};