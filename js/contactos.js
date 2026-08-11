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

const contactsCollection = collection(db, "contactos");

// 1. Cargar contactos desde Firestore
async function loadContacts() {
    const tableBody = document.getElementById("contacts-table-body");
    if (!tableBody) return;

    tableBody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-slate-500">Cargando datos...</td></tr>`;

    try {
        const querySnapshot = await getDocs(contactsCollection);
        tableBody.innerHTML = "";

        if (querySnapshot.empty) {
            tableBody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-slate-500">No hay contactos registrados.</td></tr>`;
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const row = document.createElement("tr");

            row.innerHTML = `
                <td class="p-3 font-semibold text-slate-900 dark:text-white">${data.nombre || ''}</td>
                <td class="p-3 text-slate-600 dark:text-slate-300">${data.empresa || ''}</td>
                <td class="p-3 text-slate-600 dark:text-slate-300">${data.cargo || ''}</td>
                <td class="p-3 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    <div>📧 ${data.email || ''}</div>
                    <div>📞 ${data.telefono || ''}</div>
                </td>
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
                if (confirm("¿Deseas eliminar este contacto?")) {
                    await deleteDoc(doc(db, "contactos", id));
                    loadContacts();
                }
            });
        });

        // Eventos Editar
        document.querySelectorAll(".btn-edit").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.getAttribute("data-id");
                const docSnap = await getDoc(doc(db, "contactos", id));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    document.getElementById("contact-id").value = id;
                    document.getElementById("contact-name").value = data.nombre || "";
                    document.getElementById("contact-company").value = data.empresa || "";
                    document.getElementById("contact-role").value = data.cargo || "";
                    document.getElementById("contact-email").value = data.email || "";
                    document.getElementById("contact-phone").value = data.telefono || "";
                    document.getElementById("modal-contact-title").textContent = "Editar Contacto";
                    document.getElementById("modal-contact").classList.remove("hidden");
                }
            });
        });

    } catch (error) {
        console.error("Error al cargar contactos:", error);
        tableBody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-red-500">Error al cargar datos.</td></tr>`;
    }
}

// 2. Controladores de eventos
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal-contact");
    const openBtn = document.getElementById("btn-open-contact-modal");
    const form = document.getElementById("form-contact");

    if (openBtn) {
        openBtn.addEventListener("click", () => {
            form.reset();
            document.getElementById("contact-id").value = "";
            document.getElementById("modal-contact-title").textContent = "Agregar Nuevo Contacto";
            modal.classList.remove("hidden");
        });
    }

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const id = document.getElementById("contact-id").value;
            const contactData = {
                nombre: document.getElementById("contact-name").value,
                empresa: document.getElementById("contact-company").value,
                cargo: document.getElementById("contact-role").value,
                email: document.getElementById("contact-email").value,
                telefono: document.getElementById("contact-phone").value,
                updatedAt: new Date()
            };

            try {
                if (id) {
                    await updateDoc(doc(db, "contactos", id), contactData);
                } else {
                    contactData.createdAt = new Date();
                    await addDoc(contactsCollection, contactData);
                }

                form.reset();
                modal.classList.add("hidden");
                loadContacts();
            } catch (error) {
                console.error("Error al guardar contacto:", error);
                alert("Ocurrió un error al guardar el contacto.");
            }
        });
    }

    loadContacts();
});