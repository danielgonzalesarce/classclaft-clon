const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../models/db');
const { v4: uuidv4 } = require('uuid');

// Mostrar panel HTML del profesor
router.get('/profesor/panel', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Crear una clase
router.post('/profesor/crear-clase', async (req, res) => {
    const { nombreClase } = req.body;

    const idProfesor = 1; // Temporal (luego lo sacas de la sesión)
    const codigo = uuidv4().split('-')[0].toUpperCase();

    const sql = 'INSERT INTO clases (nombre_clase, codigo, id_profesor) VALUES (?, ?, ?)';
    db.query(sql, [nombreClase, codigo, idProfesor], (err) => {
        if (err) {
            console.error('❌ Error al crear clase:', err);
            return res.status(500).send('Error al crear clase');
        }
        res.status(200).send('Clase creada');
    });
});

// Ver clases del profesor
router.get('/profesor/clases', (req, res) => {
    const idProfesor = 1; // Simulado (futuro: req.session.userId)
    db.query('SELECT * FROM clases WHERE id_profesor = ?', [idProfesor], (err, rows) => {
        if (err) {
            console.error('❌ Error al obtener clases:', err);
            return res.status(500).json([]);
        }
        res.json(rows);
    });
});

module.exports = router;
