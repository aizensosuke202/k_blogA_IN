const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

// Configuration CORS CORRECTE
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']  // ✅ "allowedHeaders"
}));

app.options('*', cors());  // Pour les preflight requests
app.use(express.json());

app.get("/", (req, res) => {
    res.send("API Blog en ligne");
});

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

const postsRoutes = require("./routes/posts");
app.use("/api/posts", postsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});