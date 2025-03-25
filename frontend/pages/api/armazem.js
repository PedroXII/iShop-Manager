export default async function handler(req, res) {
    // Configurações iniciais
    const { method, headers, query } = req;
    const { id } = query;
    const userLoja = headers['x-user-loja'];
    const userAcess = headers['x-user-acess'];
  
    // Verificação de autenticação
    if (!userLoja) {
      return res.status(401).json({ success: false, message: 'Não autenticado' });
    }
  
    // Verificação das credenciais do Back4App
    if (!process.env.BACK4APP_APP_ID || !process.env.BACK4APP_JS_KEY) {
      return res.status(500).json({ 
        success: false, 
        message: 'Configuração do servidor incompleta' 
      });
    }
  
    // Headers para o Back4App
    const parseHeaders = {
      'X-Parse-Application-Id': process.env.BACK4APP_APP_ID,
      'X-Parse-JavaScript-Key': process.env.BACK4APP_JS_KEY,
      'Content-Type': 'application/json'
    };
  
    try {
      // Operação de Pesquisa (POST sem ID)
      if (method === 'POST' && !id) {
        let body;
        try {
          body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        } catch {
          return res.status(400).json({ success: false, message: 'Body inválido' });
        }
  
        const where = {
          loja: userLoja,
          ...(body.filters?.nome && { nome: { $regex: body.filters.nome, $options: 'i' } }),
          ...(body.filters?.localizacao && {
            $or: [
              { 'localizacao.pais': { $regex: body.filters.localizacao, $options: 'i' } },
              { 'localizacao.estado': { $regex: body.filters.localizacao, $options: 'i' } },
              { 'localizacao.cidade': { $regex: body.filters.localizacao, $options: 'i' } }
            ]
          })
        };
  
        const response = await fetch(`https://parseapi.back4app.com/classes/Armazem?where=${encodeURIComponent(JSON.stringify(where))}`, {
          headers: parseHeaders
        });
        const data = await response.json();
        return res.status(response.status).json(data.results || []);
      }
  
      // Operação de Criação (POST com ID)
      if (method === 'POST' && id) {
        if (userAcess !== 'Administrador') {
          return res.status(403).json({ success: false, message: 'Acesso negado' });
        }
  
        const response = await fetch('https://parseapi.back4app.com/classes/Armazem', {
          method: 'POST',
          headers: parseHeaders,
          body: JSON.stringify({
            ...req.body,
            loja: userLoja,
            capacidadeOcupada: 0,
            ACL: { [userLoja]: { read: true, write: true } }
          })
        });
        const data = await response.json();
        return res.status(response.status).json(data);
      }
  
      // Operação de Atualização (PUT)
      if (method === 'PUT') {
        if (userAcess !== 'Administrador') {
          return res.status(403).json({ success: false, message: 'Acesso negado' });
        }
  
        const response = await fetch(`https://parseapi.back4app.com/classes/Armazem/${id}`, {
          method: 'PUT',
          headers: parseHeaders,
          body: JSON.stringify(req.body)
        });
        const data = await response.json();
        return res.status(response.status).json(data);
      }
  
      // Operação de Exclusão (DELETE)
      if (method === 'DELETE') {
        if (userAcess !== 'Administrador') {
          return res.status(403).json({ success: false, message: 'Acesso negado' });
        }
  
        const response = await fetch(`https://parseapi.back4app.com/classes/Armazem/${id}`, {
          method: 'DELETE',
          headers: parseHeaders
        });
        return res.status(response.status).json({ success: response.ok });
      }
  
      // Método não permitido
      res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
      return res.status(405).json({ success: false, message: 'Método não permitido' });
  
    } catch (error) {
      console.error('Erro na API:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
      });
    }
  }