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
      // Validação inicial
      if (!username || !password || !acess || !idade) {
        return res.status(400).json({ message: "Campos obrigatórios faltando" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Senha precisa ter no mínimo 6 caracteres" });
      }

      let lojaId = null;
      let superiorLojaId = null;

      // Fluxo para Administradores
      if (acess === "Administrador") {
        if (acao === "novaLoja" && nomeLoja) {
          // Criar nova loja
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
          if (existingStore.results?.length > 0) {
            return res.status(400).json({ message: "Loja já existe" });
          }

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
                primeiroAdministrador: null
              })
            }
          );

          const storeData = await newStore.json();
          if (!newStore.ok) {
            throw new Error(`Erro ao criar loja: ${storeData.error || JSON.stringify(storeData)}`);
          }
          
          lojaId = storeData.objectId;
          
        } else if (acao === "lojaExistente" && lojaExistente && superiorUsername && superiorPassword) {
          // ... (código existente para loja existente) ...
        } else {
          return res.status(400).json({ message: "Parâmetros inválidos para administrador" });
        }
      }

      // Fluxo para Usuários
      else if (acess === "Usuário") {
        // ... (código existente para usuários) ...
      }

      // Validação final da lojaId
      if (!lojaId) {
        throw new Error("ID da loja não foi definido corretamente");
      }

      // Criação do usuário
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

      // ... (código restante para atualização da loja) ...

    } catch (error) {
      console.error("Erro detalhado:", {
        message: error.message,
        stack: error.stack,
        body: req.body
      });
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