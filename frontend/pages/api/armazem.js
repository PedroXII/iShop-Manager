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
  
      // Listar Armazéns (GET via POST com filtros)
      if (req.method === "POST") {
        const { filters } = req.body || {};
        const loja = userLoja || filters?.loja;
        
        if (!loja) {
          return res.status(400).json({
            success: false,
            message: "Loja não identificada"
          });
        }
  
        let where = { loja };
  
        if (filters) {
          const { nome, localizacao, capacidadeMin, capacidadeMax } = filters;
          
          if (nome) where.nome = { $regex: nome, $options: 'i' };
          
          if (localizacao) {
            where.$or = [
              { pais: { $regex: localizacao, $options: 'i' } },
              { estado: { $regex: localizacao, $options: 'i' } },
              { cidade: { $regex: localizacao, $options: 'i' } },
              { rua: { $regex: localizacao, $options: 'i' } }
            ];
          }
          
          if (capacidadeMin) where.capacidadeTotal = { $gte: Number(capacidadeMin) };
          if (capacidadeMax) {
            where.capacidadeTotal = where.capacidadeTotal || {};
            where.capacidadeTotal.$lte = Number(capacidadeMax);
          }
        }
  
        const response = await fetch(`${BASE_URL}?where=${encodeURIComponent(JSON.stringify(where))}`, {
          method: "GET",
          headers,
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Erro ao carregar armazéns.");
        }
  
        const data = await response.json();
        return res.status(200).json(data.results);
      }
  
      // Adicionar/Atualizar Armazém (POST/PUT)
      else if (req.method === "POST" || req.method === "PUT") {
        const { objectId } = req.query;
        const { nome, capacidadeTotal, pais, estado, cidade, rua } = req.body;
        const loja = userLoja || req.body.loja;
  
        if (!loja) {
          return res.status(400).json({
            success: false,
            message: "Loja não identificada"
          });
        }
  
        if (!nome || !capacidadeTotal) {
          return res.status(400).json({
            success: false,
            message: "Nome e capacidade total são obrigatórios"
          });
        }
  
        const armazemData = {
          nome,
          capacidadeTotal: Number(capacidadeTotal),
          capacidadeOcupada: req.body.capacidadeOcupada || 0,
          pais: pais || "",
          estado: estado || "",
          cidade: cidade || "",
          rua: rua || "",
          loja,
          ACL: { [loja]: { read: true, write: true } }
        };
  
        const url = objectId ? `${BASE_URL}/${objectId}` : BASE_URL;
        const method = objectId ? "PUT" : "POST";
  
        const response = await fetch(url, {
          method,
          headers,
          body: JSON.stringify(armazemData),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Erro ao ${objectId ? 'atualizar' : 'adicionar'} armazém.`);
        }
  
        const data = await response.json();
        return res.status(objectId ? 200 : 201).json(data);
      }
  
      // Excluir Armazém (DELETE)
      else if (req.method === "DELETE") {
        const { objectId } = req.query;
  
        if (!objectId) {
          return res.status(400).json({
            success: false,
            message: "ID do armazém não fornecido"
          });
        }
  
        if (userAcess !== "Administrador") {
          return res.status(403).json({
            success: false,
            message: "Apenas administradores podem excluir armazéns"
          });
        }
  
        const response = await fetch(`${BASE_URL}/${objectId}`, {
          method: "DELETE",
          headers,
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Erro ao excluir armazém.");
        }
  
        return res.status(200).json({ 
          success: true, 
          message: "Armazém excluído com sucesso" 
        });
      }
  
      // Método não suportado
      else {
        res.setHeader("Allow", ["POST", "PUT", "DELETE"]);
        return res.status(405).json({ 
          success: false,
          message: "Método não permitido" 
        });
      }
    } catch (error) {
      console.error("Erro na API de armazéns:", error.message);
      return res.status(500).json({ 
        success: false,
        message: error.message || "Erro interno no servidor" 
      });
    }
  }