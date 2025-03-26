// pages/api/promocao.js
export default async function handler(req, res) {
    const BASE_URL = "https://parseapi.back4app.com/classes/Promocao";
    const APP_ID = process.env.BACK4APP_APP_ID;
    const JS_KEY = process.env.BACK4APP_JS_KEY;
  
    const headers = {
      "X-Parse-Application-Id": APP_ID,
      "X-Parse-JavaScript-Key": JS_KEY,
      "Content-Type": "application/json",
    };
  
    console.log("Requisição recebida:", req.method, req.body);
  
    try {
      // Listar Promoções (GET)
      if (req.method === "GET") {
        const { loja, nome, porcentagemDesconto, tipoProduto, produto } = req.query;
  
        if (!loja) {
          throw new Error("O campo 'loja' é obrigatório.");
        }
  
        let where = { loja };
        if (nome) where.nome = { $regex: nome, $options: "i" };
        if (porcentagemDesconto) where.porcentagemDesconto = Number(porcentagemDesconto);
        if (tipoProduto) where.tipoProduto = tipoProduto;
        if (produto) where.produto = produto;
  
        const response = await fetch(`${BASE_URL}?where=${encodeURIComponent(JSON.stringify(where))}`, {
          method: "GET",
          headers,
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro ao carregar promoções:", errorData);
          throw new Error(errorData.message || "Erro ao carregar promoções.");
        }
  
        const data = await response.json();
        
        // Formatando a resposta para o frontend
        const formattedResults = data.results.map(promocao => ({
          ...promocao,
          inicio: promocao.inicio?.iso || null,
          fim: promocao.fim?.iso || null
        }));
  
        console.log("Promoções carregadas:", formattedResults);
        res.status(200).json(formattedResults);
      }
  
      // Adicionar Promoção (POST)
      else if (req.method === "POST") {
        const { nome, porcentagemDesconto, loja, inicio, fim, produto, tipoProduto } = req.body;
  
        if (!nome || !loja) {
          throw new Error("Os campos 'nome' e 'loja' são obrigatórios.");
        }
  
        if (produto && tipoProduto) {
          throw new Error("Uma promoção não pode ter ambos 'produto' e 'tipoProduto' preenchidos.");
        }
  
        const promocaoData = {
          nome,
          porcentagemDesconto: porcentagemDesconto ? Number(porcentagemDesconto) : undefined,
          loja,
          produto: produto || undefined,
          tipoProduto: tipoProduto || undefined
        };
  
        // Formatar datas no formato específico do Back4App
        if (inicio) {
          promocaoData.inicio = {
            __type: "Date",
            iso: new Date(inicio).toISOString()
          };
        }
  
        if (fim) {
          promocaoData.fim = {
            __type: "Date",
            iso: new Date(fim).toISOString()
          };
        }
  
        const response = await fetch(BASE_URL, {
          method: "POST",
          headers,
          body: JSON.stringify(promocaoData),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro ao adicionar promoção:", errorData);
          throw new Error(errorData.message || "Erro ao adicionar promoção.");
        }
  
        const data = await response.json();
        console.log("Promoção adicionada:", data);
        res.status(201).json(data);
      }
  
      // Editar Promoção (PUT)
      else if (req.method === "PUT") {
        const { objectId } = req.query;
        const { nome, porcentagemDesconto, loja, inicio, fim, produto, tipoProduto } = req.body;
  
        if (!objectId) {
          throw new Error("O campo 'objectId' é obrigatório para edição.");
        }
  
        if (produto && tipoProduto) {
          throw new Error("Uma promoção não pode ter ambos 'produto' e 'tipoProduto' preenchidos.");
        }
  
        const promocaoData = {
          nome,
          porcentagemDesconto: porcentagemDesconto ? Number(porcentagemDesconto) : undefined,
          loja,
          produto: produto || undefined,
          tipoProduto: tipoProduto || undefined
        };
  
        if (inicio) {
          promocaoData.inicio = {
            __type: "Date",
            iso: new Date(inicio).toISOString()
          };
        }
  
        if (fim) {
          promocaoData.fim = {
            __type: "Date",
            iso: new Date(fim).toISOString()
          };
        }
  
        const response = await fetch(`${BASE_URL}/${objectId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(promocaoData),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro ao atualizar promoção:", errorData);
          throw new Error(errorData.message || "Erro ao atualizar promoção.");
        }
  
        const data = await response.json();
        console.log("Promoção atualizada:", data);
        res.status(200).json(data);
      }
  
      // Excluir Promoção (DELETE)
      else if (req.method === "DELETE") {
        const { objectId } = req.query;
  
        if (!objectId) {
          throw new Error("O campo 'objectId' é obrigatório para exclusão.");
        }
  
        const response = await fetch(`${BASE_URL}/${objectId}`, {
          method: "DELETE",
          headers,
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro ao excluir promoção:", errorData);
          throw new Error(errorData.message || "Erro ao excluir promoção.");
        }
  
        console.log("Promoção excluída:", objectId);
        res.status(200).json({ message: "Promoção excluída com sucesso." });
      }
  
      // Método não suportado
      else {
        res.status(405).json({ message: "Método não permitido." });
      }
    } catch (error) {
      console.error("Erro na API:", error.message);
      res.status(500).json({ message: error.message || "Erro interno no servidor." });
    }
  }