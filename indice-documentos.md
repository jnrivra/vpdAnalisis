# ÍNDICE DE DOCUMENTOS - Sistema Control VPD Granja Vertical

## DOCUMENTOS PARA CLAUDE CODE

### 📌 **INSTRUCCIONES_CLAUDE_CODE.md** (EMPIEZA AQUÍ)
Guía paso a paso de cómo usar Claude Code para este proyecto. Incluye prompts específicos, estructura de archivos y tips para mejores resultados.

### 1. **01_PROYECTO_CLAUDE_CODE.md** (anterior PROMPT_MAESTRO)
Documento principal optimizado para Claude Code con toda la información del proyecto, tareas específicas y prioridades de desarrollo.

### 2. **02_DESCRIPCION_PROBLEMA.md**
Explicación detallada del problema actual, sus consecuencias y el impacto en la operación. Incluye las complejidades de tener islas con diferente ocupación.

### 3. **03_DATOS_DISPONIBLES.md**
Descripción completa de los archivos CSV y Excel, su estructura, contenido y qué información importante se puede extraer de ellos.

### 4. **04_VISUALIZACIONES_REQUERIDAS.md**
Especificación de todas las visualizaciones necesarias: dashboard principal, tablas VPD, mapas de calor, gráficos temporales y reportes.

### 5. **05_LOGICA_CONTROL.md**
Descripción conceptual (sin código) de cómo debe funcionar el sistema de control: protocolos, estrategias, decisiones y optimización.

### 6. **06_PLAN_IMPLEMENTACION.md**
Plan detallado de implementación en 4 fases, con timeline, recursos necesarios, riesgos y métricas de éxito.

### 7. **07_RESUMEN_EJECUTIVO.md**
Documento de una página para la gerencia con el problema, solución, beneficios, inversión y recomendaciones.

### 8. **08_TECH_STACK_DATARABBIT.md** (NUEVO)
Especificación técnica completa del sistema DataRabbit - stack tecnológico probado en agricultura vertical que puede servir como base.

### 9. **09_INTEGRACION_DATARABBIT_VPD.md** (NUEVO)
Guía de cómo aprovechar las tecnologías y patrones de DataRabbit para el proyecto VPD, con ejemplos de código y recomendaciones.

### 📄 **CODIGO_REFERENCIA.md**
Ejemplos de código, funciones útiles y estructuras de datos para comenzar rápidamente.

## CÓMO USAR ESTOS DOCUMENTOS EN CLAUDE CODE

### Configuración Inicial:
1. Crea un nuevo proyecto en Claude Code
2. Sube TODOS estos documentos .md
3. Sube los archivos de datos (CSV y Excel)
4. Sigue las **INSTRUCCIONES_CLAUDE_CODE.md**

### Flujo de Trabajo Recomendado:
1. Lee primero **INSTRUCCIONES_CLAUDE_CODE.md**
2. Revisa **08_TECH_STACK_DATARABBIT.md** para entender el stack recomendado
3. Consulta **09_INTEGRACION_DATARABBIT_VPD.md** para aprovechar código existente
4. Usa los prompts sugeridos en orden
5. Referencia **PROYECTO_CLAUDE_CODE.md** para contexto

### Para el Desarrollo:
- **Sesión 1:** Análisis + Protocolo emergencia + Dashboard básico
- **Sesión 2:** Tabla VPD + Sistema control + Análisis energético  
- **Sesión 3:** Visualizaciones avanzadas + Reportes + Optimización

## ARCHIVOS DE DATOS NECESARIOS
- `Parcela 2 Promediosdataasjoinbyfield20250721 17_41_46.csv`
- `21Jul data analysis VPD.xlsx`
- Imagen del plano arquitectónico (opcional pero útil)

## STACK TECNOLÓGICO RECOMENDADO
Basado en DataRabbit (ver documento 08):
- **Frontend:** React 18 + TypeScript
- **UI:** Tailwind CSS
- **Gráficos:** Recharts
- **Procesamiento:** XLSX + Papa Parse
- **Estado:** React Context API

## TIPS PARA ÉXITO CON CLAUDE CODE
1. Sube TODOS los archivos antes de empezar
2. Menciona que quieres usar el stack de DataRabbit
3. Desarrolla incrementalmente
4. Prueba cada componente antes de seguir
5. Pide alternativas si algo no funciona

## PRIORIDADES CRÍTICAS
🔴 **URGENTE:** Resolver VPD nocturno (0.35-0.50 → 0.80-1.10 kPa)
🟡 **IMPORTANTE:** Optimizar consumo isla vacía (5)
🟢 **DESEABLE:** Visualizaciones avanzadas y reportes