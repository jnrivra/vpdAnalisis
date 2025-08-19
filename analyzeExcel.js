const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Cargar el archivo Excel
const workbook = XLSX.readFile(path.join(__dirname, 'public', 'dataSemanal.xlsx'));

// Analizar estructura de cada hoja
console.log('📊 ANÁLISIS DETALLADO DEL ARCHIVO EXCEL\n');
console.log('Hojas disponibles:', workbook.SheetNames);
console.log('\n' + '='.repeat(80) + '\n');

workbook.SheetNames.forEach(sheetName => {
    console.log(`\n📁 HOJA: ${sheetName}`);
    console.log('-'.repeat(40));
    
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    if (data.length > 0) {
        // Mostrar columnas disponibles
        const columns = Object.keys(data[0]);
        console.log(`Columnas (${columns.length}):`, columns);
        
        // Analizar fechas
        const times = data.map(row => row.Time);
        const validTimes = times.filter(t => t !== undefined);
        
        if (validTimes.length > 0) {
            // Convertir tiempo Excel a fecha
            const firstDate = XLSX.SSF.parse_date_code(validTimes[0]);
            const lastDate = XLSX.SSF.parse_date_code(validTimes[validTimes.length - 1]);
            
            console.log(`\n📅 Rango de fechas:`);
            console.log(`  Primera: ${new Date(firstDate.y, firstDate.m - 1, firstDate.d, firstDate.H, firstDate.M, firstDate.S)}`);
            console.log(`  Última: ${new Date(lastDate.y, lastDate.m - 1, lastDate.d, lastDate.H, lastDate.M, lastDate.S)}`);
        }
        
        // Detectar sensores
        const sensorColumns = columns.filter(col => col.includes('I1') || col.includes('I2') || col.includes('I3') || col.includes('I4') || col.includes('I5') || col.includes('I6'));
        const uniqueSensors = new Set();
        sensorColumns.forEach(col => {
            const match = col.match(/I\d/);
            if (match) uniqueSensors.add(match[0]);
        });
        
        console.log(`\n🔧 Sensores detectados: ${Array.from(uniqueSensors).join(', ')}`);
        console.log(`Total de registros: ${data.length.toLocaleString()}`);
        
        // Mostrar primeras filas como ejemplo
        console.log('\n📝 Ejemplo de primeras 2 filas:');
        data.slice(0, 2).forEach((row, idx) => {
            console.log(`\nFila ${idx + 1}:`);
            // Mostrar solo algunas columnas clave
            const keyColumns = ['Time', 'I1 Temperatura Promedio', 'I1 Humedad Promedio', 'I1 VPD', 'CO2 Promedio', 'Week Number'];
            keyColumns.forEach(col => {
                if (row[col] !== undefined) {
                    if (col === 'Time') {
                        const date = XLSX.SSF.parse_date_code(row[col]);
                        const jsDate = new Date(date.y, date.m - 1, date.d, date.H, date.M, date.S);
                        console.log(`  ${col}: ${jsDate.toISOString()}`);
                    } else {
                        console.log(`  ${col}: ${row[col]}`);
                    }
                }
            });
        });
        
        // Analizar estructura temporal
        if (data.length > 1) {
            const time1 = XLSX.SSF.parse_date_code(data[0].Time);
            const time2 = XLSX.SSF.parse_date_code(data[1].Time);
            const date1 = new Date(time1.y, time1.m - 1, time1.d, time1.H, time1.M, time1.S);
            const date2 = new Date(time2.y, time2.m - 1, time2.d, time2.H, time2.M, time2.S);
            const diffMinutes = (date2 - date1) / (1000 * 60);
            console.log(`\n⏱️ Intervalo de tiempo entre registros: ${diffMinutes} minutos`);
        }
    }
});

console.log('\n' + '='.repeat(80));
console.log('\n✅ Análisis completado\n');