// pages/api/register.js
export default async function handler(req, res) {
  if (req.method === "POST") {
    const { username, password, acess, idade, superiorUsername, superiorPassword, nomeLoja, lojaExistente, acao } = req.body;

    console.log("Dados recebidos:", { username, password, acess, idade, superiorUsername, superiorPassword, nomeLoja, lojaExistente, acao });

    // Verificar campos obrigatórios básicos
    if (!username || !password || !acess || !idade) {
      return res.status(400).json({ message: "Todos os campos básicos são obrigatórios." });
    }

    // Validação de senha
    if (password.length < 6) {
      return res.status(400).json({ message: "A senha deve ter no mínimo 6 caracteres." });
    }

    try {
      let lojaId = null;
      let superiorData = null;

      // Lógica para Administradores
      if (acess === "Administrador") {
        if (!acao) {
          return res.status(400).json({ message: "Selecione uma ação (nova loja ou loja existente)." });
        }

        // Para nova loja
        if (acao === "novaLoja") {
          if (!nomeLoja) {
            return res.status(400).json({ message: "O nome da nova loja é obrigatório." });
          }

          // Verificar se loja já existe
          const checkLoja = await fetch(`https://parseapi.back4app.com/classes/Loja?where=${encodeURIComponent(JSON.stringify({ nome: nomeLoja }))}`, {
            method: "GET",
            headers: {
              "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
              "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
              "Content-Type": "application/json",
            },
          });

          const checkData = await checkLoja.json();
          if (checkData.results.length > 0) {
            return res.status(400).json({ message: "Uma loja com este nome já existe." });
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
              // primeiroAdministrador será atualizado depois de criar o usuário
            }),
          });

          const lojaData = await responseLoja.json();
          if (!responseLoja.ok) {
            return res.status(400).json({ message: "Erro ao criar loja: " + (lojaData.error || "Erro desconhecido") });
          }

          lojaId = lojaData.objectId;
        }
        // Para loja existente
        else if (acao === "lojaExistente") {
          if (!superiorUsername || !superiorPassword || !lojaExistente) {
            return res.status(400).json({ message: "Credenciais do superior e loja são obrigatórias." });
          }

          // Verificar superior
          const superiorResponse = await fetch("https://parseapi.back4app.com/login", {
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

          superiorData = await superiorResponse.json();
          if (!superiorResponse.ok) {
            return res.status(400).json({ message: "Superior não encontrado ou senha incorreta." });
          }

          // Verificar se é administrador
          if (superiorData.acess !== "Administrador") {
            return res.status(403).json({ message: "O superior não tem permissão para criar administradores." });
          }

          // Verificar se a loja do superior é a mesma selecionada
          if (!superiorData.loja || superiorData.loja.objectId !== lojaExistente) {
            return res.status(403).json({ message: "O superior não pertence à loja selecionada." });
          }

          lojaId = lojaExistente;
        }
      }
      // Lógica para Usuários
      else if (acess === "Usuário") {
        if (!superiorUsername || !superiorPassword || !lojaExistente) {
          return res.status(400).json({ message: "Credenciais do superior e loja são obrigatórias." });
        }

        // Verificar superior
        const superiorResponse = await fetch("https://parseapi.back4app.com/login", {
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

        superiorData = await superiorResponse.json();
        if (!superiorResponse.ok) {
          return res.status(400).json({ message: "Superior não encontrado ou senha incorreta." });
        }

        // Verificar se é administrador
        if (superiorData.acess !== "Administrador") {
          return res.status(403).json({ message: "O superior não tem permissão para criar usuários." });
        }

        // Verificar se a loja do superior é a mesma selecionada
        if (!superiorData.loja || superiorData.loja.objectId !== lojaExistente) {
          return res.status(403).json({ message: "O superior não pertence à loja selecionada." });
        }

        lojaId = lojaExistente;
      }

      // Criar o usuário
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
          loja: lojaId ? {
            __type: "Pointer",
            className: "Loja",
            objectId: lojaId,
          } : undefined,
        }),
      });

      const userData = await userResponse.json();
      if (!userResponse.ok) {
        // Se falhou, apagar a loja criada (se for o caso)
        if (acao === "novaLoja" && lojaId) {
          await fetch(`https://parseapi.back4app.com/classes/Loja/${lojaId}`, {
            method: "DELETE",
            headers: {
              "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
              "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
            },
          });
        }
        return res.status(400).json({ message: userData.error || "Erro ao criar usuário." });
      }

      // Se for administrador de nova loja, atualizar o primeiroAdministrador
      if (acao === "novaLoja" && lojaId) {
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
              objectId: userData.objectId,
            },
          }),
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