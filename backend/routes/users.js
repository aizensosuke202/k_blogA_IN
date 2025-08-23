const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const pool = require('../db');
const authenticateToken = require('../middleware/authMiddleware');
const { body, validationResult} = require('express-validator');

router.post('/', [
    body('username').isLength({min: 3}),
    body('email').isEmail(),
    body('password').isLength({min: 6})
], async(req, res)=> {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
         return res.status(400).json({error: errors.array() })
    }
});

// CREATE user
router.post('/', async (req, res) => {
    try {
        const { username, email, passwd } = req.body;
        const userExists = await pool.query('SELECT * FROM users WHERE email=$1', [email]);

        if(userExists.rows.length > 0){
            return res.status(400).json({error:'Email deja utilisee!'});
        }

        const hashedPasswd = await bcrypt.hash(passwd, saltRounds);
        const result = await pool.query(
            'INSERT INTO users (username, email, passwd) VALUES ($1, $2, $3) RETURNING *',
            [username, email, hashedPasswd]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

// READ all users
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY userId ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

// READ one user
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM users WHERE userId = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

// UPDATE user
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email } = req.body;
        const result = await pool.query(
            'UPDATE users SET username = $1, email = $2 WHERE userId = $3 RETURNING *',
            [username, email, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});
/**
 * Modifie le mot de passe d'un utilisateur (nécessite l'ancien mot de passe)
 * PUT /api/users/:id/password
 */
router.put('/:id/password', async (req, res) => {
    try {
        const { id } = req.params;
        const { oldPassword, newPassword } = req.body;

        // Validation des données
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ 
                error: 'L\'ancien et le nouveau mot de passe sont requis' 
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' 
            });
        }

        // Récupérer l'utilisateur
        const userResult = await pool.query(
            'SELECT userid, passwd FROM users WHERE userid = $1',
            [id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        const user = userResult.rows[0];

        // Vérifier l'ancien mot de passe
        const isPasswordValid = await bcrypt.compare(oldPassword, user.passwd);
        
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Ancien mot de passe incorrect' });
        }

        // Hacher le nouveau mot de passe
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Mettre à jour
        const updateResult = await pool.query(
            `UPDATE users 
             SET passwd = $1, updatedat = NOW() 
             WHERE userid = $2 
             RETURNING userid, username, email, createdat`,
            [hashedNewPassword, id]
        );

        res.json({ 
            success: true,
            message: 'Mot de passe modifié avec succès',
            user: updateResult.rows[0]
        });

    } catch (err) {
        console.error('Erreur modification mot de passe:', err.message);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// DELETE user
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'DELETE FROM users WHERE userId = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.json({ message: 'Utilisateur supprimé', user: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;
