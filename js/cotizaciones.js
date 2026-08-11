import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const quotesCollection = collection(db, "cotizaciones");

async function loadQuotes() {
    const tableBody = document.getElementById("quotes-table-body");
    if (!tableBody) return;

    tableBody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-slate-500">Cargando cotizaciones...</td></tr>`;

    try {
        const querySnapshot = await getDocs(quotesCollection);
        tableBody.innerHTML = "";

        if (querySnapshot.empty) {
            tableBody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-slate-500">No hay cotizaciones registradas.</td></tr>`;
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const row = document.createElement("tr");

            row.innerHTML = `
                <td class="p-3 font-semibold text-violet-600 dark:text-violet-400">${data.folio}</td>
                <td class="p-3 text-slate-600 dark:text-slate-300">${data.cliente}</td>
                <td class="p-3 text-right font-medium">$${Number(data.monto || 0).toLocaleString()}</td>
                <td class="p-3"><span class="px-2.5 py-1 bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300 rounded-full text-xs font-semibold">${data.estado}</span></td>
                <td class="p-3 text-right space-x-1">
                    <button class="p-1 text-slate-500 hover:text-violet-600 btn-edit" data-id="${docSnap.id}"><span class="material-symbols-outlined text-base">edit</span></button>
                    <button class="p-1 text-slate-500 hover:text-red-600 btn-delete" data-id="${docSnap.id}"><span class="material-symbols-outlined text-base">delete</span></button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        document.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.getAttribute("data-id");
                if (confirm("¿Eliminar cotización?")) {
                    await deleteDoc(doc(db, "cotizaciones", id));
                    loadQuotes();
                }
            });
        });

        document.querySelectorAll(".btn-edit").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.getAttribute("data-id");
                const docSnap = await getDoc(doc(db, "cotizaciones", id));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    document.getElementById("quote-id").value = id;
                    document.getElementById("quote-folio").value = data.folio;
                    document.getElementById("quote-client").value = data.cliente;
                    document.getElementById("quote-amount").value = data.monto;
                    document.getElementById("quote-status").value = data.estado;
                    document.getElementById("modal-quote-title").textContent = "Editar Cotización";
                    document.getElementById("modal-quote").classList.remove("hidden");
                }
            });
        });

    } catch (error) {
        console.error("Error al cargar cotizaciones:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal-quote");
    const openBtn = document.getElementById("btn-open-quote-modal");
    const form = document.getElementById("form-quote");

    if (openBtn) {
        openBtn.addEventListener("click", () => {
            form.reset();
            document.getElementById("quote-id").value = "";
            document.getElementById("modal-quote-title").textContent = "Crear Cotización";
            modal.classList.remove("hidden");
        });
    }

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = document.getElementById("quote-id").value;

            const quoteData = {
                folio: document.getElementById("quote-folio").value,
                cliente: document.getElementById("quote-client").value,
                monto: parseFloat(document.getElementById("quote-amount").value),
                estado: document.getElementById("quote-status").value,
            };

            if (id) {
                await updateDoc(doc(db, "cotizaciones", id), quoteData);
            } else {
                await addDoc(quotesCollection, quoteData);
            }

            form.reset();
            modal.classList.add("hidden");
            loadQuotes();
        });
    }

    loadQuotes();
});