export default async function handler(req, res) {
    const { method, query, body } = req;
    const { id } = query;
    const userLoja = req.headers['x-user-loja'];
    const userAcess = req.headers['x-user-acess'];
  
    // Verificar autenticação
    if (!userLoja) {
      return res.status(401).json({ message: "Não autenticado" });
    }
  
    // Configurações do Back4App
    const headers = {
      "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
      "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
      "Content-Type": "application/json",
    };
  
    try {
      // Operação de pesquisa (POST)
      if (method === "POST") {
        let filters = {};
        try {
          filters = typeof body === 'string' ? JSON.parse(body).filters : body.filters;
        } catch (e) {
          return res.status(400).json({ message: "Formato de filtros inválido" });
        }
  
        const where = {
          loja: userLoja,
          ...(filters.nome && { nome: { $regex: filters.nome, $options: "i" } }),
          ...(filters.localizacao && {
            $or: [
              { 'localizacao.pais': { $regex: filters.localizacao, $options: "i" } },
              { 'localizacao.estado': { $regex: filters.localizacao, $options: "i" } },
              { 'localizacao.cidade': { $regex: filters.localizacao, $options: "i" } }
            ]
          }),
          ...(filters.capacidadeMin && { capacidadeTotal: { $gte: Number(filters.capacidadeMin) } }),
          ...(filters.capacidadeMax && { capacidadeTotal: { $lte: Number(filters.capacidadeMax) } })
        };
  
        const response = await fetch(`https://parseapi.back4app.com/classes/Armazem?where=${encodeURIComponent(JSON.stringify(where))}`, {
          headers,
        });
        
        const data = await response.json();
        return res.status(response.status).json(data.results || []);
      }
  
      // Operação de criação (POST com ID)
      if (method === "POST" && id) {
        const response = await fetch('https://parseapi.back4app.com/classes/Armazem', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ...body,
            loja: userLoja,
            capacidadeOcupada: 0,
            ACL: { [userLoja]: { read: true, write: true } }
          })
        });
        const data = await response.json();
        return res.status(response.status).json(data);
      }
  
      // Operação de atualização (PUT)
      if (method === "PUT") {
        if (userAcess !== "Administrador") {
          return res.status(403).json({ message: "Apenas administradores podem atualizar armazéns" });
        }
  
        const response = await fetch(`https://parseapi.back4app.com/classes/Armazem/${id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(body)
        });
        const data = await response.json();
        return res.status(response.status).json(data);
      }
  
      // Operação de exclusão (DELETE)
      if (method === "DELETE") {
        if (userAcess !== "Administrador") {
          return res.status(403).json({ message: "Apenas administradores podem excluir armazéns" });
        }
  
        const response = await fetch(`https://parseapi.back4app.com/classes/Armazem/${id}`, {
          method: 'DELETE',
          headers
        });
        return res.status(response.status).json({ success: response.ok });
      }
  
      // Método não permitido
      res.setHeader("Allow", ["POST", "PUT", "DELETE"]);
      return res.status(405).json({ message: "Método não permitido" });
    } catch (error) {
      console.error("Erro na API de armazém:", error);
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }