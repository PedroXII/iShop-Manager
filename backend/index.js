const Parse = require('parse/node');
require('dotenv').config();
const express = require('express');
const cors = require('cors');

Parse.initialize(process.env.BACK4APP_APP_ID, process.env.BACK4APP_JS_KEY);
Parse.serverURL = "https://parseapi.back4app.com/";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("API funcionando!");
});

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

// Em vez de usar app.listen(), exportamos a aplicação
module.exports = app;
