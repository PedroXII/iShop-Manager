export default async function handler(req, res) {
    const { method, query, body } = req;
    const { id } = query;
    const userLoja = req.headers['x-user-loja'];
    const userAcess = req.headers['x-user-acess'];
  
    // Verificar autenticação
    if (!userLoja) {
      return res.status(401).json({ success: false, message: "Não autenticado" });
    }
  
    // Configurações do Back4App
    const parseHeaders = {
      "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
      "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
      "Content-Type": "application/json",
    };
  
    try {
      // Operação de pesquisa (POST)
      if (method === "POST") {
        let filters = {};
        try {
          filters = typeof body === 'string' ? JSON.parse(body).filters : body.filters || {};
        } catch (e) {
          console.error("Erro ao parsear body:", e);
          return res.status(400).json({ success: false, message: "Formato de dados inválido" });
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
          headers: parseHeaders
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao buscar armazéns");
        }
  
        const data = await response.json();
        return res.status(200).json(data.results || []);
      }
  
      // Operação de criação (POST sem ID)
      if (method === "POST") {
        let armazemData;
        try {
          armazemData = typeof body === 'string' ? JSON.parse(body) : body;
        } catch (e) {
          return res.status(400).json({ success: false, message: "Formato de dados inválido" });
        }
  
        const response = await fetch('https://parseapi.back4app.com/classes/Armazem', {
          method: 'POST',
          headers: parseHeaders,
          body: JSON.stringify({
            ...armazemData,
            loja: userLoja,
            capacidadeOcupada: 0,
            ACL: { [userLoja]: { read: true, write: true } }
          })
        });
  
        const data = await response.json();
        return res.status(response.ok ? 200 : 400).json(data);
      }
  
      // Operação de atualização (PUT)
      if (method === "PUT") {
        if (userAcess !== "Administrador") {
          return res.status(403).json({ success: false, message: "Apenas administradores podem atualizar armazéns" });
        }
  
        let armazemData;
        try {
          armazemData = typeof body === 'string' ? JSON.parse(body) : body;
        } catch (e) {
          return res.status(400).json({ success: false, message: "Formato de dados inválido" });
        }
  
        const response = await fetch(`https://parseapi.back4app.com/classes/Armazem/${id}`, {
          method: 'PUT',
          headers: parseHeaders,
          body: JSON.stringify(armazemData)
        });
  
        const data = await response.json();
        return res.status(response.ok ? 200 : 400).json(data);
      }
  
      // Operação de exclusão (DELETE)
      if (method === "DELETE") {
        if (userAcess !== "Administrador") {
          return res.status(403).json({ success: false, message: "Apenas administradores podem excluir armazéns" });
        }
  
        const response = await fetch(`https://parseapi.back4app.com/classes/Armazem/${id}`, {
          method: 'DELETE',
          headers: parseHeaders
        });
        return res.status(response.ok ? 200 : 400).json({ success: response.ok });
      }
  
      // Método não permitido
      res.setHeader("Allow", ["POST", "PUT", "DELETE"]);
      return res.status(405).json({ success: false, message: "Método não permitido" });
    } catch (error) {
      console.error("Erro na API de armazém:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Erro interno no servidor",
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }