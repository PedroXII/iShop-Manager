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
      lojaExistente,
      acao
    } = req.body;

    try {
      // ... (validações iniciais permanecem iguais) ...

      let lojaId = null;
      let novoUsuarioId = null;

      // Fluxo para Administrador criando nova loja
      if (acess === "Administrador" && acao === "novaLoja") {
        // 1. Criar usuário temporário para vincular à loja
        const tempUser = await fetch("https://parseapi.back4app.com/users", {
          method: "POST",
          headers: {
            "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
            "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: `temp_${Date.now()}`,
            password: "temp_password",
            acess: "Administrador",
            idade: 18,
            loja: {
              __type: "Pointer",
              className: "Loja",
              objectId: "temp_loja" // Placeholder
            }
          })
        });

        const tempUserData = await tempUser.json();
        if (!tempUser.ok) throw new Error("Falha ao criar usuário temporário");

        // 2. Criar loja com primeiroAdministrador temporário
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
              objectId: tempUserData.objectId
            }
          })
        });

        const storeData = await newStore.json();
        if (!newStore.ok) throw new Error("Falha ao criar loja");
        lojaId = storeData.objectId;

        // 3. Criar usuário final com a loja correta
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
        if (!newUser.ok) throw new Error("Falha ao criar usuário final");
        novoUsuarioId = userData.objectId;

        // 4. Atualizar a loja com o usuário correto
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
              objectId: novoUsuarioId
            }
          })
        });

        // 5. Excluir usuário temporário
        await fetch(`https://parseapi.back4app.com/users/${tempUserData.objectId}`, {
          method: "DELETE",
          headers: {
            "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
            "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY
          }
        });
      }

      // ... (restante do código para outros fluxos) ...

      return res.status(201).json({ 
        message: "Usuário e loja criados com sucesso",
        lojaId,
        userId: novoUsuarioId
      });

    } catch (error) {
      console.error("Erro detalhado:", error);
      return res.status(500).json({ 
        message: "Erro interno no servidor",
        details: error.message 
      });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Método não permitido" });
  }
}