import Parse from "parse/node";

// Configuração do Parse (Back4App)
Parse.initialize(
  process.env.BACK4APP_APPLICATION_ID,
  process.env.BACK4APP_JAVASCRIPT_KEY,
  process.env.BACK4APP_MASTER_KEY
);
Parse.serverURL = "https://parseapi.back4app.com/";

// Função para verificar se o usuário está autenticado e obter a loja e nível de acesso
const getUsuarioAutenticado = async (sessionToken) => {
  const query = new Parse.Query(Parse.Session);
  query.equalTo("sessionToken", sessionToken);
  const session = await query.first({ useMasterKey: true });

  if (!session) {
    throw new Error("Sessão inválida.");
  }

  const user = session.get("user");
  return {
    loja: user.get("loja"),
    nivelAcesso: user.get("acess"), // Nível de acesso do usuário
  };
};

// Função para padronizar respostas da API
const respostaPadronizada = (success, message, data = null) => {
  return {
    success,
    message,
    data,
  };
};

// API de Clientes
export default async function handler(req, res) {
  if (req.method === "GET") {
    // Listar Clientes da Loja
    try {
      const sessionToken = req.headers["x-session-token"];
      if (!sessionToken) {
        return res
          .status(401)
          .json(respostaPadronizada(false, "Token de sessão não fornecido."));
      }

      const { loja, nivelAcesso } = await getUsuarioAutenticado(sessionToken);

      // Verificar nível de acesso (exemplo: apenas administradores podem listar clientes)
      if (nivelAcesso !== "admin") {
        return res
          .status(403)
          .json(respostaPadronizada(false, "Acesso negado."));
      }

      const query = new Parse.Query("Cliente");
      query.equalTo("loja", loja); // Filtra pela loja do usuário logado
      const clientes = await query.find();

      res
        .status(200)
        .json(
          respostaPadronizada(
            true,
            "Clientes carregados com sucesso.",
            clientes.map((c) => c.toJSON())
          )
        );
    } catch (error) {
      res
        .status(500)
        .json(respostaPadronizada(false, "Erro ao carregar clientes."));
    }
  }

  // Adicionar Cliente
  else if (req.method === "POST") {
    try {
      const sessionToken = req.headers["x-session-token"];
      if (!sessionToken) {
        return res
          .status(401)
          .json(respostaPadronizada(false, "Token de sessão não fornecido."));
      }

      const { loja, nivelAcesso } = await getUsuarioAutenticado(sessionToken);

      // Verificar nível de acesso (exemplo: apenas administradores podem adicionar clientes)
      if (nivelAcesso !== "admin") {
        return res
          .status(403)
          .json(respostaPadronizada(false, "Acesso negado."));
      }

      const { nome, statusAssinatura, idade, comprasAnteriores, sexo } = req.body;

      if (!nome || !idade) {
        return res
          .status(400)
          .json(respostaPadronizada(false, "Nome e idade são obrigatórios."));
      }

      const Cliente = Parse.Object.extend("Cliente");
      const cliente = new Cliente();

      cliente.set("nome", nome);
      cliente.set("statusAssinatura", statusAssinatura || false);
      cliente.set("idade", idade || 18);
      cliente.set("comprasAnteriores", comprasAnteriores || []);
      cliente.set("sexo", sexo || "");
      cliente.set("loja", loja); // Associa o cliente à loja do usuário logado

      await cliente.save();

      res
        .status(201)
        .json(
          respostaPadronizada(true, "Cliente adicionado com sucesso.", cliente.toJSON())
        );
    } catch (error) {
      res
        .status(500)
        .json(respostaPadronizada(false, "Erro ao adicionar cliente."));
    }
  }

  // Editar Cliente
  else if (req.method === "PUT") {
    try {
      const sessionToken = req.headers["x-session-token"];
      if (!sessionToken) {
        return res
          .status(401)
          .json(respostaPadronizada(false, "Token de sessão não fornecido."));
      }

      const { loja, nivelAcesso } = await getUsuarioAutenticado(sessionToken);

      // Verificar nível de acesso (exemplo: apenas administradores podem editar clientes)
      if (nivelAcesso !== "admin") {
        return res
          .status(403)
          .json(respostaPadronizada(false, "Acesso negado."));
      }

      const { objectId } = req.query;
      const { nome, statusAssinatura, idade, comprasAnteriores, sexo } = req.body;

      const query = new Parse.Query("Cliente");
      query.equalTo("objectId", objectId);
      query.equalTo("loja", loja); // Garante que o cliente pertence à loja do usuário logado
      const cliente = await query.first();

      if (!cliente) {
        return res
          .status(404)
          .json(
            respostaPadronizada(false, "Cliente não encontrado ou não pertence à sua loja.")
          );
      }

      cliente.set("nome", nome);
      cliente.set("statusAssinatura", statusAssinatura);
      cliente.set("idade", idade);
      cliente.set("comprasAnteriores", comprasAnteriores);
      cliente.set("sexo", sexo);

      await cliente.save();

      res
        .status(200)
        .json(
          respostaPadronizada(true, "Cliente atualizado com sucesso.", cliente.toJSON())
        );
    } catch (error) {
      res
        .status(500)
        .json(respostaPadronizada(false, "Erro ao atualizar cliente."));
    }
  }

  // Excluir Cliente
  else if (req.method === "DELETE") {
    try {
      const sessionToken = req.headers["x-session-token"];
      if (!sessionToken) {
        return res
          .status(401)
          .json(respostaPadronizada(false, "Token de sessão não fornecido."));
      }

      const { loja, nivelAcesso } = await getUsuarioAutenticado(sessionToken);

      // Verificar nível de acesso (exemplo: apenas administradores podem excluir clientes)
      if (nivelAcesso !== "admin") {
        return res
          .status(403)
          .json(respostaPadronizada(false, "Acesso negado."));
      }

      const { objectId } = req.query;

      const query = new Parse.Query("Cliente");
      query.equalTo("objectId", objectId);
      query.equalTo("loja", loja); // Garante que o cliente pertence à loja do usuário logado
      const cliente = await query.first();

      if (!cliente) {
        return res
          .status(404)
          .json(
            respostaPadronizada(false, "Cliente não encontrado ou não pertence à sua loja.")
          );
      }

      await cliente.destroy();

      res
        .status(200)
        .json(respostaPadronizada(true, "Cliente excluído com sucesso."));
    } catch (error) {
      res
        .status(500)
        .json(respostaPadronizada(false, "Erro ao excluir cliente."));
    }
  }

  // Método não suportado
  else {
    res
      .status(405)
      .json(respostaPadronizada(false, "Método não permitido."));
  }
}