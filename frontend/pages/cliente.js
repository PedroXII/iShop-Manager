import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from './components/NavbarUser';

export default function Client() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [nome, setNome] = useState("");
  const [statusAssinatura, setStatusAssinatura] = useState(false);
  const [idade, setIdade] = useState(18);
  const [comprasAnteriores, setComprasAnteriores] = useState([]);
  const [sexo, setSexo] = useState("");
  const [error, setError] = useState("");
  const [editingCliente, setEditingCliente] = useState(null);
  const [searchNome, setSearchNome] = useState("");
  const [searchIdade, setSearchIdade] = useState("");
  const [searchSexo, setSearchSexo] = useState("");
  const [searchStatusAssinatura, setSearchStatusAssinatura] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [loja, setLoja] = useState(null); // Estado para armazenar a loja
  const router = useRouter();

  // Carregar a loja do usuário logado apenas no lado do cliente
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loja = localStorage.getItem("loja");
      setLoja(loja);
    }
  }, []);

  // Carregar clientes da loja do usuário logado
  useEffect(() => {
    if (loja) {
      const fetchClientes = async () => {
        try {
          const response = await fetch(`/api/clientes?loja=${loja}`);
          const data = await response.json();
          if (response.ok) {
            setClientes(data);
          } else {
            setError(data.message || "Erro ao carregar clientes.");
          }
        } catch (error) {
          setError("Erro ao conectar com o servidor.");
        }
      };

      fetchClientes();
    }
  }, [loja]);

  // Adicionar ou editar cliente
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!loja) {
      setError("Loja não encontrada. Faça login novamente.");
      return;
    }

    const clienteData = {
      nome,
      statusAssinatura,
      idade,
      comprasAnteriores,
      sexo,
      loja, 
    };

    try {
      const url = editingCliente
        ? `/api/clientes?objectId=${editingCliente.objectId}`
        : "/api/clientes";
      const method = editingCliente ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clienteData),
      });

      const data = await response.json();

      if (response.ok) {
        // Atualizar a lista de clientes
        if (editingCliente) {
          setClientes(
            clientes.map((c) =>
              c.objectId === editingCliente.objectId ? data : c
            )
          );
        } else {
          setClientes([...clientes, data]);
        }
        // Limpar o formulário
        setNome("");
        setStatusAssinatura(false);
        setIdade(18);
        setComprasAnteriores([]);
        setSexo("");
        setEditingCliente(null);
      } else {
        setError(data.message || "Erro ao salvar cliente.");
      }
    } catch (error) {
      setError("Erro ao conectar com o servidor.");
    }
  };

  // Excluir cliente
  const handleDelete = async (objectId) => {
    try {
      const response = await fetch(`/api/clientes?objectId=${objectId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setClientes(clientes.filter((c) => c.objectId !== objectId));
      } else {
        const data = await response.json();
        setError(data.message || "Erro ao excluir cliente.");
      }
    } catch (error) {
      setError("Erro ao conectar com o servidor.");
    }
  };

  // Preencher formulário para edição
  const handleEdit = (cliente) => {
    setNome(cliente.nome);
    setStatusAssinatura(cliente.statusAssinatura);
    setIdade(cliente.idade);
    setComprasAnteriores(cliente.comprasAnteriores || []);
    setSexo(cliente.sexo || "");
    setEditingCliente(cliente);
  };

  // Filtrar clientes com base nos critérios de pesquisa
  const filteredClientes = clientes.filter((cliente) => {
    return (
      (searchNome === "" ||
        cliente.nome.toLowerCase().includes(searchNome.toLowerCase())) &&
      (searchIdade === "" || cliente.idade === Number(searchIdade)) &&
      (searchSexo === "" ||
        cliente.sexo.toLowerCase().includes(searchSexo.toLowerCase())) &&
      (searchStatusAssinatura === "" ||
        cliente.statusAssinatura === (searchStatusAssinatura === "true"))
    );
  });

  // Função para lidar com a pesquisa
  const handleSearch = () => {
    setShowResults(true); // Mostrar resultados após a pesquisa
  };

  return (
    <>
      <Head>
        <title>iShop Manager: Clientes</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <main>
          <section>
            <Navbar />
          </section>

          <section id="top" className="d-flex flex-column min-vh-100 pt-5">
            <div className="container row m-auto">
              <div className="col-md-8 mx-auto mt-5">
                <h2 className="text-center mb-4">Clientes</h2>
                {error && <div className="alert alert-danger">{error}</div>}

                {/* Formulário para adicionar/editar cliente */}
                <form onSubmit={handleSubmit} className="mb-4">
                  <div className="mb-3">
                    <label htmlFor="nome" className="form-label">Nome</label>
                    <input
                      type="text"
                      className="form-control"
                      id="nome"
                      placeholder="Digite o nome do cliente"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="idade" className="form-label">Idade</label>
                    <input
                      type="number"
                      className="form-control"
                      id="idade"
                      placeholder="Digite a idade do cliente"
                      value={idade}
                      onChange={(e) => setIdade(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="sexo" className="form-label">Sexo</label>
                    <input
                      type="text"
                      className="form-control"
                      id="sexo"
                      placeholder="Digite o sexo do cliente"
                      value={sexo}
                      onChange={(e) => setSexo(e.target.value)}
                    />
                  </div>
                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="statusAssinatura"
                      checked={statusAssinatura}
                      onChange={(e) => setStatusAssinatura(e.target.checked)}
                    />
                    <label htmlFor="statusAssinatura" className="form-check-label">Status de Assinatura</label>
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    {editingCliente ? "Atualizar Cliente" : "Adicionar Cliente"}
                  </button>
                </form>

                {/* Área de pesquisa e filtros */}
                <div className="mb-4">
                  <h3>Pesquisar Clientes</h3>
                  <div className="row">
                    <div className="col-md-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nome"
                        value={searchNome}
                        onChange={(e) => setSearchNome(e.target.value)}
                      />
                    </div>
                    <div className="col-md-3">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Idade"
                        value={searchIdade}
                        onChange={(e) => setSearchIdade(e.target.value)}
                      />
                    </div>
                    <div className="col-md-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Sexo"
                        value={searchSexo}
                        onChange={(e) => setSearchSexo(e.target.value)}
                      />
                    </div>
                    <div className="col-md-3">
                      <select
                        className="form-control"
                        value={searchStatusAssinatura}
                        onChange={(e) => setSearchStatusAssinatura(e.target.value)}
                      >
                        <option value="">Status de Assinatura</option>
                        <option value="true">Ativa</option>
                        <option value="false">Inativa</option>
                      </select>
                    </div>
                  </div>
                  <button
                    className="btn btn-secondary mt-2"
                    onClick={() => {
                      setSearchNome("");
                      setSearchIdade("");
                      setSearchSexo("");
                      setSearchStatusAssinatura("");
                      setShowResults(false); // Limpar resultados ao limpar filtros
                    }}
                  >
                    Limpar Filtros
                  </button>
                  <button
                    className="btn btn-primary mt-2 ms-2"
                    onClick={handleSearch} // Executar a pesquisa
                  >
                    Pesquisar
                  </button>
                </div>

                {/* Lista de clientes (só aparece após a pesquisa) */}
                {showResults && (
                  <div className="list-group">
                    {filteredClientes.length > 0 ? (
                      filteredClientes.map((cliente) => (
                        <div
                          key={cliente.objectId}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <h5>{cliente.nome}</h5>
                            <p>Idade: {cliente.idade}</p>
                            <p>Sexo: {cliente.sexo}</p>
                            <p>Assinatura: {cliente.statusAssinatura ? "Ativa" : "Inativa"}</p>
                          </div>
                          <div>
                            <button
                              className="btn btn-warning btn-sm me-2"
                              onClick={() => handleEdit(cliente)}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(cliente.objectId)}
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="alert alert-info">
                        Nenhum cliente encontrado com os filtros aplicados.
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