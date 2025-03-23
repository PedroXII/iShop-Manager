// pages/api/funcionario.js
export default async function handler(req, res) {
    const { method, query, body } = req;
    const { objectId, loja } = query;
  
    if (method === "GET") {
      // Buscar funcionários da loja
      try {
        const response = await fetch(
          `https://parseapi.back4app.com/classes/Funcionario?where={"loja":"${loja}"}`,
          {
            method: "GET",
            headers: {
              "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
              "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
            },
          }
        );
  
        const data = await response.json();
        if (response.ok) {
          res.status(200).json(data.results);
        } else {
          res.status(400).json({ message: data.error || "Erro ao buscar funcionários." });
        }
      } catch (error) {
        res.status(500).json({ message: "Erro ao conectar com o servidor." });
      }
    } else if (method === "POST") {
      // Criar um novo funcionário
      try {
        const response = await fetch("https://parseapi.back4app.com/classes/Funcionario", {
          method: "POST",
          headers: {
            "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
            "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
  
        const data = await response.json();
        if (response.ok) {
          res.status(201).json(data);
        } else {
          res.status(400).json({ message: data.error || "Erro ao criar funcionário." });
        }
      } catch (error) {
        res.status(500).json({ message: "Erro ao conectar com o servidor." });
      }
    } else if (method === "PUT") {
      // Atualizar um funcionário existente
      try {
        const response = await fetch(
          `https://parseapi.back4app.com/classes/Funcionario/${objectId}`,
          {
            method: "PUT",
            headers: {
              "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
              "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          }
        );
  
        const data = await response.json();
        if (response.ok) {
          res.status(200).json(data);
        } else {
          res.status(400).json({ message: data.error || "Erro ao atualizar funcionário." });
        }
      } catch (error) {
        res.status(500).json({ message: "Erro ao conectar com o servidor." });
      }
    } else if (method === "DELETE") {
      // Excluir um funcionário
      try {
        const response = await fetch(
          `https://parseapi.back4app.com/classes/Funcionario/${objectId}`,
          {
            method: "DELETE",
            headers: {
              "X-Parse-Application-Id": process.env.BACK4APP_APP_ID,
              "X-Parse-JavaScript-Key": process.env.BACK4APP_JS_KEY,
            },
          }
        );
  
        if (response.ok) {
          res.status(200).json({ message: "Funcionário excluído com sucesso." });
        } else {
          const data = await response.json();
          res.status(400).json({ message: data.error || "Erro ao excluir funcionário." });
        }
      } catch (error) {
        res.status(500).json({ message: "Erro ao conectar com o servidor." });
      }
    } else {
      res.status(405).json({ message: "Método não permitido." });
    }
  }