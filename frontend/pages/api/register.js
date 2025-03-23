// pages/api/register.js
export default async function handler(req, res) {
  if (req.method === "POST") {
    const { username, password, acess, idade, superiorUsername, superiorPassword, nomeLoja, acao, loja } = req.body;

    console.log("Dados recebidos:", { username, password, acess, idade, superiorUsername, superiorPassword, nomeLoja, acao, loja });

    // Verificar se todos os campos obrigatórios estão presentes
    if (!username || !password || !acess || !idade) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios." });
    }

    // Validação básica de senha (mínimo 6 caracteres)
    if (password.length < 6) {
      return res.status(400).json({ message: "A senha deve ter no mínimo 6 caracteres." });
    }

    try {
      let lojaId = null; // Armazenará o ID da loja principal (se houver)

      // Verificar se o superior pertence à mesma loja (apenas para usuários)
      if (acess === "Usuário" && (superiorUsername && superiorPassword)) {
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

        // Verificar se o superior é um administrador
        if (dataSuperior.acess !== "Administrador") {
          return res.status(403).json({ message: "O superior não tem permissão para criar este usuário." });
        }

        // Obter o ID da loja do superior (loja principal)
        lojaId = dataSuperior.loja.objectId;
      }

      // Criar a loja parceira se necessário (apenas para administradores)
      if (acess === "Administrador" && acao === "lojaParceira") {
        // Autenticar o administrador da loja principal
        const responseAdmin = await fetch("https://parseapi.back4app.com/login", {
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

        const dataAdmin = await responseAdmin.json();

        // Se o administrador não for encontrado ou a senha estiver incorreta
        if (!responseAdmin.ok) {
          console.error("Erro ao autenticar administrador:", dataAdmin);
          return res.status(400).json({ message: "Administrador não encontrado ou senha incorreta." });
        }

        // Obter o ID da loja principal do administrador
        lojaId = dataAdmin.loja.objectId;

        // Verificar se a loja já existe para evitar duplicação
        const responseVerificarLoja = await fetch(`https://parseapi.back4app.com/classes/Loja?where={"nome":"${nomeLoja}"}`, {
          method: "GET",
          headers: {
            "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
            "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
            "Content-Type": "application/json",
          },
        });

        const dataVerificarLoja = await responseVerificarLoja.json();

        if (dataVerificarLoja.results.length > 0) {
          return res.status(400).json({ message: "Uma loja com esse nome já existe." });
        }

        // Criar a nova loja parceira
        const responseLoja = await fetch("https://parseapi.back4app.com/classes/Loja", {
          method: "POST",
          headers: {
            "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
            "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: nomeLoja, // Nome da loja parceira
            primeiroAdministrador: {
              __type: "Pointer",
              className: "_User",
              objectId: username, // ID do administrador que está criando a loja
            },
          }),
        });

        const dataLoja = await responseLoja.json();

        if (!responseLoja.ok) {
          console.error("Erro ao criar loja:", dataLoja);
          return res.status(400).json({ message: "Erro ao criar loja." });
        }

        const lojaParceiraId = dataLoja.objectId; // ID da nova loja parceira

        // Adicionar o ID da loja parceira ao array lojasParceiras da loja principal
        const responseAtualizarLojaPrincipal = await fetch(`https://parseapi.back4app.com/classes/Loja/${lojaId}`, {
          method: "PUT",
          headers: {
            "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
            "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lojasParceiras: {
              __op: "Add",
              objects: [lojaParceiraId], // Adiciona o ID da loja parceira ao array
            },
          }),
        });

        const dataAtualizarLojaPrincipal = await responseAtualizarLojaPrincipal.json();

        if (!responseAtualizarLojaPrincipal.ok) {
          console.error("Erro ao atualizar loja principal:", dataAtualizarLojaPrincipal);
          return res.status(400).json({ message: "Erro ao atualizar loja principal." });
        }
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
          idade: Number(idade),
          loja: lojaId, // ID da loja principal (se houver)
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