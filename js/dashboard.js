// js/dashboard.js
import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

async function initDashboard() {
    try {
        // 1. Obtener Clientes
        const clientsSnap = await getDocs(collection(db, "clientes"));
        const clientCountEl = document.getElementById("kpi-clients");
        if (clientCountEl) clientCountEl.textContent = clientsSnap.size;

        // 2. Obtener Oportunidades y Calcular Ingresos
        const dealsSnap = await getDocs(collection(db, "ventas"));
        let totalRevenue = 0;
        
        dealsSnap.forEach(docSnap => {
            const data = docSnap.data();
            totalRevenue += Number(data.monto || 0);
        });

        const dealsCountEl = document.getElementById("kpi-deals");
        const revenueTotalEl = document.getElementById("kpi-revenue");

        if (dealsCountEl) dealsCountEl.textContent = dealsSnap.size;
        if (revenueTotalEl) revenueTotalEl.textContent = `$${totalRevenue.toLocaleString()} MXN`;

        // 3. Renderizar Gráfica de Barras con Chart.js
        renderBarChart(totalRevenue);

    } catch (error) {
        console.error("Error al cargar datos en el Dashboard:", error);
    }
}

function renderBarChart(currentRevenue) {
    const canvas = document.getElementById('dashboardBarChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Mes Actual'],
            datasets: [{
                label: 'Ventas ($ MXN)',
                data: [15000, 22000, 18000, 31000, 29000, 42000, currentRevenue],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.5)',
                    'rgba(59, 130, 246, 0.5)',
                    'rgba(59, 130, 246, 0.5)',
                    'rgba(59, 130, 246, 0.5)',
                    'rgba(59, 130, 246, 0.5)',
                    'rgba(59, 130, 246, 0.5)',
                    'rgba(37, 99, 235, 0.9)'
                ],
                borderColor: '#2563eb',
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", initDashboard);