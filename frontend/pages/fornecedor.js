import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from './components/NavbarUser';

export default function Fornecedor() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [fornecedores, setFornecedores] = useState([]);
  const [nome, setNome] = useState("");
  const [fornecimento, setFornecimento] = useState("");
  const [observacao, setObservacao] = useState("");
  const [error, setError] = useState("");
  const [editingFornecedor, setEditingFornecedor] = useState(null);
  const [searchNome, setSearchNome] = useState("");
  const [searchFornecimento, setSearchFornecimento] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [loja, setLoja] = useState(null);
  const router = useRouter();

  // Carregar a loja do usuário logado apenas no lado do cliente
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loja = localStorage.getItem("loja");
      setLoja(loja);
    }
  }, []);

  // Carregar fornecedores da loja do usuário logado
  useEffect(() => {
    if (loja) {
      const fetchFornecedores = async () => {
        try {
          const response = await fetch(`/api/fornecedor?loja=${loja}`);
          const data = await response.json();
          if (response.ok) {
            setFornecedores(data);
          } else {
            setError(data.message || "Erro ao carregar fornecedores.");
          }
        } catch (error) {
          setError("Erro ao conectar com o servidor.");
        }
      };

      fetchFornecedores();
    }
  }, [loja]);

  // Adicionar ou editar fornecedor
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!loja) {
      setError("Loja não encontrada. Faça login novamente.");
      return;
    }

    if (!nome) {
      setError("O campo Nome é obrigatório.");
      return;
    }

    const fornecedorData = {
      nome,
      fornecimento,
      observacao,
      loja,
    };

    try {
      const url = editingFornecedor
        ? `/api/fornecedor?objectId=${editingFornecedor.objectId}`
        : "/api/fornecedor";
      const method = editingFornecedor ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fornecedorData),
      });

      const data = await response.json();

      if (response.ok) {
        // Atualizar a lista de fornecedores
        if (editingFornecedor) {
          setFornecedores(
            fornecedores.map((f) =>
              f.objectId === editingFornecedor.objectId ? data : f
            )
          );
        } else {
          setFornecedores([...fornecedores, data]);
        }
        // Limpar o formulário
        setNome("");
        setFornecimento("");
        setObservacao("");
        setEditingFornecedor(null);
        setError("");
      } else {
        setError(data.message || "Erro ao salvar fornecedor.");
      }
    } catch (error) {
      setError("Erro ao conectar com o servidor.");
    }
  };

  // Excluir fornecedor
  const handleDelete = async (objectId) => {
    try {
      const response = await fetch(`/api/fornecedor?objectId=${objectId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setFornecedores(fornecedores.filter((f) => f.objectId !== objectId));
      } else {
        const data = await response.json();
        setError(data.message || "Erro ao excluir fornecedor.");
      }
    } catch (error) {
      setError("Erro ao conectar com o servidor.");
    }
  };

  // Preencher formulário para edição
  const handleEdit = (fornecedor) => {
    setNome(fornecedor.nome);
    setFornecimento(fornecedor.fornecimento || "");
    setObservacao(fornecedor.observacao || "");
    setEditingFornecedor(fornecedor);
  };

  // Filtrar fornecedores com base nos critérios de pesquisa
  const filteredFornecedores = fornecedores.filter((fornecedor) => {
    return (
      (searchNome === "" ||
        fornecedor.nome.toLowerCase().includes(searchNome.toLowerCase())) &&
      (searchFornecimento === "" ||
        (fornecedor.fornecimento && 
         fornecedor.fornecimento.toLowerCase().includes(searchFornecimento.toLowerCase())))
    );
  });

  // Função para lidar com a pesquisa
  const handleSearch = () => {
    setShowResults(true);
  };

  return (
    <>
      <Head>
        <title>iShop Manager: Fornecedor</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
        <link rel="icon" href="/favicon.ico"/>
      </Head>
      <div>
        <main>
          <section>
            <Navbar />
          </section>

          <section id="top" className="d-flex flex-column min-vh-100">
            <div className="container row m-auto">
              <div className="col-md-8 mx-auto mt-5">
                <h2 className="text-center mb-4">Fornecedores</h2>
                {error && <div className="alert alert-danger">{error}</div>}

                {/* Formulário para adicionar/editar fornecedor */}
                <form onSubmit={handleSubmit} className="mb-4">
                  <div className="mb-3">
                    <label htmlFor="nome" className="form-label">Nome*</label>
                    <input
                      type="text"
                      className="form-control"
                      id="nome"
                      placeholder="Digite o nome do fornecedor"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="fornecimento" className="form-label">Fornecimento</label>
                    <textarea
                      className="form-control"
                      id="fornecimento"
                      placeholder="Descreva o que o fornecedor oferece"
                      value={fornecimento}
                      onChange={(e) => setFornecimento(e.target.value)}
                      rows="3"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="observacao" className="form-label">Observação</label>
                    <textarea
                      className="form-control"
                      id="observacao"
                      placeholder="Adicione observações sobre o fornecedor"
                      value={observacao}
                      onChange={(e) => setObservacao(e.target.value)}
                      rows="3"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    {editingFornecedor ? "Atualizar Fornecedor" : "Adicionar Fornecedor"}
                  </button>
                </form>

                {/* Área de pesquisa e filtros */}
                <div className="mb-4">
                  <h3>Pesquisar Fornecedores</h3>
                  <div className="row">
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nome"
                        value={searchNome}
                        onChange={(e) => setSearchNome(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Fornecimento"
                        value={searchFornecimento}
                        onChange={(e) => setSearchFornecimento(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    className="btn btn-secondary mt-2"
                    onClick={() => {
                      setSearchNome("");
                      setSearchFornecimento("");
                      setShowResults(false);
                    }}
                  >
                    Limpar Filtros
                  </button>
                  <button
                    className="btn btn-primary mt-2 ms-2"
                    onClick={handleSearch}
                  >
                    Pesquisar
                  </button>
                </div>

                {/* Lista de fornecedores (só aparece após a pesquisa) */}
                {showResults && (
                  <div className="list-group">
                    {filteredFornecedores.length > 0 ? (
                      filteredFornecedores.map((fornecedor) => (
                        <div
                          key={fornecedor.objectId}
                          className="list-group-item"
                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h5>{fornecedor.nome}</h5>
                              {fornecedor.fornecimento && (
                                <p><strong>Fornecimento:</strong> {fornecedor.fornecimento}</p>
                              )}
                              {fornecedor.observacao && (
                                <p><strong>Observação:</strong> {fornecedor.observacao}</p>
                              )}
                            </div>
                            <div>
                              <button
                                className="btn btn-warning btn-sm me-2"
                                onClick={() => handleEdit(fornecedor)}
                              >
                                Editar
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(fornecedor.objectId)}
                              >
                                Excluir
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="alert alert-info">
                        Nenhum fornecedor encontrado com os filtros aplicados.
                      </div>
                    )}
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