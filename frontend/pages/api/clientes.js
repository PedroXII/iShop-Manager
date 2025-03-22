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
  
    console.log("Requisição recebida:", req.method, req.body);
  
    try {
      // Listar Clientes (GET)
      if (req.method === "GET") {
        const response = await fetch(BASE_URL, {
          method: "GET",
          headers,
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro ao carregar clientes:", errorData);
          throw new Error(errorData.message || "Erro ao carregar clientes.");
        }
  
        const data = await response.json();
        console.log("Clientes carregados:", data.results);
        res.status(200).json(data.results);
      }
  
      // Adicionar Cliente (POST)
      else if (req.method === "POST") {
        const { nome, statusAssinatura, idade, comprasAnteriores, sexo, loja } = req.body;
  
        if (!loja) {
          throw new Error("O campo 'loja' é obrigatório.");
        }
  
        const body = JSON.stringify({
          nome,
          statusAssinatura: statusAssinatura || false,
          idade: idade || 18,
          comprasAnteriores: comprasAnteriores || [],
          sexo: sexo || "",
          loja, // Campo obrigatório
        });
  
        console.log("Corpo da requisição:", body);
  
        const response = await fetch(BASE_URL, {
          method: "POST",
          headers,
          body,
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro ao adicionar cliente:", errorData);
          throw new Error(errorData.message || "Erro ao adicionar cliente.");
        }
  
        const data = await response.json();
        console.log("Cliente adicionado:", data);
        res.status(201).json(data);
      }
  
      // Editar Cliente (PUT)
      else if (req.method === "PUT") {
        const { objectId } = req.query;
        const { nome, statusAssinatura, idade, comprasAnteriores, sexo } = req.body;
  
        const body = JSON.stringify({
          nome,
          statusAssinatura,
          idade,
          comprasAnteriores,
          sexo,
        });
  
        const response = await fetch(`${BASE_URL}/${objectId}`, {
          method: "PUT",
          headers,
          body,
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro ao atualizar cliente:", errorData);
          throw new Error(errorData.message || "Erro ao atualizar cliente.");
        }
  
        const data = await response.json();
        console.log("Cliente atualizado:", data);
        res.status(200).json(data);
      }
  
      // Excluir Cliente (DELETE)
      else if (req.method === "DELETE") {
        const { objectId } = req.query;
  
        const response = await fetch(`${BASE_URL}/${objectId}`, {
          method: "DELETE",
          headers,
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro ao excluir cliente:", errorData);
          throw new Error(errorData.message || "Erro ao excluir cliente.");
        }
  
        console.log("Cliente excluído:", objectId);
        res.status(200).json({ message: "Cliente excluído com sucesso." });
      }
  
      // Método não suportado
      else {
        res.status(405).json({ message: "Método não permitido." });
      }
    } catch (error) {
      console.error("Erro na API:", error.message);
      res.status(500).json({ message: error.message });
    }
  }