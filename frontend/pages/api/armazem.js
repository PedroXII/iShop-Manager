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
        return res.status(400).json({ 
          success: false,
          message: "Loja não identificada" 
        });
      }
  
      // GET - Busca com Filtros Inteligentes
      if (req.method === "GET") {
        const { nome, localizacao, capacidadeMin, capacidadeMax } = req.query;
        
        let where = { loja: userLoja };
  
        // Busca parcial no nome (ex: "arm" → "Armazém 3")
        if (nome) where.nome = { 
          $regex: nome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 
          $options: 'i' 
        };
  
        // Busca unificada em cidade/estado/país
        if (localizacao) {
          const sanitizedLoc = localizacao.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          where.$or = [
            { cidade: { $regex: sanitizedLoc, $options: 'i' } },
            { estado: { $regex: sanitizedLoc, $options: 'i' } },
            { pais: { $regex: sanitizedLoc, $options: 'i' } }
          ];
        }
  
        // Filtros de capacidade
        if (capacidadeMin) where.capacidadeTotal = { $gte: Number(capacidadeMin) };
        if (capacidadeMax) where.capacidadeTotal = { ...where.capacidadeTotal, $lte: Number(capacidadeMax) };
  
        const response = await fetch(`${BASE_URL}?where=${encodeURIComponent(JSON.stringify(where))}`, {
          method: "GET",
          headers,
        });
  
        const data = await response.json();
        return res.status(200).json(data.results || []);
      }
  
      // ... (Mantido o resto do código CRUD)
    } catch (error) {
      console.error("Erro na API:", error);
      return res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }