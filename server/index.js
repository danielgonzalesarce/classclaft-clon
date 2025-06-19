console.log('🚀 El archivo index.js se está ejecutando...');

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./models/db');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 🧱 Ruta pública de archivos
app.use(express.static(path.join(__dirname, 'public')));

// 🧠 Sesión
app.use(session({
    secret: 'classcraft-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true }
}));

// 🎨 (opcional si no usas EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 🏠 Ruta base
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

// 🧭 Rutas
const authRoutes = require('./routes/auth');
const profesorRoutes = require('./routes/profesor');
app.use('/', authRoutes);
app.use('/', profesorRoutes);

// 🔊 Servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
