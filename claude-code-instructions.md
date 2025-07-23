# INSTRUCCIONES PARA USAR CLAUDE CODE

## CÓMO CONFIGURAR EL PROYECTO

### Paso 1: Crear Nuevo Proyecto
1. Ve a Claude Code
2. Crea un nuevo proyecto: "Control VPD Granja Vertical"
3. Sube estos archivos:
   - `Parcela 2 Promediosdataasjoinbyfield20250721 17_41_46.csv`
   - `21Jul data analysis VPD.xlsx`
   - Todos los documentos .md de este paquete
   - Imagen del plano (si la tienes)

### Paso 2: Configurar el Contexto
En la descripción del proyecto, pega:
```
Sistema de control climático para granja vertical con problema crítico de VPD nocturno bajo. 
6 islas con diferentes niveles de ocupación. Necesito resolver condensación nocturna y optimizar energía.
Quiero usar el stack tecnológico de DataRabbit (React + TypeScript + Tailwind + Recharts) como base.
```

## 🛠️ STACK TECNOLÓGICO RECOMENDADO

Basado en DataRabbit (ver documento 08_TECH_STACK_DATARABBIT.md):

### Core Technologies
- **React 18** + **TypeScript** - Framework principal
- **Tailwind CSS** - Estilos y diseño responsive
- **Recharts** - Gráficos y visualizaciones
- **XLSX** + **Papa Parse** - Procesamiento de archivos
- **Date-fns** - Manejo de fechas

### Ventajas de usar este stack
- Probado en agricultura vertical
- Maneja grandes volúmenes de datos
- Componentes reutilizables
- TypeScript previene errores
- Excelente performance

## PROMPTS SUGERIDOS PARA CLAUDE CODE

### 🔴 URGENTE - Primera Sesión

#### 1. Análisis Inicial
```
Analiza los archivos CSV y Excel. Necesito:
1. Confirmar que el VPD nocturno está entre 0.35-0.50 kPa
2. Identificar en qué sensores/islas es más crítico
3. Correlación entre consumo de deshumidificadores y VPD
4. Resumen de la situación actual con gráficos

Usa el stack de DataRabbit como base (React + TypeScript + Tailwind + Recharts).
Consulta 08_TECH_STACK_DATARABBIT.md para los patrones de código.
```

#### 2. Protocolo de Emergencia
```
Crea un protocolo nocturno de emergencia en HTML/JS que:
1. Muestre los pasos a seguir desde las 16:30 hasta las 5:00
2. Calcule los ajustes necesarios para alcanzar VPD 0.80-1.10
3. Incluya alertas visuales si VPD < 0.60
4. Sea usable en tablet por los operadores
```

#### 3. Dashboard Básico
```
Desarrolla un dashboard.html que muestre:
1. Las 6 islas con su estado actual (temperatura, humedad, VPD)
2. Código de colores: verde (OK), amarillo (alerta), rojo (crítico)
3. Indicador de ocupación de cada isla
4. VPD promedio día vs noche
5. Actualización automática cada 5 minutos
```

### 🟡 IMPORTANTE - Segunda Sesión

#### 4. Tabla VPD Interactiva
```
Crea una tabla VPD interactiva (vpd-table.html) con:
1. Ejes: Temperatura (17-26°C, incrementos 0.25°) vs Humedad (50-85%, incrementos 2%)
2. Selector de semana que cambie las zonas óptimas de color
3. Marcadores mostrando la posición actual de cada sensor
4. Leyenda clara de qué significa cada color
5. Exportable como imagen
```

#### 5. Sistema de Control
```
Implementa la lógica de control (control-logic.js) que:
1. Calcule ajustes necesarios según la semana de cada isla
2. Respete el límite de 2°C/hora
3. Maneje diferente las islas vacías/parciales
4. Genere recomendaciones específicas de qué equipos activar
5. Incluya el protocolo nocturno automatizado
```

#### 6. Análisis Energético
```
Crea un módulo de análisis energético que:
1. Compare consumo entre deshumidificadores oriente vs poniente
2. Calcule eficiencia (kPa VPD / watts consumidos)
3. Identifique oportunidades de ahorro en isla 5 (vacía)
4. Muestre tendencias de consumo día vs noche
5. Proyecte ahorros potenciales
```

### 🟢 OPTIMIZACIÓN - Tercera Sesión

#### 7. Visualizaciones Avanzadas
```
Añade visualizaciones avanzadas:
1. Mapa de calor del layout real mostrando gradientes
2. Gráfico 24 horas con múltiples variables
3. Comparador lado a lado de islas
4. Simulador "qué pasaría si..."
5. Timeline de eventos del día
```

#### 8. Reportes y Exportación
```
Implementa sistema de reportes:
1. Resumen diario automático en PDF
2. Análisis semanal de eficiencia
3. Log de alertas y eventos
4. Exportación de datos para análisis externo
5. Dashboard ejecutivo con KPIs
```

#### 9. Optimizaciones Finales
```
Optimiza el sistema completo:
1. Modo offline básico
2. Caché inteligente de datos
3. Compresión de históricos
4. Backup automático de configuraciones
5. Tests de todos los componentes críticos
```

## PREGUNTAS CLAVE PARA CADA MÓDULO

### Al analizar datos:
- "¿Cuál es el VPD promedio nocturno por isla?"
- "¿Qué correlación hay entre ocupación y consumo?"
- "¿En qué momentos del día el VPD es más crítico?"

### Al crear visualizaciones:
- "¿Puedes mostrar esto en un formato fácil de entender para operadores?"
- "¿Cómo podemos destacar las zonas problemáticas?"
- "¿Qué información es crítica vs nice-to-have?"

### Al implementar control:
- "¿Qué validaciones necesitamos para evitar cambios bruscos?"
- "¿Cómo manejamos los casos extremos?"
- "¿Qué pasa si falla un sensor?"

## TIPS PARA MEJORES RESULTADOS

1. **Sé específico** con los rangos de valores y objetivos
2. **Pide código modular** que sea fácil de mantener
3. **Solicita comentarios** en español en el código
4. **Prueba incrementalmente** cada componente
5. **Pide alternativas** cuando algo no funcione

## ESTRUCTURA DE ARCHIVOS ESPERADA

```
proyecto-vpd/
├── index.html (dashboard principal)
├── css/
│   ├── styles.css
│   ├── dashboard.css
│   └── tables.css
├── js/
│   ├── vpd-calculator.js
│   ├── control-logic.js
│   ├── energy-optimizer.js
│   ├── data-processor.js
│   └── charts.js
├── pages/
│   ├── vpd-table.html
│   ├── energy-report.html
│   ├── emergency-protocol.html
│   └── settings.html
├── data/
│   ├── (archivos CSV)
│   └── (archivos Excel)
└── docs/
    └── manual-usuario.md
```

## DEBUGGING Y PROBLEMAS COMUNES

Si algo no funciona, pregunta:
- "¿Puedes añadir console.log para debug?"
- "¿Qué puede estar causando este error?"
- "¿Hay una forma más simple de hacer esto?"
- "¿Puedes validar los datos de entrada?"

## RECORDATORIOS IMPORTANTES

- **Prioridad #1:** Resolver el VPD nocturno bajo
- **Prioridad #2:** Optimizar consumo en isla vacía
- **Límite crítico:** Nunca cambiar más de 2°C por hora
- **Meta VPD nocturno:** 0.80-1.10 kPa SIEMPRE
- **Horario luces:** OFF 17:00-23:00, ON 23:00-17:00

---

**COMIENZA** con el análisis de datos para confirmar el problema, luego el protocolo de emergencia. Todo lo demás se construye sobre esa base.