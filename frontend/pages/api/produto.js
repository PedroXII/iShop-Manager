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
    // Listar Produtos (GET)
    if (req.method === "GET") {
      const { loja } = req.query;

      if (!loja) {
        throw new Error("O campo 'loja' é obrigatório.");
      }

      const response = await fetch(`${BASE_URL}?where={"loja":"${loja}"}`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao carregar produtos.");
      }

      const data = await response.json();
      res.status(200).json(data.results);
    }

    // Adicionar Produto (POST)
    else if (req.method === "POST") {
      const { nome, categoria, preco, estoque, loja } = req.body;

      if (!loja) {
        throw new Error("O campo 'loja' é obrigatório.");
      }

      const body = JSON.stringify({
        nome,
        categoria,
        preco: Number(preco) || 0,
        estoque: Number(estoque) || 0,
        loja,
      });

      const response = await fetch(BASE_URL, {
        method: "POST",
        headers,
        body,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao adicionar produto.");
      }

      const data = await response.json();
      res.status(201).json(data);
    }

    // Editar Produto (PUT)
    else if (req.method === "PUT") {
      const { objectId } = req.query;
      const { nome, categoria, preco, estoque, loja } = req.body;

      if (!objectId) {
        throw new Error("O campo 'objectId' é obrigatório para edição.");
      }

      const body = JSON.stringify({
        nome,
        categoria,
        preco: Number(preco) || 0,
        estoque: Number(estoque) || 0,
        loja,
      });

      const response = await fetch(`${BASE_URL}/${objectId}`, {
        method: "PUT",
        headers,
        body,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao atualizar produto.");
      }

      const data = await response.json();
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
        throw new Error(errorData.message || "Erro ao excluir produto.");
      }

      res.status(200).json({ message: "Produto excluído com sucesso." });
    }

    // Método não suportado
    else {
      res.status(405).json({ message: "Método não permitido." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || "Erro interno no servidor." });
  }
}
