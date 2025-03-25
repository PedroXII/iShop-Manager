// pages/api/armazem.js
export default async function handler(req, res) {
    const { method, headers, body, query } = req;
    const { id } = query;
    const userLoja = headers['x-user-loja'];
    const userAcess = headers['x-user-acess'];
  
    if (!userLoja) {
      return res.status(401).json({ message: 'Não autorizado' });
    }
  
    const baseUrl = 'https://parseapi.back4app.com/classes/Armazem';
    const parseHeaders = {
      'X-Parse-Application-Id': process.env.BACK4APP_APP_ID,
      'X-Parse-REST-API-Key': process.env.BACK4APP_REST_KEY,
      'Content-Type': 'application/json'
    };
  
    try {
      switch (method) {
        case 'POST': // Pesquisar ou Criar
          if (id) { // Se tem ID, é criação
            if (userAcess !== 'Administrador') {
              return res.status(403).json({ message: 'Acesso negado' });
            }
  
            const createResponse = await fetch(baseUrl, {
              method: 'POST',
              headers: parseHeaders,
              body: JSON.stringify({
                ...body,
                loja: userLoja,
                capacidadeOcupada: 0,
                ACL: { [userLoja]: { read: true, write: true } }
              })
            });
            const createData = await createResponse.json();
            return res.status(createResponse.status).json(createData);
          } else { // Pesquisa
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
  
            const searchResponse = await fetch(`${baseUrl}?where=${encodeURIComponent(JSON.stringify(where))}`, {
              headers: parseHeaders
            });
            const searchData = await searchResponse.json();
            return res.status(searchResponse.status).json(searchData.results || []);
          }
  
        case 'PUT': // Atualizar
          if (userAcess !== 'Administrador') {
            return res.status(403).json({ message: 'Acesso negado' });
          }
  
          // Verificar se o armazém pertence à loja do usuário
          const checkResponse = await fetch(`${baseUrl}/${id}`, { headers: parseHeaders });
          const existingData = await checkResponse.json();
          
          if (!existingData.objectId || existingData.loja !== userLoja) {
            return res.status(404).json({ message: 'Armazém não encontrado' });
          }
  
          const updateResponse = await fetch(`${baseUrl}/${id}`, {
            method: 'PUT',
            headers: parseHeaders,
            body: JSON.stringify(body)
          });
          const updateData = await updateResponse.json();
          return res.status(updateResponse.status).json(updateData);
  
        case 'DELETE': // Excluir
          if (userAcess !== 'Administrador') {
            return res.status(403).json({ message: 'Acesso negado' });
          }
  
          // Verificar se o armazém pertence à loja do usuário
          const checkDeleteResponse = await fetch(`${baseUrl}/${id}`, { headers: parseHeaders });
          const existingDeleteData = await checkDeleteResponse.json();
          
          if (!existingDeleteData.objectId || existingDeleteData.loja !== userLoja) {
            return res.status(404).json({ message: 'Armazém não encontrado' });
          }
  
          const deleteResponse = await fetch(`${baseUrl}/${id}`, {
            method: 'DELETE',
            headers: parseHeaders
          });
          return res.status(deleteResponse.status).json({ success: deleteResponse.ok });
  
        default:
          res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
          return res.status(405).json({ message: `Método ${method} não permitido` });
      }
    } catch (error) {
      console.error('Erro na API:', error);
      return res.status(500).json({ message: 'Erro interno no servidor' });
    }
  }