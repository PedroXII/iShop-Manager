// pages/api/register.js
export default async function handler(req, res) {
    if (req.method === "POST") {
      const { username, password, acess, idade } = req.body;
  
      try {
        const response = await fetch("https://parseapi.back4app.com/users", {
          method: "POST",
          headers: {
            "X-Parse-Application-Id": process.env.BACK4APP_APP_ID, // Usando variável de ambiente
            "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY, // Usando variável de ambiente
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
            acess,
            idade,
          }),
        });
  
        const data = await response.json();
        if (response.ok) {
          res.status(200).json({ message: "Usuário registrado com sucesso!" });
        } else {
          res.status(400).json({ message: data.error || "Erro ao registrar usuário." });
        }
      } catch (error) {
        res.status(500).json({ message: "Erro ao conectar com o servidor." });
      }
    } else {
      res.status(405).json({ message: "Método não permitido." });
    }
  }