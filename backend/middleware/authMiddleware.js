const jwt = require('jsonwebtoken');
const JWT_SECRET = "iasilwyfklmfw"; // à mettre aussi dans .env

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

    if (!token) return res.status(401).json({ error: "Accès refusé. Token manquant." });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Token invalide" });
        req.user = user; // on stocke l'user dans req pour l’utiliser après
        next();
    });
}

module.exports = authenticateToken;
