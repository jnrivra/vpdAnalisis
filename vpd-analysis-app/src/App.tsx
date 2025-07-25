import React from 'react';
import './App.css';
import VPDDashboard from './components/VPDDashboard';
import { useVPDData } from './hooks/useVPDData';

function App() {
  const { data: vpdData, loading, error } = useVPDData();

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
        <p>{error?.message || 'No se pudieron cargar los datos VPD'}</p>
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
