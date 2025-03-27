import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Armazem() {
  const router = useRouter();
  const [armazens, setArmazens] = useState([]);
  const [nome, setNome] = useState("");
  const [capacidadeTotal, setCapacidadeTotal] = useState("");
  const [pais, setPais] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [rua, setRua] = useState("");
  const [error, setError] = useState("");
  const [editingArmazem, setEditingArmazem] = useState(null);
  const [searchNome, setSearchNome] = useState("");
  const [searchLocalizacao, setSearchLocalizacao] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [loja, setLoja] = useState(null);
  const [loading, setLoading] = useState(false);

  // Carregar a loja do usuário logado
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loja = localStorage.getItem("loja");
      setLoja(loja);
    }
  }, []);

  // Carregar armazéns da loja do usuário logado
  useEffect(() => {
    if (loja) {
      const fetchArmazens = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/armazem?loja=${loja}`);
          const data = await response.json();
          if (response.ok) {
            setArmazens(data);
          } else {
            setError(data.message || "Erro ao carregar armazéns.");
          }
        } catch (error) {
          setError("Erro ao conectar com o servidor.");
        } finally {
          setLoading(false);
        }
      };

      fetchArmazens();
    }
  }, [loja]);

  // Adicionar ou editar armazém
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!loja) {
      setError("Loja não encontrada. Faça login novamente.");
      return;
    }

    if (!nome || !capacidadeTotal) {
      setError("Nome e capacidade total são obrigatórios.");
      return;
    }

    const armazemData = {
      nome,
      capacidadeTotal,
      pais,
      estado,
      cidade,
      rua,
      loja,
    };

    setLoading(true);
    try {
      const url = editingArmazem
        ? `/api/armazem?objectId=${editingArmazem.objectId}`
        : "/api/armazem";
      const method = editingArmazem ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(armazemData),
      });

      const data = await response.json();

      if (response.ok) {
        // Atualizar a lista de armazéns
        if (editingArmazem) {
          setArmazens(
            armazens.map((a) =>
              a.objectId === editingArmazem.objectId ? data : a
            )
          );
        } else {
          setArmazens([...armazens, data]);
        }
        // Limpar o formulário
        setNome("");
        setCapacidadeTotal("");
        setPais("");
        setEstado("");
        setCidade("");
        setRua("");
        setEditingArmazem(null);
      } else {
        setError(data.message || "Erro ao salvar armazém.");
      }
    } catch (error) {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Excluir armazém
  const handleDelete = async (objectId) => {
    if (window.confirm("Tem certeza que deseja excluir este armazém?")) {
      setLoading(true);
      try {
        const response = await fetch(`/api/armazem?objectId=${objectId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setArmazens(armazens.filter((a) => a.objectId !== objectId));
        } else {
          const data = await response.json();
          setError(data.message || "Erro ao excluir armazém.");
        }
      } catch (error) {
        setError("Erro ao conectar com o servidor.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Preencher formulário para edição
  const handleEdit = (armazem) => {
    setNome(armazem.nome);
    setCapacidadeTotal(armazem.capacidadeTotal);
    setPais(armazem.pais || "");
    setEstado(armazem.estado || "");
    setCidade(armazem.cidade || "");
    setRua(armazem.rua || "");
    setEditingArmazem(armazem);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filtrar armazéns com base nos critérios de pesquisa
  const filteredArmazens = armazens.filter((armazem) => {
    const localizacao = [armazem.cidade, armazem.estado, armazem.pais]
      .filter(Boolean)
      .join(", ")
      .toLowerCase();
    
    return (
      (searchNome === "" ||
        armazem.nome.toLowerCase().includes(searchNome.toLowerCase())) &&
      (searchLocalizacao === "" ||
        localizacao.includes(searchLocalizacao.toLowerCase()))
    );
  });

  // Função para lidar com a pesquisa
  const handleSearch = () => {
    setShowResults(true);
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
            <nav className="navbar navbar-expand-lg bg-primary fixed-top">
              <div className="container-fluid">
                <Link href="/home" className="navbar-brand">
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
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-expanded={isMenuOpen}
                  aria-label="Toggle navigation"
                >
                  <span className="navbar-toggler-icon"></span>
                </button>

                <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
                  <ul className="navbar-nav ms-auto">
                    <li className="nav-item">
                      <Link href="/home" className="nav-link text-light">
                        Home
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/armazem" className="nav-link text-light">
                        Armazém
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/fornecedor" className="nav-link text-light">
                        Fornecedor
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/funcionario" className="nav-link text-light">
                        Funcionário
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/cliente" className="nav-link text-light">
                        Cliente
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/produto" className="nav-link text-light">
                        Produto
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/promocao" className="nav-link text-light">
                        Promoção
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/index" className="nav-link text-light">
                        Logout
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

              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title">
                    {editingArmazem ? '✏️ Editar Armazém' : '➕ Novo Armazém'}
                  </h5>
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Nome*</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Nome do armazém"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
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
                          value={capacidadeTotal}
                          onChange={(e) => setCapacidadeTotal(e.target.value)}
                          required
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
                          value={pais}
                          onChange={(e) => setPais(e.target.value)}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Estado/Província</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ex: São Paulo"
                          value={estado}
                          onChange={(e) => setEstado(e.target.value)}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Cidade</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ex: Campinas"
                          value={cidade}
                          onChange={(e) => setCidade(e.target.value)}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Endereço</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Rua, número"
                          value={rua}
                          onChange={(e) => setRua(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="d-flex gap-2">
                      <button 
                        type="submit" 
                        className="btn btn-success flex-grow-1"
                        disabled={loading}
                      >
                        {loading ? 'Salvando...' : (editingArmazem ? 'Atualizar' : 'Cadastrar')}
                      </button>
                      {editingArmazem && (
                        <button 
                          type="button" 
                          className="btn btn-outline-danger"
                          onClick={() => {
                            setEditingArmazem(null);
                            setNome("");
                            setCapacidadeTotal("");
                            setPais("");
                            setEstado("");
                            setCidade("");
                            setRua("");
                          }}
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title">🔍 Pesquisar Armazéns</h5>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nome do armazém"
                        value={searchNome}
                        onChange={(e) => setSearchNome(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="País, estado ou cidade"
                        value={searchLocalizacao}
                        onChange={(e) => setSearchLocalizacao(e.target.value)}
                      />
                    </div>
                    <div className="col-12">
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-primary flex-grow-1"
                          onClick={handleSearch}
                          disabled={loading}
                        >
                          {loading ? 'Pesquisando...' : 'Pesquisar'}
                        </button>
                        <button 
                          className="btn btn-outline-secondary"
                          onClick={() => {
                            setSearchNome("");
                            setSearchLocalizacao("");
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

              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title mb-0">
                      📦 Armazéns ({showResults ? filteredArmazens.length : armazens.length})
                    </h5>
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => {
                        setSearchNome("");
                        setSearchLocalizacao("");
                        setShowResults(false);
                      }}
                    >
                      Mostrar Todos
                    </button>
                  </div>
                  
                  {(showResults ? filteredArmazens : armazens).length > 0 ? (
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
                          {(showResults ? filteredArmazens : armazens).map(armazem => (
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
                                    onClick={() => handleEdit(armazem)}
                                  >
                                    Editar
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDelete(armazem.objectId)}
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
                        {showResults
                          ? 'Nenhum armazém encontrado com esses filtros'
                          : 'Nenhum armazém cadastrado ainda'}
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