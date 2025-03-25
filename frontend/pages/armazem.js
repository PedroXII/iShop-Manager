import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Armazem() {
  const router = useRouter();
  const [armazens, setArmazens] = useState([]);
  const [nome, setNome] = useState("");
  const [capacidadeTotal, setCapacidadeTotal] = useState(0);
  const [cep, setCep] = useState("");
  const [pais, setPais] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [rua, setRua] = useState("");
  const [complemento, setComplemento] = useState("");
  const [error, setError] = useState("");
  const [editingArmazem, setEditingArmazem] = useState(null);
  const [searchNome, setSearchNome] = useState("");
  const [searchLocalizacao, setSearchLocalizacao] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [loja, setLoja] = useState(null);
  const [acess, setAcess] = useState("");
  const [aviso, setAviso] = useState("");

  // Carregar a loja e acesso do usuário logado
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loja = localStorage.getItem("loja");
      const acess = localStorage.getItem("acess");
      setLoja(loja);
      setAcess(acess);
    }
  }, []);

  // Adicionar ou editar armazém
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!loja) {
      setError("Loja não encontrada. Faça login novamente.");
      return;
    }

    // Verificar campos recomendados
    if (!nome || !capacidadeTotal) {
      setAviso("Atenção: Nome e capacidade total são recomendados");
    } else {
      setAviso("");
    }

    const armazemData = {
      nome,
      capacidadeTotal: Number(capacidadeTotal),
      capacidadeOcupada: 0,
      CEP: cep,
      pais,
      estado,
      cidade,
      rua,
      complemento,
      loja,
    };

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
        setCapacidadeTotal(0);
        setCep("");
        setPais("");
        setEstado("");
        setCidade("");
        setRua("");
        setComplemento("");
        setEditingArmazem(null);
      } else {
        setError(data.message || "Erro ao salvar armazém.");
      }
    } catch (error) {
      setError("Erro ao conectar com o servidor.");
    }
  };

  // Excluir armazém
  const handleDelete = async (objectId) => {
    if (acess !== "Administrador") {
      setError("Apenas administradores podem excluir armazéns.");
      return;
    }

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
    }
  };

  // Preencher formulário para edição
  const handleEdit = (armazem) => {
    setNome(armazem.nome || "");
    setCapacidadeTotal(armazem.capacidadeTotal || 0);
    setCep(armazem.CEP || "");
    setPais(armazem.pais || "");
    setEstado(armazem.estado || "");
    setCidade(armazem.cidade || "");
    setRua(armazem.rua || "");
    setComplemento(armazem.complemento || "");
    setEditingArmazem(armazem);
  };

  // Pesquisar armazéns
  const handleSearch = async () => {
    try {
      const response = await fetch(`/api/armazem?loja=${loja}&nome=${searchNome}&localizacao=${searchLocalizacao}`);
      const data = await response.json();

      if (response.ok) {
        setArmazens(Array.isArray(data) ? data : []);
        setShowResults(true);
      } else {
        setError(data.message || "Erro ao pesquisar armazéns.");
      }
    } catch (error) {
      setError("Erro ao conectar com o servidor.");
    }
  };

  return (
    <>
      <Head>
        <title>iShop Manager: Armazém</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <main>
          <section>
            <nav
              id="navbar"
              className="navbar bg-primary col-12 navbar-expand-lg position-fixed"
            >
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

          <section id="top" className="d-flex flex-column min-vh-100">
            <div className="container row m-auto">
              <div className="col-md-8 mx-auto mt-5">
                <h2 className="text-center mb-4">Armazéns</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                {aviso && <div className="alert alert-warning">{aviso}</div>}

                {/* Formulário para adicionar/editar armazém */}
                <form onSubmit={handleSubmit} className="mb-4">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="nome" className="form-label">Nome</label>
                      <input
                        type="text"
                        className="form-control"
                        id="nome"
                        placeholder="Nome do armazém"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="capacidade" className="form-label">Capacidade Total (L)</label>
                      <input
                        type="number"
                        className="form-control"
                        id="capacidade"
                        placeholder="Capacidade em litros"
                        value={capacidadeTotal}
                        onChange={(e) => setCapacidadeTotal(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-3 mb-3">
                      <label htmlFor="cep" className="form-label">CEP</label>
                      <input
                        type="text"
                        className="form-control"
                        id="cep"
                        placeholder="CEP"
                        value={cep}
                        onChange={(e) => setCep(e.target.value)}
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label htmlFor="pais" className="form-label">País</label>
                      <input
                        type="text"
                        className="form-control"
                        id="pais"
                        placeholder="País"
                        value={pais}
                        onChange={(e) => setPais(e.target.value)}
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label htmlFor="estado" className="form-label">Estado</label>
                      <input
                        type="text"
                        className="form-control"
                        id="estado"
                        placeholder="Estado"
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label htmlFor="cidade" className="form-label">Cidade</label>
                      <input
                        type="text"
                        className="form-control"
                        id="cidade"
                        placeholder="Cidade"
                        value={cidade}
                        onChange={(e) => setCidade(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-8 mb-3">
                      <label htmlFor="rua" className="form-label">Rua</label>
                      <input
                        type="text"
                        className="form-control"
                        id="rua"
                        placeholder="Rua"
                        value={rua}
                        onChange={(e) => setRua(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label htmlFor="complemento" className="form-label">Complemento</label>
                      <input
                        type="text"
                        className="form-control"
                        id="complemento"
                        placeholder="Complemento"
                        value={complemento}
                        onChange={(e) => setComplemento(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <button type="submit" className="btn btn-primary w-100">
                    {editingArmazem ? "Atualizar Armazém" : "Adicionar Armazém"}
                  </button>
                </form>

                {/* Área de pesquisa */}
                <div className="mb-4">
                  <h3>Pesquisar Armazéns</h3>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nome do armazém"
                        value={searchNome}
                        onChange={(e) => setSearchNome(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="País, estado ou cidade"
                        value={searchLocalizacao}
                        onChange={(e) => setSearchLocalizacao(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="d-flex">
                    <button
                      className="btn btn-secondary me-2"
                      onClick={() => {
                        setSearchNome("");
                        setSearchLocalizacao("");
                        setShowResults(false);
                      }}
                    >
                      Limpar Filtros
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleSearch}
                    >
                      Pesquisar
                    </button>
                  </div>
                </div>

                {/* Lista de armazéns (só aparece após a pesquisa) */}
                {showResults && (
                  <div className="list-group">
                    {armazens.length > 0 ? (
                      armazens.map((armazem) => (
                        <div
                          key={armazem.objectId}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <h5>{armazem.nome}</h5>
                            <p>Capacidade: {armazem.capacidadeOcupada}/{armazem.capacidadeTotal}L</p>
                            <p>Localização: {armazem.cidade}, {armazem.estado}, {armazem.pais}</p>
                            <p>Endereço: {armazem.rua}, {armazem.complemento} - CEP: {armazem.CEP}</p>
                          </div>
                          <div>
                            <button
                              className="btn btn-warning btn-sm me-2"
                              onClick={() => handleEdit(armazem)}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(armazem.objectId)}
                              disabled={acess !== "Administrador"}
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="alert alert-info">
                        Nenhum armazém encontrado com os filtros aplicados.
                      </div>
                    )}
                  </div>
                )}
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