import { useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Armazem() {
  const router = useRouter();
  const [filtros, setFiltros] = useState({
    nome: '',
    CEP: '',
    cidade: ''
  });
  const [armazens, setArmazens] = useState([]);
  const [editando, setEditando] = useState(null);
  const [novoArmazem, setNovoArmazem] = useState({
    nome: '',
    capacidadeTotal: 0,
    CEP: '',
    cidade: '',
    estado: '',
    rua: ''
  });
  const [error, setError] = useState('');

  const pesquisarArmazens = async () => {
    try {
      const loja = localStorage.getItem('loja');
      if (!loja) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/armazem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...filtros, loja }),
      });

      const data = await response.json();
      if (response.ok) {
        setArmazens(data);
      } else {
        setError(data.message || 'Erro ao pesquisar armazéns');
      }
    } catch (error) {
      setError('Erro ao conectar com o servidor');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const loja = localStorage.getItem('loja');
      const acess = localStorage.getItem('acess');
      
      if (!loja) {
        router.push('/login');
        return;
      }

      const method = editando ? 'PUT' : 'POST';
      const url = editando ? `/api/armazem/${editando}` : '/api/armazem';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...novoArmazem,
          loja,
          capacidadeOcupada: 0,
          acess // Para verificação de permissões no back-end
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setNovoArmazem({ nome: '', capacidadeTotal: 0, CEP: '', cidade: '', estado: '', rua: '' });
        setEditando(null);
        pesquisarArmazens();
      } else {
        setError(data.message || 'Erro ao salvar armazém');
      }
    } catch (error) {
      setError('Erro ao conectar com o servidor');
    }
  };

  const excluirArmazem = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este armazém?')) return;

    try {
      const loja = localStorage.getItem('loja');
      if (!loja) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/armazem/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ loja })
      });

      const data = await response.json();
      if (response.ok) {
        pesquisarArmazens();
      } else {
        setError(data.message || 'Erro ao excluir armazém');
      }
    } catch (error) {
      setError('Erro ao conectar com o servidor');
    }
  };

  return (
    <>
      <Head>
        <title>iShop Manager: Armazéns</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
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
                    <div className="col-md-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="CEP"
                        value={filtros.CEP}
                        onChange={(e) => setFiltros({...filtros, CEP: e.target.value})}
                      />
                    </div>
                    <div className="col-md-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Cidade"
                        value={filtros.cidade}
                        onChange={(e) => setFiltros({...filtros, cidade: e.target.value})}
                      />
                    </div>
                    <div className="col-md-2">
                      <button 
                        className="btn btn-primary w-100"
                        onClick={pesquisarArmazens}
                      >
                        Pesquisar
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
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Nome</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Nome do armazém"
                          required
                          value={novoArmazem.nome}
                          onChange={(e) => setNovoArmazem({...novoArmazem, nome: e.target.value})}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Capacidade Total</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Capacidade total"
                          required
                          min="0"
                          value={novoArmazem.capacidadeTotal}
                          onChange={(e) => setNovoArmazem({...novoArmazem, capacidadeTotal: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="row g-3 mb-3">
                      <div className="col-md-3">
                        <label className="form-label">CEP</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="CEP"
                          value={novoArmazem.CEP}
                          onChange={(e) => setNovoArmazem({...novoArmazem, CEP: e.target.value})}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Cidade</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Cidade"
                          value={novoArmazem.cidade}
                          onChange={(e) => setNovoArmazem({...novoArmazem, cidade: e.target.value})}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Estado</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Estado"
                          value={novoArmazem.estado}
                          onChange={(e) => setNovoArmazem({...novoArmazem, estado: e.target.value})}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Rua</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Rua"
                          value={novoArmazem.rua}
                          onChange={(e) => setNovoArmazem({...novoArmazem, rua: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <button type="submit" className="btn btn-success mt-3">
                      {editando ? 'Atualizar' : 'Cadastrar'}
                    </button>
                    {editando && (
                      <button 
                        type="button" 
                        className="btn btn-secondary mt-3 ms-2"
                        onClick={() => {
                          setEditando(null);
                          setNovoArmazem({ nome: '', capacidadeTotal: 0, CEP: '', cidade: '', estado: '', rua: '' });
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
                  <h5 className="card-title">📦 Lista de Armazéns</h5>
                  
                  {armazens.length > 0 ? (
                    armazens.map(armazem => (
                      <div key={armazem.objectId} className="border p-3 mb-3 rounded">
                        <div className="row align-items-center">
                          <div className="col-md-4">
                            <h6>{armazem.nome}</h6>
                            <small className="text-muted">
                              {armazem.rua}, {armazem.cidade} - {armazem.estado}
                            </small>
                          </div>
                          <div className="col-md-4">
                            <div className="progress">
                              <div 
                                className="progress-bar" 
                                role="progressbar" 
                                style={{ width: `${(armazem.capacidadeOcupada / armazem.capacidadeTotal) * 100}%` }}
                                aria-valuenow={armazem.capacidadeOcupada}
                                aria-valuemin="0"
                                aria-valuemax={armazem.capacidadeTotal}
                              >
                                {armazem.capacidadeOcupada}/{armazem.capacidadeTotal}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-4 text-end">
                            <button 
                              className="btn btn-sm btn-primary me-2"
                              onClick={() => {
                                setEditando(armazem.objectId);
                                setNovoArmazem(armazem);
                              }}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => excluirArmazem(armazem.objectId)}
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted py-4">
                      Nenhum armazém encontrado. Realize uma pesquisa para visualizar os resultados.
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