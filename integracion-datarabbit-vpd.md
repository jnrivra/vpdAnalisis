# Integración DataRabbit → Proyecto VPD

## 🔄 RELACIÓN ENTRE PROYECTOS

### DataRabbit (Sistema Existente)
- **Propósito:** Análisis de datos históricos de agricultura vertical
- **Enfoque:** Correlación producción-ambiente, análisis semanal
- **Stack:** React + TypeScript + Recharts
- **Datos:** Excel con múltiples hojas, ~30K registros

### Proyecto VPD (Sistema Nuevo)
- **Propósito:** Control climático en tiempo real
- **Enfoque:** Mantener VPD óptimo 24/7, prevenir condensación
- **Stack:** Por definir (puede usar DataRabbit como base)
- **Datos:** CSV + Excel con VPD y consumo energético

## 🛠️ TECNOLOGÍAS REUTILIZABLES

### Del Stack de DataRabbit para VPD

#### 1. **Procesamiento de Excel**
```typescript
// DataRabbit ya tiene:
- XLSX 0.18.5 para leer Excel multi-hoja
- Papa Parse para CSV
- Validación de datos robusta

// Para VPD puedes reutilizar:
import { processExcelFile } from './utils/excelProcessor';
const vpdData = await processExcelFile('21Jul data analysis VPD.xlsx');
```

#### 2. **Visualizaciones con Recharts**
```typescript
// DataRabbit usa Recharts para:
- Gráficos de líneas temporales
- Mapas de calor
- Comparaciones multi-parcel

// Para VPD necesitas:
- Gráfico 24 horas de VPD
- Mapa de calor por isla
- Consumo energético en barras
```

#### 3. **Estructura de Componentes**
```
// Estructura DataRabbit adaptada para VPD:
src/
├── components/
│   ├── VPDDashboard/        # Dashboard principal VPD
│   ├── VPDTable/            # Tabla interactiva VPD
│   ├── EnergyAnalysis/      # Análisis consumo
│   └── EmergencyProtocol/   # Protocolo nocturno
├── utils/
│   ├── vpdCalculator.ts     # Cálculo VPD
│   └── controlLogic.ts      # Lógica de control
```

## 📊 ADAPTACIONES NECESARIAS

### 1. **Tiempo Real vs Histórico**
```typescript
// DataRabbit (histórico)
const weeklyAnalysis = analyzeWeekData(historicalData);

// VPD (tiempo real)
const currentVPD = calculateVPD(liveTemp, liveHumidity);
setInterval(updateDashboard, 5 * 60 * 1000); // Cada 5 min
```

### 2. **Control vs Análisis**
```typescript
// DataRabbit (análisis)
const correlation = correlateEnvironmentProduction(data);

// VPD (control)
if (currentVPD < 0.60) {
  activateEmergencyProtocol();
  adjustTemperature(+2); // Max 2°C/hora
}
```

### 3. **Multi-Parcel vs Multi-Isla**
```typescript
// DataRabbit
type ParcelId = 'P1' | 'P2' | 'P3';

// VPD
type IslandId = 'I1' | 'I2' | 'I3' | 'I4' | 'I5' | 'I6';
type IslandStatus = 'empty' | 'partial' | 'full';
```

## 🚀 PLAN DE MIGRACIÓN TECNOLÓGICA

### Fase 1: Reutilizar Core
1. Copiar estructura de proyecto DataRabbit
2. Adaptar procesadores de Excel/CSV
3. Reutilizar componentes de gráficos

### Fase 2: Agregar Específicos VPD
1. Calculadora VPD en tiempo real
2. Sistema de alertas (VPD < 0.60)
3. Control de equipos (VRF, deshumidificadores)

### Fase 3: Optimizar para Control
1. WebSocket para datos en tiempo real
2. LocalStorage para protocolo offline
3. PWA para acceso móvil

## 💡 RECOMENDACIONES DE INTEGRACIÓN

### 1. **Aprovechar TypeScript**
```typescript
// Interfaces compartidas
interface EnvironmentData {
  temperature: number;
  humidity: number;
  vpd: number;
  timestamp: Date;
}

// Específicas VPD
interface ControlAction {
  type: 'HEAT' | 'COOL' | 'DEHUMIDIFY';
  targetValue: number;
  maxChangeRate: number; // 2°C/hora
}
```

### 2. **Componentes Modulares**
```tsx
// Reutilizable de DataRabbit
<TemperatureChart data={sensorData} />

// Nuevo para VPD
<VPDGauge 
  current={0.45} 
  target={0.90} 
  status="critical" 
/>
```

### 3. **Tailwind CSS Consistente**
```css
/* Paleta DataRabbit */
--primary: #3498db;
--success: #27ae60;
--warning: #f39c12;
--danger: #e74c3c;

/* Extender para VPD */
.vpd-critical { @apply bg-danger text-white animate-pulse; }
.vpd-optimal { @apply bg-success text-white; }
```

## 📝 CÓDIGO DE EJEMPLO INTEGRADO

```typescript
// Combinar lo mejor de ambos mundos
import { processExcelFile } from 'datarabbit/utils'; // Reutilizar
import { calculateVPD } from './utils/vpdCalculator'; // Nuevo

const VPDController: React.FC = () => {
  // Estado similar a DataRabbit
  const [sensorData, setSensorData] = useState<SensorRecord[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  // Lógica específica VPD
  useEffect(() => {
    const checkVPD = () => {
      const currentVPD = calculateVPD(
        sensorData[0]?.temperature,
        sensorData[0]?.humidity
      );
      
      if (currentVPD < 0.60) {
        triggerEmergencyProtocol();
      }
    };
    
    const interval = setInterval(checkVPD, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [sensorData]);
  
  // UI combinando ambos estilos
  return (
    <div className="dashboard-container"> {/* DataRabbit style */}
      <VPDTable /> {/* Nuevo componente */}
      <EnergyConsumptionChart /> {/* Adaptado de DataRabbit */}
      <EmergencyProtocolPanel /> {/* Específico VPD */}
    </div>
  );
};
```

## ✅ VENTAJAS DE USAR DATARABBIT COMO BASE

1. **Stack probado** en agricultura vertical
2. **Manejo robusto** de Excel/CSV
3. **Visualizaciones optimizadas** para grandes datasets
4. **Estructura escalable** y modular
5. **TypeScript** para prevenir errores
6. **Tailwind CSS** para desarrollo rápido

## ⚠️ CONSIDERACIONES IMPORTANTES

1. **DataRabbit es análisis, VPD es control** - No confundir propósitos
2. **Tiempo real requiere WebSocket** - DataRabbit no lo tiene
3. **Offline first para VPD** - Crítico si falla internet
4. **Simplicidad en UI** - Operadores, no analistas
5. **Mobile first** - Tablets en la granja