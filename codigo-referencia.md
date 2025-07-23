# CÓDIGO DE REFERENCIA - Ejemplos para Claude Code

## FÓRMULA VPD - Cálculo Básico

```javascript
// Función principal para calcular VPD
function calculateVPD(temperature, humidity) {
    // temperature en °C, humidity en %
    // Fórmula: VPD = SVP × (1 - HR/100)
    const SVP = 0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3));
    const VPD = SVP * (1 - humidity / 100);
    return VPD; // Resultado en kPa
}

// Ejemplo de uso
const vpd = calculateVPD(23.5, 72.3); // Returns ~0.81 kPa
```

## ESTRUCTURA DE DATOS ESPERADA

```javascript
// Estructura para datos de cada isla
const islandData = {
    id: 1,
    week: 3,                    // Semana de cultivo (1, 2 o 3)
    crop: "albahaca",          // o "mixto"
    occupancy: 100,            // Porcentaje de ocupación
    sensors: {
        temperature: 23.5,      // °C
        humidity: 72.3,         // %
        vpd: 0.81              // kPa calculado
    },
    dehumidifiers: {
        east: {
            status: "on",       // on/off
            watts: 150         // Consumo actual
        },
        west: {
            status: "on",
            watts: 145
        }
    },
    alerts: [],                // Array de alertas activas
    lastUpdate: "2025-03-22T17:40:00"
};

// Objetivos VPD por semana
const VPD_TARGETS = {
    week1: {
        day: { min: 1.00, max: 1.05 },
        night: { min: 0.90, max: 1.10 }
    },
    week2: {
        day: { min: 0.95, max: 1.00 },
        night: { min: 0.85, max: 1.05 }
    },
    week3: {
        day: { min: 0.80, max: 1.00 },
        night: { min: 0.80, max: 1.00 }
    }
};
```

## COLORES Y ESTILOS PARA VISUALIZACIONES

```css
/* Variables CSS para el tema */
:root {
    /* Estados VPD */
    --vpd-optimal: #27ae60;      /* Verde - En rango */
    --vpd-warning: #f39c12;      /* Naranja - Cerca del límite */
    --vpd-critical: #e74c3c;     /* Rojo - Fuera de rango */
    --vpd-danger: #c0392b;       /* Rojo oscuro - Peligroso */
    
    /* Estados de ocupación */
    --occupied-full: #2ecc71;    /* Verde brillante - 100% */
    --occupied-partial: #f1c40f; /* Amarillo - Parcial */
    --occupied-empty: #95a5a6;   /* Gris - Vacío */
    
    /* UI General */
    --bg-primary: #ecf0f1;
    --bg-secondary: #ffffff;
    --text-primary: #2c3e50;
    --text-secondary: #7f8c8d;
    --border: #bdc3c7;
}

/* Clases para estados */
.vpd-status {
    padding: 5px 10px;
    border-radius: 4px;
    font-weight: bold;
}

.vpd-optimal { 
    background-color: var(--vpd-optimal); 
    color: white; 
}

.vpd-critical { 
    background-color: var(--vpd-critical); 
    color: white;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
}
```

## ESTRUCTURA HTML BÁSICA DASHBOARD

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Control VPD - Granja Vertical</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <header>
        <h1>Sistema Control Climático VPD - Parcela 2</h1>
        <div class="status-bar">
            <span id="current-time"></span>
            <span id="lights-status"></span>
            <span id="alert-count"></span>
        </div>
    </header>
    
    <main>
        <div class="islands-grid">
            <!-- Se generan dinámicamente 6 islas -->
        </div>
        
        <div class="metrics-panel">
            <div class="metric-card">
                <h3>VPD Promedio</h3>
                <p class="metric-value" id="avg-vpd">0.00</p>
                <span class="unit">kPa</span>
            </div>
            <!-- Más métricas... -->
        </div>
    </main>
    
    <script src="js/vpd-calculator.js"></script>
    <script src="js/dashboard.js"></script>
</body>
</html>
```

## FUNCIONES ÚTILES PARA CLAUDE CODE

```javascript
// Determinar período del día
function getCurrentPeriod() {
    const hour = new Date().getHours();
    // Luces: ON 23:00-17:00, OFF 17:00-23:00
    return (hour >= 23 || hour < 17) ? 'day' : 'night';
}

// Verificar si VPD está en rango
function checkVPDStatus(vpd, week, period) {
    const targets = VPD_TARGETS[`week${week}`][period];
    
    if (vpd < targets.min) {
        return { status: 'low', message: `VPD bajo: ${vpd.toFixed(2)} kPa` };
    } else if (vpd > targets.max) {
        return { status: 'high', message: `VPD alto: ${vpd.toFixed(2)} kPa` };
    }
    return { status: 'optimal', message: `VPD óptimo: ${vpd.toFixed(2)} kPa` };
}

// Calcular ajuste necesario
function calculateAdjustment(currentVPD, targetVPD, currentTemp, currentRH) {
    const vpdDiff = targetVPD - currentVPD;
    
    // Estrategia: preferir cambio de temperatura
    let tempAdjust = 0;
    let rhAdjust = 0;
    
    if (Math.abs(vpdDiff) > 0.05) {
        // Aproximación simple - ajustar según necesidad
        if (vpdDiff > 0) {
            // Necesitamos subir VPD
            tempAdjust = Math.min(2, vpdDiff * 4); // Max 2°C
            rhAdjust = Math.min(10, vpdDiff * 20); // Max 10%
        } else {
            // Necesitamos bajar VPD
            tempAdjust = Math.max(-2, vpdDiff * 4);
            rhAdjust = Math.max(-10, vpdDiff * 20);
        }
    }
    
    return {
        temperature: tempAdjust,
        humidity: -rhAdjust, // Negativo porque bajamos HR para subir VPD
        estimated_vpd: calculateVPD(currentTemp + tempAdjust, currentRH - rhAdjust)
    };
}

// Formatear tiempo
function formatTime(date) {
    return date.toLocaleTimeString('es-CL', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}
```

## PROTOCOLO NOCTURNO DE EMERGENCIA

```javascript
// Protocolo para resolver VPD bajo nocturno
const NIGHT_PROTOCOL = {
    steps: [
        {
            time: "16:30",
            actions: [
                "Iniciar pre-calentamiento: +1°C",
                "Verificar funcionamiento de equipos",
                "Alertar al personal"
            ]
        },
        {
            time: "17:00",
            actions: [
                "Luces apagadas - iniciar ajuste agresivo",
                "Subir temperatura a 21-22°C gradualmente",
                "Activar deshumidificadores al 80%"
            ]
        },
        {
            time: "18:00",
            actions: [
                "Verificar VPD > 0.80 kPa",
                "Ajustar fino si es necesario",
                "Mantener condiciones estables"
            ]
        },
        {
            time: "22:00",
            actions: [
                "Verificar estabilidad",
                "Preparar logs para reporte"
            ]
        },
        {
            time: "04:30",
            actions: [
                "Iniciar transición a día",
                "Reducir temperatura gradualmente",
                "Preparar para encendido de luces"
            ]
        }
    ]
};
```

## NOTAS PARA CLAUDE CODE

1. **Siempre valida los datos** antes de calcular VPD
2. **Usa console.log liberalmente** para debugging
3. **Implementa límites de seguridad** (ej: max 2°C/hora)
4. **Guarda configuraciones en LocalStorage**
5. **Maneja errores gracefully** con try/catch

## EJEMPLO DE PETICIÓN A CLAUDE CODE

```
"Usando estas estructuras de datos y funciones como base, 
crea un dashboard que muestre las 6 islas con su VPD actual, 
implemente el protocolo nocturno, y alerte cuando VPD < 0.60"
```