console.log('🚀 El archivo index.js se está ejecutando...');

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// 🧠 Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 🧱 Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/sounds', express.static(path.join(__dirname, 'public/sounds')));

// 🧠 Sesiones
app.use(session({
    secret: 'classcraft-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true }
}));

// 🎨 Motor de vistas (opcional)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 🏠 Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

// 🧭 Rutas
const authRoutes = require('./routes/auth');
const profesorRoutes = require('./routes/profesor');
app.use('/', authRoutes);
app.use('/', profesorRoutes);

// 🔊 Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
