// pages/api/produto.js
export default async function handler(req, res) {
    const BASE_URL = "https://parseapi.back4app.com/classes/Produto";
    const APP_ID = process.env.BACK4APP_APP_ID;
    const JS_KEY = process.env.BACK4APP_JS_KEY;
  
    const headers = {
      "X-Parse-Application-Id": APP_ID,
      "X-Parse-JavaScript-Key": JS_KEY,
      "Content-Type": "application/json",
    };
  
    console.log("Requisição recebida:", req.method, req.body);
  
    try {
      // Listar Produtos (GET)
      if (req.method === "GET") {
        const { loja } = req.query;
  
        if (!loja) {
          throw new Error("O campo 'loja' é obrigatório.");
        }
  
        // Filtro para buscar apenas os produtos da loja do usuário logado
        const response = await fetch(`${BASE_URL}?where={"loja":"${loja}"}`, {
          method: "GET",
          headers,
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro ao carregar produtos:", errorData);
          throw new Error(errorData.message || "Erro ao carregar produtos.");
        }
  
        const data = await response.json();
        console.log("Produtos carregados:", data.results);
        res.status(200).json(data.results);
      }
  
      // Adicionar Produto (POST)
      else if (req.method === "POST") {
        const { nome, marca, preco, tipo, loja } = req.body;
  
        if (!nome || !loja) {
          throw new Error("Os campos 'nome' e 'loja' são obrigatórios.");
        }
  
        const body = JSON.stringify({
          nome,
          marca: marca || "",
          preco: preco || 0,
          tipo: tipo || "",
          loja,
        });
  
        console.log("Corpo da requisição:", body);
  
        const response = await fetch(BASE_URL, {
          method: "POST",
          headers,
          body,
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro ao adicionar produto:", errorData);
          throw new Error(errorData.message || "Erro ao adicionar produto.");
        }
  
        const data = await response.json();
        console.log("Produto adicionado:", data);
        res.status(201).json(data);
      }
  
      // Editar Produto (PUT)
      else if (req.method === "PUT") {
        const { objectId } = req.query;
        const { nome, marca, preco, tipo, loja } = req.body;
  
        if (!objectId) {
          throw new Error("O campo 'objectId' é obrigatório para edição.");
        }
  
        const body = JSON.stringify({
          nome,
          marca,
          preco,
          tipo,
          loja,
        });
  
        const response = await fetch(`${BASE_URL}/${objectId}`, {
          method: "PUT",
          headers,
          body,
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro ao atualizar produto:", errorData);
          throw new Error(errorData.message || "Erro ao atualizar produto.");
        }
  
        const data = await response.json();
        console.log("Produto atualizado:", data);
        res.status(200).json(data);
      }
  
      // Excluir Produto (DELETE)
      else if (req.method === "DELETE") {
        const { objectId } = req.query;
  
        if (!objectId) {
          throw new Error("O campo 'objectId' é obrigatório para exclusão.");
        }
  
        const response = await fetch(`${BASE_URL}/${objectId}`, {
          method: "DELETE",
          headers,
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro ao excluir produto:", errorData);
          throw new Error(errorData.message || "Erro ao excluir produto.");
        }
  
        console.log("Produto excluído:", objectId);
        res.status(200).json({ message: "Produto excluído com sucesso." });
      }
  
      // Método não suportado
      else {
        res.status(405).json({ message: "Método não permitido." });
      }
    } catch (error) {
      console.error("Erro na API:", error.message);
      res.status(500).json({ message: error.message || "Erro interno no servidor." });
    }
  }