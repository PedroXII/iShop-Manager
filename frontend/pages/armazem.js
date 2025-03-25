import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Armazem() {
  const router = useRouter();
  const [armazens, setArmazens] = useState([]);
  const [formData, setFormData] = useState({
    nome: '',
    capacidadeTotal: '',
    pais: '',
    estado: '',
    cidade: '',
    rua: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState(null);
  const [filtros, setFiltros] = useState({
    nome: '',
    localizacao: '',
    capacidadeMin: '',
    capacidadeMax: ''
  });
  const [showResults, setShowResults] = useState(false);

  // Busca armazéns com filtros
  const pesquisarArmazens = async () => {
    const loja = localStorage.getItem('loja');
    if (!loja) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...filtros,
        loja
      });

      const response = await fetch(`/api/armazem?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setArmazens(data);
        setShowResults(true);
      } else {
        throw new Error(data.message || "Erro na pesquisa");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // CRUD Operations
  const salvarArmazem = async (e) => {
    e.preventDefault();
    if (!formData.nome || !formData.capacidadeTotal) {
      setError("Nome e capacidade são obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const loja = localStorage.getItem('loja');
      const method = editando ? 'PUT' : 'POST';
      const url = editando ? `/api/armazem?id=${editando}` : '/api/armazem';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-User-Loja': loja,
          'X-User-Acess': localStorage.getItem('acess')
        },
        body: JSON.stringify({
          ...formData,
          capacidadeTotal: Number(formData.capacidadeTotal),
          capacidadeOcupada: 0,
          loja
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      // Atualiza a lista
      await pesquisarArmazens();
      setFormData({
        nome: '',
        capacidadeTotal: '',
        pais: '',
        estado: '',
        cidade: '',
        rua: ''
      });
      setEditando(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const excluirArmazem = async (id) => {
    if (confirm("Tem certeza que deseja excluir?")) {
      setLoading(true);
      try {
        const response = await fetch(`/api/armazem?id=${id}`, {
          method: 'DELETE',
          headers: {
            'X-User-Loja': localStorage.getItem('loja'),
            'X-User-Acess': localStorage.getItem('acess')
          }
        });
        if (!response.ok) throw new Error("Falha ao excluir");
        await pesquisarArmazens();
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Preenche formulário para edição
  const iniciarEdicao = (armazem) => {
    setFormData({
      nome: armazem.nome,
      capacidadeTotal: armazem.capacidadeTotal,
      pais: armazem.pais || '',
      estado: armazem.estado || '',
      cidade: armazem.cidade || '',
      rua: armazem.rua || ''
    });
    setEditando(armazem.objectId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Verifica autenticação
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('loja')) {
      router.push('/login');
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>iShop Manager - Armazéns</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navbar Padrão */}
      <nav className="navbar bg-primary navbar-expand-lg fixed-top">
        <div className="container-fluid">
          <Link href="/home" className="navbar-brand">
            <Image 
              src="/Varios-12-150ppp-01.jpg" 
              alt="Logo" 
              width={40} 
              height={40} 
            />
          </Link>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link href="/home" className="nav-link text-light">Home</Link>
              </li>
              {/* Outros links da navbar... */}
            </ul>
          </div>
        </div>
      </nav>

      <main className="container mt-5 pt-4">
        {/* Formulário de Cadastro/Edição */}
        <div className="card shadow mb-4">
          <div className="card-body">
            <h2 className="card-title">
              {editando ? '✏️ Editar Armazém' : '➕ Novo Armazém'}
            </h2>
            {error && <div className="alert alert-danger">{error}</div>}
            
            <form onSubmit={salvarArmazem}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Nome*</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Capacidade Total (L)*</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.capacidadeTotal}
                    onChange={(e) => setFormData({...formData, capacidadeTotal: e.target.value})}
                    required
                  />
                </div>
                {/* Outros campos do formulário... */}
              </div>
              <button 
                type="submit" 
                className="btn btn-primary mt-3"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
              {editando && (
                <button
                  type="button"
                  className="btn btn-outline-secondary mt-3 ms-2"
                  onClick={() => {
                    setEditando(null);
                    setFormData({
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
            </form>
          </div>
        </div>

        {/* Seção de Pesquisa */}
        <div className="card shadow mb-4">
          <div className="card-body">
            <h2 className="card-title mb-4">🔍 Pesquisar Armazéns</h2>
            <div className="row g-3">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nome ou parte do nome"
                  value={filtros.nome}
                  onChange={(e) => setFiltros({...filtros, nome: e.target.value})}
                />
                <small className="text-muted">Ex: "arm" para "Armazém 1"</small>
              </div>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Cidade, Estado ou País"
                  value={filtros.localizacao}
                  onChange={(e) => setFiltros({...filtros, localizacao: e.target.value})}
                />
                <small className="text-muted">Ex: "São Paulo" ou "Brasil"</small>
              </div>
              {/* Filtros de capacidade... */}
              <div className="col-12">
                <button
                  className="btn btn-primary me-2"
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
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Resultados da Pesquisa */}
        {showResults && (
          <div className="card shadow">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="card-title mb-0">
                  📦 Resultados ({armazens.length})
                </h2>
                <small className="text-muted">
                  {filtros.nome && `Nome: "${filtros.nome}"`}
                  {filtros.localizacao && ` | Local: "${filtros.localizacao}"`}
                </small>
              </div>

              {armazens.length > 0 ? (
                <div className="list-group">
                  {armazens.map((armazem) => (
                    <div key={armazem.objectId} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h5>{armazem.nome}</h5>
                          <p className="mb-1 text-muted">
                            {[armazem.cidade, armazem.estado, armazem.pais].filter(Boolean).join(' • ')}
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
                        <div>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => iniciarEdicao(armazem)}
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
                  Nenhum armazém encontrado com os critérios atuais
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer Padrão */}
      <footer className="bg-light py-3 mt-4">
        <div className="container text-center">
          <p className="mb-0">
            &copy; {new Date().getFullYear()} iShop Manager. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </>
  );
}