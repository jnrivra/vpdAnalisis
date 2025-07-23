# Algoritmos de Control - Sistema VPD

## 🧮 Algoritmo Principal de Control Adaptativo

```javascript
// Controlador principal que se ejecuta cada 5 minutos
async function mainControlLoop() {
    const islands = await getIslandData();
    
    for (const island of islands) {
        // Determinar estrategia según ocupación
        const strategy = determineStrategy(island);
        
        // Calcular ajustes necesarios
        const adjustments = calculateAdjustments(island, strategy);
        
        // Aplicar cambios graduales
        await applyGradualChanges(island, adjustments);
        
        // Registrar métricas
        logMetrics(island, adjustments);
    }
}

function determineStrategy(island) {
    if (island.occupancy === 0) {
        return 'MAINTENANCE_MODE';
    } else if (island.occupancy < 70) {
        return 'PARTIAL_OCCUPANCY';
    } else {
        return `WEEK_${island.week}_FULL`;
    }
}
```

## 🌡️ Control de VPD por Semana

```javascript
class VPDController {
    constructor(targetRanges) {
        this.targets = targetRanges;
        this.history = [];
        this.pid = new PIDController();
    }
    
    calculateAdjustments(currentVPD, targetVPD, currentTemp, currentRH) {
        const vpdError = targetVPD - currentVPD;
        
        // Estrategia: priorizar cambio de temperatura sobre humedad
        let tempAdjust = 0;
        let rhAdjust = 0;
        
        if (Math.abs(vpdError) > 0.05) {
            // Calcular cambio necesario
            if (vpdError > 0) {
                // VPD muy bajo - necesitamos subirlo
                // Opción 1: Subir temperatura
                tempAdjust = this.calculateTempIncrease(currentTemp, currentRH, vpdError);
                
                // Opción 2: Bajar humedad
                if (tempAdjust > 2) {
                    // Si requiere más de 2°C, mejor bajar humedad
                    rh