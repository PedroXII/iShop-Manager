//Arquivo principal do servidor.

require('dotenv').config();
//===================================================================
const Parse = require('parse/node');
Parse.initialize(process.env.BACK4APP_APP_ID, process.env.BACK4APP_JS_KEY);
Parse.serverURL = "https://parseapi.back4app.com/";
//===================================================================
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

//==========================================================
//Rota de teste
app.get("/test-db", async (req, res) => {
    try {
        const TestObject = Parse.Object.extend("Test");
        const testObject = new TestObject();
        testObject.set("message", "Conexão bem-sucedida!");
        await testObject.save();
        res.send("Banco de dados conectado e objeto criado!");
    } catch (error) {
        res.status(500).send("Erro ao conectar ao banco de dados: " + error.message);
    }
});
//=============================================================