const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Registro de usuario
router.post('/register', (req, res) => {
    const { nombre, correo, contrasena, rol, codigo_clase } = req.body;

    if (!nombre || !correo || !contrasena || !rol) {
        return res.send('Faltan campos obligatorios.');
    }

    if (rol === 'profesor') {
        const check = 'SELECT id FROM profesores WHERE correo = ?';
        db.query(check, [correo], (err, results) => {
            if (err) return res.send('Error del servidor.');
            if (results.length > 0) return res.send('El correo ya está registrado como profesor.');

            const insert = 'INSERT INTO profesores (nombre, correo, contrasena) VALUES (?, ?, ?)';
            db.query(insert, [nombre, correo, contrasena], (err) => {
                if (err) return res.send('Error al registrar profesor.');
                return res.redirect('/html/profesor/profesor.html');
            });
        });
    } else if (rol === 'alumno') {
        const check = 'SELECT id FROM estudiantes WHERE correo = ?';
        db.query(check, [correo], (err, results) => {
            if (err) return res.send('Error del servidor.');
            if (results.length > 0) return res.send('El correo ya está registrado como alumno.');

            const claseQuery = 'SELECT id FROM clases WHERE codigo_clase = ?';
            db.query(claseQuery, [codigo_clase], (err, claseResult) => {
                if (err || claseResult.length === 0) return res.send('Código de clase inválido.');

                const claseId = claseResult[0].id;
                const insertAlumno = 'INSERT INTO estudiantes (nombre, correo, contrasena) VALUES (?, ?, ?)';
                db.query(insertAlumno, [nombre, correo, contrasena], (err, result) => {
                    if (err) return res.send('Error al registrar alumno.');

                    const estudianteId = result.insertId;
                    const insertRelacion = 'INSERT INTO estudiantes_clase (estudiante_id, clase_id) VALUES (?, ?)';
                    db.query(insertRelacion, [estudianteId, claseId], (err) => {
                        if (err) return res.send('Error al asociar alumno con clase.');
                        return res.redirect('/html/alumno/elige_personaje.html');
                    });
                });
            });
        });
    } else {
        return res.send('Rol inválido.');
    }
});

// 🔐 Login de usuario (CORREGIDO Y AGREGADO)
router.post('/login', (req, res) => {
    const { correo, contrasena, rol } = req.body;

    if (!correo || !contrasena || !rol) {
        return res.send('Faltan campos obligatorios.');
    }

    if (rol === 'profesor') {
        const query = 'SELECT * FROM profesores WHERE correo = ? AND contrasena = ?';
        db.query(query, [correo, contrasena], (err, results) => {
            if (err) return res.send('Error al iniciar sesión.');
            if (results.length === 0) return res.send('Correo o contraseña incorrectos.');
            return res.redirect('/html/profesor/profesor.html');
        });
    } else if (rol === 'alumno') {
        const query = 'SELECT * FROM estudiantes WHERE correo = ? AND contrasena = ?';
        db.query(query, [correo, contrasena], (err, results) => {
            if (err) return res.send('Error al iniciar sesión.');
            if (results.length === 0) return res.send('Correo o contraseña incorrectos.');
            return res.redirect('/html/alumno/elige_personaje.html');
        });
    } else {
        return res.send('Rol inválido.');
    }
});

module.exports = router;
