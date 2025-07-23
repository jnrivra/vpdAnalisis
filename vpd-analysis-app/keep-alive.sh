#!/bin/bash

# Script para mantener la aplicación corriendo con auto-restart
echo "🔄 Iniciando VPD App con auto-restart..."

# Función para verificar si el puerto está activo
check_port() {
    lsof -i :3002 &>/dev/null
    return $?
}

# Función para iniciar la aplicación
start_app() {
    echo "📱 Iniciando aplicación en puerto 3002..."
    export FAST_REFRESH=true
    export GENERATE_SOURCEMAP=false
    export ESLINT_NO_DEV_ERRORS=true
    export TSC_COMPILE_ON_ERROR=true
    export DISABLE_ESLINT_PLUGIN=true
    export PORT=3002
    export BROWSER=none
    export WDS_SOCKET_PORT=0
    
    npm start &
    APP_PID=$!
    echo "🚀 Aplicación iniciada con PID: $APP_PID"
}

# Limpiar procesos existentes
echo "🧹 Limpiando procesos existentes..."
lsof -ti :3002 | xargs kill -9 2>/dev/null
sleep 2

# Iniciar aplicación
start_app

# Loop de monitoreo
while true; do
    sleep 10
    
    if ! check_port; then
        echo "⚠️  Aplicación caída, reiniciando..."
        
        # Matar proceso anterior si existe
        if [ ! -z "$APP_PID" ]; then
            kill -9 $APP_PID 2>/dev/null
        fi
        
        # Limpiar puerto
        lsof -ti :3002 | xargs kill -9 2>/dev/null
        sleep 3
        
        # Reiniciar
        start_app
    else
        echo "✅ Aplicación corriendo correctamente en puerto 3002"
    fi
done