// pages/api/armazem/index.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Método não permitido' });
    }
  
    const { loja, acess, ...armazemData } = req.body;
  
    try {
      // Verificar se o usuário tem permissão
      if (!loja) {
        return res.status(400).json({ message: 'Loja não identificada' });
      }
  
      // URL do Back4App
      const url = 'https://parseapi.back4app.com/classes/Armazem';
      const headers = {
        'X-Parse-Application-Id': process.env.BACK4APP_APP_ID,
        'X-Parse-REST-API-Key': process.env.BACK4APP_REST_KEY,
        'Content-Type': 'application/json'
      };
  
      // Criar novo armazém
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...armazemData,
          loja,
          ACL: { // Definir permissões de acesso
            [loja]: { read: true, write: true },
            '*': { read: false, write: false }
          }
        })
      });
  
      const data = await response.json();
      if (response.ok) {
        res.status(201).json(data);
      } else {
        res.status(response.status).json({ message: data.error || 'Erro ao criar armazém' });
      }
    } catch (error) {
      console.error('Erro ao criar armazém:', error);
      res.status(500).json({ message: 'Erro interno no servidor' });
    }
  }