// pages/api/register.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ 
      success: false,
      message: "Método não permitido" 
    });
  }

  const { username, password, acess, idade, nomeLoja, lojaExistente, superiorUsername, superiorPassword, acao } = req.body;

  console.log("Dados recebidos:", { 
    username, 
    acess,
    acao,
    lojaExistente,
    nomeLoja 
  });

  // Validações básicas
  if (!username || !password || !acess || !idade) {
    return res.status(400).json({
      success: false,
      message: "Campos obrigatórios faltando",
      required: ["username", "password", "acess", "idade"]
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Senha deve ter no mínimo 6 caracteres"
    });
  }

  try {
    let lojaId = null;
    let userId = null;

    // FLUXO 1: ADMINISTRADOR CRIANDO NOVA LOJA
    if (acess === "Administrador" && acao === "novaLoja") {
      if (!nomeLoja) {
        return res.status(400).json({
          success: false,
          message: "Nome da loja é obrigatório"
        });
      }

      // 1. Criar a loja primeiro (sem administrador ainda)
      const lojaResponse = await fetch("https://parseapi.back4app.com/classes/Loja", {
        method: "POST",
        headers: {
          "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
          "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nome: nomeLoja,
          status: "ativa",
          primeiroAdministrador: null // Será preenchido depois
        })
      });

      const lojaData = await lojaResponse.json();

      if (!lojaResponse.ok) {
        console.error("Erro ao criar loja:", lojaData);
        return res.status(400).json({
          success: false,
          message: "Erro ao criar loja",
          error: lojaData.error || "Erro desconhecido"
        });
      }

      lojaId = lojaData.objectId;
      console.log("Loja criada temporariamente com ID:", lojaId);

      // 2. Criar usuário administrador
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
          loja: lojaId // Armazenamos apenas o ID como string
        })
      });

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        console.error("Erro ao criar usuário:", userData);
        // Rollback: apagar a loja criada
        await fetch(`https://parseapi.back4app.com/classes/Loja/${lojaId}`, {
          method: "DELETE",
          headers: {
            "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
            "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY
          }
        });
        
        return res.status(400).json({
          success: false,
          message: "Erro ao criar usuário administrador",
          error: userData.error || "Erro desconhecido"
        });
      }

      userId = userData.objectId;
      console.log("Administrador criado com ID:", userId);

      // 3. Atualizar loja com o primeiroAdministrador
      const updateLojaResponse = await fetch(`https://parseapi.back4app.com/classes/Loja/${lojaId}`, {
        method: "PUT",
        headers: {
          "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
          "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          primeiroAdministrador: userId // Armazenamos apenas o ID como string
        })
      });

      if (!updateLojaResponse.ok) {
        console.error("Erro ao atualizar loja:", await updateLojaResponse.json());
        // Não fazemos rollback aqui para evitar perda de dados
      }
    }
    // FLUXO 2: USUÁRIO/ADMIN EM LOJA EXISTENTE
    else {
      if (!superiorUsername || !superiorPassword || !lojaExistente) {
        return res.status(400).json({
          success: false,
          message: "Credenciais do superior e ID da loja são obrigatórias"
        });
      }

      // 1. Verificar superior
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

      // 3. Verificar se o superior pertence à loja informada
      if (superiorData.loja !== lojaExistente) {
        return res.status(403).json({
          success: false,
          message: "O superior não tem permissão para esta loja",
          detail: {
            lojaSuperior: superiorData.loja,
            lojaSolicitada: lojaExistente
          }
        });
      }

      // 4. Criar novo usuário
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
          loja: lojaExistente // Armazenamos apenas o ID como string
        })
      });

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        return res.status(400).json({
          success: false,
          message: "Falha ao criar usuário",
          error: userData.error || "Erro desconhecido"
        });
      }

      userId = userData.objectId;
      lojaId = lojaExistente;
    }

    return res.status(201).json({
      success: true,
      message: "Registro concluído com sucesso",
      data: {
        userId,
        lojaId
      }
    });

  } catch (error) {
    console.error("Erro interno:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno no servidor",
      error: error.message
    });
  }
}