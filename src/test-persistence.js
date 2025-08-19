// Script para probar la persistencia de configuraciones
// Ejecutar desde la consola del navegador

const testPersistence = () => {
  console.log('\n===== Test de Persistencia de Configuraciones =====\n');
  
  // 1. Ver configuraciones actuales guardadas
  const stored = localStorage.getItem('vpd_island_configs');
  if (stored) {
    const configs = JSON.parse(stored);
    console.log('Configuraciones guardadas:', configs);
    
    // Mostrar por sector
    Object.keys(configs).forEach(sector => {
      console.log(`\nSector: ${sector}`);
      Object.keys(configs[sector]).forEach(island => {
        const config = configs[sector][island];
        console.log(`  ${island}: Tipo=${config.cropType}, Semana=${config.week}`);
      });
    });
  } else {
    console.log('No hay configuraciones guardadas');
  }
  
  // 2. Simular guardado de configuración
  console.log('\n--- Simulando guardado de configuración ---');
  const testConfig = {
    'Parcela 1': {
      'I1': { cropType: 'lechuga', week: 2 },
      'I2': { cropType: 'albahaca', week: 3 },
      'I3': { cropType: 'mixto', week: 1 }
    },
    'Parcela 2': {
      'I1': { cropType: 'albahaca', week: 1 },
      'I2': { cropType: 'lechuga', week: 2 },
      'I3': { cropType: 'mixto', week: 3 }
    }
  };
  
  // Guardar configuración de prueba
  // localStorage.setItem('vpd_island_configs', JSON.stringify(testConfig));
  // console.log('Configuración de prueba guardada (descomenta la línea anterior para guardar)');
  
  // 3. Verificar que persiste después de recargar
  console.log('\n--- Instrucciones para verificar persistencia ---');
  console.log('1. Modifica la configuración de una isla en la interfaz');
  console.log('2. Recarga la página (F5 o Cmd+R)');
  console.log('3. Verifica que la configuración se mantenga');
  console.log('4. Ejecuta testPersistence() nuevamente para ver los datos guardados');
  
  // 4. Función para limpiar todo
  window.clearAllConfigs = () => {
    localStorage.removeItem('vpd_island_configs');
    console.log('Todas las configuraciones han sido limpiadas');
    console.log('Recarga la página para ver los valores por defecto');
  };
  
  console.log('\nFunciones disponibles:');
  console.log('- testPersistence(): Ejecutar este test');
  console.log('- clearAllConfigs(): Limpiar todas las configuraciones');
};

// Hacer la función disponible globalmente
window.testPersistence = testPersistence;

// Ejecutar automáticamente al cargar
if (typeof window !== 'undefined') {
  console.log('Test de persistencia cargado. Ejecuta testPersistence() en la consola.');
}

export default testPersistence;