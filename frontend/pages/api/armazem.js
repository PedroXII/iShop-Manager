export default async function handler(req, res) {
    const BASE_URL = "https://parseapi.back4app.com/classes/Armazem";
    const APP_ID = process.env.BACK4APP_APP_ID;
    const JS_KEY = process.env.BACK4APP_JS_KEY;
  
    const headers = {
      "X-Parse-Application-Id": APP_ID,
      "X-Parse-JavaScript-Key": JS_KEY,
      "Content-Type": "application/json",
    };
  
    console.log("Requisição recebida:", req.method, req.query, req.body);
  
    try {
      // Listar Armazéns (GET)
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
          console.error("Erro ao carregar armazéns:", errorData);
          throw new Error(errorData.message || "Erro ao carregar armazéns.");
        }
  
        const data = await response.json();
        console.log("Armazéns carregados:", data.results);
        res.status(200).json(data.results);
      }
  
      // Adicionar Armazém (POST)
      else if (req.method === "POST") {
        const { nome, capacidadeTotal, CEP, pais, estado, cidade, rua, complemento, loja } = req.body;
  
        if (!loja) {
          throw new Error("O campo 'loja' é obrigatório.");
        }
  
        const body = JSON.stringify({
          nome,
          capacidadeTotal: capacidadeTotal || 0,
          capacidadeOcupada: 0, // Valor padrão
          CEP: CEP || "",
          pais: pais || "",
          estado: estado || "",
          cidade: cidade || "",
          rua: rua || "",
          complemento: complemento || "",
          loja,
          ACL: { [loja]: { read: true, write: true } } // Permissões de acesso
        });
  
        console.log("Corpo da requisição:", body);
  
        const response = await fetch(BASE_URL, {
          method: "POST",
          headers,
          body,
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro ao adicionar armazém:", errorData);
          throw new Error(errorData.message || "Erro ao adicionar armazém.");
        }
  
        const data = await response.json();
        console.log("Armazém adicionado:", data);
        res.status(201).json(data);
      }
  
      // Editar Armazém (PUT)
      else if (req.method === "PUT") {
        const { objectId } = req.query;
        const { nome, capacidadeTotal, capacidadeOcupada, CEP, pais, estado, cidade, rua, complemento, loja } = req.body;
  
        if (!objectId) {
          throw new Error("O campo 'objectId' é obrigatório para edição.");
        }
  
        const body = JSON.stringify({
          nome,
          capacidadeTotal,
          capacidadeOcupada,
          CEP,
          pais,
          estado,
          cidade,
          rua,
          complemento,
          loja
        });
  
        const response = await fetch(`${BASE_URL}/${objectId}`, {
          method: "PUT",
          headers,
          body,
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro ao atualizar armazém:", errorData);
          throw new Error(errorData.message || "Erro ao atualizar armazém.");
        }
  
        const data = await response.json();
        console.log("Armazém atualizado:", data);
        res.status(200).json(data);
      }
  
      // Excluir Armazém (DELETE)
      else if (req.method === "DELETE") {
        const { objectId } = req.query;
        const userAcess = req.headers['x-user-acess'];
  
        if (!objectId) {
          throw new Error("O campo 'objectId' é obrigatório para exclusão.");
        }
  
        if (userAcess !== "Administrador") {
          throw new Error("Apenas administradores podem excluir armazéns.");
        }
  
        const response = await fetch(`${BASE_URL}/${objectId}`, {
          method: "DELETE",
          headers,
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro ao excluir armazém:", errorData);
          throw new Error(errorData.message || "Erro ao excluir armazém.");
        }
  
        console.log("Armazém excluído:", objectId);
        res.status(200).json({ success: true, message: "Armazém excluído com sucesso." });
      }
  
      // Método não suportado
      else {
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
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