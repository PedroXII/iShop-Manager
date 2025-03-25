// pages/api/register.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ 
      success: false,
      message: "Método não permitido" 
    });
  }

  const { username, password, acess, idade, superiorUsername, superiorPassword, nomeLoja, lojaExistente, acao } = req.body;

  console.log("Iniciando processo de registro para:", username);

  // Validações básicas
  if (!username || !password || !acess || !idade) {
    return res.status(400).json({
      success: false,
      message: "Dados incompletos",
      requiredFields: ["username", "password", "acess", "idade"]
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Senha deve conter no mínimo 6 caracteres"
    });
  }

  try {
    // FLUXO 1: ADMINISTRADOR COM NOVA LOJA
    if (acess === "Administrador" && acao === "novaLoja") {
      if (!nomeLoja) {
        return res.status(400).json({
          success: false,
          message: "Nome da loja é obrigatório"
        });
      }

      console.log(`Criando nova loja '${nomeLoja}' para admin '${username}'`);

      // 1. Criar loja com status temporário
      const lojaResponse = await fetch("https://parseapi.back4app.com/classes/Loja", {
        method: "POST",
        headers: {
          "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
          "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nome: nomeLoja,
          status: "pending_admin_creation",
          primeiroAdministrador: null // Inicialmente nulo
        })
      });

      const lojaData = await lojaResponse.json();

      if (!lojaResponse.ok) {
        console.error("Falha ao criar loja:", lojaData);
        return res.status(400).json({
          success: false,
          message: "Falha ao criar nova loja",
          error: lojaData.error || "Erro desconhecido"
        });
      }

      const lojaId = lojaData.objectId;
      console.log(`Loja criada temporariamente com ID: ${lojaId}`);

      // 2. Criar usuário admin associado à loja
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
          idade: Number(idade),
          loja: {
            __type: "Pointer",
            className: "Loja",
            objectId: lojaId
          }
        })
      });

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        console.error("Falha ao criar admin:", userData);
        // Rollback: remover loja criada
        await fetch(`https://parseapi.back4app.com/classes/Loja/${lojaId}`, {
          method: "DELETE",
          headers: {
            "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
            "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY
          }
        });
        
        return res.status(400).json({
          success: false,
          message: "Falha ao criar usuário administrador",
          error: userData.error || "Erro desconhecido"
        });
      }

      const userId = userData.objectId;
      console.log(`Admin criado com ID: ${userId}`);

      // 3. Atualizar loja com primeiroAdministrador
      const updateLojaResponse = await fetch(`https://parseapi.back4app.com/classes/Loja/${lojaId}`, {
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
            objectId: userId
          },
          status: "active"
        })
      });

      if (!updateLojaResponse.ok) {
        console.error("Falha ao atualizar loja com admin:", await updateLojaResponse.json());
        // Não fazemos rollback aqui para evitar perda de dados
      }

      return res.status(201).json({
        success: true,
        message: "Administrador e loja criados com sucesso",
        data: {
          userId,
          lojaId
        }
      });
    }

    // FLUXO 2: USUÁRIO/ADMIN EM LOJA EXISTENTE
    if (!superiorUsername || !superiorPassword || !lojaExistente) {
      return res.status(400).json({
        success: false,
        message: "Credenciais de administrador e loja são obrigatórias"
      });
    }

    console.log(`Verificando superior ${superiorUsername} para loja ${lojaExistente}`);

    // 1. Autenticar superior
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
        success: false,
        message: "Falha na autenticação do superior",
        error: errorData.error || "Credenciais inválidas"
      });
    }

    const superiorData = await loginResponse.json();

    // 2. Verificar se é administrador
    if (superiorData.acess !== "Administrador") {
      return res.status(403).json({
        success: false,
        message: "Apenas administradores podem registrar novos usuários"
      });
    }

    // 3. Verificar associação com a loja
    const userQuery = await fetch(`https://parseapi.back4app.com/users/${superiorData.objectId}?keys=loja`, {
      headers: {
        "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
        "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY
      }
    });

    const userData = await userQuery.json();

    if (!userQuery.ok || !userData.loja || userData.loja.objectId !== lojaExistente) {
      return res.status(403).json({
        success: false,
        message: "O superior não tem permissão para esta loja",
        detail: {
          lojaEsperada: lojaExistente,
          lojaDoSuperior: userData.loja?.objectId || "não encontrada"
        }
      });
    }

    // 4. Criar novo usuário
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
          objectId: lojaExistente
        }
      })
    });

    const newUserData = await newUserResponse.json();

    if (!newUserResponse.ok) {
      return res.status(400).json({
        success: false,
        message: "Falha ao criar usuário",
        error: newUserData.error || "Erro desconhecido"
      });
    }

    return res.status(201).json({
      success: true,
      message: "Usuário registrado com sucesso",
      userId: newUserData.objectId,
      lojaId: lojaExistente
    });

  } catch (error) {
    console.error("Erro inesperado:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno no servidor",
      error: error.message
    });
  }
}