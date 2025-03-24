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

      // Fluxo para Administrador em Loja Existente
      if (acess === "Administrador" && acao === "lojaExistente") {
        // Autenticação do Superior
        const authResponse = await fetch("https://parseapi.back4app.com/login", {
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

        const superiorData = await authResponse.json();
        
        if (!authResponse.ok) {
          return res.status(401).json({ message: "Credenciais do superior inválidas" });
        }

        // Buscar dados completos do superior
        const superiorComLoja = await fetch(
          `https://parseapi.back4app.com/users/${superiorData.objectId}?include=loja`,
          {
            headers: {
              "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
              "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY
            }
          }
        );

        const superiorFull = await superiorComLoja.json();

        // Validações críticas
        if (superiorFull.acess !== "Administrador") {
          return res.status(403).json({ message: "Apenas administradores podem criar novos administradores" });
        }

        if (superiorFull.loja?.objectId !== lojaExistente) {
          return res.status(403).json({ 
            message: "O administrador superior não pertence à loja selecionada" 
          });
        }

        lojaId = lojaExistente;
      }

      // ... (restante do código) ...

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