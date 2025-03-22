// pages/api/register.js
export default async function handler(req, res) {
  if (req.method === "POST") {
    const { username, password, acess, idade, loja, superiorUsername, superiorPassword } = req.body;

    console.log("Dados recebidos:", { username, password, acess, idade, loja, superiorUsername, superiorPassword });

    // Verificar se todos os campos obrigatórios estão presentes
    if (!username || !password || !acess || !idade || !loja) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios." });
    }

    // Validação básica de senha (mínimo 6 caracteres)
    if (password.length < 6) {
      return res.status(400).json({ message: "A senha deve ter no mínimo 6 caracteres." });
    }

    try {
      // Verificar se o superior pertence à mesma loja (apenas se necessário)
      if (acess !== "Primeiro Administrador" && (superiorUsername && superiorPassword)) {
        const responseSuperior = await fetch("https://parseapi.back4app.com/login", {
          method: "POST",
          headers: {
            "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
            "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: superiorUsername,
            password: superiorPassword,
          }),
        });

        const dataSuperior = await responseSuperior.json();

        // Se o superior não for encontrado ou a senha estiver incorreta
        if (!responseSuperior.ok) {
          console.error("Erro ao verificar superior:", dataSuperior);
          return res.status(400).json({ message: "Superior não encontrado ou senha incorreta." });
        }

        // Verificar se o superior pertence à mesma loja
        if (dataSuperior.loja !== loja) {
          return res.status(403).json({ message: "O superior não pertence à mesma loja." });
        }
      }

      // Criar a loja se o usuário for o Primeiro Administrador
      let lojaId = loja; // Armazenará o ID da loja existente ou criada

      if (acess === "Primeiro Administrador") {
        const responseLoja = await fetch("https://parseapi.back4app.com/classes/Loja", {
          method: "POST",
          headers: {
            "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
            "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: loja, // Enviar o nome da loja como string
            tipo: "Loja Principal",
            administrador: username,
          }),
        });

        const dataLoja = await responseLoja.json();

        if (!responseLoja.ok) {
          console.error("Erro ao criar loja:", dataLoja);
          return res.status(400).json({ message: "Erro ao criar loja." });
        }

        lojaId = dataLoja.objectId; // Usar o ID da loja criada
      }

      // Criar o novo usuário no Back4App
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
          idade: Number(idade), // Garantir que a idade seja um número
          loja: lojaId, // Usar o ID da loja criada ou existente
        }),
      });

      const data = await response.json();
      console.log("Resposta do Back4App:", data);

      if (response.ok) {
        res.status(200).json({ message: "Usuário registrado com sucesso!" });
      } else {
        console.error("Erro ao criar usuário:", data);
        res.status(400).json({ message: data.error || "Erro ao registrar usuário." });
      }
    } catch (error) {
      console.error("Erro ao conectar com o Back4App:", error);
      res.status(500).json({ message: "Erro ao conectar com o servidor." });
    }
  } else {
    res.status(405).json({ message: "Método não permitido." });
  }
}