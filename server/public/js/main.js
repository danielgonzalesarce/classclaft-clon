document.getElementById('btn-registro').addEventListener('click', () => {
    document.getElementById('clickSound').play();
});

const avatar = document.getElementById('avatar');
avatar.onmouseenter = () => avatar.src = "/img/avatar1-animado.gif";
avatar.onmouseleave = () => avatar.src = "/img/avatar1.png";

const rol = document.getElementById('rol');
const codigo = document.getElementById('codigoClase');
const form = document.getElementById('registroForm');
const pass = document.getElementById('contraseña');
const confirmar = document.getElementById('confirmar');
const mensajeError = document.getElementById('mensaje-error');

// Mostrar u ocultar campo de código según el rol
rol.addEventListener('change', function () {
    codigo.style.display = this.value === 'alumno' ? 'inline-block' : 'none';
});

form.addEventListener('submit', async function (e) {
    e.preventDefault();
    mensajeError.style.display = "none";

    const nombre = form.nombre.value.trim();
    const correo = form.correo.value.trim();
    const contraseña = pass.value.trim();
    const confirmarContraseña = confirmar.value.trim();
    const rolSeleccionado = rol.value;
    const codigoClase = codigo.value.trim();

    // Validaciones básicas
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
        // Verificar código de clase si es alumno
        if (rolSeleccionado === 'alumno') {
            const respuesta = await fetch('/verificar-codigo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codigo: codigoClase })
            });

            const datos = await respuesta.json();
            if (!datos.valido) {
                mensajeError.textContent = "El código de clase no es válido.";
                mensajeError.style.display = "block";
                return;
            }
        }

        // Enviar datos al backend
        const registro = await fetch('/registro', {
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

        const resultado = await registro.json();

        if (registro.ok) {
            if (rolSeleccionado === 'profesor') {
                window.location.href = "/profesor.html";
            } else {
                window.location.href = "/escoge_personaje.html";
            }
        } else {
            mensajeError.textContent = resultado.mensaje || "Error en el registro.";
            mensajeError.style.display = "block";
        }
    } catch (error) {
        console.error("❌ Error de red o servidor:", error);
        mensajeError.textContent = "No se pudo conectar con el servidor.";
        mensajeError.style.display = "block";
    }
});
