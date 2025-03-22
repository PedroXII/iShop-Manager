// pages/api/listar-lojas.js
export default async function handler(req, res) {
    if (req.method === "GET") {
      try {
        // Fazer a requisição para o Back4App para listar as lojas
        const response = await fetch("https://parseapi.back4app.com/classes/Loja", {
          method: "GET",
          headers: {
            "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
            "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
            "Content-Type": "application/json",
          },
        });
  
        const data = await response.json();
  
        if (response.ok) {
          // Retornar a lista de lojas
          res.status(200).json({ lojas: data.results });
        } else {
          console.error("Erro ao listar lojas:", data);
          res.status(400).json({ message: "Erro ao carregar lojas." });
        }
      } catch (error) {
        console.error("Erro ao conectar com o Back4App:", error);
        res.status(500).json({ message: "Erro ao conectar com o servidor." });
      }
    } else {
      res.status(405).json({ message: "Método não permitido." });
    }
  }