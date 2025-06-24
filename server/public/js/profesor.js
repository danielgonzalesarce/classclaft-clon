// 👉 Mostrar secciones
function mostrarSeccion(id) {
    document.querySelectorAll('.seccion').forEach(sec => sec.classList.remove('activa'));
    document.getElementById(id).classList.add('activa');
}

// 🔊 Sonido general para botones
const sonidoClick = new Audio('/sounds/Menu_Selection_Click.mp3');
sonidoClick.volume = 0.5;
document.addEventListener('click', (e) => {
    const esBoton = e.target.closest('button');
    if (esBoton && !e.target.disabled) {
        sonidoClick.currentTime = 0;
        sonidoClick.play().catch(() => {});
    }
});

// 👉 Cargar nombre e icono del profesor desde localStorage
document.addEventListener('DOMContentLoaded', () => {
    const profesor = JSON.parse(localStorage.getItem('profesor'));
    if (!profesor) {
        alert("⚠️ No hay sesión activa. Redirigiendo al login...");
        window.location.href = "/html/login.html";
        return;
    }

    const nombreElemento = document.getElementById('nombre-profesor');
    const iconoElemento = document.getElementById('icono-perfil');

    const primerNombre = profesor.nombre.split(' ')[0];
    if (nombreElemento) nombreElemento.textContent = primerNombre;
    if (iconoElemento) iconoElemento.src = profesor.foto;

    const btnConfiguracion = document.getElementById('btn-configuracion');
    const menuConfig = document.getElementById('menu-config');
    if (btnConfiguracion && menuConfig) {
        btnConfiguracion.addEventListener('click', () => {
            menuConfig.classList.toggle('visible');
        });
    }
});

// 🔁 Cambiar de cuenta
function cambiarCuenta() {
    localStorage.removeItem('profesor');
    window.location.href = '/html/login.html';
}

// 🚪 Cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('profesor');
    alert('Sesión cerrada correctamente.');
    window.location.href = '/html/login.html';
}

// 🗑 Eliminar cuenta del profesor
function eliminarCuenta() {
    const confirmar = confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.");
    if (!confirmar) return;

    const profesor = JSON.parse(localStorage.getItem('profesor'));
    if (!profesor || !profesor.correo) {
        alert('No se encontró el correo del profesor.');
        return;
    }

    fetch('/profesor/eliminar', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: profesor.correo })
    })
    .then(res => res.json())
    .then(data => {
        if (data.mensaje) {
            alert(data.mensaje);
            localStorage.removeItem('profesor');
            window.location.href = '/html/login.html';
        } else {
            alert('No se pudo eliminar la cuenta.');
        }
    })
    .catch(err => {
        console.error(err);
        alert('Error al intentar eliminar la cuenta.');
    });
}

// 📚 Crear clase
const formClase = document.getElementById('form-clase');
if (formClase) {
    formClase.addEventListener('submit', async e => {
        e.preventDefault();
        const nombreClase = document.getElementById('nombreClase').value;

        const res = await fetch('/profesor/crear-clase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombreClase })
        });

        if (res.ok) {
            alert('✅ Clase creada');
            location.reload();
        } else {
            alert('❌ Error al crear clase');
        }
    });
}

// 📤 Subir Excel
const formExcel = document.getElementById('form-estudiantes');
if (formExcel) {
    formExcel.addEventListener('submit', function(e) {
        e.preventDefault();
        const archivo = document.getElementById('archivoExcel').files[0];
        if (!archivo) return alert('Selecciona un archivo Excel');

        const formData = new FormData();
        formData.append('excel', archivo);

        fetch('/profesor/cargar-excel', {
            method: 'POST',
            body: formData
        })
        .then(res => res.ok ? alert('✅ Alumnos cargados') : alert('❌ Error al subir'))
        .catch(err => alert('❌ Error: ' + err));
    });
}

// 🎲 Llamar alumno aleatorio
function llamarAlumno() {
    fetch('/profesor/alumnos')
        .then(res => res.json())
        .then(data => {
            if (data.length === 0) return alert('No hay alumnos');
            const random = data[Math.floor(Math.random() * data.length)];
            document.getElementById('resultado-alumno').textContent = `🎯 ${random.nombre}`;
        });
}

// ⭐ Calificar alumno
function calificar(tipo) {
    const id = document.getElementById('selectAlumno').value;
    if (!id) return alert('Selecciona un alumno');

    fetch(`/profesor/calificar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, tipo })
    })
    .then(res => res.ok ? alert('✅ Calificación enviada') : alert('❌ Error'));
}

// 🧠 Cargar alumnos en select al cargar la página
window.onload = () => {
    fetch('/profesor/alumnos')
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById('selectAlumno');
            if (!select) return;
            data.forEach(a => {
                const opt = document.createElement('option');
                opt.value = a.id;
                opt.textContent = a.nombre;
                select.appendChild(opt);
            });
        });
};
