//Arquivo principal do servidor.

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Rota de teste
app.get("/", (req, res) => {
    res.send("API funcionando!");
});

app.listen(3001, () => console.log("Backend rodando na porta 3001"));