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
  
      if (!userLoja) {
        throw new Error("Acesso não autorizado: loja não identificada");
      }
  
      // Listar Armazéns com filtros (POST)
      if (req.method === "POST") {
        const { filters } = req.body;
        const { nome, localizacao, capacidadeMin, capacidadeMax } = filters || {};
        
        let where = {
          loja: userLoja
        };
  
        if (nome) where.nome = { $regex: nome, $options: 'i' };
        if (localizacao) {
          where.$or = [
            { 'localizacao.pais': { $regex: localizacao, $options: 'i' } },
            { 'localizacao.estado': { $regex: localizacao, $options: 'i' } },
            { 'localizacao.cidade': { $regex: localizacao, $options: 'i' } }
          ];
        }
        if (capacidadeMin) where.capacidadeTotal = { $gte: Number(capacidadeMin) };
        if (capacidadeMax) {
          where.capacidadeTotal = where.capacidadeTotal || {};
          where.capacidadeTotal.$lte = Number(capacidadeMax);
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
        res.status(200).json(data.results);
      }
  
      // Adicionar Armazém (POST)
      else if (req.method === "POST") {
        const { nome, capacidadeTotal, localizacao } = req.body;
  
        const body = JSON.stringify({
          nome,
          capacidadeTotal: Number(capacidadeTotal) || 0,
          capacidadeOcupada: 0,
          localizacao: {
            pais: localizacao?.pais || "",
            estado: localizacao?.estado || "",
            cidade: localizacao?.cidade || "",
            endereco: localizacao?.endereco || ""
          },
          loja: userLoja,
          ACL: { [userLoja]: { read: true, write: true } }
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
        const { nome, capacidadeTotal, localizacao } = req.body;
  
        if (!objectId) {
          throw new Error("O campo 'objectId' é obrigatório para edição.");
        }
  
        // Primeiro verifica se o armazém pertence à loja do usuário
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
          throw new Error("Acesso não autorizado: este armazém pertence a outra loja.");
        }
  
        const body = JSON.stringify({
          nome,
          capacidadeTotal: Number(capacidadeTotal),
          localizacao: {
            pais: localizacao?.pais || existingArmazem.localizacao?.pais || "",
            estado: localizacao?.estado || existingArmazem.localizacao?.estado || "",
            cidade: localizacao?.cidade || existingArmazem.localizacao?.cidade || "",
            endereco: localizacao?.endereco || existingArmazem.localizacao?.endereco || ""
          }
        });
  
        const updateResponse = await fetch(`${BASE_URL}/${objectId}`, {
          method: "PUT",
          headers,
          body,
        });
  
        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          throw new Error(errorData.message || "Erro ao atualizar armazém.");
        }
  
        const data = await updateResponse.json();
        res.status(200).json(data);
      }
  
      // Excluir Armazém (DELETE)
      else if (req.method === "DELETE") {
        const { objectId } = req.query;
  
        if (!objectId) {
          throw new Error("O campo 'objectId' é obrigatório para exclusão.");
        }
  
        if (userAcess !== "Administrador") {
          throw new Error("Apenas administradores podem excluir armazéns.");
        }
  
        // Primeiro verifica se o armazém pertence à loja do usuário
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
          throw new Error("Acesso não autorizado: este armazém pertence a outra loja.");
        }
  
        const deleteResponse = await fetch(`${BASE_URL}/${objectId}`, {
          method: "DELETE",
          headers,
        });
  
        if (!deleteResponse.ok) {
          const errorData = await deleteResponse.json();
          throw new Error(errorData.message || "Erro ao excluir armazém.");
        }
  
        res.status(200).json({ success: true, message: "Armazém excluído com sucesso." });
      }
  
      // Método não suportado
      else {
        res.setHeader("Allow", ["POST", "PUT", "DELETE"]);
        res.status(405).json({ message: "Método não permitido." });
      }
    } catch (error) {
      console.error("Erro na API de armazéns:", error.message);
      res.status(500).json({ 
        success: false,
        message: error.message || "Erro interno no servidor." 
      });
    }
  }