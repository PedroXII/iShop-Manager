// pages/api/login.js
export default async function handler(req, res) {
  if (req.method === "POST") {
    const { username, password } = req.body;

    console.log("Dados recebidos:", { username, password });

    // Verificar se todos os campos obrigatórios estão presentes
    if (!username || !password) {
      console.error("Campos obrigatórios faltando.");
      return res.status(400).json({ message: "Todos os campos são obrigatórios." });
    }

    try {
      // Autenticar o usuário no Back4App
      const response = await fetch("https://parseapi.back4app.com/login", {
        method: "POST",
        headers: {
          "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
          "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();
      console.log("Resposta do Back4App:", data);

      if (response.ok) {
        // Retornar os dados do usuário autenticado, incluindo o nível de acesso e a loja
        res.status(200).json({
          message: "Login bem-sucedido!",
          user: data,
          nivelAcesso: data.acess, // Nível de acesso do usuário
          loja: data.loja, // Loja do usuário
        });
      } else {
        console.error("Erro ao fazer login:", data.error);
        res.status(400).json({ message: data.error || "Erro ao fazer login." });
      }
    } catch (error) {
      console.error("Erro ao conectar com o Back4App:", error);
      res.status(500).json({ message: "Erro ao conectar com o servidor." });
    }
  } else {
    res.status(405).json({ message: "Método não permitido." });
  }
}