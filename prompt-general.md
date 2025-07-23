# 01_PROYECTO_CLAUDE_CODE - Sistema Control Climático VPD Granja Vertical

## CONFIGURACIÓN DEL PROYECTO

### Archivos que debes subir a Claude Code:
1. `Parcela 2 Promediosdataasjoinbyfield20250721 17_41_46.csv`
2. `21Jul data analysis VPD.xlsx`
3. Esta documentación
4. Imagen del plano arquitectónico (si la tienes)

### Contexto del Proyecto
Soy gerente de automatización de una granja vertical con un problema crítico: el VPD nocturno está peligrosamente bajo (0.35-0.50 kPa) cuando debe estar entre 0.80-1.10 kPa, causando condensación y riesgo de enfermedades.

## ESTRUCTURA DE LA GRANJA - PARCELA 2

### Layout Físico
- 380 m² × 8 m altura
- 6 islas numeradas 1-6 (izquierda a derecha)
- Cada isla: 10 pisos, 288 bandejas

### Estado Actual de Ocupación
- **Isla 1:** Semana 3, Albahaca, 100% ocupada
- **Isla 2:** Semana 2, Albahaca, 100% ocupada
- **Isla 3:** Semana 1, Mixto, PARCIALMENTE VACÍA (2 sectores sin plantas)
- **Isla 4:** Semana 3, Mixto, PARCIALMENTE VACÍA (algunos sectores sin plantas)
- **Isla 5:** COMPLETAMENTE VACÍA
- **Isla 6:** Semana 1, Mixto, 100% ocupada

### Equipamiento
- 7 sistemas VRF (aire acondicionado)
- 12 deshumidificadores (2 por isla: oriente/poniente)
- 6 sensores por isla (I1-I6)
- Luces LED: ON 23:00-17:00, OFF 17:00-23:00

## TAREAS PRINCIPALES PARA CLAUDE CODE

### 1. ANÁLISIS INICIAL DE DATOS
```
- Cargar y explorar el CSV con datos de temperatura y humedad
- Cargar y analizar el Excel con VPD y consumo energético
- Calcular estadísticas por período (día/noche)
- Identificar correlaciones entre ocupación y consumo
- Generar reporte de la situación actual
```

### 2. CREAR DASHBOARD PRINCIPAL
```
Archivo: dashboard.html
- Vista de 6 islas con layout tipo plano
- Mostrar VPD actual de cada sensor
- Indicadores de ocupación por isla
- Alertas visuales para VPD < 0.60
- Consumo energético en tiempo real
- Actualización automática cada 5 minutos
```

### 3. TABLA VPD INTERACTIVA
```
Archivo: vpd-table.html
- Tabla con incrementos 0.25°C × 2% HR
- Selector de semana (1, 2, 3)
- Colores adaptativos según objetivos:
  - Semana 1: VPD 1.00-1.05 (día), 0.90-1.10 (noche)
  - Semana 2: VPD 0.95-1.00 (día), 0.85-1.05 (noche)
  - Semana 3: VPD 0.80-1.00 (día), 0.80-1.00 (noche)
- Marcadores de posición actual de sensores
```

### 4. SISTEMA DE CONTROL
```
Archivo: control-logic.js
- Protocolo nocturno de emergencia:
  - 16:30: Pre-calentamiento (+1°C)
  - 17:00: Luces OFF, acelerar ajustes
  - 18:00: Alcanzar objetivo (21-22°C, 62-66% HR)
  - Mantener VPD 0.80-1.10 toda la noche
- Control adaptativo por semana
- Gestión especial isla vacía (5)
- Límite: máximo 2°C/hora de cambio
```

### 5. OPTIMIZADOR ENERGÉTICO
```
Archivo: energy-optimizer.js
- Análisis de eficiencia por deshumidificador
- Comparación oriente vs poniente
- Modo ECO para islas vacías/parciales
- Cálculo de ROI por ajuste
- Recomendaciones de ahorro
```

### 6. VISUALIZACIONES ADICIONALES
```
Archivos: charts.js, heatmap.js
- Gráfico 24 horas (temperatura, humedad, VPD)
- Mapa de calor por zonas
- Comparador de islas
- Tendencias de consumo
- Proyecciones y simulaciones
```

## PRIORIDADES DE DESARROLLO

### FASE 1 - URGENTE (Primera sesión)
1. Analizar datos y confirmar problema VPD nocturno
2. Crear protocolo nocturno de emergencia
3. Dashboard básico con alertas críticas

### FASE 2 - IMPORTANTE (Segunda sesión)
1. Tabla VPD interactiva completa
2. Sistema de control automático
3. Optimización para islas vacías/parciales

### FASE 3 - OPTIMIZACIÓN (Tercera sesión)
1. Análisis energético detallado
2. Algoritmos predictivos
3. Reportes automáticos

## NOTAS TÉCNICAS PARA CLAUDE CODE

### Stack Tecnológico
- Frontend: HTML5, CSS3, JavaScript vanilla
- Gráficos: Chart.js (incluir vía CDN)
- Sin backend (todo client-side)
- LocalStorage para configuraciones

### Estructura de Archivos Sugerida
```
/
├── index.html (dashboard principal)
├── css/
│   └── styles.css
├── js/
│   ├── vpd-calculator.js
│   ├── control-logic.js
│   ├── energy-optimizer.js
│   └── charts.js
├── pages/
│   ├── vpd-table.html
│   ├── energy-report.html
│   └── settings.html
└── data/
    └── (archivos CSV y Excel)
```

### Consideraciones Especiales
- El sistema debe funcionar en tablets
- Priorizar claridad sobre complejidad
- Incluir modo manual de emergencia
- Documentar todas las funciones
- Usar console.log para debugging

## RESULTADO ESPERADO

Un sistema funcional que:
1. Resuelva el problema crítico del VPD nocturno
2. Optimice el consumo energético según ocupación
3. Proporcione visibilidad total de la operación
4. Sea fácil de usar por los operadores
5. Genere ahorros medibles desde el día 1

---

**IMPORTANTE:** Comienza analizando los datos para confirmar el problema y luego desarrolla el protocolo nocturno de emergencia. Todo lo demás puede construirse incrementalmente.