# 🌱 VPD Analysis App - Sistema de Control Climático Inteligente

> **Aplicación avanzada para análisis y optimización del Déficit de Presión de Vapor (VPD) en cultivos hidropónicos con sistema de bloques temporales**

## 🚀 Características Principales

### 📊 **Sistema de 5 Bloques Temporales**
Control climático inteligente dividido en bloques específicos según el ciclo circadiano de las plantas:

- **🌙 Madrugada Fría** (23:00-02:00) - Prioridad: Temperatura
- **🌌 Noche Profunda** (02:01-08:00) - Prioridad: Humedad  
- **🌅 Amanecer** (08:01-12:00) - Prioridad: Balance
- **☀️ Día Activo** (12:01-17:00) - Prioridad: Temperatura
- **🌃 Noche Planta** (17:01-22:59) - Prioridad: Balance

### 📈 **Visualización Avanzada**
- **Gráficos interactivos** con Recharts
- **Franjas verticales** que separan bloques temporales
- **Áreas sombreadas** por bloque climático
- **Líneas de referencia** para rangos óptimos
- **Leyendas visuales** con horarios e íconos

### ⚡ **Análisis Energético**
- **Consumo de deshumidificadores** por isla y orientación
- **Recomendaciones eficientes** basadas en consumo energético
- **Badges de estado** (Crítico, Alto, Moderado, Bajo, Apagado)
- **Impacto energético** calculado por ajuste climático

### 🎯 **Recomendaciones Inteligentes**
- **Análisis por isla** con datos específicos
- **Opciones de ajuste** con viabilidad y eficiencia
- **Cálculos de VPD** predictivos
- **Priorización** según consumo energético actual

## 🛠️ Tecnologías

- **React 18.2** con TypeScript 4.9.5
- **Recharts 3.1.0** para visualización de datos
- **Date-fns** para manejo de fechas
- **CSS Modules** con diseño responsivo

## ⚙️ Instalación y Uso

```bash
# Clonar repositorio
git clone https://github.com/jnrivra/vpdAnalisis.git
cd vpd-analysis-app

# Instalar dependencias
npm install

# Iniciar aplicación
npm start
```

La aplicación estará disponible en `http://localhost:3002`

## 📋 Funcionalidades

### **1. Selector de Períodos**
- **24 Horas Completas**: Vista general con todos los bloques
- **Día Planta**: Análisis del período activo (23:00-17:00)
- **Noche Planta**: Análisis del período de descanso (17:01-22:59)
- **Bloques Específicos**: Análisis detallado por bloque temporal

### **2. Análisis por Semana de Cultivo**
- **Semana 1**: Establecimiento radicular (VPD 1.00-1.05 kPa)
- **Semana 2**: Desarrollo foliar (VPD 0.95-1.00 kPa)  
- **Semana 3**: Máxima biomasa (VPD 0.80-1.00 kPa)

### **3. Monitoreo Multi-Isla**
- **6 islas independientes** (I1-I6)
- **Estados de cultivo** diferenciados
- **Asignación automática** por semana de crecimiento

### **4. Métricas de Control**
- **VPD (kPa)**: Déficit de presión de vapor
- **Temperatura (°C)**: Con rangos óptimos por semana
- **Humedad Relativa (%)**: Con rangos óptimos por semana
- **Consumo Energético (W)**: Deshumidificadores por orientación

## 🔧 Configuración

### **Datos de Entrada**
La aplicación procesa datos JSON con estructura:
```json
{
  "metadata": {
    "date": "2025-07-21",
    "totalRecords": 288,
    "timeInterval": "5min"
  },
  "data": [
    {
      "time": "2025-07-21T00:00:00.000Z",
      "hour": 0,
      "islands": { ... },
      "dehumidifiers": { ... }
    }
  ]
}
```

### **Cálculo de VPD**
```typescript
const calculateVPD = (temp: number, humidity: number) => {
  const svp = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
  return svp * (1 - humidity / 100);
};
```

## 📊 Arquitectura del Sistema

```
src/
├── components/
│   ├── VPDDashboard.tsx          # Componente principal
│   ├── VPDEvolutionChart.tsx     # Gráficos temporales
│   ├── VPDAnalysisTable.tsx      # Tabla de análisis
│   └── VPDOptimizer.tsx          # Optimizador de condiciones
├── types/
│   └── vpd-types.ts              # Definiciones TypeScript
└── utils/
    └── vpdCalculations.ts        # Cálculos VPD
```

## 🎨 Interfaz de Usuario

### **Diseño Responsivo**
- **Grid adaptativo** para recomendaciones
- **Gráficos escalables** con ResponsiveContainer
- **Colores temáticos** por isla y bloque temporal

### **Paleta de Colores**
- **I1**: Verde #27ae60
- **I2**: Azul #3498db  
- **I3**: Rojo #e74c3c
- **I4**: Naranja #f39c12
- **I5**: Morado #9b59b6
- **I6**: Turquesa #1abc9c

## 🚦 Estados del Sistema

### **Consumo Energético**
- **🔴 CRÍTICO**: >8000W - Acción inmediata requerida
- **🟠 ALTO**: 6000-8000W - Optimización recomendada
- **🟡 MODERADO**: 4000-6000W - Monitoreo continuo
- **🟢 BAJO**: 0-4000W - Funcionamiento eficiente
- **⚫ APAGADO**: 0W - Deshumidificadores inactivos

### **VPD Status**
- **✅ ÓPTIMO**: Dentro del rango objetivo
- **⬆️ ALTO**: Por encima del rango - Requiere humidificación
- **⬇️ BAJO**: Por debajo del rango - Requiere deshumidificación

## 📈 Métricas de Rendimiento

- **Tiempo de respuesta**: <2s para carga inicial
- **Actualización de gráficos**: Tiempo real
- **Procesamiento de datos**: 288 registros/día
- **Memoria**: Optimizado para datasets grandes

## 🔄 Flujo de Trabajo

1. **Carga de datos** automática desde archivo JSON
2. **Selección de período** temporal
3. **Filtrado de datos** por bloque climático
4. **Análisis de condiciones** actuales vs. óptimas
5. **Generación de recomendaciones** específicas
6. **Visualización** de resultados y tendencias

## 🌟 Características Avanzadas

### **Análisis Predictivo**
- Cálculo de VPD resultante por ajuste
- Predicción de impacto energético
- Evaluación de viabilidad de cambios

### **Sistema de Prioridades**
- **🚨 CRÍTICO**: Condiciones fuera de rango con alto consumo
- **🔴 URGENTE**: Ajustes necesarios inmediatos
- **🟡 MEDIO**: Optimizaciones recomendadas
- **🟢 NORMAL**: Mantenimiento de condiciones actuales

## 📱 Responsive Design

- **Desktop**: Pantallas >1200px
- **Tablet**: 768px-1200px  
- **Mobile**: <768px
- **Gráficos escalables** en todos los dispositivos

## 🔮 Próximas Funcionalidades

- [ ] Alertas en tiempo real
- [ ] Exportación de reportes PDF
- [ ] Integración con sensores IoT
- [ ] Machine Learning para predicciones
- [ ] Dashboard móvil nativo

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## 🌱 Desarrollado para Agrourbana

**Sistema de Control Climático Inteligente para Cultivos Hidropónicos**

---

**Última actualización**: Julio 23, 2025  
**Versión**: 2.1.0 - Sistema de Bloques Temporales  
**Desarrollado con**: ❤️ y mucho ☕