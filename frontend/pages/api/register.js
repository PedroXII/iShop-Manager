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
      lojaExistente,
      acao
    } = req.body;

    try {
      // Validações básicas
      if (!username || !password || !acess || !idade) {
        return res.status(400).json({ message: "Preencha todos os campos obrigatórios" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Senha deve ter no mínimo 6 caracteres" });
      }

      let lojaId = null;
      let tempUserId = null;

      // Fluxo para Administradores
      if (acess === "Administrador") {
        if (acao === "novaLoja" && nomeLoja) {
          // Criar usuário temporário
          const tempUser = await fetch("https://parseapi.back4app.com/users", {
            method: "POST",
            headers: {
              "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
              "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              username: `temp_${Date.now()}`,
              password: "temp_pwd_123",
              acess: "Administrador",
              idade: 18,
              loja: { __type: "Pointer", className: "Loja", objectId: "temp" }
            })
          });

          const tempUserData = await tempUser.json();
          if (!tempUser.ok) throw new Error("Falha ao criar usuário temporário");
          tempUserId = tempUserData.objectId;

          // Criar nova loja
          const newStore = await fetch("https://parseapi.back4app.com/classes/Loja", {
            method: "POST",
            headers: {
              "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
              "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              nome: nomeLoja,
              primeiroAdministrador: {
                __type: "Pointer",
                className: "_User",
                objectId: tempUserId
              }
            })
          });

          const storeData = await newStore.json();
          if (!newStore.ok) throw new Error(storeData.error || "Erro ao criar loja");
          lojaId = storeData.objectId;
        } 
        else if (acao === "lojaExistente" && lojaExistente && superiorUsername && superiorPassword) {
          // Validar superior
          const authSuperior = await fetch("https://parseapi.back4app.com/login", {
            method: "POST",
            headers: {
              "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
              "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              username: superiorUsername,
              password: superiorPassword
            })
          });

          const superiorData = await authSuperior.json();
          if (!authSuperior.ok) {
            return res.status(401).json({ message: "Credenciais inválidas do administrador superior" });
          }

          // Buscar dados completos do superior
          const superiorCompleto = await fetch(
            `https://parseapi.back4app.com/users/${superiorData.objectId}?include=loja`,
            {
              headers: {
                "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
                "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY
              }
            }
          );

          const superiorFull = await superiorCompleto.json();
          
          // Validações
          if (superiorFull.acess !== "Administrador") {
            return res.status(403).json({ message: "O superior não é um administrador" });
          }

          if (superiorFull.loja?.objectId !== lojaExistente) {
            return res.status(403).json({ message: "O superior não pertence a esta loja" });
          }

          lojaId = lojaExistente;
        } else {
          return res.status(400).json({ message: "Parâmetros inválidos para administrador" });
        }
      }

      // Fluxo para Usuários
      if (acess === "Usuário") {
        if (!lojaExistente || !superiorUsername || !superiorPassword) {
          return res.status(400).json({ message: "Preencha todos os campos da loja" });
        }

        // Validar superior
        const authSuperior = await fetch("https://parseapi.back4app.com/login", {
          method: "POST",
          headers: {
            "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
            "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: superiorUsername,
            password: superiorPassword
          })
        });

        const superiorData = await authSuperior.json();
        if (!authSuperior.ok) {
          return res.status(401).json({ message: "Credenciais inválidas do administrador" });
        }

        // Verificar se é administrador
        if (superiorData.acess !== "Administrador") {
          return res.status(403).json({ message: "Apenas administradores podem criar usuários" });
        }

        // Verificar se pertence à mesma loja
        const superiorComLoja = await fetch(
          `https://parseapi.back4app.com/users/${superiorData.objectId}?include=loja`,
          { headers: {
              "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
              "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY
            }
          }
        );

        const lojaSuperior = await superiorComLoja.json();
        if (lojaSuperior.loja?.objectId !== lojaExistente) {
          return res.status(403).json({ message: "O administrador não pertence a esta loja" });
        }

        lojaId = lojaExistente;
      }

      // Criar usuário final
      const newUser = await fetch("https://parseapi.back4app.com/users", {
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

      const userData = await newUser.json();
      
      if (!newUser.ok) {
        throw new Error(userData.error || "Erro ao criar usuário");
      }

      // Atualizar primeiro administrador se for nova loja
      if (acao === "novaLoja" && tempUserId) {
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
              objectId: userData.objectId
            }
          })
        });

        // Remover usuário temporário
        await fetch(`https://parseapi.back4app.com/users/${tempUserId}`, {
          method: "DELETE",
          headers: {
            "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
            "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY
          }
        });
      }

      res.status(201).json({ 
        success: true,
        userId: userData.objectId,
        lojaId
      });

    } catch (error) {
      console.error("Erro no registro:", error);
      res.status(500).json({
        message: error.message || "Erro interno no servidor",
        details: error.stack
      });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: "Método não permitido" });
  }
}