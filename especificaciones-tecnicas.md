# Especificaciones Técnicas - Sistema Control VPD

## 📐 Arquitectura del Sistema

### Frontend
- **Framework:** HTML5 + CSS3 + JavaScript Vanilla (opcional React)
- **Gráficos:** Chart.js 3.x o D3.js v7
- **Mapas de calor:** Canvas API o SVG
- **Responsive:** Bootstrap 5 o CSS Grid nativo
- **Compatibilidad:** Chrome/Edge/Firefox (últimas 2 versiones)

### Almacenamiento
- **LocalStorage:** Configuraciones de usuario
- **SessionStorage:** Datos temporales de sesión
- **IndexedDB:** Histórico de datos (opcional)
- **Límite datos:** 7 días en navegador

### APIs y Servicios
- **Datos en tiempo real:** WebSocket o Server-Sent Events
- **Actualización:** Cada 5 minutos
- **Formato datos:** JSON
- **Compresión:** gzip

## 🔧 Fórmulas y Cálculos

### Cálculo VPD (Vapor Pressure Deficit)
```javascript
function calculateVPD(temperature, relativeHumidity) {
    // temperature en °C, relativeHumidity en %
    const SVP = 0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3));
    const AVP = SVP * (relativeHumidity / 100);
    const VPD = SVP - AVP;
    return VPD; // en kPa
}
```

### Eficiencia Energética
```javascript
function calculateEfficiency(vpdAchieved, wattsConsumed) {
    // Eficiencia = VPD alcanzado / Watts consumidos
    if (wattsConsumed === 0) return 0;
    return vpdAchieved / wattsConsumed;
}
```

### Índice de Transpiración
```javascript
function transpirationIndex(leafArea, vpd, windSpeed) {
    // Simplificado - ajustar según cultivo
    const k = 0.8; // coeficiente cultivo
    return leafArea * vpd * windSpeed * k;
}
```

## 📊 Estructura de Datos

### Modelo de Datos Principal
```javascript
const IslandData = {
    id: 1,
    week: 3,
    crop: "albahaca",
    occupancy: 100, // porcentaje
    sensors: {
        temperature: 23.5,
        humidity: 72.3,
        vpd: 0.81
    },
    dehumidifiers: {
        east: {
            status: "active",
            watts: 150
        },
        west: {
            status: "active", 
            watts: 145
        }
    },
    timestamp: "2025-03-22T17:40:00"
};
```

### Configuración de Zonas
```javascript
const ZoneConfig = {
    week1: {
        day: {
            tempMin: 22, tempMax: 26,
            rhMin: 55, rhMax: 70,
            vpdMin: 1.00, vpdMax: 1.05
        },
        night: {
            tempMin: 22, tempMax: 23,
            rhMin: 60, rhMax: 65,
            vpdMin: 0.90, vpdMax: 1.10
        }
    },
    // week2, week3...
};
```

## 🎨 Especificaciones de UI/UX

### Paleta de Colores
```css
:root {
    /* Estados VPD */
    --vpd-optimal: #27ae60;
    --vpd-acceptable: #f39c12;
    --vpd-low: #e74c3c;
    --vpd-critical: #c0392b;
    
    /* Estados ocupación */
    --occupied: #2ecc71;
    --partial: #f1c40f;
    --empty: #95a5a6;
    
    /* Interfaz */
    --primary: #3498db;
    --secondary: #2c3e50;
    --background: #ecf0f1;
    --text: #34495e;
}
```

### Diseño Responsive
```css
/* Mobile First */
.grid-container {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
    .grid-container {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* Desktop */
@media (min-width: 1200px) {
    .grid-container {
        grid-template-columns: repeat(3, 1fr);
    }
}
```

## 🔌 Integración con Hardware

### Protocolo de Comunicación
```javascript
// Estructura mensaje MQTT/WebSocket
const sensorMessage = {
    topic: "greenhouse/parcela2/island/1/sensor",
    payload: {
        temperature: 23.5,
        humidity: 72.3,
        timestamp: Date.now()
    },
    qos: 1
};

const controlMessage = {
    topic: "greenhouse/parcela2/island/1/control",
    payload: {
        vrf: {
            setpoint: 22.0,
            mode: "cooling"
        },
        dehumidifier: {
            east: "on",
            west: "on",
            power: 80 // percentage
        }
    }
};
```

### Endpoints API REST
```
GET /api/islands                     // Lista todas las islas
GET /api/islands/{id}               // Datos de una isla
GET /api/islands/{id}/history       // Histórico 24h
POST /api/islands/{id}/control      // Enviar comandos
GET /api/energy/consumption         // Consumo actual
GET /api/alerts                     // Alertas activas
```

## 🛡️ Seguridad y Validación

### Validación de Datos
```javascript
function validateSensorData(data) {
    const rules = {
        temperature: { min: -10, max: 50 },
        humidity: { min: 0, max: 100 },
        vpd: { min: 0, max: 5 }
    };
    
    for (const [key, value] of Object.entries(data)) {
        if (rules[key]) {
            if (value < rules[key].min || value > rules[key].max) {
                throw new Error(`${key} fuera de rango: ${value}`);
            }
        }
    }
    return true;
}
```

### Manejo de Errores
```javascript
class SensorError extends Error {
    constructor(sensorId, message) {
        super(message);
        this.name = "SensorError";
        this.sensorId = sensorId;
        this.timestamp = new Date();
    }
}

// Uso
try {
    const data = await readSensor(sensorId);
    validateSensorData(data);
} catch (error) {
    if (error instanceof SensorError) {
        logError(error);
        showAlert("Sensor " + error.sensorId + " con problemas");
    }
}
```

## 📱 Notificaciones y Alertas

### Tipos de Alertas
```javascript
const AlertTypes = {
    CRITICAL: {
        vpd_very_low: "VPD < 0.60 por más de 2 horas",
        equipment_failure: "Falla en equipo",
        sensor_offline: "Sensor sin respuesta"
    },
    WARNING: {
        vpd_low: "VPD fuera de rango objetivo",
        high_consumption: "Consumo > 150% promedio",
        gradient_high: "Gradiente térmico > 5°C"
    },
    INFO: {
        maintenance_due: "Mantenimiento programado",
        optimization_available: "Oportunidad de ahorro detectada"
    }
};
```

## 🔄 Actualizaciones y Mantenimiento

### Versionado
- Mayor.Minor.Patch (ej: 1.2.3)
- Mayor: Cambios incompatibles
- Minor: Nueva funcionalidad compatible
- Patch: Corrección de bugs

### Logs del Sistema
```javascript
const LogLevels = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

function log(level, message, data = {}) {
    const entry = {
        timestamp: new Date().toISOString(),
        level: LogLevels[level],
        message,
        data,
        user: getCurrentUser(),
        module: getCallerModule()
    };
    
    // Enviar a servidor o almacenar localmente
    if (level <= LogLevels.WARN) {
        sendToServer(entry);
    }
    storeLocally(entry);
}
```