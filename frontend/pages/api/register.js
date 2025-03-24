// pages/api/register.js
export default async function handler(req, res) {
  if (req.method === "POST") {
    const { username, password, acess, idade, superiorUsername, superiorPassword, nomeLoja, lojaExistente, acao } = req.body;

    console.log("Dados recebidos:", { username, password, acess, idade, superiorUsername, superiorPassword, nomeLoja, lojaExistente, acao });

    // Verificações básicas
    if (!username || !password || !acess || !idade) {
      return res.status(400).json({ message: "Todos os campos básicos são obrigatórios." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "A senha deve ter no mínimo 6 caracteres." });
    }

    try {
      let lojaId = null;

      // Lógica para Administradores em loja existente
      if (acess === "Administrador" && acao === "lojaExistente") {
        if (!superiorUsername || !superiorPassword || !lojaExistente) {
          return res.status(400).json({ message: "Credenciais do superior e loja são obrigatórias." });
        }

        // Primeiro: Verificar se o superior existe e é administrador
        const loginResponse = await fetch("https://parseapi.back4app.com/login", {
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

        if (!loginResponse.ok) {
          const errorData = await loginResponse.json();
          return res.status(400).json({ 
            message: "Superior não encontrado ou senha incorreta.",
            detail: errorData.error || "Erro desconhecido"
          });
        }

        const loginData = await loginResponse.json();
        
        if (loginData.acess !== "Administrador") {
          return res.status(403).json({ message: "O superior não tem permissão para criar administradores." });
        }

        // Segundo: Buscar a loja do superior usando uma query
        const queryResponse = await fetch(`https://parseapi.back4app.com/classes/_User/${loginData.objectId}?keys=loja`, {
          method: "GET",
          headers: {
            "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
            "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
            "Content-Type": "application/json",
          },
        });

        if (!queryResponse.ok) {
          const errorData = await queryResponse.json();
          console.error("Erro ao buscar loja do superior:", errorData);
          return res.status(400).json({ 
            message: "Erro ao verificar a loja do superior.",
            detail: errorData.error || "Erro desconhecido"
          });
        }

        const userData = await queryResponse.json();
        
        if (!userData.loja || !userData.loja.objectId) {
          return res.status(403).json({ 
            message: "O superior não está associado a nenhuma loja.",
            debug: userData
          });
        }

        if (userData.loja.objectId !== lojaExistente) {
          return res.status(403).json({ 
            message: "O superior não pertence à loja selecionada.",
            detail: `Loja do superior: ${userData.loja.objectId}, Loja selecionada: ${lojaExistente}`
          });
        }

        lojaId = lojaExistente;
      }
      // ... (restante do código para outros casos)

      // Criar o novo usuário
      const userResponse = await fetch("https://parseapi.back4app.com/users", {
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
          idade: Number(idade),
          loja: {
            __type: "Pointer",
            className: "Loja",
            objectId: lojaId,
          },
        }),
      });

      const newUserData = await userResponse.json();
      if (!userResponse.ok) {
        return res.status(400).json({ 
          message: "Erro ao criar usuário",
          detail: newUserData.error || "Erro desconhecido"
        });
      }

      res.status(200).json({ message: "Usuário registrado com sucesso!" });

    } catch (error) {
      console.error("Erro no servidor:", error);
      res.status(500).json({ message: "Erro interno no servidor." });
    }
  } else {
    res.status(405).json({ message: "Método não permitido." });
  }
}