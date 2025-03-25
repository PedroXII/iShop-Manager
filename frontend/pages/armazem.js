import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Armazem() {
  const router = useRouter();
  const [filtros, setFiltros] = useState({
    nome: '',
    localizacao: '',
    capacidadeMin: '',
    capacidadeMax: ''
  });
  const [armazens, setArmazens] = useState([]);
  const [editando, setEditando] = useState(null);
  const [novoArmazem, setNovoArmazem] = useState({
    nome: '',
    capacidadeTotal: '',
    localizacao: {
      pais: '',
      estado: '',
      cidade: '',
      endereco: ''
    }
  });
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApiCall = async (url, method, body) => {
    setLoading(true);
    setError('');
    try {
      const loja = localStorage.getItem('loja');
      const acess = localStorage.getItem('acess');
      
      if (!loja) {
        router.push('/login');
        return null;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-User-Loja': loja,
          'X-User-Acess': acess
        },
        body: body ? JSON.stringify(body) : undefined
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Erro ${response.status}`);
      }

      return data;
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const pesquisarArmazens = async () => {
    const loja = localStorage.getItem('loja');
    if (!loja) {
      setError('Loja não identificada');
      return;
    }

    const data = await handleApiCall('/api/armazem', 'POST', { 
      filters: {
        ...filtros,
        loja
      } 
    });
    
    if (data) {
      setArmazens(data);
    }
  };

  const salvarArmazem = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!novoArmazem.nome || !novoArmazem.capacidadeTotal) {
      setAviso('Atenção: Nome e capacidade total são recomendados');
    } else {
      setAviso('');
    }

    const armazemData = {
      nome: novoArmazem.nome,
      capacidadeTotal: Number(novoArmazem.capacidadeTotal),
      pais: novoArmazem.localizacao.pais,
      estado: novoArmazem.localizacao.estado,
      cidade: novoArmazem.localizacao.cidade,
      rua: novoArmazem.localizacao.endereco,
      complemento: '',
      loja: localStorage.getItem('loja')
    };

    const url = editando ? `/api/armazem?id=${editando}` : '/api/armazem';
    const method = editando ? 'PUT' : 'POST';
    
    const data = await handleApiCall(url, method, armazemData);
    
    if (data) {
      setNovoArmazem({ 
        nome: '', 
        capacidadeTotal: '',
        localizacao: {
          pais: '',
          estado: '',
          cidade: '',
          endereco: ''
        }
      });
      setEditando(null);
      pesquisarArmazens();
    }
  };

  const excluirArmazem = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este armazém?')) {
      const data = await handleApiCall(`/api/armazem?id=${id}`, 'DELETE');
      if (data?.success) {
        pesquisarArmazens();
      }
    }
  };

  useEffect(() => {
    const loja = localStorage.getItem('loja');
    if (!loja) {
      router.push('/login');
    } else {
      pesquisarArmazens();
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>iShop Manager: Armazém</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico"/>
      </Head>
      
      <div>
        <main>
          {/* Navbar e seção inicial permanecem iguais */}
          {/* ... */}

          <section id="top" className="d-flex flex-column min-vh-100" style={{ paddingTop: '80px' }}>
            <div className="container">
              {error && <div className="alert alert-danger">{error}</div>}
              {aviso && <div className="alert alert-warning">{aviso}</div>}

              {/* Formulário de pesquisa e cadastro permanecem iguais */}
              {/* ... */}

              {/* Tabela de armazéns */}
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title mb-0">📦 Armazéns ({armazens.length})</h5>
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={pesquisarArmazens}
                    >
                      Atualizar
                    </button>
                  </div>
                  
                  {armazens.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Nome</th>
                            <th>Localização</th>
                            <th>Capacidade</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {armazens.map(armazem => (
                            <tr key={armazem.objectId}>
                              <td>{armazem.nome}</td>
                              <td>
                                {[armazem.cidade, armazem.estado, armazem.pais].filter(Boolean).join(', ')}
                              </td>
                              <td>
                                <div className="progress" style={{ height: '20px' }}>
                                  <div 
                                    className="progress-bar bg-success" 
                                    style={{ 
                                      width: `${(armazem.capacidadeOcupada / armazem.capacidadeTotal) * 100}%`
                                    }}
                                  >
                                    {armazem.capacidadeOcupada}/{armazem.capacidadeTotal}L
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => {
                                      setEditando(armazem.objectId);
                                      setNovoArmazem({
                                        nome: armazem.nome,
                                        capacidadeTotal: armazem.capacidadeTotal,
                                        localizacao: {
                                          pais: armazem.pais || '',
                                          estado: armazem.estado || '',
                                          cidade: armazem.cidade || '',
                                          endereco: armazem.rua || ''
                                        }
                                      });
                                      window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                  >
                                    Editar
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => excluirArmazem(armazem.objectId)}
                                    disabled={localStorage.getItem('acess') !== "Administrador"}
                                  >
                                    Excluir
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="alert alert-info">
                        {filtros.nome || filtros.localizacao 
                          ? 'Nenhum armazém encontrado com esses filtros'
                          : 'Realize uma pesquisa para visualizar os armazéns'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <footer className="d-flex align-items-center justify-content-center py-3 mt-4">
            <p className="mb-0">
              &copy; {new Date().getFullYear()} iShop Manager. Todos os direitos reservados.
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}