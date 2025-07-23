# VISUALIZACIONES REQUERIDAS

## 1. DASHBOARD PRINCIPAL

### Vista General de las 6 Islas
- Layout tipo plano arquitectónico
- Cada isla muestra:
  - Número y semana de cultivo
  - VPD actual con color según estado
  - Temperatura y humedad actuales
  - Porcentaje de ocupación
  - Consumo energético instantáneo
- Actualización automática cada 5 minutos
- Alertas visuales para condiciones críticas

### Panel de Métricas Globales
- VPD promedio de la granja
- Consumo total energético
- Eficiencia general (kPa/watt)
- Alertas activas
- Tendencia últimas 4 horas

## 2. TABLA VPD INTERACTIVA

### Características Principales
- Ejes: Temperatura (Y) vs Humedad (X)
- Incrementos: 0.25°C × 2% HR
- Celdas coloreadas según valor VPD
- Zonas óptimas resaltadas según semana seleccionada

### Elementos Interactivos
- Selector de semana (1, 2 o 3)
- Marcadores de posición actual de cada sensor
- Modo día/noche
- Tooltips con información detallada
- Exportable como imagen

### Códigos de Color
- Verde: VPD óptimo para la semana
- Amarillo: VPD aceptable
- Rojo: VPD crítico
- Gris: Fuera de rango operativo

## 3. MAPA DE CALOR POR ZONAS

### Vista Tipo Plano
- Representación fiel del layout real
- Gradientes de color para temperatura
- Overlay opcional para humedad o VPD
- Zonas vacías claramente marcadas
- Animación de flujo de aire (opcional)

### Información por Zona
- Click en zona muestra detalle
- Histórico de últimas 24 horas
- Comparación con zonas adyacentes
- Recomendaciones específicas

## 4. GRÁFICOS TEMPORALES

### Gráfico Principal 24 Horas
- Líneas múltiples: Temperatura, Humedad, VPD
- Área sombreada para período sin luz
- Marcadores de eventos (cambios de luz)
- Zoom interactivo
- Comparación entre islas

### Gráfico de Consumo Energético
- Barras apiladas por deshumidificador
- Línea de VPD superpuesta
- Identificación de picos
- Cálculo de eficiencia en tiempo real

## 5. PANEL DE CONTROL POR ISLA

### Información Detallada
- Todos los parámetros actuales
- Histórico de 7 días
- Proyección próximas 4 horas
- Controles manuales (override)

### Modos de Operación
- Automático (por semana)
- Manual
- Eco (ahorro energía)
- Mantenimiento

## 6. VISUALIZACIONES ESPECIALES

### Comparador de Islas
- Tabla comparativa lado a lado
- Métricas de eficiencia
- Ranking de performance
- Identificación de anomalías

### Simulador de Escenarios
- Qué pasaría si cambio X grados
- Impacto en consumo energético
- Tiempo para alcanzar objetivo
- Riesgos asociados

### Monitor de Transiciones
- Visualización especial 16:00-18:00 y 22:00-24:00
- Velocidad de cambio
- Alertas de cambios bruscos
- Recomendaciones de ajuste

## 7. REPORTES Y EXPORTACIÓN

### Reportes Automáticos
- Resumen diario
- Análisis semanal
- Consumo mensual
- Incidencias y alertas

### Formatos de Exportación
- PDF para gerencia
- Excel para análisis
- Imágenes para presentaciones
- Datos raw en CSV