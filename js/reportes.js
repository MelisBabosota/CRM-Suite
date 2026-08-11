// js/reportes.js
import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

async function initReports() {
    try {
        const dealsSnap = await getDocs(collection(db, "ventas"));
        let totalAmount = 0;
        let count = dealsSnap.size;

        const stages = { Prospecto: 0, Propuesta: 0, Negociación: 0, Ganada: 0, Perdida: 0 };

        dealsSnap.forEach(docSnap => {
            const data = docSnap.data();
            const monto = Number(data.monto || 0);
            totalAmount += monto;

            if (data.etapa && stages[data.etapa] !== undefined) {
                stages[data.etapa]++;
            } else {
                stages.Propuesta++;
            }
        });

        // Ticket promedio
        const avgTicket = count > 0 ? totalAmount / count : 0;
        const avgEl = document.getElementById("rep-avg-ticket");
        if (avgEl) avgEl.textContent = `$${Math.round(avgTicket).toLocaleString()} MXN`;

        // Renderizar Gráficas
        renderRevenueChart(totalAmount);
        renderStageChart(stages);

    } catch (error) {
        console.error("Error al cargar reportes:", error);
    }
}

function renderRevenueChart(total) {
    const ctx = document.getElementById('chartRevenueTrend');
    if (!ctx) return;

    new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago'],
            datasets: [{
                label: 'Ingresos ($ MXN)',
                data: [12000, 19000, 15000, 28000, 32000, 45000, 40000, total],
                borderColor: '#7c3aed',
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#6d28d9',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(148, 163, 184, 0.1)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function renderStageChart(stages) {
    const ctx = document.getElementById('chartStageDistribution');
    if (!ctx) return;

    new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(stages),
            datasets: [{
                data: Object.values(stages),
                backgroundColor: [
                    '#c4b5fd', // Prospecto (violeta claro)
                    '#a78bfa', // Propuesta
                    '#8b5cf6', // Negociación
                    '#6d28d9', // Ganada (violeta oscuro)
                    '#ef4444'  // Perdida (rojo suave)
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", initReports);