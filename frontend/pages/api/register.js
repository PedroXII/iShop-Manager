// pages/api/register.js
export default async function handler(req, res) {
    if (req.method === "POST") {
      const { username, password, acess, idade } = req.body;
  
      console.log("Dados recebidos:", { username, password, acess, idade }); // Log dos dados recebidos
  
      // Verificar se todos os campos obrigatórios estão presentes
      if (!username || !password || !acess || !idade) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios." });
      }
  
      try {
        const response = await fetch("https://parseapi.back4app.com/users", {
          method: "POST",
          headers: {
            "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
            "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
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
        console.log("Resposta do Back4App:", data); // Log da resposta do Back4App
  
        if (response.ok) {
          res.status(200).json({ message: "Usuário registrado com sucesso!" });
        } else {
          res.status(400).json({ message: data.error || "Erro ao registrar usuário." });
        }
      } catch (error) {
        console.error("Erro ao conectar com o Back4App:", error); // Log de erro
        res.status(500).json({ message: "Erro ao conectar com o servidor." });
      }
    } else {
      res.status(405).json({ message: "Método não permitido." });
    }
  }