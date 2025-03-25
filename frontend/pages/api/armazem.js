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
      // Verifica os headers e o body para encontrar a loja
      const userLoja = req.headers['x-user-loja'] || req.body?.loja || req.body?.filters?.loja;
      const userAcess = req.headers['x-user-acess'];
  
      console.log("Loja identificada:", userLoja); // Para depuração
  
      // Listar Armazéns com filtros (POST)
      if (req.method === "POST") {
        const { filters } = req.body || {};
        
        if (!userLoja) {
          return res.status(400).json({
            success: false,
            message: "Loja não identificada para filtro"
          });
        }
  
        let where = { loja: userLoja };
  
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
  
      // Adicionar Armazém (POST)
      else if (req.method === "POST") {
        const { nome, capacidadeTotal, pais, estado, cidade, rua, complemento, loja } = req.body;
  
        if (!loja && !userLoja) {
          return res.status(400).json({
            success: false,
            message: "Loja não identificada"
          });
        }
  
        const armazemData = {
          nome,
          capacidadeTotal: Number(capacidadeTotal) || 0,
          capacidadeOcupada: 0,
          pais: pais || "",
          estado: estado || "",
          cidade: cidade || "",
          rua: rua || "",
          complemento: complemento || "",
          loja: loja || userLoja,
          ACL: { [loja || userLoja]: { read: true, write: true } }
        };
  
        const response = await fetch(BASE_URL, {
          method: "POST",
          headers,
          body: JSON.stringify(armazemData),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Erro ao adicionar armazém.");
        }
  
        const data = await response.json();
        return res.status(201).json(data);
      }
  
      // Editar Armazém (PUT)
      else if (req.method === "PUT") {
        const { objectId } = req.query;
        const { nome, capacidadeTotal, pais, estado, cidade, rua } = req.body;
  
        if (!objectId) {
          return res.status(400).json({
            success: false,
            message: "ID do armazém não fornecido"
          });
        }
  
        // Verifica se o armazém existe e pertence à loja do usuário
        const checkResponse = await fetch(`${BASE_URL}/${objectId}`, {
          method: "GET",
          headers,
        });
  
        if (!checkResponse.ok) {
          const errorData = await checkResponse.json();
          throw new Error(errorData.message || "Armazém não encontrado.");
        }
  
        const existingArmazem = await checkResponse.json();
        
        if (existingArmazem.loja !== userLoja) {
          return res.status(403).json({
            success: false,
            message: "Você não tem permissão para editar este armazém"
          });
        }
  
        const updateData = {
          nome,
          capacidadeTotal: Number(capacidadeTotal),
          pais: pais || existingArmazem.pais,
          estado: estado || existingArmazem.estado,
          cidade: cidade || existingArmazem.cidade,
          rua: rua || existingArmazem.rua
        };
  
        const updateResponse = await fetch(`${BASE_URL}/${objectId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(updateData),
        });
  
        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          throw new Error(errorData.message || "Erro ao atualizar armazém.");
        }
  
        const data = await updateResponse.json();
        return res.status(200).json(data);
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
  
        // Verifica se o armazém existe e pertence à loja do usuário
        const checkResponse = await fetch(`${BASE_URL}/${objectId}`, {
          method: "GET",
          headers,
        });
  
        if (!checkResponse.ok) {
          const errorData = await checkResponse.json();
          throw new Error(errorData.message || "Armazém não encontrado.");
        }
  
        const existingArmazem = await checkResponse.json();
        
        if (existingArmazem.loja !== userLoja) {
          return res.status(403).json({
            success: false,
            message: "Você não tem permissão para excluir este armazém"
          });
        }
  
        const deleteResponse = await fetch(`${BASE_URL}/${objectId}`, {
          method: "DELETE",
          headers,
        });
  
        if (!deleteResponse.ok) {
          const errorData = await deleteResponse.json();
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