export default async function handler(req, res) {
    // 1. Configuração inicial com logs para diagnóstico
    const { method, headers, body, query } = req;
    const { id } = query;
    const userLoja = headers['x-user-loja'];
    const userAcess = headers['x-user-acess'];
  
    console.log('[API] Nova requisição:', {
      method,
      endpoint: '/api/armazem',
      userLoja,
      userAcess: userAcess || 'N/A'
    });
  
    // 2. Verificação rigorosa das credenciais
    if (!process.env.BACK4APP_APP_ID || !process.env.BACK4APP_JS_KEY) {
      console.error('[API] Erro: Credenciais do Back4App não configuradas', {
        APP_ID: !!process.env.BACK4APP_APP_ID,
        JS_KEY: !!process.env.BACK4APP_JS_KEY,
        NODE_ENV: process.env.NODE_ENV
      });
      return res.status(500).json({
        success: false,
        message: 'Erro de configuração do servidor',
        details: 'Credenciais do Back4App ausentes'
      });
    }
  
    // 3. Configuração do Back4App (com JS_KEY corrigida)
    const baseUrl = 'https://parseapi.back4app.com/classes/Armazem';
    const parseHeaders = {
      'X-Parse-Application-Id': process.env.BACK4APP_APP_ID,
      'X-Parse-JavaScript-Key': process.env.BACK4APP_JS_KEY, // ← Chave corrigida aqui
      'Content-Type': 'application/json'
    };
  
    // 4. Controle de operações
    try {
      switch (method) {
        case 'POST': // Pesquisar (POST sem ID) ou Criar (POST com ID)
          if (id) {
            // CREATE - Somente administradores
            if (userAcess !== 'Administrador') {
              console.warn('[API] Acesso negado: Usuário não é administrador');
              return res.status(403).json({
                success: false,
                message: 'Acesso negado: Requer privilégios de administrador'
              });
            }
  
            console.log('[API] Criando armazém:', body);
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
            console.log('[API] Resultado da criação:', {
              status: createResponse.status,
              objectId: createData.objectId
            });
  
            return res.status(createResponse.status).json({
              success: createResponse.ok,
              ...createData
            });
          } else {
            // SEARCH
            const where = { loja: userLoja };
            
            // Filtros dinâmicos
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
  
            console.log('[API] Pesquisando armazéns com filtro:', where);
            const searchUrl = `${baseUrl}?where=${encodeURIComponent(JSON.stringify(where))}`;
            const searchResponse = await fetch(searchUrl, { headers: parseHeaders });
            const searchData = await searchResponse.json();
  
            console.log('[API] Resultados encontrados:', searchData.results?.length || 0);
            return res.status(searchResponse.status).json(searchData.results || []);
          }
  
        case 'PUT': // Atualização
          if (userAcess !== 'Administrador') {
            console.warn('[API] Acesso negado para atualização');
            return res.status(403).json({
              success: false,
              message: 'Acesso negado: Requer privilégios de administrador'
            });
          }
  
          // Verificar existência e permissão
          console.log('[API] Verificando armazém para atualização:', id);
          const checkResponse = await fetch(`${baseUrl}/${id}`, { headers: parseHeaders });
          const existingData = await checkResponse.json();
          
          if (!existingData.objectId || existingData.loja !== userLoja) {
            console.error('[API] Armazém não encontrado ou acesso negado', {
              objectId: existingData.objectId,
              lojaArmazem: existingData.loja,
              lojaUsuario: userLoja
            });
            return res.status(404).json({
              success: false,
              message: 'Armazém não encontrado ou não pertence à sua loja'
            });
          }
  
          console.log('[API] Atualizando armazém:', id, body);
          const updateResponse = await fetch(`${baseUrl}/${id}`, {
            method: 'PUT',
            headers: parseHeaders,
            body: JSON.stringify(body)
          });
          const updateData = await updateResponse.json();
  
          console.log('[API] Resultado da atualização:', {
            status: updateResponse.status,
            objectId: updateData.objectId
          });
          return res.status(updateResponse.status).json({
            success: updateResponse.ok,
            ...updateData
          });
  
        case 'DELETE': // Exclusão
          if (userAcess !== 'Administrador') {
            console.warn('[API] Acesso negado para exclusão');
            return res.status(403).json({
              success: false,
              message: 'Acesso negado: Requer privilégios de administrador'
            });
          }
  
          // Verificar existência e permissão
          console.log('[API] Verificando armazém para exclusão:', id);
          const checkDeleteResponse = await fetch(`${baseUrl}/${id}`, { headers: parseHeaders });
          const existingDeleteData = await checkDeleteResponse.json();
          
          if (!existingDeleteData.objectId || existingDeleteData.loja !== userLoja) {
            console.error('[API] Armazém não encontrado para exclusão', {
              objectId: existingDeleteData.objectId,
              lojaArmazem: existingDeleteData.loja,
              lojaUsuario: userLoja
            });
            return res.status(404).json({
              success: false,
              message: 'Armazém não encontrado ou não pertence à sua loja'
            });
          }
  
          console.log('[API] Excluindo armazém:', id);
          const deleteResponse = await fetch(`${baseUrl}/${id}`, {
            method: 'DELETE',
            headers: parseHeaders
          });
  
          console.log('[API] Resultado da exclusão:', deleteResponse.status);
          return res.status(deleteResponse.status).json({
            success: deleteResponse.ok,
            message: deleteResponse.ok ? 'Armazém excluído com sucesso' : 'Falha ao excluir armazém'
          });
  
        default:
          console.error('[API] Método não permitido:', method);
          res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
          return res.status(405).json({
            success: false,
            message: `Método ${method} não permitido`
          });
      }
    } catch (error) {
      console.error('[API] Erro interno:', {
        message: error.message,
        stack: error.stack
      });
      return res.status(500).json({
        success: false,
        message: 'Erro interno no servidor',
        ...(process.env.NODE_ENV === 'development' && {
          error: error.message
        })
      });
    }
  }