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

  try {
    // Listar produtos (GET)
    if (req.method === "GET") {
      const { loja } = req.query;
      if (!loja) {
        return res.status(400).json({ message: "O campo 'loja' é obrigatório." });
      }
      
      const response = await fetch(`${BASE_URL}?where={\"lojaVendedora\":{\"$in\":[\"${loja}\"]}}`, {
        method: "GET",
        headers,
      });
      
      const data = await response.json();
      if (!response.ok) {
        return res.status(400).json({ message: data.error || "Erro ao buscar produtos." });
      }
      res.status(200).json(data.results);
    }
    
    // Criar produto (POST)
    else if (req.method === "POST") {
      const { nome, marca, preco, tipo, armazemProduto, lojaVendedora } = req.body;
      if (!lojaVendedora || !nome || !preco || !tipo) {
        return res.status(400).json({ message: "Todos os campos obrigatórios devem ser preenchidos." });
      }

      const body = JSON.stringify({
        nome,
        marca: marca || "",
        preco: Number(preco),
        tipo,
        armazemProduto: armazemProduto || [],
        lojaVendedora: [lojaVendedora],
      });
      
      console.log("Enviando dados para Back4App:", body);
      
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers,
        body,
      });

      const data = await response.json();
      if (!response.ok) {
        return res.status(400).json({ message: data.error || "Erro ao adicionar produto." });
      }
      res.status(201).json(data);
    }
    
    // Atualizar produto (PUT)
    else if (req.method === "PUT") {
      const { objectId } = req.query;
      const { nome, marca, preco, tipo, armazemProduto, lojaVendedora } = req.body;
      
      if (!objectId) {
        return res.status(400).json({ message: "O campo 'objectId' é obrigatório para edição." });
      }
      
      const body = JSON.stringify({ nome, marca, preco: Number(preco), tipo, armazemProduto, lojaVendedora });
      
      const response = await fetch(`${BASE_URL}/${objectId}`, {
        method: "PUT",
        headers,
        body,
      });
      
      const data = await response.json();
      if (!response.ok) {
        return res.status(400).json({ message: data.error || "Erro ao atualizar produto." });
      }
      res.status(200).json(data);
    }
    
    // Excluir produto (DELETE)
    else if (req.method === "DELETE") {
      const { objectId } = req.query;
      if (!objectId) {
        return res.status(400).json({ message: "O campo 'objectId' é obrigatório para exclusão." });
      }
      
      const response = await fetch(`${BASE_URL}/${objectId}`, {
        method: "DELETE",
        headers,
      });

      const data = await response.json();
      if (!response.ok) {
        return res.status(400).json({ message: data.error || "Erro ao excluir produto." });
      }
      res.status(200).json({ message: "Produto excluído com sucesso." });
    }
    
    else {
      res.status(405).json({ message: "Método não permitido." });
    }
  } catch (error) {
    console.error("Erro no servidor:", error);
    res.status(500).json({ message: error.message || "Erro interno no servidor." });
  }
}