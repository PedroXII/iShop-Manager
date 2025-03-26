// pages/api/armazem.js
export default async function handler(req, res) {
  const BASE_URL = "https://parseapi.back4app.com/classes/Armazem";
  const APP_ID = process.env.BACK4APP_APP_ID;
  const JS_KEY = process.env.BACK4APP_JS_KEY;

  const headers = {
    "X-Parse-Application-Id": APP_ID,
    "X-Parse-JavaScript-Key": JS_KEY,
    "Content-Type": "application/json",
  };

  try {
    // Listar Armazéns (GET)
    if (req.method === "GET") {
      const { loja } = req.query; // Obter a loja do usuário logado

      if (!loja) {
        throw new Error("O campo 'loja' é obrigatório.");
      }

      // Filtro para buscar apenas os armazéns da loja do usuário logado
      const response = await fetch(`${BASE_URL}?where={"loja":"${loja}"}`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao carregar armazéns.");
      }

      const data = await response.json();
      res.status(200).json(data.results);
    }

    // Adicionar Armazém (POST)
    else if (req.method === "POST") {
      const { nome, capacidadeTotal, pais, estado, cidade, rua, loja } = req.body;

      if (!loja) {
        throw new Error("O campo 'loja' é obrigatório.");
      }

      const body = JSON.stringify({
        nome,
        capacidadeTotal: Number(capacidadeTotal) || 0,
        capacidadeOcupada: 0,
        pais: pais || "",
        estado: estado || "",
        cidade: cidade || "",
        rua: rua || "",
        loja,
      });

      const response = await fetch(BASE_URL, {
        method: "POST",
        headers,
        body,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao adicionar armazém.");
      }

      const data = await response.json();
      res.status(201).json(data);
    }

    // Editar Armazém (PUT)
    else if (req.method === "PUT") {
      const { objectId } = req.query;
      const { nome, capacidadeTotal, pais, estado, cidade, rua, loja } = req.body;

      if (!objectId) {
        throw new Error("O campo 'objectId' é obrigatório para edição.");
      }

      const body = JSON.stringify({
        nome,
        capacidadeTotal: Number(capacidadeTotal) || 0,
        pais,
        estado,
        cidade,
        rua,
        loja,
      });

      const response = await fetch(`${BASE_URL}/${objectId}`, {
        method: "PUT",
        headers,
        body,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao atualizar armazém.");
      }

      const data = await response.json();
      res.status(200).json(data);
    }

    // Excluir Armazém (DELETE)
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
        throw new Error(errorData.message || "Erro ao excluir armazém.");
      }

      res.status(200).json({ message: "Armazém excluído com sucesso." });
    }

    // Método não suportado
    else {
      res.status(405).json({ message: "Método não permitido." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || "Erro interno no servidor." });
  }
}