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
    const userLoja = req.headers['x-user-loja'];
    const userAcess = req.headers['x-user-acess'];

    // Verificação básica de autenticação
    if (!userLoja) {
      throw new Error("Usuário não autenticado");
    }

    // Listar Armazéns (GET)
    if (req.method === "GET") {
      const { nome, localizacao, capacidadeMin, capacidadeMax } = req.query;
      
      let where = { loja: userLoja }; // Filtra apenas pela loja do usuário
      
      // Adiciona filtros se existirem
      if (nome) where.nome = { $regex: nome, $options: 'i' };
      if (localizacao) where.$or = [
        { pais: { $regex: localizacao, $options: 'i' } },
        { estado: { $regex: localizacao, $options: 'i' } },
        { cidade: { $regex: localizacao, $options: 'i' } }
      ];
      if (capacidadeMin) where.capacidadeTotal = { $gte: Number(capacidadeMin) };
      if (capacidadeMax) where.capacidadeTotal = { ...where.capacidadeTotal, $lte: Number(capacidadeMax) };

      const response = await fetch(`${BASE_URL}?where=${encodeURIComponent(JSON.stringify(where))}`, {
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao carregar armazéns.");
      }

      const data = await response.json();
      res.status(200).json(data.results || []);
    }

    // Adicionar Armazém (POST)
    else if (req.method === "POST") {
      const { nome, capacidadeTotal } = req.body;

      if (!nome || !capacidadeTotal) {
        throw new Error("Nome e capacidade total são obrigatórios.");
      }

      const body = JSON.stringify({
        ...req.body,
        capacidadeTotal: Number(capacidadeTotal),
        capacidadeOcupada: 0,
        loja: userLoja // Garante que o armazém será da loja do usuário
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
      const { nome, capacidadeTotal } = req.body;

      if (!objectId) {
        throw new Error("ID do armazém é obrigatório para edição.");
      }

      // Verifica se o armazém pertence à loja do usuário
      const verifyResponse = await fetch(`${BASE_URL}/${objectId}`, { headers });
      const existingData = await verifyResponse.json();
      
      if (existingData.loja !== userLoja) {
        throw new Error("Você só pode editar armazéns da sua loja.");
      }

      const body = JSON.stringify({
        ...req.body,
        capacidadeTotal: Number(capacidadeTotal)
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
        throw new Error("ID do armazém é obrigatório para exclusão.");
      }

      // Verifica se é admin
      if (userAcess !== 'admin') {
        throw new Error("Apenas administradores podem excluir armazéns.");
      }

      // Verifica se o armazém pertence à loja do usuário
      const verifyResponse = await fetch(`${BASE_URL}/${objectId}`, { headers });
      const existingData = await verifyResponse.json();
      
      if (existingData.loja !== userLoja) {
        throw new Error("Você só pode excluir armazéns da sua loja.");
      }

      const response = await fetch(`${BASE_URL}/${objectId}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao excluir armazém.");
      }

      res.status(200).json({ success: true });
    }

    // Método não suportado
    else {
      res.status(405).json({ message: "Método não permitido." });
    }
  } catch (error) {
    console.error("Erro na API:", error.message);
    res.status(500).json({ 
      message: error.message || "Erro interno no servidor.",
      error: error.stack 
    });
  }
}