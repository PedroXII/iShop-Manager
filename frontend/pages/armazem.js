import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Armazem() {
  const router = useRouter();
  const [armazens, setArmazens] = useState([]);
  const [editando, setEditando] = useState(null);
  const [novoArmazem, setNovoArmazem] = useState({
    nome: '',
    capacidadeTotal: '',
    pais: '',
    estado: '',
    cidade: '',
    rua: ''
  });
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    nome: '',
    localizacao: '',
    capacidadeMin: '',
    capacidadeMax: ''
  });
  const [showResults, setShowResults] = useState(false);

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

    const params = new URLSearchParams({
      ...filtros,
      loja
    });

    const data = await handleApiCall(`/api/armazem?${params.toString()}`, 'GET');
    
    if (data) {
      setArmazens(data);
      setShowResults(true);
    }
  };

  const salvarArmazem = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!novoArmazem.nome || !novoArmazem.capacidadeTotal) {
      setAviso('Atenção: Nome e capacidade total são obrigatórios');
      return;
    }

    const loja = localStorage.getItem('loja');
    if (!loja) {
      setError('Loja não identificada');
      return;
    }

    const armazemData = {
      ...novoArmazem,
      capacidadeTotal: Number(novoArmazem.capacidadeTotal),
      capacidadeOcupada: 0,
      loja
    };

    const url = editando ? `/api/armazem?id=${editando}` : '/api/armazem';
    const method = editando ? 'PUT' : 'POST';
    
    const data = await handleApiCall(url, method, armazemData);
    
    if (data) {
      setNovoArmazem({ 
        nome: '', 
        capacidadeTotal: '',
        pais: '',
        estado: '',
        cidade: '',
        rua: ''
      });
      setEditando(null);
      setAviso('');
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
            <div className="container col-11 mx-auto">
              {error && <div className="alert alert-danger">{error}</div>}
              {aviso && <div className="alert alert-warning">{aviso}</div>}

              <div className="card mb-4 shadow">
                <div className="card-body">
                  <h3 className="card-title mb-4">🔍 Pesquisar Armazéns</h3>
                  <div className="row g-3">
                    <div className="col-md-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nome"
                        value={filtros.nome}
                        onChange={(e) => setFiltros({...filtros, nome: e.target.value})}
                      />
                    </div>
                    <div className="col-md-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Localização"
                        value={filtros.localizacao}
                        onChange={(e) => setFiltros({...filtros, localizacao: e.target.value})}
                      />
                    </div>
                    <div className="col-md-3">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Capacidade Mínima"
                        value={filtros.capacidadeMin}
                        onChange={(e) => setFiltros({...filtros, capacidadeMin: e.target.value})}
                      />
                    </div>
                    <div className="col-md-3">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Capacidade Máxima"
                        value={filtros.capacidadeMax}
                        onChange={(e) => setFiltros({...filtros, capacidadeMax: e.target.value})}
                      />
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
                            setShowResults(false);
                          }}
                        >
                          Limpar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card mb-4 shadow">
                <div className="card-body">
                  <h3 className="card-title mb-4">
                    {editando ? '✏️ Editar Armazém' : '➕ Novo Armazém'}
                  </h3>
                  <form onSubmit={salvarArmazem}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Nome*</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Nome do armazém"
                          value={novoArmazem.nome}
                          onChange={(e) => setNovoArmazem({...novoArmazem, nome: e.target.value})}
                          required
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
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">País</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ex: Brasil"
                          value={novoArmazem.pais}
                          onChange={(e) => setNovoArmazem({...novoArmazem, pais: e.target.value})}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Estado</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ex: São Paulo"
                          value={novoArmazem.estado}
                          onChange={(e) => setNovoArmazem({...novoArmazem, estado: e.target.value})}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Cidade</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ex: Campinas"
                          value={novoArmazem.cidade}
                          onChange={(e) => setNovoArmazem({...novoArmazem, cidade: e.target.value})}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Endereço</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Rua, número"
                          value={novoArmazem.rua}
                          onChange={(e) => setNovoArmazem({...novoArmazem, rua: e.target.value})}
                        />
                      </div>
                      <div className="col-12">
                        <button 
                          type="submit" 
                          className="btn btn-success w-100"
                          disabled={loading}
                        >
                          {loading ? 'Salvando...' : (editando ? 'Atualizar' : 'Cadastrar')}
                        </button>
                        {editando && (
                          <button 
                            type="button" 
                            className="btn btn-outline-danger w-100 mt-2"
                            onClick={() => {
                              setEditando(null);
                              setNovoArmazem({ 
                                nome: '', 
                                capacidadeTotal: '',
                                pais: '',
                                estado: '',
                                cidade: '',
                                rua: ''
                              });
                            }}
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {showResults && (
                <div className="card shadow">
                  <div className="card-body">
                    <h3 className="card-title mb-4">📦 Resultados ({armazens.length})</h3>
                    
                    {armazens.length > 0 ? (
                      <div className="list-group">
                        {armazens.map(armazem => (
                          <div 
                            key={armazem.objectId}
                            className="list-group-item list-group-item-action"
                          >
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h5>{armazem.nome}</h5>
                                <p className="mb-1">
                                  {[armazem.cidade, armazem.estado, armazem.pais].filter(Boolean).join(', ')}
                                </p>
                                <div className="progress mt-2" style={{ height: '20px' }}>
                                  <div 
                                    className="progress-bar bg-success" 
                                    style={{ 
                                      width: `${(armazem.capacidadeOcupada / armazem.capacidadeTotal) * 100}%`
                                    }}
                                  >
                                    {armazem.capacidadeOcupada}/{armazem.capacidadeTotal}L
                                  </div>
                                </div>
                              </div>
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => {
                                    setEditando(armazem.objectId);
                                    setNovoArmazem({
                                      nome: armazem.nome,
                                      capacidadeTotal: armazem.capacidadeTotal,
                                      pais: armazem.pais || '',
                                      estado: armazem.estado || '',
                                      cidade: armazem.cidade || '',
                                      rua: armazem.rua || ''
                                    });
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
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="alert alert-info">
                        Nenhum armazém encontrado com os filtros aplicados
                      </div>
                    )}
                  </div>
                </div>
              )}
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