<<<<<<< HEAD
# 🌱 VPD Analysis App - Sistema Inteligente de Monitoreo Agrícola

## 📋 Descripción

Aplicación web avanzada para el monitoreo y análisis del Déficit de Presión de Vapor (VPD) en ambientes agrícolas controlados. Diseñada específicamente para optimizar las condiciones de cultivo en invernaderos con múltiples islas/parcelas.

## ✨ Características Principales

### 📊 Análisis Temporal Avanzado
- **Visualización multi-isla**: Monitoreo simultáneo de hasta 6 islas de cultivo
- **Gráficos interactivos**: Temperatura, humedad y VPD con ejes duales
- **Bloques temporales**: División automática del día en períodos optimizados:
  - 🌙 **Noche Planta** (17:00-23:00)
  - ☀️ **Día Planta** (00:00-16:55) con 3 sub-bloques:
    - 🌃 Madrugada (00:00-05:59)
    - 🌅 Mañana (06:00-11:59)
    - ☀️ Tarde (12:00-16:59)

### 🎯 Recomendaciones Inteligentes
- **Análisis por bloque**: Recomendaciones específicas para cada período del día
- **Comparación temperatura vs humedad**: Opciones lado a lado con consumo energético
- **Indicador de eficiencia**: Estrella (⭐) marca la opción más eficiente
- **Cálculo automático**: Ajustes necesarios para alcanzar VPD objetivo

### 💾 Configuración Persistente
- **Guardado automático**: Configuraciones se mantienen entre sesiones
- **Por sector/parcela**: Cada parcela tiene su propia configuración
- **Tipos de cultivo**: Albahaca 🌿, Lechuga 🥬, Mixto 🌱
- **Semanas de cultivo**: 4 etapas de desarrollo (S0-S3)

### 📁 Soporte Multi-fuente de Datos
- **JSON**: Datos en tiempo real desde sensores
- **Excel**: Importación de datos históricos (dataSemanal.xlsx)
- **Selector de fecha**: Calendario para análisis de días específicos
- **Múltiples sectores**: Parcela 1, 2, 3 y Almácigo

## 🚀 Instalación

### Prerrequisitos
- Node.js (v14 o superior)
- npm o yarn

### Pasos de instalación

```bash
# Clonar el repositorio
git clone https://github.com/jnrivra/vpdAnalisis.git
cd vpdAnalisis/vpd-analysis-app

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm start

# La aplicación estará disponible en http://localhost:3000
```

### Iniciar en puerto específico

```bash
# Iniciar en puerto 3020
PORT=3020 npm start
```

## 📂 Estructura del Proyecto

```
vpd-analysis-app/
├── public/
│   ├── vpd-data.json          # Datos de ejemplo JSON
│   └── dataSemanal.xlsx       # Datos históricos Excel
├── src/
│   ├── components/
│   │   ├── VPDDashboard.tsx   # Dashboard principal
│   │   ├── VPDTemporalAnalysis.tsx  # Análisis temporal con configuración
│   │   ├── VPDConfigPanel.tsx # Panel de configuración VPD
│   │   └── SectorDaySelector.tsx # Selector de sector y fecha
│   ├── services/
│   │   ├── dataService.ts     # Servicio centralizado de datos
│   │   └── configStorageService.ts # Persistencia de configuraciones
│   ├── types/
│   │   └── vpd-types.ts       # Definiciones TypeScript
│   └── utils/
│       └── excelToJsonConverter.ts # Conversión Excel a JSON
```

## 🎮 Uso

### Configuración de Islas

1. **Seleccionar tipo de cultivo**: Click en los botones de cultivo (🌿 Albahaca, 🥬 Lechuga, 🌱 Mixto)
2. **Asignar semana**: Seleccionar S0-S3 según etapa de desarrollo
3. **Activar/desactivar islas**: Checkbox para incluir/excluir del análisis
4. **Guardado automático**: Cambios se guardan instantáneamente con notificación verde

### Análisis de Datos

1. **Cargar datos**:
   - **JSON**: Seleccionar "Datos JSON" para tiempo real
   - **Excel**: Seleccionar "Datos Excel", elegir sector y fecha, click en "Cargar Datos"

2. **Filtrar por período**:
   - Click en "Noche Planta" o "Día Planta"
   - Día Planta muestra automáticamente 3 sub-bloques con recomendaciones

3. **Interpretar recomendaciones**:
   - **Verde**: VPD óptimo ✅
   - **Amarillo**: VPD aceptable ⚠️
   - **Rojo**: Requiere ajuste ❌
   - **Estrella ⭐**: Opción más eficiente energéticamente

## 🔧 Configuración Avanzada

### Rangos VPD por Semana

| Semana | Etapa | VPD Óptimo | Enfoque |
|--------|-------|------------|----------|
| S0 | Sin Cultivo | N/A | Modo ahorro |
| S1 | Germinación | 1.00-1.05 kPa | Establecimiento radicular |
| S2 | Desarrollo | 0.95-1.00 kPa | Desarrollo foliar |
| S3 | Producción | 0.80-1.00 kPa | Máxima biomasa |

### Personalización por Cultivo

#### 🌿 Albahaca
- S1: 1.05-1.15 kPa (Germinación)
- S2: 0.95-1.10 kPa (Vegetativo)
- S3: 0.85-1.05 kPa (Aromático)

#### 🥬 Lechuga
- S1: 0.95-1.05 kPa (Germinación)
- S2: 0.85-0.95 kPa (Hojas)
- S3: 0.75-0.90 kPa (Cogollo)

## 🛠️ Tecnologías

- **React 18** con TypeScript
- **Recharts** para visualización de datos
- **date-fns** para manejo de fechas
- **xlsx** para procesamiento de Excel
- **LocalStorage API** para persistencia

## 📈 Mejoras Recientes

### v2.5.0 (Enero 2025)
- ✅ Eliminación de pestaña redundante "Análisis Inteligente"
- ✅ Consolidación de funcionalidades en "Análisis Temporal"
- ✅ Persistencia de configuraciones por sector
- ✅ Recomendaciones temperatura/humedad lado a lado
- ✅ División automática en 3 bloques para "Día Planta"
- ✅ Notificaciones visuales de guardado
- ✅ Botón para limpiar configuraciones

### v2.4.0 (Diciembre 2024)
- ✅ Sistema de visualización VPD integrado
- ✅ Estadísticas contextualizadas por semana
- ✅ Optimización UI/UX con headers compactos
- ✅ Sistema de bloques temporales simplificado

## 🐛 Solución de Problemas

### La aplicación no carga datos Excel
- Verificar que el archivo `dataSemanal.xlsx` esté en `/public`
- Asegurar que el formato del Excel coincida con el esperado
- Revisar la consola del navegador para mensajes de error

### Las configuraciones no se guardan
- Verificar que el navegador permita LocalStorage
- Limpiar caché del navegador si es necesario
- Usar el botón "Limpiar Configuraciones" y volver a configurar

### Gráficos no muestran datos
- Verificar que las islas estén seleccionadas (checkbox activo)
- Confirmar que hay datos para el período seleccionado
- Revisar que el archivo de datos tenga el formato correcto

## 👥 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea tu rama de características (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📧 Contacto

- **Proyecto**: [https://github.com/jnrivra/vpdAnalisis](https://github.com/jnrivra/vpdAnalisis)
- **Desarrollado para**: AgroUrbana

## 🙏 Agradecimientos

- Equipo de AgroUrbana por los requerimientos y feedback
- Claude AI por la asistencia en el desarrollo
- Comunidad de React y TypeScript

---

🤖 *Desarrollado con [Claude Code](https://claude.ai/code)*

*Última actualización: Enero 2025*
=======
# 🌱 Sistema de Control VPD - Granja Vertical Agrourbana

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)](https://www.typescriptlang.org/)
[![Recharts](https://img.shields.io/badge/Recharts-3.1.0-orange.svg)](https://recharts.org/)
[![Version](https://img.shields.io/badge/Version-2.3.0-green.svg)](https://github.com/jnrivra/vpdAnalisis)
[![Status](https://img.shields.io/badge/Status-Production-success.svg)](https://github.com/jnrivra/vpdAnalisis)

> **Sistema inteligente de control climático para optimización del Déficit de Presión de Vapor (VPD) en cultivos hidropónicos con análisis térmico avanzado y gestión energética**

## 🆕 Actualizaciones Recientes (v2.3.0 - Julio 28, 2025)

### 🤖 Integración con Agentes Especializados de Claude Code
- **36 Agentes Especializados**: Cada agente maneja aspectos específicos del sistema VPD
- **Arquitectura Multi-Agente**: Coordinación inteligente entre agentes de análisis, visualización y control
- **Especialización por Dominio**: Agentes expertos en frontend, backend, datos, ML, seguridad y más
- **Escalabilidad Automática**: Sistema que se adapta automáticamente a la complejidad del proyecto

### ✨ Control Panel - Análisis Térmico Avanzado
- **4 Etapas del Ciclo Térmico**: Calentamiento matutino, estabilidad diurna, enfriamiento vespertino y estabilidad nocturna
- **Gradientes Térmicos**: Monitoreo de tasas de cambio (°C/hora) con alertas
- **Integral Térmica Diaria**: Cálculo de grados-día acumulados
- **Métricas Avanzadas**: Amplitud térmica, tiempo en rango óptimo, uniformidad

### 🎨 Mejoras Visuales
- **Franjas Verticales**: Separación clara entre bloques temporales
- **Áreas Sombreadas**: Identificación visual de períodos climáticos
- **Tooltips Mejorados**: Información detallada al hover
- **Rendimiento Optimizado**: Carga más rápida y menor uso de memoria

### ⚡ Sistema de 5 Bloques Temporales
- 🌙 **Madrugada Fría** (23:00-02:00): Prioridad en temperatura
- 🌌 **Noche Profunda** (02:01-08:00): Prioridad en humedad
- 🌅 **Amanecer** (08:01-12:00): Balance óptimo
- ☀️ **Día Activo** (12:01-17:00): Máxima fotosíntesis
- 🌃 **Noche Planta** (17:01-22:59): Preparación para descanso

## 📖 Descripción

Aplicación web desarrollada en React/TypeScript que permite monitorear, analizar y optimizar el **Déficit de Presión de Vapor (VPD)** en sistemas de cultivo hidropónico. Diseñada específicamente para el manejo de múltiples islas de cultivo con análisis inteligente basado en períodos circadianos de las plantas y ahora con análisis térmico avanzado para optimización energética.

## 🏗️ Arquitectura del Sistema

### Arquitectura Multi-Agente con Claude Code

```
┌─────────────────────────────────────────────────────────────┐
│               SISTEMA MULTI-AGENTE VPD                      │
├─────────────────────────────────────────────────────────────┤
│  🤖 Claude Code Agents (36 especializados)                 │
│  ├─ frontend-developer: UI/UX y componentes React          │
│  ├─ data-engineer: ETL pipelines y análisis de datos       │
│  ├─ python-pro: Algoritmos de cálculo VPD                  │
│  ├─ javascript-pro: Optimización y patrones ES6+           │
│  ├─ performance-engineer: Métricas y optimización          │
│  ├─ security-auditor: Validación y compliance              │
│  ├─ ml-engineer: Predicciones y análisis predictivo        │
│  ├─ database-optimizer: Queries y estructuras de datos     │
│  ├─ api-documenter: Documentación técnica                  │
│  └─ ... 27 agentes adicionales especializados              │
├─────────────────────────────────────────────────────────────┤
│                    VPD ANALYSIS APP                         │
├─────────────────────────────────────────────────────────────┤
│  📊 Dashboard Principal                                     │
│  ├─ 🔄 Selector Período (Día/Noche/24h)                   │
│  ├─ 🏝️ Gestión Multi-Isla (I1-I6)                         │
│  └─ 📈 Visualización en Tiempo Real                       │
├─────────────────────────────────────────────────────────────┤
│  📈 Módulo de Gráficos                                     │
│  ├─ VPD Evolution Chart (Recharts)                        │
│  ├─ Análisis Temporal Dinámico                            │
│  └─ Recomendaciones Inteligentes                          │
├─────────────────────────────────────────────────────────────┤
│  🧮 Motor de Cálculo VPD                                   │
│  ├─ SVP = 0.6108 × e^(17.27×T/(T+237.3))                 │
│  ├─ VPD = SVP × (1 - RH/100)                              │
│  └─ Análisis por Períodos Circadianos                     │
├─────────────────────────────────────────────────────────────┤
│  📊 Procesamiento de Datos                                 │
│  ├─ Excel/CSV Reader (XLSX)                               │
│  ├─ Filtros Temporales                                    │
│  └─ Estadísticas Avanzadas                                │
└─────────────────────────────────────────────────────────────┘
```

## 🕐 Períodos Circadianos de Plantas

La aplicación está optimizada para trabajar con los ciclos naturales de las plantas:

```
🌅 DÍA PLANTA     │ 23:00 ────────► 17:00 │ 18 horas de luz
🌙 NOCHE PLANTA   │ 17:01 ────────► 22:59 │  6 horas de oscuridad
🕐 24 HORAS       │ 00:00 ────────► 23:59 │ Análisis completo
```

## 🏝️ Configuración Multi-Isla

Sistema diseñado para 6 islas de cultivo con configuraciones específicas:

| Isla | Estado | Semana Cultivo | Cultivo | VPD Óptimo |
|------|--------|----------------|---------|------------|
| I1 | 🟢 Activa | Semana 3 | Albahaca | 0.8-1.2 kPa |
| I2 | 🟢 Activa | Semana 2 | Albahaca | 0.6-1.0 kPa |
| I3 | 🟡 Mixta | Semana 1 | Mixto | 0.4-0.8 kPa |
| I4 | 🟡 Mixta | Semana 3 | Mixto | 0.8-1.2 kPa |
| I5 | 🔴 Vacía | - | - | - |
| I6 | 🟢 Activa | Semana 1 | Mixto | 0.4-0.8 kPa |

## 🚀 Instalación Rápida

### Prerrequisitos
- Node.js 16+ 
- npm 8+

### Pasos de Instalación

```bash
# 1. Clonar repositorio
git clone https://github.com/jnrivra/vpdAnalisis.git
cd vpdAnalisis

# 2. Instalar dependencias
npm install

# 3. Iniciar aplicación
npm run start-dynamic

# 4. Abrir navegador
# La app estará disponible en http://localhost:3002
```

### Scripts Disponibles

```bash
npm run start-dynamic    # Servidor optimizado puerto 3002
npm run dev-stable      # Modo desarrollo ultra-estable
npm run build          # Build producción
npm run test           # Ejecutar tests
```

## 📊 Funcionalidades Principales

### 1. 📈 Análisis Visual Avanzado
- **Gráficos interactivos** con Recharts
- **Zoom temporal** y navegación fluida
- **Líneas de referencia** para rangos óptimos
- **Performance optimizada** sin dots en líneas

### 2. 🧠 Recomendaciones Inteligentes
```
📊 ESTADÍSTICAS DINÁMICAS POR PERÍODO
├─ VPD Promedio Actual
├─ Temperatura Media
├─ Humedad Relativa Media
└─ % Tiempo en Rango Óptimo

🎯 RECOMENDACIONES ESPECÍFICAS
├─ Ajustes de Temperatura
├─ Ajustes de Humedad
├─ Predicción de Impacto
└─ Prioridad de Acción
```

### 3. 🔄 Análisis Temporal Inteligente
- **Filtros por período**: Día/Noche/24h
- **Estadísticas dinámicas** que cambian según período seleccionado
- **Consistencia total** entre gráficos y estadísticas
- **Alertas en tiempo real**

### 4. 📋 Gestión de Datos
- **Importación Excel/CSV** automática
- **Procesamiento en tiempo real**
- **Validación de datos** inteligente
- **Backup automático** de configuraciones

## 🧮 Algoritmos de Cálculo

### VPD (Vapor Pressure Deficit)
```typescript
// 1. Cálculo SVP (Saturated Vapor Pressure)
const svp = 0.6108 * Math.exp((17.27 * temperatura) / (temperatura + 237.3));

// 2. Cálculo VPD
const vpd = svp * (1 - humedadRelativa / 100);

// 3. Análisis por período
const periodData = data.filter(record => {
  const hour = new Date(record.timestamp).getHours();
  return selectedPeriod === 'day' 
    ? (hour >= 23 || hour <= 17)
    : (hour >= 17 && hour <= 22);
});
```

### Recomendaciones Dinámicas
```typescript
// Cálculo de ajustes necesarios
const tempAdjustment = targetVPD - currentVPD > 0 
  ? `+${(targetVPD - currentVPD) * 2.5}°C`
  : `${(targetVPD - currentVPD) * 2.5}°C`;

const humidityAdjustment = targetVPD - currentVPD > 0
  ? `${(currentVPD - targetVPD) * 15}%`
  : `+${(targetVPD - currentVPD) * 15}%`;
```

## 📱 Interface de Usuario

### Panel de Control Simplificado
```
┌────────────────────────────────────────┐
│  🕐 PERÍODO DE ANÁLISIS               │
│  ┌──────┐ ┌──────┐ ┌──────┐          │
│  │ ☀️ DÍA│ │🌙NOCHE│ │🕐 24H │          │
│  └──────┘ └──────┘ └──────┘          │
└────────────────────────────────────────┘
```

### Sistema de Pestañas
- **📈 Evolución**: Gráficos temporales interactivos
- **📊 Análisis**: Tablas estadísticas detalladas  
- **🎯 Optimizador**: Recomendaciones y ajustes

## ⚙️ Configuración Técnica

### Hot Reload Estable
```bash
# Configuración optimizada en .env
CI=false                    # Evita warnings fatales
GENERATE_SOURCEMAP=false   # Mejora performance
SKIP_PREFLIGHT_CHECK=true  # Omite verificaciones problemáticas
FAST_REFRESH=true          # Recarga rápida
PORT=3002                  # Puerto fijo
```

### Dependencias Clave
```json
{
  "react": "^19.1.0",
  "typescript": "^4.9.5", 
  "recharts": "^3.1.0",
  "date-fns": "^4.1.0",
  "xlsx": "^0.18.5",
  "lucide-react": "^0.525.0"
}
```

## 📈 Performance y Optimización

### Métricas de Rendimiento
- ⚡ **Inicio**: < 3 segundos
- 📊 **Render gráficos**: < 500ms
- 🔄 **Hot reload**: < 1 segundo
- 💾 **Memoria**: < 100MB

### Optimizaciones Implementadas
- **Lazy Loading** de componentes pesados
- **Memoización** de cálculos VPD
- **Virtualización** de listas grandes
- **Debounce** en filtros temporales

## 🔧 Desarrollo y Mantenimiento

### Estructura del Proyecto
```
vpd-analysis-app/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── VPDDashboard.tsx      # Dashboard principal
│   │   ├── VPDEvolutionChart.tsx # Motor gráficos
│   │   ├── VPDAnalysisTable.tsx  # Tablas análisis
│   │   └── VPDOptimizer.tsx      # Recomendaciones
│   ├── types/
│   │   └── vpd-types.ts          # Definiciones TypeScript
│   ├── utils/
│   │   └── vpdCalculations.ts    # Algoritmos cálculo
│   └── styles/
│       └── *.css                 # Estilos componentes
├── package.json
├── .env                          # Configuración ambiente
└── README.md
```

### Testing y QA
```bash
# Ejecutar suite completa de tests
npm run test

# Tests específicos
npm run test -- --testPathPattern=VPD
npm run test -- --coverage
```

## 🐛 Resolución de Problemas

### Problemas Comunes

#### ❗ Servidor no inicia
```bash
# Limpiar puerto y cache
lsof -ti :3002 | xargs kill -9
npm run start-dynamic
```

#### ❗ Hot reload no funciona
```bash
# Verificar configuración .env
echo $CI $FAST_REFRESH
# Debe mostrar: false true
```

#### ❗ Datos no cargan
- Verificar formato Excel/CSV
- Comprobar columnas: timestamp, I1_Temp, I1_Humidity, etc.
- Validar rangos de datos (Temp: 0-50°C, RH: 0-100%)

### Logs de Diagnóstico
```bash
# Ver logs detallados
npm run start-dynamic 2>&1 | tee debug.log

# Monitorear performance
npm run build --analyze
```

## 🤝 Contribución

### Para Desarrolladores
1. Fork del repositorio
2. Crear branch feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'feat: agregar nueva funcionalidad'`
4. Push branch: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

### Estándares de Código
- **TypeScript estricto** con tipos explícitos
- **Componentes funcionales** con hooks
- **CSS modular** por componente
- **Comentarios** en funciones complejas

## 📊 Roadmap

### ✅ v2.3.0 - Completado (Julio 2025)
- [x] 🤖 Integración con 36 agentes especializados de Claude Code
- [x] 🏗️ Arquitectura multi-agente para desarrollo escalable
- [x] 📚 Documentación técnica completa actualizada
- [x] 🔧 Sistema de especialización por dominio
- [x] ⚡ Coordinación automática entre agentes

### ✅ v2.2.0 - Completado (Julio 2025)
- [x] 🌡️ Control Panel con análisis térmico avanzado
- [x] 📊 Sistema de 5 bloques temporales
- [x] 🎨 Mejoras visuales con franjas verticales
- [x] ⚡ Optimización de rendimiento
- [x] 📈 Análisis energético mejorado

### 🚧 v2.4.0 - En Desarrollo (Q3 2025)
- [ ] 📡 API REST para datos en tiempo real con agente backend-architect
- [ ] 📧 Sistema de alertas push/SMS con agente incident-responder
- [ ] 📊 Exportar reportes PDF con agente api-documenter
- [ ] 🔍 Búsqueda avanzada con agente data-scientist
- [ ] 🤖 AI-powered recommendations con agente ai-engineer

### 🔮 v3.0.0 - Futuro (Q4 2025)
- [ ] 🤖 Machine Learning avanzado con agente ml-engineer
- [ ] 📱 App móvil React Native con agente mobile-developer
- [ ] ☁️ Cloud infrastructure con agente cloud-architect
- [ ] 🎯 Automatización completa con agente devops-troubleshooter
- [ ] 📈 Dashboard ejecutivo con agente data-engineer
- [ ] 🔒 Security hardening con agente security-auditor
- [ ] 🚀 Performance optimization con agente performance-engineer

## 📄 Licencia

Este proyecto está bajo Licencia MIT - ver archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**Juan Rivera** - *Desarrollo completo* - [@jnrivra](https://github.com/jnrivra)

---

### 🚀 ¡Empezar Ahora!

```bash
git clone https://github.com/jnrivra/vpdAnalisis.git && cd vpdAnalisis && npm install && npm run start-dynamic
```

**¡Tu sistema VPD estará corriendo en http://localhost:3002 en menos de 2 minutos!** 🌱
>>>>>>> 30c926593f3a4658aa2229ee7b3fb71dd4695a6f
