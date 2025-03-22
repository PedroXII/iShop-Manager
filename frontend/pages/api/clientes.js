// pages/api/clientes.js

export default async function handler(req, res) {
    const BASE_URL = "https://parseapi.back4app.com/classes/Cliente";
    const APP_ID = process.env.BACK4APP_APP_ID;
    const JS_KEY = process.env.BACK4APP_JS_KEY;
  
    const headers = {
      "X-Parse-Application-Id": APP_ID,
      "X-Parse-JavaScript-Key": JS_KEY,
      "Content-Type": "application/json",
    };
  
    try {
      // Listar Clientes (GET)
      if (req.method === "GET") {
        const response = await fetch(BASE_URL, {
          method: "GET",
          headers,
        });
  
        if (!response.ok) {
          throw new Error("Erro ao carregar clientes.");
        }
  
        const data = await response.json();
        res.status(200).json(data.results);
      }
  
      // Adicionar Cliente (POST)
      else if (req.method === "POST") {
        const { nome, statusAssinatura, idade, comprasAnteriores, sexo } = req.body;
  
        const body = JSON.stringify({
          nome,
          statusAssinatura: statusAssinatura || false,
          idade: idade || 18,
          comprasAnteriores: comprasAnteriores || [],
          sexo: sexo || "",
        });
  
        const response = await fetch(BASE_URL, {
          method: "POST",
          headers,
          body,
        });
  
        if (!response.ok) {
          throw new Error("Erro ao adicionar cliente.");
        }
  
        const data = await response.json();
        res.status(201).json(data);
      }
  
      // Método não suportado
      else {
        res.status(405).json({ message: "Método não permitido." });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }