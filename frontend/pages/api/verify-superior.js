// pages/api/verify-superior.js
export default async function handler(req, res) {
  if (req.method === "POST") {
    const { username, password, nivelRequerido, loja } = req.body;

    console.log("Dados recebidos:", { username, password, nivelRequerido, loja });

    // Verificar se todos os campos obrigatórios estão presentes
    if (!username || !password || !nivelRequerido || !loja) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios." });
    }

    try {
      // Verificar se o superior existe no Back4App
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

      // Se o superior não for encontrado ou a senha estiver incorreta
      if (!response.ok) {
        console.error("Erro ao verificar superior:", data);
        return res.status(400).json({ message: "Superior não encontrado ou senha incorreta." });
      }

      // Verificar o nível de acesso do superior
      if (data.acess !== nivelRequerido && data.acess !== "Primeiro Administrador") {
        return res.status(403).json({ message: "Superior não tem permissão para criar este usuário." });
      }

      // Verificar se o superior pertence à mesma loja
      if (data.loja !== loja) {
        return res.status(403).json({ message: "O superior não pertence à mesma loja." });
      }

      res.status(200).json({ message: "Superior verificado com sucesso!" });
    } catch (error) {
      console.error("Erro ao conectar com o Back4App:", error);
      res.status(500).json({ message: "Erro ao conectar com o servidor." });
    }
  } else {
    res.status(405).json({ message: "Método não permitido." });
  }
}