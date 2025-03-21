// pages/api/verify-superior.js
export default async function handler(req, res) {
    if (req.method === "POST") {
      const { username, password, nivelRequerido } = req.body;
  
      try {
        // Verificar se o superior existe e tem o nível de acesso necessário
        const response = await fetch("https://parseapi.back4app.com/login", {
          method: "POST",
          headers: {
            "X-Parse-Application-Id": process.env.BACK4APP_APP_ID, // Usando variável de ambiente
            "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY, // Usando variável de ambiente
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        });
  
        const data = await response.json();
        if (response.ok) {
          // Verificar o nível de acesso do superior
          if (data.acess === nivelRequerido || data.acess === "Primeiro Administrador") {
            res.status(200).json({ message: "Superior verificado com sucesso!" });
          } else {
            res.status(403).json({ message: "Superior não tem permissão para criar este usuário." });
          }
        } else {
          res.status(400).json({ message: "Erro ao verificar superior." });
        }
      } catch (error) {
        res.status(500).json({ message: "Erro ao conectar com o servidor." });
      }
    } else {
      res.status(405).json({ message: "Método não permitido." });
    }
  }