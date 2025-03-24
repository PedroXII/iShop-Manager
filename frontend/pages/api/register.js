export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { username, password, acess, idade, superiorUsername, superiorPassword, nomeLoja, lojaExistente, acao } = req.body;

  console.log("Recebendo solicitação de registro:", req.body);

  if (!username || !password || !acess || !idade) {
    console.error("Erro: Campos obrigatórios ausentes");
    return res.status(400).json({ message: "Todos os campos básicos são obrigatórios" });
  }

  if (password.length < 6) {
    console.error("Erro: Senha curta");
    return res.status(400).json({ message: "A senha deve ter no mínimo 6 caracteres" });
  }

  try {
    let lojaId = null;

    if (acess === "Administrador" && acao === "novaLoja") {
      if (!nomeLoja) {
        console.error("Erro: Nome da nova loja ausente");
        return res.status(400).json({ message: "O nome da nova loja é obrigatório" });
      }

      console.log("Criando nova loja:", nomeLoja);

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
      console.log("Nova loja criada:", lojaData);
      
      if (!lojaResponse.ok) {
        console.error("Erro ao criar loja");
        return res.status(400).json({ message: "Erro ao criar loja" });
      }

      lojaId = lojaData.objectId;
    } else {
      if (!superiorUsername || !superiorPassword || !lojaExistente) {
        console.error("Erro: Credenciais do superior ausentes");
        return res.status(400).json({ message: "Credenciais do superior e loja são obrigatórias" });
      }

      console.log("Verificando superior:", superiorUsername);

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
        console.error("Erro: Superior não encontrado ou senha incorreta");
        return res.status(400).json({ message: "Superior não encontrado ou senha incorreta" });
      }

      const loginData = await loginResponse.json();
      console.log("Dados do superior:", loginData);
      
      if (loginData.acess !== "Administrador") {
        console.error("Erro: Superior sem permissão para criar usuários");
        return res.status(403).json({ message: "O superior não tem permissão para criar usuários" });
      }

      console.log("Buscando loja do superior...");
      const userResponse = await fetch(`https://parseapi.back4app.com/users/${loginData.objectId}?include=loja`, {
        headers: {
          "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
          "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY
        }
      });

      const userData = await userResponse.json();
      console.log("Dados completos do superior:", userData);
      
      if (!userData.loja || !userData.loja.objectId) {
        console.error("Erro: Superior sem loja associada");
        return res.status(403).json({ message: "O superior não está associado a nenhuma loja" });
      }

      if (userData.loja.objectId !== lojaExistente) {
        console.error("Erro: Superior não pertence à loja selecionada", {
          lojaSuperior: userData.loja.objectId,
          lojaSelecionada: lojaExistente
        });
        return res.status(403).json({ message: "O superior não pertence à loja selecionada" });
      }

      lojaId = lojaExistente;
    }

    console.log("Criando novo usuário:", username);

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
    console.log("Usuário criado:", newUserData);
    
    if (!newUserResponse.ok) {
      console.error("Erro ao criar usuário", newUserData);
      return res.status(400).json({ message: "Erro ao criar usuário" });
    }

    return res.status(200).json({ message: "Usuário registrado com sucesso" });
  } catch (error) {
    console.error("Erro interno no servidor:", error);
    return res.status(500).json({ message: "Erro interno no servidor", error: error.message });
  }
}
