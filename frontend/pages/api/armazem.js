export default async function handler(req, res) {
    // 1. Configuração inicial
    const { method, headers, body, query } = req;
    const { id } = query;
    const userLoja = headers['x-user-loja'];
    const userAcess = headers['x-user-acess'];
  
    // 2. Verificações iniciais
    if (!userLoja) {
      return res.status(401).json({ 
        success: false,
        message: 'Não autorizado: Loja não identificada'
      });
    }
  
    if (!process.env.BACK4APP_APP_ID || !process.env.BACK4APP_REST_KEY) {
      console.error('Erro: Credenciais do Back4App não configuradas');
      return res.status(500).json({
        success: false,
        message: 'Configuração do servidor incompleta'
      });
    }
  
    // 3. Configuração do Back4App
    const baseUrl = 'https://parseapi.back4app.com/classes/Armazem';
    const parseHeaders = {
      'X-Parse-Application-Id': process.env.BACK4APP_APP_ID,
      'X-Parse-REST-API-Key': process.env.BACK4APP_REST_KEY,
      'Content-Type': 'application/json'
    };
  
    try {
      // 4. Rotas da API
      switch (method) {
        case 'POST': // Pesquisar ou Criar
          if (id) {
            // Criação - Somente administradores
            if (userAcess !== 'Administrador') {
              return res.status(403).json({
                success: false,
                message: 'Acesso negado: Requer privilégios de administrador'
              });
            }
  
            const createResponse = await fetch(baseUrl, {
              method: 'POST',
              headers: parseHeaders,
              body: JSON.stringify({
                ...body,
                loja: userLoja,
                capacidadeOcupada: 0,
                ACL: { 
                  [userLoja]: { read: true, write: true },
                  '*': { read: false, write: false }
                }
              })
            });
  
            const createData = await createResponse.json();
            return res.status(createResponse.status).json({
              success: createResponse.ok,
              ...createData
            });
          } else {
            // Pesquisa
            const where = { loja: userLoja };
            
            if (body.nome) where.nome = { $regex: body.nome, $options: 'i' };
            if (body.localizacao) {
              where.$or = [
                { 'localizacao.pais': { $regex: body.localizacao, $options: 'i' } },
                { 'localizacao.estado': { $regex: body.localizacao, $options: 'i' } },
                { 'localizacao.cidade': { $regex: body.localizacao, $options: 'i' } }
              ];
            }
            if (body.capacidadeMin || body.capacidadeMax) {
              where.capacidadeTotal = {};
              if (body.capacidadeMin) where.capacidadeTotal.$gte = Number(body.capacidadeMin);
              if (body.capacidadeMax) where.capacidadeTotal.$lte = Number(body.capacidadeMax);
            }
  
            const searchResponse = await fetch(
              `${baseUrl}?where=${encodeURIComponent(JSON.stringify(where))}`,
              { headers: parseHeaders }
            );
            const searchData = await searchResponse.json();
            return res.status(searchResponse.status).json(searchData.results || []);
          }
  
        case 'PUT': // Atualização
          if (userAcess !== 'Administrador') {
            return res.status(403).json({
              success: false,
              message: 'Acesso negado: Requer privilégios de administrador'
            });
          }
  
          // Verificar se o armazém pertence à loja
          const checkResponse = await fetch(`${baseUrl}/${id}`, { headers: parseHeaders });
          const existingData = await checkResponse.json();
          
          if (!existingData.objectId || existingData.loja !== userLoja) {
            return res.status(404).json({
              success: false,
              message: 'Armazém não encontrado ou não pertence à sua loja'
            });
          }
  
          const updateResponse = await fetch(`${baseUrl}/${id}`, {
            method: 'PUT',
            headers: parseHeaders,
            body: JSON.stringify(body)
          });
          const updateData = await updateResponse.json();
          return res.status(updateResponse.status).json({
            success: updateResponse.ok,
            ...updateData
          });
  
        case 'DELETE': // Exclusão
          if (userAcess !== 'Administrador') {
            return res.status(403).json({
              success: false,
              message: 'Acesso negado: Requer privilégios de administrador'
            });
          }
  
          // Verificar se o armazém pertence à loja
          const checkDeleteResponse = await fetch(`${baseUrl}/${id}`, { headers: parseHeaders });
          const existingDeleteData = await checkDeleteResponse.json();
          
          if (!existingDeleteData.objectId || existingDeleteData.loja !== userLoja) {
            return res.status(404).json({
              success: false,
              message: 'Armazém não encontrado ou não pertence à sua loja'
            });
          }
  
          const deleteResponse = await fetch(`${baseUrl}/${id}`, {
            method: 'DELETE',
            headers: parseHeaders
          });
          return res.status(deleteResponse.status).json({
            success: deleteResponse.ok,
            message: deleteResponse.ok ? 'Armazém excluído com sucesso' : 'Falha ao excluir armazém'
          });
  
        default:
          res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
          return res.status(405).json({
            success: false,
            message: `Método ${method} não permitido`
          });
      }
    } catch (error) {
      console.error('Erro na API:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno no servidor',
        ...(process.env.NODE_ENV === 'development' && {
          error: error.message
        })
      });
    }
  }