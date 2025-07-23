#!/bin/bash

# Script para iniciar desarrollo con hot reload mejorado
echo "🚀 Iniciando VPD Analysis App con hot reload mejorado..."

# Limpiar puerto si está ocupado
lsof -ti :3002 | xargs kill -9 2>/dev/null

# Variables de entorno para hot reload estable
export FAST_REFRESH=true
export GENERATE_SOURCEMAP=false
export ESLINT_NO_DEV_ERRORS=true
export TSC_COMPILE_ON_ERROR=true
export DISABLE_ESLINT_PLUGIN=true
export PORT=3002
export BROWSER=none
export WDS_SOCKET_PORT=0

# Iniciar con configuración optimizada
npm start