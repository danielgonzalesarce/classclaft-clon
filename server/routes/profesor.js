const express = require('express');
const router = express.Router();
const db = require('../models/db');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

// Configurar multer para guardar archivos Excel
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `excel-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

// 🔥 Cargar Excel
router.post('/profesor/cargar-excel', upload.single('excel'), (req, res) => {
    const filePath = req.file.path;

    try {
        const workbook = xlsx.readFile(filePath);
        const hoja = workbook.Sheets[workbook.SheetNames[0]];
        const datos = xlsx.utils.sheet_to_json(hoja);

        const estudiantes = datos.map(est => [
            est.nombre,
            est.correo,
            est.contrasena
        ]);

        const query = 'INSERT INTO estudiantes (nombre, correo, contrasena) VALUES ?';

        db.query(query, [estudiantes], (err, result) => {
            fs.unlinkSync(filePath); // Borrar archivo luego de procesar
            if (err) {
                console.error(err);
                return res.status(500).json({ mensaje: 'Error al guardar en BD.' });
            }
            res.json({ mensaje: 'Estudiantes cargados', cantidad: result.affectedRows });
        });
    } catch (error) {
        console.error('❌ Error al procesar el Excel:', error);
        res.status(500).json({ mensaje: 'Error al leer el archivo Excel.' });
    }
});

// Eliminar cuenta de profesor
router.delete('/profesor/eliminar', (req, res) => {
    const { correo } = req.body;
    if (!correo) return res.status(400).json({ mensaje: 'Correo es requerido.' });

    db.query('DELETE FROM profesores WHERE correo = ?', [correo], (err, result) => {
        if (err) return res.status(500).json({ mensaje: 'Error al eliminar cuenta.' });
        if (result.affectedRows > 0) {
            res.json({ mensaje: 'Cuenta eliminada correctamente.' });
        } else {
            res.status(404).json({ mensaje: 'No se encontró la cuenta.' });
        }
    });
});

// Crear clase
router.post('/profesor/crear-clase', (req, res) => {
    const { nombreClase } = req.body;
    if (!nombreClase) return res.status(400).json({ mensaje: 'Nombre de clase requerido.' });

    db.query('INSERT INTO clases (nombre) VALUES (?)', [nombreClase], (err, result) => {
        if (err) return res.status(500).json({ mensaje: 'Error al crear clase.' });
        res.json({ mensaje: 'Clase creada', id: result.insertId });
    });
});

// Obtener alumnos
router.get('/profesor/alumnos', (req, res) => {
    db.query('SELECT id, nombre FROM estudiantes', (err, results) => {
        if (err) return res.status(500).json([]);
        res.json(results);
    });
});

// Calificar alumno
router.post('/profesor/calificar', (req, res) => {
    const { id, tipo } = req.body;
    if (!id || !tipo) return res.status(400).json({ mensaje: 'Datos incompletos' });

    let campo = '';
    if (tipo === '+') campo = 'oro = oro + 10';
    else if (tipo === '-') campo = 'oro = oro - 5';
    else if (tipo === 'gold') campo = 'oro = oro + 50';
    else return res.status(400).json({ mensaje: 'Tipo inválido' });

    db.query(`UPDATE estudiantes SET ${campo} WHERE id = ?`, [id], (err) => {
        if (err) return res.status(500).json({ mensaje: 'Error al calificar' });
        res.json({ mensaje: 'Calificación actualizada' });
    });
});

module.exports = router;
