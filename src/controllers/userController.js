import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Función para cargar y reemplazar variables en la plantilla
const renderTemplate = (templatePath, variables) => {
    let template = fs.readFileSync(templatePath, 'utf-8');
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, value);
    }
    return template;
};


// Registro de Usuario
export const registerUser = async (req, res) => {
    const { username, email, password, questions, image } = req.body;

    try {
        // Verificar si el usuario ya existe
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear el nuevo usuario
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            questions,
            image,
        });

        // Configurar transporte de correo
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Opciones de correo para el usuario
        const mailOptionsUser = {
            from: process.env.EMAIL_USER,
            to: user.email, // Correo del usuario registrado
            subject: 'Registro Exitoso',
            text: `Hola ${user.username}, ¡te has registrado exitosamente!`,
        };

        // Opciones de correo para el administrador
        const mailOptionsAdmin = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL, // Correo del administrador
            subject: 'Nuevo Usuario Registrado',
            text: `Se ha registrado un nuevo usuario: \n\nNombre: ${user.username}\nEmail: ${user.email}`,
        };

        // Enviar correo al usuario
        transporter.sendMail(mailOptionsUser, (error, info) => {
            if (error) {
                return console.error('Error al enviar el correo al usuario:', error);
            }
            console.log('Correo enviado al usuario: ' + info.response);
        });

        // Enviar correo al administrador
        transporter.sendMail(mailOptionsAdmin, (error, info) => {
            if (error) {
                return console.error('Error al enviar el correo al administrador:', error);
            }
            console.log('Correo enviado al administrador: ' + info.response);
        });

        // Respuesta exitosa
        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};


// Autenticación de Usuario
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Obtener toda la información del usuario autenticado
export const getMyDetails = async (req, res) => {
    try {
        // Obtener el usuario autenticado usando el ID del token
        const user = await User.findById(req.user.id).select('-password'); // No incluir el campo de contraseña
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Devolver la información completa del usuario
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Obtener toda la información de un usuario específico (solo para administradores)
export const getUserDetailsAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password'); // No incluir el campo de contraseña
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Devolver todos los datos del usuario (incluyendo preguntas, imagen, etc.)
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Controlador para actualizar las preguntas de un usuario
export const updateUserQuestionsAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        const { favoriteFood, favoriteArtist, favoritePlace, favoriteColor } = req.body;

        // Validar si los campos de preguntas están presentes
        if (!favoriteFood || !favoriteArtist || !favoritePlace || !favoriteColor) {
            return res.status(400).json({ message: 'Todos los campos de preguntas son requeridos' });
        }

        // Buscar al usuario por ID y actualizar sus preguntas
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Actualizar las preguntas del usuario
        user.questions = {
            favoriteFood,
            favoriteArtist,
            favoritePlace,
            favoriteColor
        };

        await user.save();

        res.json({ message: 'Preguntas actualizadas exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};
