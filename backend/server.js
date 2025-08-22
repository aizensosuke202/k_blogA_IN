const express = require("express");
const cors = require("cors");
const pool = require("./db");


const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res)=> {
    res.send("API Blog en ligne");
})

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

const postsRoutes = require("./routes/posts");
app.use("/api/posts", postsRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log(`serveur demarre sur http://localhost:${PORT}`);
});

