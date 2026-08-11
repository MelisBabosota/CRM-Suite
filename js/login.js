import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("form-login");
    const errorBox = document.getElementById("auth-error");
    const submitBtn = document.getElementById("btn-submit-login");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;

            errorBox.classList.add("hidden");
            submitBtn.disabled = true;
            submitBtn.textContent = "Ingresando...";

            try {
                await signInWithEmailAndPassword(auth, email, password);
                // Redirección exitosa a la carpeta pages
                window.location.href = "pages/dashboard.html";
            } catch (error) {
                console.error("Error al iniciar sesión:", error);
                errorBox.classList.remove("hidden");
                
                switch (error.code) {
                    case "auth/invalid-credential":
                    case "auth/user-not-found":
                    case "auth/wrong-password":
                        errorBox.textContent = "Correo o contraseña incorrectos.";
                        break;
                    case "auth/too-many-requests":
                        errorBox.textContent = "Demasiados intentos fallidos. Intenta más tarde.";
                        break;
                    default:
                        errorBox.textContent = "Error de autenticación: " + error.message;
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "Iniciar Sesión";
            }
        });
    }
});