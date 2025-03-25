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
      // Operação de pesquisa (GET)
      if (method === "POST" && !id) {
        let filters = {};
        try {
          filters = typeof body === 'string' ? JSON.parse(body).filters : body.filters || {};
        } catch (e) {
          return res.status(400).json({ success: false, message: "Formato de filtros inválido" });
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
          })
        };
  
        const response = await fetch(`https://parseapi.back4app.com/classes/Armazem?where=${encodeURIComponent(JSON.stringify(where))}`, {
          headers: parseHeaders
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro na resposta do Back4App:", errorData);
          throw new Error(errorData.error || "Erro ao buscar armazéns");
        }
  
        const data = await response.json();
        return res.status(200).json(data.results || []);
      }
  
      // Operação de criação (POST)
      if (method === "POST" && !id) {
        let armazemData = {};
        try {
          armazemData = typeof body === 'string' ? JSON.parse(body) : body;
        } catch (e) {
          return res.status(400).json({ success: false, message: "Formato de dados inválido" });
        }
  
        // Preparar dados para o Back4App
        const payload = {
          ...armazemData,
          loja: userLoja,
          capacidadeOcupada: 0,
          ACL: {
            [userLoja]: { read: true, write: true }
          }
        };
  
        console.log("Enviando para Back4App:", payload); // Log para debug
  
        const response = await fetch('https://parseapi.back4app.com/classes/Armazem', {
          method: 'POST',
          headers: parseHeaders,
          body: JSON.stringify(payload)
        });
  
        const data = await response.json();
        
        if (!response.ok) {
          console.error("Erro na criação:", data);
          throw new Error(data.error || "Erro ao criar armazém");
        }
  
        return res.status(201).json(data);
      }
  
      // Operação de atualização (PUT)
      if (method === "PUT") {
        if (userAcess !== "Administrador") {
          return res.status(403).json({ success: false, message: "Apenas administradores podem atualizar armazéns" });
        }
  
        let armazemData = {};
        try {
          armazemData = typeof body === 'string' ? JSON.parse(body) : body;
        } catch (e) {
          return res.status(400).json({ success: false, message: "Formato de dados inválido" });
        }
  
        console.log("Atualizando no Back4App:", armazemData); // Log para debug
  
        const response = await fetch(`https://parseapi.back4app.com/classes/Armazem/${id}`, {
          method: 'PUT',
          headers: parseHeaders,
          body: JSON.stringify(armazemData)
        });
  
        const data = await response.json();
        
        if (!response.ok) {
          console.error("Erro na atualização:", data);
          throw new Error(data.error || "Erro ao atualizar armazém");
        }
  
        return res.status(200).json(data);
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
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro na exclusão:", errorData);
          throw new Error(errorData.error || "Erro ao excluir armazém");
        }
  
        return res.status(200).json({ success: true });
      }
  
      // Método não permitido
      res.setHeader("Allow", ["POST", "PUT", "DELETE"]);
      return res.status(405).json({ success: false, message: "Método não permitido" });
    } catch (error) {
      console.error("Erro na API de armazém:", error);
      return res.status(500).json({ 
        success: false, 
        message: error.message || "Erro interno no servidor"
      });
    }
  }