import React, { useState, useEffect } from 'react';
import './App.css';
import VPDDashboard from './components/VPDDashboard';
import { VPDData } from './types/vpd-types';

function App() {
  const [vpdData, setVpdData] = useState<VPDData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVPDData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/vpd-data.json');
        
        if (!response.ok) {
          throw new Error('Error cargando datos VPD');
        }
        
        const data = await response.json();
        setVpdData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('Error loading VPD data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadVPDData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h2>🌱 Cargando Análisis VPD...</h2>
        <p>Procesando 288 registros del 21 de Julio</p>
      </div>
    );
  }

  if (error || !vpdData) {
    return (
      <div className="error-container">
        <h2>❌ Error al cargar datos</h2>
        <p>{error || 'No se pudieron cargar los datos VPD'}</p>
        <button onClick={() => window.location.reload()}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="App">
      <VPDDashboard data={vpdData} />
    </div>
  );
}

export default App;
