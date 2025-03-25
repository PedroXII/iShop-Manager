// pages/api/register.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { username, password, acess, idade, superiorUsername, superiorPassword, nomeLoja, lojaExistente, acao } = req.body;

  console.log("Dados recebidos:", { 
    username, 
    acess,
    acao,
    lojaExistente,
    nomeLoja
  });

  // Validações básicas
  const requiredFields = [];
  if (!username) requiredFields.push("username");
  if (!password) requiredFields.push("password");
  if (!acess) requiredFields.push("acess");
  if (!idade) requiredFields.push("idade");

  if (requiredFields.length > 0) {
    return res.status(400).json({ 
      message: "Campos obrigatórios faltando",
      missingFields: requiredFields
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ 
      message: "Senha muito curta",
      requirement: "Mínimo 6 caracteres"
    });
  }

  try {
    let lojaId = null;
    let novoUsuarioId = null;
    let sessionToken = null;

    // FLUXO 1: Administrador criando nova loja
    if (acess === "Administrador" && acao === "novaLoja") {
      if (!nomeLoja) {
        return res.status(400).json({ 
          message: "Nome da loja é obrigatório para cadastro de nova loja"
        });
      }

      // 1. Primeiro cria o usuário administrador
      const userResponse = await fetch("https://parseapi.back4app.com/users", {
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
          idade: Number(idade)
        })
      });

      const userData = await userResponse.json();
      
      if (!userResponse.ok) {
        console.error("Falha ao criar usuário:", userData);
        return res.status(400).json({ 
          message: "Falha ao criar usuário administrador",
          error: userData.error || "Erro desconhecido"
        });
      }

      novoUsuarioId = userData.objectId;
      sessionToken = userData.sessionToken;

      // 2. Cria a nova loja com primeiroAdministrador
      const lojaResponse = await fetch("https://parseapi.back4app.com/classes/Loja", {
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
            objectId: novoUsuarioId
          }
        })
      });

      const lojaData = await lojaResponse.json();
      
      if (!lojaResponse.ok) {
        // Rollback: remove o usuário se a loja falhar
        await fetch(`https://parseapi.back4app.com/users/${novoUsuarioId}`, {
          method: "DELETE",
          headers: {
            "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
            "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY
          }
        });
        
        return res.status(400).json({ 
          message: "Falha ao criar nova loja",
          error: lojaData.error || "Erro desconhecido"
        });
      }

      lojaId = lojaData.objectId;

      // 3. Atualiza o usuário com a loja associada
      const updateResponse = await fetch(`https://parseapi.back4app.com/users/${novoUsuarioId}`, {
        method: "PUT",
        headers: {
          "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
          "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
          "X-Parse-Session-Token": sessionToken,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          loja: {
            __type: "Pointer",
            className: "Loja",
            objectId: lojaId
          }
        })
      });

      if (!updateResponse.ok) {
        console.error("Falha ao atualizar usuário com loja");
        // Não fazemos rollback aqui pois a loja já foi criada
      }
    }
    // FLUXO 2: Cadastro em loja existente (Administrador ou Usuário)
    else {
      const requiredFields = [];
      if (!superiorUsername) requiredFields.push("superiorUsername");
      if (!superiorPassword) requiredFields.push("superiorPassword");
      if (!lojaExistente) requiredFields.push("lojaExistente");

      if (requiredFields.length > 0) {
        return res.status(400).json({ 
          message: "Credenciais do superior são obrigatórias",
          missingFields: requiredFields
        });
      }

      // 1. Verifica o superior
      const loginResponse = await fetch("https://parseapi.back4app.com/login", {
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

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        return res.status(401).json({ 
          message: "Falha na autenticação do superior",
          error: errorData.error || "Credenciais inválidas"
        });
      }

      const superiorData = await loginResponse.json();

      // 2. Verifica se é administrador
      if (superiorData.acess !== "Administrador") {
        return res.status(403).json({ 
          message: "Apenas administradores podem criar novos usuários"
        });
      }

      // 3. Verifica a loja do superior
      const userQuery = await fetch(`https://parseapi.back4app.com/users/${superiorData.objectId}?include=loja`, {
        headers: {
          "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
          "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY
        }
      });

      const userData = await userQuery.json();
      
      if (!userQuery.ok || !userData.loja || !userData.loja.objectId) {
        return res.status(400).json({ 
          message: "Não foi possível verificar a loja do superior",
          error: "Loja não encontrada"
        });
      }

      // 4. Verifica se a loja é a mesma
      if (userData.loja.objectId !== lojaExistente) {
        return res.status(403).json({ 
          message: "O superior não tem permissão para esta loja",
          detail: {
            lojaSuperior: userData.loja.objectId,
            lojaSolicitada: lojaExistente
          }
        });
      }

      lojaId = lojaExistente;

      // 5. Cria o novo usuário
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
        return res.status(400).json({ 
          message: "Falha ao criar usuário",
          error: newUserData.error || "Erro desconhecido"
        });
      }
    }

    return res.status(201).json({ 
      success: true,
      message: "Registro concluído com sucesso",
      lojaId,
      userId: novoUsuarioId
    });

  } catch (error) {
    console.error("Erro interno:", error);
    return res.status(500).json({ 
      message: "Erro interno no servidor",
      error: error.message 
    });
  }
}