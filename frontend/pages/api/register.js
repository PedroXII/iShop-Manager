export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { username, password, acess, idade, superiorUsername, superiorPassword, nomeLoja, lojaExistente, acao } = req.body;

  if (!username || !password || !acess || !idade) {
    return res.status(400).json({ message: "Todos os campos básicos são obrigatórios" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "A senha deve ter no mínimo 6 caracteres" });
  }

  try {
    let lojaId = null;

    if (acess === "Administrador" || acess === "Usuário") {
      if (!superiorUsername || !superiorPassword || !lojaExistente) {
        return res.status(400).json({ message: "Credenciais do superior e loja são obrigatórias" });
      }

      const loginResponse = await fetch("https://parseapi.back4app.com/login", {
        method: "POST",
        headers: {
          "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
          "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username: superiorUsername, password: superiorPassword })
      });

      if (!loginResponse.ok) {
        return res.status(400).json({ message: "Superior não encontrado ou senha incorreta" });
      }

      const loginData = await loginResponse.json();
      
      if (loginData.acess !== "Administrador") {
        return res.status(403).json({ message: "O superior não tem permissão para criar usuários" });
      }

      const userResponse = await fetch(`https://parseapi.back4app.com/users/${loginData.objectId}?include=loja`, {
        headers: {
          "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
          "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY
        }
      });

      const userData = await userResponse.json();
      
      if (!userData.loja || !userData.loja.objectId) {
        return res.status(403).json({ message: "O superior não está associado a nenhuma loja" });
      }

      if (userData.loja.objectId !== lojaExistente) {
        return res.status(403).json({ message: "O superior não pertence à loja selecionada" });
      }

      lojaId = lojaExistente;
    }

    if (acess === "Administrador" && acao === "novaLoja") {
      if (!nomeLoja) {
        return res.status(400).json({ message: "O nome da nova loja é obrigatório" });
      }

      const lojaResponse = await fetch("https://parseapi.back4app.com/classes/Loja", {
        method: "POST",
        headers: {
          "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
          "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nome: nomeLoja })
      });

      const lojaData = await lojaResponse.json();
      
      if (!lojaResponse.ok) {
        return res.status(400).json({ message: "Erro ao criar loja" });
      }

      lojaId = lojaData.objectId;
    }

    const newUserResponse = await fetch("https://parseapi.back4app.com/users", {
      method: "POST",
      headers: {
        "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
        "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        password,
        acess,
        idade: Number(idade),
        loja: {
          __type: "Pointer",
          className: "Loja",
          objectId: lojaId
        }
      })
    });

    const newUserData = await newUserResponse.json();
    
    if (!newUserResponse.ok) {
      return res.status(400).json({ message: "Erro ao criar usuário" });
    }

    if (acess === "Administrador" && acao === "novaLoja") {
      await fetch(`https://parseapi.back4app.com/classes/Loja/${lojaId}`, {
        method: "PUT",
        headers: {
          "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
          "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          primeiroAdministrador: {
            __type: "Pointer",
            className: "_User",
            objectId: newUserData.objectId
          }
        })
      });
    }

    return res.status(200).json({ message: "Usuário registrado com sucesso" });
  } catch (error) {
    return res.status(500).json({ message: "Erro interno no servidor", error: error.message });
  }
}
