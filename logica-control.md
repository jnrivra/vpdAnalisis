# LÓGICA DE CONTROL DEL SISTEMA

## PRINCIPIOS FUNDAMENTALES

### 1. Control Adaptativo por Semana
- **Semana 1:** Plantas pequeñas necesitan más calor, menos humedad
- **Semana 2:** Balance intermedio
- **Semana 3:** Plantas grandes toleran más humedad, menos calor

### 2. Prioridad de Ajustes
1. Nunca cambiar más de 2°C por hora
2. Preferir cambio de temperatura sobre humedad
3. Usar deshumidificadores solo cuando sea necesario
4. Coordinar equipos para evitar conflictos

### 3. Gestión por Ocupación
- **Islas completas:** Control estándar según semana
- **Islas parciales:** Ajustar proporcionalmente
- **Isla vacía:** Modo mantenimiento mínimo

## PROTOCOLOS DE OPERACIÓN

### Protocolo Diurno (Luces ON: 23:00-17:00)
1. Mantener VPD objetivo según semana
2. Priorizar uniformidad entre zonas
3. Optimizar consumo energético
4. Preparar transición a noche

### Protocolo Nocturno (Luces OFF: 17:00-23:00)
1. **16:30** - Iniciar pre-calentamiento
2. **17:00** - Acelerar ajustes al apagar luces
3. **18:00** - Alcanzar VPD objetivo nocturno
4. **Mantener** VPD 0.80-1.10 toda la noche
5. **04:30** - Preparar transición a día

### Protocolo de Emergencia VPD Bajo
- Si VPD < 0.60 por más de 1 hora:
  1. Activar calefacción inmediata
  2. Maximizar deshumidificación
  3. Aumentar ventilación
  4. Alertar a operadores

## ESTRATEGIAS DE CONTROL

### Para Islas Completas (1, 2, 6)
- Control estándar según semana
- Ajustes uniformes en toda el área
- Optimización energética normal
- Monitoreo estándar

### Para Islas Parcialmente Vacías (3, 4)
- Identificar zonas con y sin plantas
- Crear "buffer" térmico en zonas vacías
- Ajustar ventilación para homogenizar
- Reducir equipos en zonas sin plantas

### Para Isla Vacía (5)
- Temperatura mínima: 18°C
- Humedad: 50-60%
- Deshumidificadores: OFF
- VRF: Mínimo o apagado
- Modo preparación si se va a plantar

## ALGORITMOS DE DECISIÓN

### Decisión de Ajuste de Temperatura
1. Calcular diferencia entre VPD actual y objetivo
2. Si diferencia > 0.1 kPa:
   - Estimar cambio de temperatura necesario
   - Verificar que no exceda 2°C/hora
   - Aplicar cambio gradual
3. Monitorear respuesta cada 15 minutos

### Decisión de Activación Deshumidificadores
1. Si humedad > objetivo + 5%:
   - Activar lado con mayor humedad primero
   - Si no es suficiente, activar ambos lados
   - Ajustar potencia según déficit
2. Si VPD está en rango: apagar para ahorrar

### Balanceo Entre Islas
1. Comparar condiciones entre islas similares
2. Si diferencia > 15%:
   - Identificar causa (equipos, ocupación)
   - Ajustar ventilación cruzada
   - Redistribuir carga térmica

## OPTIMIZACIÓN ENERGÉTICA

### Reglas de Ahorro
1. Nunca operar equipos en zonas vacías
2. Usar inercia térmica del edificio
3. Coordinar islas adyacentes
4. Aprovechar condiciones exteriores favorables

### Priorización de Equipos
1. VRF más eficiente que resistencias
2. Ventilación antes que deshumidificación
3. Usar un solo deshumidificador si es posible
4. Rotar equipos para desgaste uniforme

### Metas de Eficiencia
- Consumo < 100W por punto de VPD
- Tiempo en rango objetivo > 95%
- Reducción 30% consumo vs operación manual
- Cero condensación en estructuras

## SISTEMA DE ALERTAS

### Alertas Críticas (Acción Inmediata)
- VPD < 0.60 por más de 2 horas
- Falla de equipo principal
- Temperatura > 30°C o < 15°C
- Condensación detectada

### Alertas de Advertencia
- VPD fuera de rango por 1 hora
- Consumo > 150% del normal
- Diferencia > 20% entre islas similares
- Mantenimiento próximo

### Notificaciones Informativas
- Cambio de ciclo luz/oscuridad
- Optimización disponible
- Resumen diario de performance
- Proyecciones semanales