export default async function handler(req, res) {
    const { method, query, body } = req;
    const { objectId } = query;
    const loja = req.headers['x-user-loja'];
    const acess = req.headers['x-user-acess'];
  
    // Verificar autenticação
    if (!loja) {
      return res.status(401).json({ message: "Não autenticado" });
    }
  
    // Configurações do Back4App
    const headers = {
      "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
      "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
      "Content-Type": "application/json",
    };
  
    try {
      // Operação de pesquisa (GET)
      if (method === "GET") {
        const { nome, localizacao } = query;
        
        let where = { loja };
        if (nome) where.nome = { $regex: nome, $options: "i" };
        if (localizacao) {
          where.$or = [
            { pais: { $regex: localizacao, $options: "i" } },
            { estado: { $regex: localizacao, $options: "i" } },
            { cidade: { $regex: localizacao, $options: "i" } },
          ];
        }
  
        const response = await fetch(`https://parseapi.back4app.com/classes/Armazem?where=${encodeURIComponent(JSON.stringify(where))}`, {
          headers,
        });
        const data = await response.json();
        return res.status(200).json(data.results || []);
      }
  
      // Operação de criação (POST)
      if (method === "POST") {
        const response = await fetch("https://parseapi.back4app.com/classes/Armazem", {
          method: "POST",
          headers,
          body: JSON.stringify({
            ...body,
            ACL: { [loja]: { read: true, write: true } }
          }),
        });
        const data = await response.json();
        return res.status(response.ok ? 200 : 400).json(data);
      }
  
      // Operação de atualização (PUT)
      if (method === "PUT") {
        if (acess !== "Administrador") {
          return res.status(403).json({ message: "Apenas administradores podem atualizar armazéns" });
        }
  
        const response = await fetch(`https://parseapi.back4app.com/classes/Armazem/${objectId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(body),
        });
        const data = await response.json();
        return res.status(response.ok ? 200 : 400).json(data);
      }
  
      // Operação de exclusão (DELETE)
      if (method === "DELETE") {
        if (acess !== "Administrador") {
          return res.status(403).json({ message: "Apenas administradores podem excluir armazéns" });
        }
  
        const response = await fetch(`https://parseapi.back4app.com/classes/Armazem/${objectId}`, {
          method: "DELETE",
          headers,
        });
        return res.status(response.ok ? 200 : 400).json({ success: response.ok });
      }
  
      // Método não permitido
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      return res.status(405).json({ message: "Método não permitido" });
    } catch (error) {
      console.error("Erro na API de armazém:", error);
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  }