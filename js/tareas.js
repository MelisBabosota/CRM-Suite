import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const tasksCollection = collection(db, "tareas");

async function loadTasks() {
    const pContainer = document.getElementById("tasks-pending");
    const ipContainer = document.getElementById("tasks-in-progress");
    const cContainer = document.getElementById("tasks-completed");

    if (!pContainer) return;

    pContainer.innerHTML = ipContainer.innerHTML = cContainer.innerHTML = "";

    try {
        const querySnapshot = await getDocs(tasksCollection);

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const card = document.createElement("div");
            card.className = "bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm space-y-2";

            card.innerHTML = `
                <div class="flex justify-between items-start">
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${data.prioridad === 'Alta' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}">${data.prioridad || 'Media'}</span>
                    <div class="space-x-1">
                        <button class="p-1 text-slate-400 hover:text-violet-600 btn-edit" data-id="${docSnap.id}"><span class="material-symbols-outlined text-xs">edit</span></button>
                        <button class="p-1 text-slate-400 hover:text-red-600 btn-delete" data-id="${docSnap.id}"><span class="material-symbols-outlined text-xs">delete</span></button>
                    </div>
                </div>
                <h4 class="font-bold text-sm text-slate-900 dark:text-white">${data.titulo}</h4>
                <p class="text-xs text-slate-500 dark:text-slate-300">${data.cliente}</p>
            `;

            if (data.estado === 'En Proceso') ipContainer.appendChild(card);
            else if (data.estado === 'Completada') cContainer.appendChild(card);
            else pContainer.appendChild(card);
        });

        document.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.getAttribute("data-id");
                if (confirm("¿Eliminar tarea?")) {
                    await deleteDoc(doc(db, "tareas", id));
                    loadTasks();
                }
            });
        });

        document.querySelectorAll(".btn-edit").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.getAttribute("data-id");
                const docSnap = await getDoc(doc(db, "tareas", id));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    document.getElementById("task-id").value = id;
                    document.getElementById("task-title").value = data.titulo;
                    document.getElementById("task-client").value = data.cliente;
                    document.getElementById("task-status").value = data.estado;
                    document.getElementById("task-priority").value = data.prioridad;
                    document.getElementById("modal-task-title").textContent = "Editar Tarea";
                    document.getElementById("modal-task").classList.remove("hidden");
                }
            });
        });

    } catch (error) {
        console.error("Error al cargar tareas:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal-task");
    const openBtn = document.getElementById("btn-open-task-modal");
    const form = document.getElementById("form-task");

    if (openBtn) {
        openBtn.addEventListener("click", () => {
            form.reset();
            document.getElementById("task-id").value = "";
            document.getElementById("modal-task-title").textContent = "Nueva Tarea";
            modal.classList.remove("hidden");
        });
    }

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = document.getElementById("task-id").value;

            const taskData = {
                titulo: document.getElementById("task-title").value,
                cliente: document.getElementById("task-client").value,
                estado: document.getElementById("task-status").value,
                prioridad: document.getElementById("task-priority").value,
            };

            if (id) {
                await updateDoc(doc(db, "tareas", id), taskData);
            } else {
                await addDoc(tasksCollection, taskData);
            }

            form.reset();
            modal.classList.add("hidden");
            loadTasks();
        });
    }

    loadTasks();
});