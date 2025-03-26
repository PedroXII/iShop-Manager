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
    pais: '',
    estado: '',
    cidade: '',
    rua: ''
  });
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [loading, setLoading] = useState(false);
  const [loja, setLoja] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loja = localStorage.getItem('loja');
      setLoja(loja);
    }
  }, []);

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
  
    const params = new URLSearchParams();
    if (filtros.nome) params.append('nome', filtros.nome);
    if (filtros.localizacao) params.append('localizacao', filtros.localizacao);
    if (filtros.capacidadeMin) params.append('capacidadeMin', filtros.capacidadeMin);
    if (filtros.capacidadeMax) params.append('capacidadeMax', filtros.capacidadeMax);
  
    const data = await handleApiCall(`/api/armazem?${params.toString()}`, 'GET');
    
    if (data) {
      setArmazens(data);
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
    const acess = localStorage.getItem('acess');
    if (acess !== 'admin') {
      setError('Apenas administradores podem excluir armazéns');
      return;
    }

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

          <section className="container mt-5 pt-5">
            <div className="row justify-content-center">
              <div className="col-md-8">
                <h2 className="text-center mb-4">Gerenciar Armazéns</h2>
                
                {/* Formulário de Cadastro/Edição */}
                <form onSubmit={salvarArmazem} className="mb-4">
                  {aviso && <div className="alert alert-warning">{aviso}</div>}
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nome do Armazém *"
                      value={novoArmazem.nome}
                      onChange={(e) => setNovoArmazem({...novoArmazem, nome: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Capacidade Total *"
                      value={novoArmazem.capacidadeTotal}
                      onChange={(e) => setNovoArmazem({...novoArmazem, capacidadeTotal: e.target.value})}
                      required
                    />
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="País"
                        value={novoArmazem.pais}
                        onChange={(e) => setNovoArmazem({...novoArmazem, pais: e.target.value})}
                      />
                    </div>
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Estado"
                        value={novoArmazem.estado}
                        onChange={(e) => setNovoArmazem({...novoArmazem, estado: e.target.value})}
                      />
                    </div>
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Cidade"
                        value={novoArmazem.cidade}
                        onChange={(e) => setNovoArmazem({...novoArmazem, cidade: e.target.value})}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    {editando ? 'Atualizar Armazém' : 'Cadastrar Armazém'}
                  </button>
                  {editando && (
                    <button
                      type="button"
                      className="btn btn-secondary w-100 mt-2"
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
                      Cancelar Edição
                    </button>
                  )}
                </form>

                {/* Filtros de Pesquisa */}
                <div className="mb-4 border p-3 rounded">
                  <h5>Pesquisar Armazéns</h5>
                  <div className="row g-2">
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nome"
                        value={filtros.nome}
                        onChange={(e) => setFiltros({...filtros, nome: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Localização (País/Estado/Cidade)"
                        value={filtros.localizacao}
                        onChange={(e) => setFiltros({...filtros, localizacao: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Capacidade Mínima"
                        value={filtros.capacidadeMin}
                        onChange={(e) => setFiltros({...filtros, capacidadeMin: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Capacidade Máxima"
                        value={filtros.capacidadeMax}
                        onChange={(e) => setFiltros({...filtros, capacidadeMax: e.target.value})}
                      />
                    </div>
                  </div>
                  <button 
                    onClick={pesquisarArmazens} 
                    className="btn btn-primary mt-2 w-100"
                    disabled={loading}
                  >
                    {loading ? 'Pesquisando...' : 'Pesquisar'}
                  </button>
                </div>

                {/* Listagem de Resultados */}
                {error && <div className="alert alert-danger">{error}</div>}
                {armazens.length > 0 ? (
                  armazens.map((armazem) => (
                    <div key={armazem.objectId} className="card mb-3">
                      <div className="card-body">
                        <h5>{armazem.nome}</h5>
                        <p>Capacidade: {armazem.capacidadeTotal} m³</p>
                        <p>Localização: {armazem.cidade}, {armazem.estado}, {armazem.pais}</p>
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => {
                              setEditando(armazem.objectId);
                              setNovoArmazem(armazem);
                            }}
                            className="btn btn-sm btn-warning"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => excluirArmazem(armazem.objectId)}
                            className="btn btn-sm btn-danger"
                            disabled={loading}
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="alert alert-info">
                    Nenhum armazém encontrado. Realize uma pesquisa.
                  </div>
                )}
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