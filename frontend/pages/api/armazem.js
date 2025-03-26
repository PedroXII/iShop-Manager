export default async function handler(req, res) {
  const BASE_URL = "https://parseapi.back4app.com/classes/Armazem";
  const APP_ID = process.env.BACK4APP_APP_ID;
  const JS_KEY = process.env.BACK4APP_JS_KEY;

  const headers = {
    "X-Parse-Application-Id": APP_ID,
    "X-Parse-JavaScript-Key": JS_KEY,
    "Content-Type": "application/json",
  };

  const loja = req.headers['x-user-loja'];
  const acess = req.headers['x-user-acess'];

  try {
    // GET - Listar Armazéns
    if (req.method === 'GET') {
      const { nome, localizacao, capacidadeMin, capacidadeMax } = req.query;
      
      let where = { loja };
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
      
      const data = await response.json();
      res.status(200).json(data.results || []);
    }

    // POST - Criar Armazém
    else if (req.method === 'POST') {
      if (acess !== 'admin') {
        throw new Error('Apenas administradores podem criar armazéns');
      }

      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...req.body, loja }),
      });

      const data = await response.json();
      res.status(201).json(data);
    }

    // PUT - Atualizar Armazém
    else if (req.method === 'PUT') {
      const { objectId } = req.query;
      if (!objectId) throw new Error('ID do armazém é obrigatório');

      const response = await fetch(`${BASE_URL}/${objectId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(req.body),
      });

      const data = await response.json();
      res.status(200).json(data);
    }

    // DELETE - Excluir Armazém (CORREÇÃO PRINCIPAL)
    else if (req.method === 'DELETE') {
      if (acess !== 'admin') {
        throw new Error('Apenas administradores podem excluir armazéns');
      }

      const { objectId } = req.query;
      if (!objectId) throw new Error('ID do armazém é obrigatório');

      const response = await fetch(`${BASE_URL}/${objectId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao excluir armazém');
      }

      res.status(200).json({ success: true });
    }

    else {
      res.status(405).json({ message: 'Método não permitido' });
    }
  } catch (error) {
    res.status(500).json({ 
      message: error.message,
      error: error.stack 
    });
  }
}