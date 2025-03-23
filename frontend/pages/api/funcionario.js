// pages/api/funcionario.js
export default async function handler(req, res) {
    if (req.method === "GET") {
      const { loja } = req.query;
  
      if (!loja) {
        return res.status(400).json({ message: "Loja não especificada." });
      }
  
      try {
        const response = await fetch(`https://parseapi.back4app.com/classes/Funcionario?where={"loja":"${loja}"}`, {
          method: "GET",
          headers: {
            "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
            "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
          },
        });
  
        const data = await response.json();
  
        if (response.ok) {
          res.status(200).json(data.results);
        } else {
          res.status(400).json({ message: data.error || "Erro ao buscar funcionários." });
        }
      } catch (error) {
        res.status(500).json({ message: "Erro ao conectar com o servidor." });
      }
    } else {
      res.status(405).json({ message: "Método não permitido." });
    }
  }