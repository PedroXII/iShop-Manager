// pages/api/register.js
export default async function handler(req, res) {
  if (req.method === "POST") {
    const { username, password, acess, idade, superiorUsername, superiorPassword, nomeLoja, lojaExistente, acao } = req.body;

    console.log("Dados recebidos:", { username, password, acess, idade, superiorUsername, superiorPassword, nomeLoja, lojaExistente, acao });

    // Verificações básicas...
    if (!username || !password || !acess || !idade) {
      return res.status(400).json({ message: "Todos os campos básicos são obrigatórios." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "A senha deve ter no mínimo 6 caracteres." });
    }

    try {
      let lojaId = null;
      let superiorLojaId = null;

      // Lógica para Administradores
      if (acess === "Administrador") {
        if (!acao) {
          return res.status(400).json({ message: "Selecione uma ação (nova loja ou loja existente)." });
        }

        if (acao === "novaLoja") {
          // ... (mantenha o código existente para nova loja)
        } 
        else if (acao === "lojaExistente") {
          if (!superiorUsername || !superiorPassword || !lojaExistente) {
            return res.status(400).json({ message: "Credenciais do superior e loja são obrigatórias." });
          }

          // Primeiro faça login para obter o objectId do superior
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
            return res.status(400).json({ message: "Superior não encontrado ou senha incorreta." });
          }

          // Agora busque os dados completos do usuário incluindo a loja
          const superiorResponse = await fetch(`https://parseapi.back4app.com/users/${loginData.objectId}?include=loja`, {
            method: "GET",
            headers: {
              "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
              "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
              "Content-Type": "application/json",
            },
          });

          const superiorData = await superiorResponse.json();
          if (!superiorResponse.ok) {
            return res.status(400).json({ message: "Erro ao obter dados do superior." });
          }

          console.log("Dados completos do superior:", superiorData);

          if (superiorData.acess !== "Administrador") {
            return res.status(403).json({ message: "O superior não tem permissão para criar administradores." });
          }

          if (!superiorData.loja || !superiorData.loja.objectId) {
            return res.status(403).json({ 
              message: "O superior não está associado a nenhuma loja.",
              debug: superiorData
            });
          }

          if (superiorData.loja.objectId !== lojaExistente) {
            return res.status(403).json({ 
              message: "O superior não pertence à loja selecionada.",
              detail: `Loja do superior: ${superiorData.loja.objectId}, Loja selecionada: ${lojaExistente}`
            });
          }

          lojaId = lojaExistente;
        }
      }
      // Lógica para Usuários (similar à de Administrador para lojaExistente)
      else if (acess === "Usuário") {
        // ... (implemente similar ao código acima para usuários)
      }

      // Restante do código para criar o usuário...
      
    } catch (error) {
      console.error("Erro no servidor:", error);
      res.status(500).json({ message: "Erro interno no servidor." });
    }
  } else {
    res.status(405).json({ message: "Método não permitido." });
  }
}