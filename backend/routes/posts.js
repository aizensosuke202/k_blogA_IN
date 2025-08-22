const express = require('express');
const router = express.Router();
const pool = require('../db');

// CREATE post - CORRIGÉ
router.post('/', async (req, res) => {
    try {
        const { titre, content, createdBy } = req.body;

        const result = await pool.query(
            'INSERT INTO articles (titre, content, createdby) VALUES ($1, $2, $3) RETURNING *',
            [titre, content, createdBy]  // createdby en minuscule
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erreur détaillée:', err.message);
        res.status(500).send('Erreur serveur');
    }
});

// READ all posts - CORRIGÉ
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM articles ORDER BY createdat DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

// READ one article - CORRIGÉ
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM articles WHERE articleid = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Article non trouvé' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

// UPDATE article - CORRIGÉ
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { titre, content } = req.body;
        const result = await pool.query(
            'UPDATE articles SET titre = $1, content = $2, updatedat = NOW() WHERE articleid = $3 RETURNING *',
            [titre, content, id]  // articleid en minuscule
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Article non trouvé' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

// DELETE article - CORRIGÉ
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'DELETE FROM articles WHERE articleid = $1 RETURNING *',
            [id]  // articleid en minuscule
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Article non trouvé' });
        }
        res.json({ message: 'Article supprimé avec succès', article: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;