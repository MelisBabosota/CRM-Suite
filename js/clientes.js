// js/clientes.js
import { db } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc, 
    doc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const clientsCollection = collection(db, "clientes");

// 1. Cargar clientes al iniciar
async function loadClients() {
    const tableBody = document.getElementById("clients-table-body");
    if (!tableBody) return;

    tableBody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-slate-500">Cargando datos de Firestore...</td></tr>`;

    try {
        const querySnapshot = await getDocs(clientsCollection);
        tableBody.innerHTML = "";

        if (querySnapshot.empty) {
            tableBody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-slate-500">No hay clientes registrados aún.</td></tr>`;
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const row = document.createElement("tr");

            row.innerHTML = `
                <td class="p-3 font-semibold">${data.nombre || ''}</td>
                <td class="p-3 text-slate-600">${data.taxid || ''}</td>
                <td class="p-3"><span class="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-semibold">${data.industria || ''}</span></td>
                <td class="p-3 text-blue-600 hover:underline"><a href="${data.website || '#'}" target="_blank">${data.website || ''}</a></td>
                <td class="p-3 text-right space-x-1">
                    <button class="p-1 text-slate-500 hover:text-red-600 btn-delete" data-id="${docSnap.id}" title="Eliminar">
                        <span class="material-symbols-outlined text-base">delete</span>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Eventos para eliminar
        document.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.getAttribute("data-id");
                if (confirm("¿Deseas eliminar este cliente de Firestore?")) {
                    await deleteDoc(doc(db, "clientes", id));
                    loadClients();
                }
            });
        });

    } catch (error) {
        console.error("Error detallado al cargar desde Firestore:", error);
        tableBody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-red-500">Error de conexión: Revisa la consola (F12)</td></tr>`;
    }
}

// 2. Control de eventos de formulario y modal
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal-client");
    const openBtn = document.getElementById("btn-open-client-modal");
    const closeBtn = document.getElementById("btn-close-client-modal");
    const form = document.getElementById("form-client");

    if (openBtn) openBtn.addEventListener("click", () => modal.classList.remove("hidden"));
    if (closeBtn) closeBtn.addEventListener("click", () => modal.classList.add("hidden"));

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = "Guardando...";

            const newClient = {
                nombre: document.getElementById("client-name").value,
                taxid: document.getElementById("client-taxid").value,
                industria: document.getElementById("client-industry").value,
                website: document.getElementById("client-website").value,
                createdAt: new Date()
            };

            try {
                console.log("Enviando cliente a Firestore...", newClient);
                await addDoc(clientsCollection, newClient);
                alert("¡Cliente guardado con éxito!");
                
                form.reset();
                modal.classList.add("hidden");
                loadClients();
            } catch (error) {
                console.error("Error al guardar en Firestore:", error);
                alert("Ocurrió un error al guardar. Revisa la consola (F12) para más detalles.");
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "Guardar";
            }
        });
    }

    loadClients();
});