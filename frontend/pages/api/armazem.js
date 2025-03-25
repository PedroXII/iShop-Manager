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
  
      if (!userLoja) return res.status(400).json({ success: false, message: "Loja não identificada" });
  
      // GET - Listar com filtros
      if (req.method === "GET") {
        const { nome, localizacao, capacidadeMin, capacidadeMax } = req.query;
        
        const where = { loja: userLoja };
        if (nome) where.nome = { $regex: nome, $options: 'i' };
        if (localizacao) where.$or = [
          { pais: { $regex: localizacao, $options: 'i' } },
          { estado: { $regex: localizacao, $options: 'i' } },
          { cidade: { $regex: localizacao, $options: 'i' } }
        ];
        if (capacidadeMin) where.capacidadeTotal = { $gte: Number(capacidadeMin) };
        if (capacidadeMax) where.capacidadeTotal = { ...where.capacidadeTotal, $lte: Number(capacidadeMax) };

        const response = await fetch(`${BASE_URL}?where=${encodeURIComponent(JSON.stringify(where))}`, { headers });
        const data = await response.json();
        return res.status(response.ok ? 200 : 400).json(response.ok ? data.results : { error: data.message });
      }

      // POST - Criar
      else if (req.method === "POST") {
        const { nome, capacidadeTotal } = req.body;
        if (!nome || !capacidadeTotal) return res.status(400).json({ success: false, message: "Campos obrigatórios faltando" });

        const body = JSON.stringify({
          ...req.body,
          capacidadeTotal: Number(capacidadeTotal),
          capacidadeOcupada: 0,
          loja: userLoja,
          ACL: { [userLoja]: { read: true, write: true } }
        });

        const response = await fetch(BASE_URL, { method: "POST", headers, body });
        const data = await response.json();
        return res.status(response.ok ? 201 : 400).json(data);
      }

      // PUT - Atualizar
      else if (req.method === "PUT") {
        const { objectId } = req.query;
        if (!objectId) return res.status(400).json({ success: false, message: "ID não fornecido" });

        const verifyRes = await fetch(`${BASE_URL}/${objectId}`, { headers });
        const existingData = await verifyRes.json();
        if (existingData.loja !== userLoja) return res.status(403).json({ success: false, message: "Acesso não autorizado" });

        const body = JSON.stringify({ ...req.body, capacidadeTotal: Number(req.body.capacidadeTotal) });
        const response = await fetch(`${BASE_URL}/${objectId}`, { method: "PUT", headers, body });
        return res.status(response.ok ? 200 : 400).json(await response.json());
      }

      // DELETE - Excluir
      else if (req.method === "DELETE") {
        const { objectId } = req.query;
        if (!objectId) return res.status(400).json({ success: false, message: "ID não fornecido" });
        if (userAcess !== "Administrador") return res.status(403).json({ success: false, message: "Acesso negado" });

        const verifyRes = await fetch(`${BASE_URL}/${objectId}`, { headers });
        const existingData = await verifyRes.json();
        if (existingData.loja !== userLoja) return res.status(403).json({ success: false, message: "Acesso não autorizado" });

        const response = await fetch(`${BASE_URL}/${objectId}`, { method: "DELETE", headers });
        return res.status(response.ok ? 200 : 400).json({ success: response.ok, message: response.ok ? "Armazém excluído" : "Erro na exclusão" });
      }

      else {
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        return res.status(405).json({ success: false, message: "Método não permitido" });
      }
    } catch (error) {
      console.error("Erro na API:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
}