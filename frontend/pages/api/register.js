// pages/api/register.js
export default async function handler(req, res) {
  if (req.method === "POST") {
    const { username, password, acess, idade, superiorUsername, superiorPassword, nomeLoja, loja, acao } = req.body;

    console.log("Dados recebidos:", { username, password, acess, idade, superiorUsername, superiorPassword, nomeLoja, loja, acao });

    // Verificar se todos os campos obrigatórios estão presentes
    if (!username || !password || !acess || !idade) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios." });
    }

    // Validação básica de senha (mínimo 6 caracteres)
    if (password.length < 6) {
      return res.status(400).json({ message: "A senha deve ter no mínimo 6 caracteres." });
    }

    try {
      let lojaId = loja; // Armazenará o ID da loja

      // Verificar se o superior pertence à mesma loja (apenas para usuários e administradores cadastrando em loja existente)
      if ((acess === "Usuário" || (acess === "Administrador" && acao === "lojaExistente")) && (superiorUsername && superiorPassword)) {
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
        if (dataSuperior.acess !== "Administrador" && dataSuperior.acess !== "Primeiro Administrador") {
          return res.status(403).json({ message: "O superior não tem permissão para criar este usuário." });
        }

        // Verificar se o superior pertence à mesma loja
        if (dataSuperior.loja.objectId !== loja) {
          console.log("Loja do superior:", dataSuperior.loja.objectId, "Loja do usuário:", loja);
          return res.status(403).json({ message: "O superior não pertence à mesma loja." });
        }
      }

      // Criar a nova loja se necessário (apenas para administradores)
      if (acess === "Administrador" && acao === "novaLoja") {
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
        console.log("Resultado da verificação de loja:", dataVerificarLoja);

        if (dataVerificarLoja.results.length > 0) {
          return res.status(400).json({ message: "Uma loja com esse nome já existe." });
        }

        // Criar a nova loja
        const responseLoja = await fetch("https://parseapi.back4app.com/classes/Loja", {
          method: "POST",
          headers: {
            "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
            "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: nomeLoja,
            primeiroAdministrador: {
              __type: "Pointer",
              className: "_User",
              objectId: username, // Será atualizado após criar o usuário
            },
          }),
        });

        const dataLoja = await responseLoja.json();
        console.log("Resposta da criação da loja:", dataLoja);

        if (!responseLoja.ok) {
          console.error("Erro ao criar loja:", dataLoja);
          return res.status(400).json({ message: "Erro ao criar loja." });
        }

        lojaId = dataLoja.objectId; // Define o ID da nova loja para o usuário
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
          loja: {
            __type: "Pointer",
            className: "Loja",
            objectId: lojaId
          },
        }),
      });

      const data = await response.json();
      console.log("Resposta do Back4App:", data);

      if (response.ok) {
        // Atualizar a loja com o primeiroAdministrador se for uma nova loja
        if (acess === "Administrador" && acao === "novaLoja") {
          await fetch(`https://parseapi.back4app.com/classes/Loja/${lojaId}`, {
            method: "PUT",
            headers: {
              "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
              "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              primeiroAdministrador: {
                __type: "Pointer",
                className: "_User",
                objectId: data.objectId,
              },
            }),
          });
        }
        
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