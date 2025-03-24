// pages/api/register.js
export default async function handler(req, res) {
  if (req.method === "POST") {
    const { 
      username, 
      password, 
      acess, 
      idade, 
      superiorUsername, 
      superiorPassword, 
      nomeLoja, 
      loja, 
      acao 
    } = req.body;

    console.log("Dados recebidos:", { 
      username, 
      password, 
      acess, 
      idade, 
      superiorUsername, 
      superiorPassword, 
      nomeLoja, 
      loja, 
      acao 
    });

    // Validações básicas
    if (!username || !password || !acess || !idade) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "A senha deve ter no mínimo 6 caracteres." });
    }

    try {
      let lojaId = loja;

      // Verificação do superior (para usuários ou administradores em loja existente)
      if ((acess === "Usuário" || (acess === "Administrador" && acao === "lojaExistente")) && 
          superiorUsername && superiorPassword) {
        
        // 1. Fazer login do superior para verificar credenciais
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

        const loginData = await loginResponse.json();

        if (!loginResponse.ok) {
          console.error("Erro ao verificar superior:", loginData);
          return res.status(400).json({ 
            message: "Credenciais do superior inválidas." 
          });
        }

        // 2. Buscar dados completos do superior incluindo a loja
        const superiorResponse = await fetch(
          `https://parseapi.back4app.com/users/${loginData.objectId}?include=loja`, 
          {
            method: "GET",
            headers: {
              "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
              "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
            },
          }
        );

        const superiorComLoja = await superiorResponse.json();
        
        if (!superiorResponse.ok) {
          console.error("Erro ao buscar dados do superior:", superiorComLoja);
          return res.status(400).json({ 
            message: "Erro ao verificar dados do superior." 
          });
        }

        // Verificar nível de acesso
        if (superiorComLoja.acess !== "Administrador" && 
            superiorComLoja.acess !== "Primeiro Administrador") {
          return res.status(403).json({ 
            message: "O superior não tem permissão para criar este usuário." 
          });
        }

        // Verificar se pertence à mesma loja
        if (superiorComLoja.loja?.objectId !== lojaId) {
          console.log("Loja do superior:", superiorComLoja.loja?.objectId, 
                     "Loja do usuário:", lojaId);
          return res.status(403).json({ 
            message: "O superior não pertence à mesma loja." 
          });
        }
      }

      // Criar nova loja se necessário (para administradores)
      if (acess === "Administrador" && acao === "novaLoja") {
        // Verificar se loja já existe
        const verificarLojaResponse = await fetch(
          `https://parseapi.back4app.com/classes/Loja?where=${encodeURIComponent(
            JSON.stringify({ nome: nomeLoja })
          )}`, 
          {
            method: "GET",
            headers: {
              "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
              "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
            },
          }
        );

        const lojaData = await verificarLojaResponse.json();

        if (lojaData.results?.length > 0) {
          return res.status(400).json({ 
            message: "Uma loja com esse nome já existe." 
          });
        }

        // Criar nova loja
        const criarLojaResponse = await fetch(
          "https://parseapi.back4app.com/classes/Loja", 
          {
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
          }
        );

        const novaLoja = await criarLojaResponse.json();

        if (!criarLojaResponse.ok) {
          console.error("Erro ao criar loja:", novaLoja);
          return res.status(400).json({ 
            message: "Erro ao criar loja." 
          });
        }

        lojaId = novaLoja.objectId;
      }

      // Criar o novo usuário
      const userResponse = await fetch(
        "https://parseapi.back4app.com/users", 
        {
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
        }
      );

      const userData = await userResponse.json();

      if (userResponse.ok) {
        // Atualizar primeiroAdministrador se for nova loja
        if (acess === "Administrador" && acao === "novaLoja") {
          await fetch(
            `https://parseapi.back4app.com/classes/Loja/${lojaId}`, 
            {
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
            }
          );
        }

        return res.status(200).json({ 
          message: "Usuário registrado com sucesso!" 
        });
      } else {
        console.error("Erro ao criar usuário:", userData);
        return res.status(400).json({ 
          message: userData.error || "Erro ao registrar usuário." 
        });
      }
    } catch (error) {
      console.error("Erro no servidor:", error);
      return res.status(500).json({ 
        message: "Erro interno no servidor." 
      });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ 
      message: `Método ${req.method} não permitido.` 
    });
  }
}