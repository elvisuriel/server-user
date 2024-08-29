import jwt from 'jsonwebtoken';

export const authenticateAdmin = (req, res, next) => {
    // Obtener el token de la cabecera 'Authorization'
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) return res.sendStatus(401); // Sin token, retorno 401 (No autorizado)

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Token inválido, retorno 403 (Prohibido)

        // Verificar si el usuario es un administrador
        if (!user.isAdmin) {
            return res.status(403).json({ message: 'Acceso denegado: No eres administrador.' });
        }

        req.user = user; // Añadir la información del usuario al objeto req
        next(); // Continuar con la siguiente función
    });
};

export const authenticateToken = (req, res, next) => {
    // Obtener el token de la cabecera 'Authorization'
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) return res.sendStatus(401); // Sin token, retorno 401 (No autorizado)

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Token inválido, retorno 403 (Prohibido)

        req.user = user; // Añadir la información del usuario al objeto req
        next(); // Continuar con la siguiente función
    });
};