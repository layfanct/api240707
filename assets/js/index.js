let chart;

document.addEventListener('DOMContentLoaded', async () => {
    const selectMoneda = document.getElementById('moneda');

    try {
        const response = await fetch('https://mindicador.cl/api');
        const data = await response.json();

        const monedas = ['dolar', 'euro'];
        
        monedas.forEach(moneda => {
            if (data[moneda]) {
                const option = document.createElement('option');
                option.value = moneda;
                option.textContent = data[moneda].nombre;
                selectMoneda.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Error al obtener las monedas:', error);
    }
});

document.getElementById('convertir').addEventListener('click', convertirMoneda);

async function convertirMoneda() {
    const monto = document.getElementById('monto').value;
    const moneda = document.getElementById('moneda').value;
    const resultadoDiv = document.getElementById('resultado');
    const ctx = document.getElementById('historial').getContext('2d');

    if (!monto || monto <= 0) {
        resultadoDiv.textContent = 'Por favor, ingresa un monto válido';
        return;
    }

    try {
        const response = await fetch('https://mindicador.cl/api');
        const data = await response.json();

        const valorMoneda = data[moneda].valor;
        const resultado = monto / valorMoneda;
        resultadoDiv.textContent = `El monto en ${data[moneda].nombre} es ${resultado.toFixed(2)}`;

        const historialResponse = await fetch(`https://mindicador.cl/api/${moneda}`);
        const historialData = await historialResponse.json();
        const labels = historialData.serie.slice(0, 10).map(item => item.fecha.split('T')[0]).reverse();
        const valores = historialData.serie.slice(0, 10).map(item => item.valor).reverse();

        if (chart) {
            chart.destroy();
        }

        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `Historial de los últimos 10 días para ${data[moneda].nombre}`,
                    data: valores,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            }
        });
    } catch (error) {
        resultadoDiv.textContent = 'Error al obtener los datos. Inténtalo nuevamente más tarde.';
        console.error('Error:', error);
    }
}
