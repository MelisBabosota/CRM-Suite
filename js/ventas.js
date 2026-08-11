import { db } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc, 
    doc, 
    updateDoc, 
    getDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const dealsCollection = collection(db, "ventas");

// 1. Cargar oportunidades desde Firestore
async function loadDeals() {
    const tableBody = document.getElementById("deals-table-body");
    if (!tableBody) return;

    tableBody.innerHTML = `<tr><td colspan="6" class="p-3 text-center text-slate-500">Cargando datos...</td></tr>`;

    try {
        const querySnapshot = await getDocs(dealsCollection);
        tableBody.innerHTML = "";

        if (querySnapshot.empty) {
            tableBody.innerHTML = `<tr><td colspan="6" class="p-3 text-center text-slate-500">No hay oportunidades registradas.</td></tr>`;
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const row = document.createElement("tr");

            row.innerHTML = `
                <td class="p-3 font-semibold text-slate-900 dark:text-white">${data.nombre || ''}</td>
                <td class="p-3 text-slate-600 dark:text-slate-300">${data.cliente || ''}</td>
                <td class="p-3"><span class="px-2.5 py-1 bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300 rounded-full text-xs font-semibold">${data.etapa || 'Propuesta'}</span></td>
                <td class="p-3 text-right font-medium text-slate-900 dark:text-white">$${Number(data.monto || 0).toLocaleString()} MXN</td>
                <td class="p-3 text-slate-600 dark:text-slate-300">${data.fechaCierre || ''}</td>
                <td class="p-3 text-right space-x-1">
                    <button class="p-1 text-slate-500 hover:text-violet-600 btn-edit" data-id="${docSnap.id}" title="Editar">
                        <span class="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button class="p-1 text-slate-500 hover:text-red-600 btn-delete" data-id="${docSnap.id}" title="Eliminar">
                        <span class="material-symbols-outlined text-base">delete</span>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Eventos Eliminar
        document.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.getAttribute("data-id");
                if (confirm("¿Deseas eliminar esta oportunidad?")) {
                    await deleteDoc(doc(db, "ventas", id));
                    loadDeals();
                }
            });
        });

        // Eventos Editar
        document.querySelectorAll(".btn-edit").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.getAttribute("data-id");
                const docSnap = await getDoc(doc(db, "ventas", id));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    document.getElementById("deal-id").value = id;
                    document.getElementById("deal-name").value = data.nombre || "";
                    document.getElementById("deal-client").value = data.cliente || "";
                    document.getElementById("deal-stage").value = data.etapa || "Propuesta";
                    document.getElementById("deal-amount").value = data.monto || "";
                    document.getElementById("deal-date").value = data.fechaCierre || "";
                    document.getElementById("modal-deal-title").textContent = "Editar Oportunidad";
                    document.getElementById("modal-deal").classList.remove("hidden");
                }
            });
        });

    } catch (error) {
        console.error("Error al cargar oportunidades:", error);
        tableBody.innerHTML = `<tr><td colspan="6" class="p-3 text-center text-red-500">Error al cargar datos.</td></tr>`;
    }
}

// 2. Controladores de eventos
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal-deal");
    const openBtn = document.getElementById("btn-open-deal-modal");
    const form = document.getElementById("form-deal");

    if (openBtn) {
        openBtn.addEventListener("click", () => {
            form.reset();
            document.getElementById("deal-id").value = "";
            document.getElementById("modal-deal-title").textContent = "Agregar Nueva Oportunidad";
            modal.classList.remove("hidden");
        });
    }

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const id = document.getElementById("deal-id").value;
            const dealData = {
                nombre: document.getElementById("deal-name").value,
                cliente: document.getElementById("deal-client").value,
                etapa: document.getElementById("deal-stage").value,
                monto: parseFloat(document.getElementById("deal-amount").value),
                fechaCierre: document.getElementById("deal-date").value,
                updatedAt: new Date()
            };

            try {
                if (id) {
                    await updateDoc(doc(db, "ventas", id), dealData);
                } else {
                    dealData.createdAt = new Date();
                    await addDoc(dealsCollection, dealData);
                }

                form.reset();
                modal.classList.add("hidden");
                loadDeals();
            } catch (error) {
                console.error("Error al guardar oportunidad:", error);
                alert("Ocurrió un error al guardar la oportunidad.");
            }
        });
    }

    loadDeals();
});