const express = require('express');
const route = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const JWT_SECRET = "iasilwyfklmfw";

router.post('/', async (req,res)=>{
   try{
       const { email, passwd } = req.body;
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]

    );
    if(userResult.rows.length === 0){
        return res.status(404).json({error:"Utilisateur non trouve"});
    }

    const user = userResult.rows[0];

    const token = jwt.sign(
        {id: user.id, email: user.email},
        JWT_SECRET,
        {expiresIn: "1h"}
    );
    res.json({message:"Connexion Reussie", token});
   }catch(err){
    console.error(err.message);
    res.status(500).send('Erreur serveur');
   }


});

module.exports = router;   