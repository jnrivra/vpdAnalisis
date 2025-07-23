#!/bin/bash

# Protocolo de verificación del servidor VPD - siguiendo tu metodología

echo "🔍 Verificando estado del servidor VPD..."

# 1. Verificar si servidor está corriendo
SERVER_RUNNING=$(lsof -i :3002 2>/dev/null)

if [[ -n "$SERVER_RUNNING" ]]; then
    echo "✅ Servidor detectado en puerto 3002"
    echo "$SERVER_RUNNING"
    
    # Verificar si responde correctamente
    HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002 2>/dev/null)
    
    if [[ "$HTTP_RESPONSE" == "200" ]]; then
        echo "✅ Servidor respondiendo correctamente (HTTP 200)"
        echo "🌐 App disponible en: http://localhost:3002"
        exit 0
    else
        echo "⚠️  Servidor detectado pero no responde correctamente (HTTP $HTTP_RESPONSE)"
        echo "🔄 Reiniciando servidor..."
    fi
else
    echo "❌ No se detectó servidor en puerto 3002"
    echo "🚀 Iniciando servidor..."
fi

# 2. Limpiar puerto si hay procesos zombie
echo "🧹 Limpiando puerto 3002..."
lsof -ti :3002 | xargs kill -9 2>/dev/null
sleep 2

# 3. Iniciar servidor con configuración optimizada
echo "🚀 Iniciando servidor VPD con configuración estable..."
npm run start-dynamic &

# 4. Esperar que arranque
echo "⏳ Esperando que el servidor arranque..."
sleep 10

# 5. Verificación final
for i in {1..12}; do
    HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002 2>/dev/null)
    
    if [[ "$HTTP_RESPONSE" == "200" ]]; then
        echo "✅ ¡Servidor VPD listo y funcionando!"
        echo "🌐 App disponible en: http://localhost:3002"
        echo "🔥 Hot reload activado - cambios se aplicarán automáticamente"
        exit 0
    fi
    
    echo "⏳ Intentando conectar... ($i/12)"
    sleep 5
done

echo "❌ Error: No se pudo iniciar el servidor después de 60 segundos"
echo "🔧 Verifica manualmente con: npm run start-dynamic"
exit 1