// ✅ profesor.js actualizado

// Mostrar secciones
function mostrarSeccion(id) {
    document.querySelectorAll('.seccion').forEach(sec => {
        sec.classList.remove('activa');
    });

    const seccionActiva = document.getElementById(id);
    if (seccionActiva) {
        seccionActiva.classList.add('activa');
    } else {
        console.warn(`⚠️ No se encontró la sección con id: ${id}`);
    }
}

// Cargar nombre e icono del profesor
window.addEventListener('DOMContentLoaded', () => {
    const profesor = JSON.parse(localStorage.getItem('profesor'));
    if (!profesor) {
        alert("⚠️ No hay sesión activa. Redirigiendo al login...");
        window.location.href = "/html/profesor/login.html";
        return;
    }

    document.getElementById('nombre-profesor').textContent = profesor.nombre;
    document.getElementById('icono-perfil').src = profesor.foto;

    // Mostrar por defecto la sección de inicio
    mostrarSeccion('inicio');

    // Cargar alumnos para calificar
    cargarAlumnosEnSelect();
});

// Crear clase
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

// Subir Excel
const formExcel = document.getElementById('form-estudiantes');
if (formExcel) {
    formExcel.addEventListener('submit', function (e) {
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

// Llamar alumno aleatorio
function llamarAlumno() {
    fetch('/profesor/alumnos')
        .then(res => res.json())
        .then(data => {
            if (data.length === 0) return alert('No hay alumnos');
            const random = data[Math.floor(Math.random() * data.length)];
            document.getElementById('resultado-alumno').textContent = `🎯 ${random.nombre}`;
        });
}

// Calificar alumno
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

// Cargar alumnos en select
function cargarAlumnosEnSelect() {
    fetch('/profesor/alumnos')
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById('selectAlumno');
            if (!select) return;
            select.innerHTML = ''; // Limpiar antes
            data.forEach(a => {
                const opt = document.createElement('option');
                opt.value = a.id;
                opt.textContent = a.nombre;
                select.appendChild(opt);
            });
        });
}
