import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const productsCollection = collection(db, "productos");

async function loadProducts() {
    const grid = document.getElementById("products-grid");
    if (!grid) return;

    grid.innerHTML = `<p class="text-slate-500 col-span-3">Cargando catálogo...</p>`;

    try {
        const querySnapshot = await getDocs(productsCollection);
        grid.innerHTML = "";

        if (querySnapshot.empty) {
            grid.innerHTML = `<p class="text-slate-500 col-span-3">No hay productos registrados.</p>`;
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const card = document.createElement("div");
            card.className = "bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm flex flex-col justify-between";

            card.innerHTML = `
                <div>
                    <span class="text-xs font-semibold text-violet-600 bg-violet-50 dark:bg-violet-900/30 dark:text-violet-300 px-2 py-0.5 rounded-full">${data.categoria || 'General'}</span>
                    <h3 class="text-lg font-bold text-slate-900 dark:text-white mt-2">${data.nombre}</h3>
                    <p class="text-xs text-slate-500 mb-2">SKU: ${data.sku || 'N/A'}</p>
                    <p class="text-sm text-slate-600 dark:text-slate-300">${data.descripcion || ''}</p>
                </div>
                <div class="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <span class="text-xl font-bold text-slate-900 dark:text-white">$${Number(data.precio || 0).toLocaleString()} MXN</span>
                    <div class="space-x-1">
                        <button class="p-1 text-slate-500 hover:text-violet-600 btn-edit" data-id="${docSnap.id}"><span class="material-symbols-outlined text-base">edit</span></button>
                        <button class="p-1 text-slate-500 hover:text-red-600 btn-delete" data-id="${docSnap.id}"><span class="material-symbols-outlined text-base">delete</span></button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        // Eventos Eliminar
        document.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.getAttribute("data-id");
                if (confirm("¿Eliminar producto?")) {
                    await deleteDoc(doc(db, "productos", id));
                    loadProducts();
                }
            });
        });

        // Eventos Editar
        document.querySelectorAll(".btn-edit").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.getAttribute("data-id");
                const docSnap = await getDoc(doc(db, "productos", id));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    document.getElementById("product-id").value = id;
                    document.getElementById("product-name").value = data.nombre;
                    document.getElementById("product-sku").value = data.sku;
                    document.getElementById("product-category").value = data.categoria;
                    document.getElementById("product-price").value = data.precio;
                    document.getElementById("product-desc").value = data.descripcion || '';
                    document.getElementById("modal-product-title").textContent = "Editar Producto";
                    document.getElementById("modal-product").classList.remove("hidden");
                }
            });
        });

    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal-product");
    const openBtn = document.getElementById("btn-open-product-modal");
    const form = document.getElementById("form-product");

    if (openBtn) {
        openBtn.addEventListener("click", () => {
            form.reset();
            document.getElementById("product-id").value = "";
            document.getElementById("modal-product-title").textContent = "Agregar Producto";
            modal.classList.remove("hidden");
        });
    }

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = document.getElementById("product-id").value;

            const productData = {
                nombre: document.getElementById("product-name").value,
                sku: document.getElementById("product-sku").value,
                categoria: document.getElementById("product-category").value,
                precio: parseFloat(document.getElementById("product-price").value),
                descripcion: document.getElementById("product-desc").value,
            };

            if (id) {
                await updateDoc(doc(db, "productos", id), productData);
            } else {
                await addDoc(productsCollection, productData);
            }

            form.reset();
            modal.classList.add("hidden");
            loadProducts();
        });
    }

    loadProducts();
});