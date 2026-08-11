import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const usersCollection = collection(db, "usuarios");

async function loadUsers() {
    const tableBody = document.getElementById("users-table-body");
    if (!tableBody) return;

    tableBody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-slate-500">Cargando usuarios...</td></tr>`;

    try {
        const querySnapshot = await getDocs(usersCollection);
        tableBody.innerHTML = "";

        if (querySnapshot.empty) {
            tableBody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-slate-500">No hay usuarios registrados.</td></tr>`;
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const row = document.createElement("tr");

            row.innerHTML = `
                <td class="p-3 font-semibold text-slate-900 dark:text-white">${data.nombre}</td>
                <td class="p-3 text-slate-600 dark:text-slate-300">${data.email}</td>
                <td class="p-3"><span class="px-2.5 py-1 bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300 rounded-full text-xs font-semibold">${data.rol}</span></td>
                <td class="p-3"><span class="px-2.5 py-1 ${data.estado === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'} rounded-full text-xs font-semibold">${data.estado}</span></td>
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
                if (confirm("¿Eliminar usuario?")) {
                    await deleteDoc(doc(db, "usuarios", id));
                    loadUsers();
                }
            });
        });

        document.querySelectorAll(".btn-edit").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.getAttribute("data-id");
                const docSnap = await getDoc(doc(db, "usuarios", id));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    document.getElementById("user-id").value = id;
                    document.getElementById("user-name").value = data.nombre;
                    document.getElementById("user-email").value = data.email;
                    document.getElementById("user-role").value = data.rol;
                    document.getElementById("user-status").value = data.estado;
                    document.getElementById("modal-user-title").textContent = "Editar Usuario";
                    document.getElementById("modal-user").classList.remove("hidden");
                }
            });
        });

    } catch (error) {
        console.error("Error al cargar usuarios:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal-user");
    const openBtn = document.getElementById("btn-open-user-modal");
    const form = document.getElementById("form-user");

    if (openBtn) {
        openBtn.addEventListener("click", () => {
            form.reset();
            document.getElementById("user-id").value = "";
            document.getElementById("modal-user-title").textContent = "Nuevo Usuario";
            modal.classList.remove("hidden");
        });
    }

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = document.getElementById("user-id").value;

            const userData = {
                nombre: document.getElementById("user-name").value,
                email: document.getElementById("user-email").value,
                rol: document.getElementById("user-role").value,
                estado: document.getElementById("user-status").value,
            };

            if (id) {
                await updateDoc(doc(db, "usuarios", id), userData);
            } else {
                await addDoc(usersCollection, userData);
            }

            form.reset();
            modal.classList.add("hidden");
            loadUsers();
        });
    }

    loadUsers();
});