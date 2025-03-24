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
      // ... (validações anteriores permanecem iguais) ...

      // Seção corrigida para criação de loja
      if (acess === "Administrador" && nomeLoja) {
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
        if (existingStore.results?.length > 0) {
          return res.status(400).json({ message: "Loja já existe" });
        }

        // Criar loja com estrutura correta
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
              primeiroAdministrador: {
                __type: "Pointer",
                className: "_User",
                objectId: "temp" // Placeholder será atualizado
              }
            })
          }
        );

        const storeData = await newStore.json();
        
        if (!newStore.ok) {
          console.error("Detalhes do erro na criação da loja:", storeData);
          throw new Error(`Falha ao criar loja: ${storeData.error || storeData.message}`);
        }
        
        lojaId = storeData.objectId;
      }

      // ... (restante do código permanece igual) ...

    } catch (error) {
      console.error("Erro detalhado no registro:", {
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