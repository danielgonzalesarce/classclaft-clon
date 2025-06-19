document.addEventListener('DOMContentLoaded', () => {
    const avatar = document.getElementById('avatar');
    const rol = document.getElementById('rol');
    const codigoContainer = document.getElementById('codigoClaseContainer');
    const codigo = document.getElementById('codigoClase');
    const form = document.getElementById('registroForm');
    const pass = document.getElementById('contraseña');
    const confirmar = document.getElementById('confirmar');
    const mensajeError = document.getElementById('mensaje-error');
    const clickSound = document.getElementById('clickSound');

    // Sonido al hacer clic en registrarse
    document.getElementById('btn-registro').addEventListener('click', () => {
        clickSound.play();
    });

    // Animación del avatar
    avatar.onmouseenter = () => avatar.src = "/img/avatar1-animado.gif";
    avatar.onmouseleave = () => avatar.src = "/img/logoSolo.png";

    // Mostrar u ocultar campo de código según el rol
    rol.addEventListener('change', function () {
        if (this.value === 'alumno') {
            codigoContainer.style.display = 'block';
        } else {
            codigoContainer.style.display = 'none';
        }
    });

    // Envío del formulario
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        mensajeError.style.display = "none";

        const nombre = form.nombre.value.trim();
        const correo = form.correo.value.trim();
        const contraseña = pass.value.trim();
        const confirmarContraseña = confirmar.value.trim();
        const rolSeleccionado = rol.value;
        const codigoClase = codigo.value.trim();

        if (!nombre || !correo || !contraseña || !confirmarContraseña) {
            mensajeError.textContent = "Todos los campos son obligatorios.";
            mensajeError.style.display = "block";
            return;
        }

        if (contraseña !== confirmarContraseña) {
            mensajeError.textContent = "Las contraseñas no coinciden.";
            mensajeError.style.display = "block";
            return;
        }

        try {
            // Validación de código de clase si es alumno
            if (rolSeleccionado === 'alumno') {
                const verificar = await fetch('/verificar-codigo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ codigo: codigoClase })
                });

                const resultado = await verificar.json();
                if (!resultado.valido) {
                    mensajeError.textContent = "El código de clase no es válido.";
                    mensajeError.style.display = "block";
                    return;
                }
            }

            // Registro del usuario
            const response = await fetch('/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre,
                    correo,
                    contraseña,
                    rol: rolSeleccionado,
                    codigoClase: rolSeleccionado === 'alumno' ? codigoClase : null
                })
            });

            const data = await response.json();

            if (response.ok) {
                if (rolSeleccionado === 'profesor') {
                    window.location.href = "/html/interfas/profesor/profesor.html";
                } else {
                    window.location.href = "/html/escoge_personaje.html";
                }
            } else {
                mensajeError.textContent = data.mensaje || "Error en el registro.";
                mensajeError.style.display = "block";
            }
        } catch (err) {
            console.error("Error de red:", err);
            mensajeError.textContent = "No se pudo conectar con el servidor.";
            mensajeError.style.display = "block";
        }
    });
});
