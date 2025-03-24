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
      lojaExistente
    } = req.body;

    try {
      // Validação básica
      if (!username || !password || !acess || !idade) {
        return res.status(400).json({ message: "Campos obrigatórios faltando" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Senha precisa ter no mínimo 6 caracteres" });
      }

      let lojaId;
      let superiorLojaId;

      // Lógica para Administradores
      if (acess === "Administrador") {
        // Caso 1: Criando nova loja
        if (nomeLoja) {
          // Verificar se loja já existe
          const checkStore = await fetch(
            `https://parseapi.back4app.com/classes/Loja?where=${encodeURIComponent(
              JSON.stringify({ nome: nomeLoja })
            )}`,
            {
              headers: {
                "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
                "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
              }
            }
          );

          const existingStore = await checkStore.json();
          if (existingStore.results.length > 0) {
            return res.status(400).json({ message: "Loja já existe" });
          }

          // Criar loja primeiro (sem primeiroAdministrador)
          const newStore = await fetch(
            "https://parseapi.back4app.com/classes/Loja",
            {
              method: "POST",
              headers: {
                "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
                "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                nome: nomeLoja,
                primeiroAdministrador: null // Será atualizado depois
              })
            }
          );

          const storeData = await newStore.json();
          if (!newStore.ok) throw new Error("Falha ao criar loja");
          lojaId = storeData.objectId;
        }

        // Caso 2: Usando loja existente
        else if (superiorUsername && superiorPassword && lojaExistente) {
          // Autenticar superior
          const authResponse = await fetch(
            "https://parseapi.back4app.com/login",
            {
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
            }
          );

          const superiorData = await authResponse.json();
          if (!authResponse.ok) {
            return res.status(401).json({ message: "Credenciais inválidas do superior" });
          }

          // Verificar se é administrador
          if (superiorData.acess !== "Administrador") {
            return res.status(403).json({ message: "Superior não é administrador" });
          }

          // Obter loja do superior
          const superiorWithStore = await fetch(
            `https://parseapi.back4app.com/users/${superiorData.objectId}?include=loja`,
            {
              headers: {
                "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
                "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
              }
            }
          );

          const superiorFullData = await superiorWithStore.json();
          superiorLojaId = superiorFullData.loja?.objectId;

          // Validar loja
          if (superiorLojaId !== lojaExistente) {
            return res.status(403).json({ message: "Superior não pertence à loja informada" });
          }

          lojaId = lojaExistente;
        } else {
          return res.status(400).json({ message: "Dados insuficientes para registro" });
        }
      }

      // Lógica para Usuários
      else if (acess === "Usuário") {
        if (!superiorUsername || !superiorPassword || !lojaExistente) {
          return res.status(400).json({ message: "Credenciais do superior e loja são obrigatórias" });
        }

        // Autenticar superior
        const authResponse = await fetch(
          "https://parseapi.back4app.com/login",
          {
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
          }
        );

        const superiorData = await authResponse.json();
        if (!authResponse.ok) {
          return res.status(401).json({ message: "Credenciais inválidas do superior" });
        }

        // Verificar se é administrador
        if (superiorData.acess !== "Administrador") {
          return res.status(403).json({ message: "Superior não é administrador" });
        }

        // Obter loja do superior
        const superiorWithStore = await fetch(
          `https://parseapi.back4app.com/users/${superiorData.objectId}?include=loja`,
          {
            headers: {
              "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
              "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
            }
          }
        );

        const superiorFullData = await superiorWithStore.json();
        superiorLojaId = superiorFullData.loja?.objectId;

        // Validar loja
        if (superiorLojaId !== lojaExistente) {
          return res.status(403).json({ message: "Superior não pertence à loja informada" });
        }

        lojaId = lojaExistente;
      } else {
        return res.status(400).json({ message: "Nível de acesso inválido" });
      }

      // Criar usuário
      const newUser = await fetch(
        "https://parseapi.back4app.com/users",
        {
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
        }
      );

      const userData = await newUser.json();

      // Atualizar primeiro administrador se for nova loja
      if (acess === "Administrador" && nomeLoja) {
        await fetch(
          `https://parseapi.back4app.com/classes/Loja/${lojaId}`,
          {
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
          }
        );
      }

      return res.status(201).json({ 
        message: "Usuário criado com sucesso",
        loja: lojaId 
      });

    } catch (error) {
      console.error("Erro no registro:", error);
      return res.status(500).json({ message: "Erro interno no servidor" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Método não permitido" });
  }
}