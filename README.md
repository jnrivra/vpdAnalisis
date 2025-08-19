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