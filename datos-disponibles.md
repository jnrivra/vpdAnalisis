# DESCRIPCIÓN DE DATOS DISPONIBLES

## ARCHIVO CSV: Datos Básicos de Sensores

### Información General
- **Nombre:** Parcela 2 Promediosdataasjoinbyfield20250721 17_41_46.csv
- **Período:** 24 horas de un día típico
- **Frecuencia:** Mediciones cada 5 minutos
- **Total registros:** 289 filas

### Estructura de Columnas
1. **Time:** Fecha y hora (formato: "20-07-25 17:40")
2. **Temperaturas:** 
   - I1 Temperatura Promedio (°C)
   - I2 Temperatura Promedio (°C)
   - I3 Temperatura Promedio (°C)
   - I4 Temperatura Promedio (°C)
   - I5 Temperatura Promedio (°C)
   - I6 Temperatura Promedio (°C)
3. **Humedades:**
   - I1 Humedad Promedio (%)
   - I2 Humedad Promedio (%)
   - I3 Humedad Promedio (%)
   - I4 Humedad Promedio (%)
   - I5 Humedad Promedio (%)
   - I6 Humedad Promedio (%)

## ARCHIVO EXCEL: Análisis Ampliado con VPD y Energía

### Información General
- **Nombre:** 21Jul data analysis VPD.xlsx
- **Contenido:** Análisis completo con cálculos y consumo energético
- **Múltiples hojas** con diferentes análisis

### Hoja 1: Datos Climáticos con VPD
- Timestamp
- Temperatura por isla (I1-I6)
- Humedad por isla (I1-I6)
- **VPD calculado por isla** (I1-I6) en kPa
- Posibles promedios y estadísticas

### Hoja 2: Consumo Energético Deshumidificadores
- Timestamp
- **Consumo Oriente:** I1_Oriente_W hasta I6_Oriente_W (watts)
- **Consumo Poniente:** I1_Poniente_W hasta I6_Poniente_W (watts)
- **Consumo total** instantáneo
- Acumulados por período

### Posibles Hojas Adicionales
- Resumen estadístico día vs noche
- Correlaciones VPD vs Consumo
- Análisis por semana de cultivo
- Gráficos pre-generados

## INFORMACIÓN DERIVADA IMPORTANTE

### Patrones Esperados
- **Día (luces ON):** Mayor temperatura, menor humedad
- **Noche (luces OFF):** Menor temperatura, mayor humedad
- **Transiciones:** Cambios bruscos a las 17:00 y 23:00

### Correlaciones Clave
- Islas vacías = Menor consumo deshumidificadores
- Mayor VPD = Mayor consumo energético
- Plantas grandes = Mayor transpiración = Mayor humedad

### Datos Críticos para Análisis
1. **VPD promedio por período** (día/noche) por isla
2. **Consumo total** por isla según ocupación
3. **Eficiencia:** Watts consumidos por kPa de VPD mantenido
4. **Desbalance:** Diferencia consumo Oriente vs Poniente
5. **Anomalías:** Valores fuera de rango esperado