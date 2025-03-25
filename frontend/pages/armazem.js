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
  const [userData, setUserData] = useState({ loja: '', acess: '' });

  useEffect(() => {
    const loja = localStorage.getItem('loja');
    const acess = localStorage.getItem('acess');
    
    if (!loja) {
      router.push('/login');
      return;
    }
    
    setUserData({ loja, acess });
  }, [router]);

  const handleApiCall = async (url, method, body) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-User-Loja': userData.loja,
          'X-User-Acess': userData.acess
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
    const data = await handleApiCall('/api/armazem', 'POST', { 
      filters: {
        ...filtros,
        loja: userData.loja
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
      localizacao: {
        pais: novoArmazem.localizacao.pais,
        estado: novoArmazem.localizacao.estado,
        cidade: novoArmazem.localizacao.cidade,
        endereco: novoArmazem.localizacao.endereco
      },
      loja: userData.loja
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

  return (
    <>
      <Head>
        <title>iShop Manager: Armazém</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico"/>
      </Head>
      
      <div>
        <main>
          <section>
            <nav id="navbar" className="navbar bg-primary col-12 navbar-expand-lg position-fixed">
              <div className="container-fluid col-11 m-auto">
                <Link href="/home">
                  <Image
                    src="/Varios-12-150ppp-01.jpg"
                    alt="LOGO"
                    width={40}
                    height={40}
                    className="cursor-pointer"
                  />
                </Link>
                <button
                  className="navbar-toggler"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#navbarNav"
                  aria-controls="navbarNav"
                  aria-expanded="false"
                  aria-label="Toggle navigation"
                >
                  <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                  <ul className="navbar-nav ms-auto">
                    <li className="nav-item">
                      <Link href="/home" className="nav-link text-light">Home</Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/funcionario" className="nav-link text-light">Funcionário</Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/cliente" className="nav-link text-light">Cliente</Link>
                    </li>
                    <li className="nav-item">
                      <Link href="#top" className="nav-link text-light">Armazém</Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/promocao" className="nav-link text-light">Promoção</Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/produto" className="nav-link text-light">Produto</Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/loja_parceira" className="nav-link text-light">Parceiro</Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/index" className="nav-link text-light">Logout</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </nav>
          </section>

          <section id="top" className="d-flex flex-column min-vh-100" style={{ paddingTop: '80px' }}>
            <div className="container">
              {error && <div className="alert alert-danger">{error}</div>}
              {aviso && <div className="alert alert-warning">{aviso}</div>}

              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title">🔍 Pesquisar Armazéns</h5>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nome do armazém"
                        value={filtros.nome}
                        onChange={(e) => setFiltros({...filtros, nome: e.target.value})}
                      />
                    </div>
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="País, estado ou cidade"
                        value={filtros.localizacao}
                        onChange={(e) => setFiltros({...filtros, localizacao: e.target.value})}
                      />
                    </div>
                    <div className="col-md-4">
                      <div className="input-group">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Mínima (L)"
                          value={filtros.capacidadeMin}
                          onChange={(e) => setFiltros({...filtros, capacidadeMin: e.target.value})}
                        />
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Máxima (L)"
                          value={filtros.capacidadeMax}
                          onChange={(e) => setFiltros({...filtros, capacidadeMax: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-primary flex-grow-1"
                          onClick={pesquisarArmazens}
                          disabled={loading}
                        >
                          {loading ? 'Pesquisando...' : 'Pesquisar'}
                        </button>
                        <button 
                          className="btn btn-outline-secondary"
                          onClick={() => {
                            setFiltros({
                              nome: '',
                              localizacao: '',
                              capacidadeMin: '',
                              capacidadeMax: ''
                            });
                          }}
                        >
                          Limpar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title">
                    {editando ? '✏️ Editar Armazém' : '➕ Novo Armazém'}
                  </h5>
                  <form onSubmit={salvarArmazem}>
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Nome*</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Nome do armazém"
                          value={novoArmazem.nome}
                          onChange={(e) => setNovoArmazem({...novoArmazem, nome: e.target.value})}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Capacidade Total (L)*</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Em litros"
                          min="0"
                          value={novoArmazem.capacidadeTotal}
                          onChange={(e) => setNovoArmazem({...novoArmazem, capacidadeTotal: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="row g-3 mb-3">
                      <div className="col-md-3">
                        <label className="form-label">País</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ex: Brasil"
                          value={novoArmazem.localizacao.pais}
                          onChange={(e) => setNovoArmazem({
                            ...novoArmazem,
                            localizacao: {
                              ...novoArmazem.localizacao,
                              pais: e.target.value
                            }
                          })}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Estado/Província</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ex: São Paulo"
                          value={novoArmazem.localizacao.estado}
                          onChange={(e) => setNovoArmazem({
                            ...novoArmazem,
                            localizacao: {
                              ...novoArmazem.localizacao,
                              estado: e.target.value
                            }
                          })}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Cidade</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ex: Campinas"
                          value={novoArmazem.localizacao.cidade}
                          onChange={(e) => setNovoArmazem({
                            ...novoArmazem,
                            localizacao: {
                              ...novoArmazem.localizacao,
                              cidade: e.target.value
                            }
                          })}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Endereço</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Rua, número"
                          value={novoArmazem.localizacao.endereco}
                          onChange={(e) => setNovoArmazem({
                            ...novoArmazem,
                            localizacao: {
                              ...novoArmazem.localizacao,
                              endereco: e.target.value
                            }
                          })}
                        />
                      </div>
                    </div>
                    
                    <div className="d-flex gap-2">
                      <button 
                        type="submit" 
                        className="btn btn-success flex-grow-1"
                        disabled={loading}
                      >
                        {loading ? 'Salvando...' : (editando ? 'Atualizar' : 'Cadastrar')}
                      </button>
                      {editando && (
                        <button 
                          type="button" 
                          className="btn btn-outline-danger"
                          onClick={() => {
                            setEditando(null);
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
                          }}
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

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
                                {[armazem.localizacao?.cidade, armazem.localizacao?.estado, armazem.localizacao?.pais]
                                  .filter(Boolean).join(', ')}
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
                                          pais: armazem.localizacao?.pais || '',
                                          estado: armazem.localizacao?.estado || '',
                                          cidade: armazem.localizacao?.cidade || '',
                                          endereco: armazem.localizacao?.endereco || ''
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
                                    disabled={userData.acess !== "Administrador"}
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