import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import userRoutes from './src/routes/userRoutes.js';


dotenv.config();

const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Conexión a la base de datos
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Conectado a MongoDB'))
    .catch((error) => console.error('Error al conectar a MongoDB:', error));

app.use(cors({
    origin: ['http://localhost:3000', 'https://...'],
    credentials: true,
}));

// Rutas
app.use('/api/users', userRoutes);

// Servir imágenes estáticas
app.use('/uploads', express.static(path.resolve('./uploads')));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
