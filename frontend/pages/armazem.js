import { useState } from 'react';
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

  const handleApiCall = async (url, method, body) => {
    try {
      const loja = localStorage.getItem('loja');
      if (!loja) {
        router.push('/login');
        return null;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-User-Loja': loja,
          'X-User-Acess': localStorage.getItem('acess') || ''
        },
        body: body ? JSON.stringify(body) : undefined
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erro na requisição');
      }
      return data;
    } catch (error) {
      setError(error.message);
      return null;
    }
  };

  const pesquisarArmazens = async () => {
    const data = await handleApiCall('/api/armazem', 'POST', filtros);
    if (data) setArmazens(data);
  };

  const salvarArmazem = async (e) => {
    e.preventDefault();
    setError('');
    
    // Verificação de campos recomendados
    if (!novoArmazem.nome || !novoArmazem.capacidadeTotal) {
      setAviso('Campos recomendados: nome e capacidade total');
    } else {
      setAviso('');
    }

    const url = editando ? `/api/armazem?id=${editando}` : '/api/armazem';
    const method = editando ? 'PUT' : 'POST';
    
    const data = await handleApiCall(url, method, novoArmazem);
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
      if (data) pesquisarArmazens();
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
          {/* Navbar Completa */}
          <section>
            <nav id="navbar" className="navbar bg-primary col-12 navbar-expand-lg position-fixed">
              <div className="container-fluid col-11 m-auto">
                <Link href="/home">
                  <Image
                    src="/Varios-12-150ppp-01.jpg"
                    alt="LOGO"
                    width={40}
                    height={40}
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
                      <Link href="/home">
                        <a className="nav-link text-light">Home</a>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/funcionario">
                        <a className="nav-link text-light">Funcionário</a>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/cliente">
                        <a className="nav-link text-light">Cliente</a>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="#top">
                        <a className="nav-link text-light">Armazém</a>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/promocao">
                        <a className="nav-link text-light">Promoção</a>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/produto">
                        <a className="nav-link text-light">Produto</a>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/loja_parceira">
                        <a className="nav-link text-light">Parceiro</a>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/index">
                        <a className="nav-link text-light">Logout</a>
                      </Link>
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

              {/* Filtros de Pesquisa */}
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
                          placeholder="Capacidade mínima (L)"
                          value={filtros.capacidadeMin}
                          onChange={(e) => setFiltros({...filtros, capacidadeMin: e.target.value})}
                        />
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Capacidade máxima (L)"
                          value={filtros.capacidadeMax}
                          onChange={(e) => setFiltros({...filtros, capacidadeMax: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <button 
                        className="btn btn-primary me-2"
                        onClick={pesquisarArmazens}
                      >
                        Pesquisar
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => {
                          setFiltros({
                            nome: '',
                            localizacao: '',
                            capacidadeMin: '',
                            capacidadeMax: ''
                          });
                          pesquisarArmazens();
                        }}
                      >
                        Limpar Filtros
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulário para Criar/Editar */}
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
                        <label className="form-label">Capacidade Total (em litros)*</label>
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
                          placeholder="País"
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
                          placeholder="Estado ou província"
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
                          placeholder="Cidade"
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
                          placeholder="Endereço completo"
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
                    
                    <button type="submit" className="btn btn-success">
                      {editando ? 'Atualizar' : 'Cadastrar'}
                    </button>
                    {editando && (
                      <button 
                        type="button" 
                        className="btn btn-secondary ms-2"
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
                  </form>
                </div>
              </div>

              {/* Listagem de Resultados */}
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">📦 Armazéns Encontrados ({armazens.length})</h5>
                  
                  {armazens.length > 0 ? (
                    <div className="list-group">
                      {armazens.map(armazem => (
                        <div key={armazem.objectId} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6>{armazem.nome || 'Sem nome'}</h6>
                              <small className="text-muted">
                                {[armazem.localizacao?.cidade, armazem.localizacao?.estado, armazem.localizacao?.pais]
                                  .filter(Boolean).join(', ')}
                              </small>
                            </div>
                            <div>
                              <span className="badge bg-primary me-2">
                                {armazem.capacidadeTotal}L
                              </span>
                              <button 
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => {
                                  setEditando(armazem.objectId);
                                  setNovoArmazem(armazem);
                                }}
                              >
                                Editar
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => excluirArmazem(armazem.objectId)}
                              >
                                Excluir
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted py-4">
                      Nenhum armazém encontrado. Realize uma pesquisa.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <footer className="d-flex align-items-center justify-content-center py-3" id="bottom">
            <p className="mb-0">&copy;iShop Manager 2025. Todos os direitos reservados.</p>
          </footer>
        </main>
      </div>
    </>
  );
}