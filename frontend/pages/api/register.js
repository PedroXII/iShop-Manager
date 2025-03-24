// pages/api/register.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { username, password, acess, idade, superiorUsername, superiorPassword, nomeLoja, lojaExistente, acao } = req.body;

  // Validações básicas
  if (!username || !password || !acess || !idade) {
    return res.status(400).json({ message: "Todos os campos básicos são obrigatórios" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "A senha deve ter no mínimo 6 caracteres" });
  }

  try {
    let lojaId = null;

    // Fluxo para Administrador
    if (acess === "Administrador") {
      if (!acao) {
        return res.status(400).json({ message: "Selecione uma ação (nova loja ou loja existente)" });
      }

      if (acao === "novaLoja") {
        if (!nomeLoja) {
          return res.status(400).json({ message: "O nome da nova loja é obrigatório" });
        }

        // Verificar se loja já existe
        const checkResponse = await fetch(`https://parseapi.back4app.com/classes/Loja?where=${encodeURIComponent(JSON.stringify({ nome: nomeLoja }))}`, {
          headers: {
            "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
            "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY
          }
        });

        const checkData = await checkResponse.json();
        if (checkData.results?.length > 0) {
          return res.status(400).json({ message: "Uma loja com este nome já existe" });
        }

        // Criar nova loja
        const lojaResponse = await fetch("https://parseapi.back4app.com/classes/Loja", {
          method: "POST",
          headers: {
            "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
            "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ nome: nomeLoja })
        });

        const lojaData = await lojaResponse.json();
        if (!lojaResponse.ok) {
          return res.status(400).json({ 
            message: "Erro ao criar loja",
            detail: lojaData.error || "Erro desconhecido"
          });
        }

        lojaId = lojaData.objectId;
      } 
      else if (acao === "lojaExistente") {
        if (!superiorUsername || !superiorPassword || !lojaExistente) {
          return res.status(400).json({ message: "Credenciais do superior e loja são obrigatórias" });
        }

        // Verificar superior
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
          return res.status(400).json({ message: "Superior não encontrado ou senha incorreta" });
        }

        const loginData = await loginResponse.json();
        
        // Verificar se é administrador
        if (loginData.acess !== "Administrador") {
          return res.status(403).json({ message: "O superior não tem permissão para criar administradores" });
        }

        // Buscar dados completos com a loja
        const userResponse = await fetch(`https://parseapi.back4app.com/users/${loginData.objectId}?include=loja`, {
          headers: {
            "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
            "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY
          }
        });

        if (!userResponse.ok) {
          return res.status(400).json({ 
            message: "Erro ao verificar a loja do superior",
            detail: "O usuário pode não estar associado a uma loja"
          });
        }

        const userData = await userResponse.json();
        
        // Verificar associação com loja
        if (!userData.loja?.objectId) {
          return res.status(403).json({ 
            message: "O superior não está associado a nenhuma loja",
            debug: userData
          });
        }

        // Verificar se pertence à loja selecionada
        if (userData.loja.objectId !== lojaExistente) {
          return res.status(403).json({
            message: "O superior não pertence à loja selecionada",
            detail: `Loja do superior: ${userData.loja.objectId}, Loja selecionada: ${lojaExistente}`
          });
        }

        lojaId = lojaExistente;
      }
    }
    // Fluxo para Usuário
    else if (acess === "Usuário") {
      if (!superiorUsername || !superiorPassword || !lojaExistente) {
        return res.status(400).json({ message: "Credenciais do superior e loja são obrigatórias" });
      }

      // Verificação similar ao fluxo do administrador
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
        return res.status(400).json({ message: "Superior não encontrado ou senha incorreta" });
      }

      const loginData = await loginResponse.json();
      
      if (loginData.acess !== "Administrador") {
        return res.status(403).json({ message: "O superior não tem permissão para criar usuários" });
      }

      const userResponse = await fetch(`https://parseapi.back4app.com/users/${loginData.objectId}?include=loja`, {
        headers: {
          "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
          "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY
        }
      });

      if (!userResponse.ok) {
        return res.status(400).json({ 
          message: "Erro ao verificar a loja do superior",
          detail: "O usuário pode não estar associado a uma loja"
        });
      }

      const userData = await userResponse.json();
      
      if (!userData.loja?.objectId) {
        return res.status(403).json({ message: "O superior não está associado a nenhuma loja" });
      }

      if (userData.loja.objectId !== lojaExistente) {
        return res.status(403).json({
          message: "O superior não pertence à loja selecionada",
          detail: `Loja do superior: ${userData.loja.objectId}, Loja selecionada: ${lojaExistente}`
        });
      }

      lojaId = lojaExistente;
    }

    // Criar o novo usuário
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
      // Rollback: Apagar loja se foi criada
      if (acao === "novaLoja" && lojaId) {
        await fetch(`https://parseapi.back4app.com/classes/Loja/${lojaId}`, {
          method: "DELETE",
          headers: {
            "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
            "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY
          }
        });
      }
      return res.status(400).json({ 
        message: "Erro ao criar usuário",
        detail: newUserData.error || "Erro desconhecido"
      });
    }

    // Atualizar primeiroAdministrador se for nova loja
    if (acao === "novaLoja" && lojaId) {
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
            objectId: newUserData.objectId
          }
        })
      });
    }

    return res.status(200).json({ message: "Usuário registrado com sucesso" });

  } catch (error) {
    console.error("Erro no servidor:", error);
    return res.status(500).json({ message: "Erro interno no servidor" });
  }
}