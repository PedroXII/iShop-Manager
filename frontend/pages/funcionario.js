import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Funcionario() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [funcionarios, setFuncionarios] = useState([]);
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [salario, setSalario] = useState(0);
  const [idade, setIdade] = useState(18);
  const [sexo, setSexo] = useState("");
  const [deficiencia, setDeficiencia] = useState("");
  const [error, setError] = useState("");
  const [editingFuncionario, setEditingFuncionario] = useState(null);
  const [searchNome, setSearchNome] = useState("");
  const [searchCargo, setSearchCargo] = useState("");
  const [searchIdade, setSearchIdade] = useState("");
  const [searchSexo, setSearchSexo] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [loja, setLoja] = useState(null);
  const router = useRouter();

  // Carregar a loja do usuário logado
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loja = localStorage.getItem("loja");
      setLoja(loja);
    }
  }, []);

  // Carregar funcionários da loja do usuário logado
  useEffect(() => {
    if (loja) {
      const fetchFuncionarios = async () => {
        try {
          const response = await fetch(`/api/funcionario?loja=${loja}`);
          const data = await response.json();

          if (response.ok) {
            // Garantir que os dados sejam um array
            setFuncionarios(Array.isArray(data) ? data : []);
          } else {
            setError(data.message || "Erro ao carregar funcionários.");
          }
        } catch (error) {
          setError("Erro ao conectar com o servidor.");
        }
      };

      fetchFuncionarios();
    }
  }, [loja]);

  // Adicionar ou editar funcionário
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!loja) {
      setError("Loja não encontrada. Faça login novamente.");
      return;
    }

    // Aplicar valor padrão para "deficiencia" se estiver vazio
    const deficienciaValue = deficiencia.trim() === "" ? "nenhuma" : deficiencia;

    const funcionarioData = {
      nome,
      cargo,
      salario,
      idade,
      sexo,
      deficiencia: deficienciaValue,
      loja,
    };

    try {
      const url = editingFuncionario
        ? `/api/funcionario?objectId=${editingFuncionario.objectId}`
        : "/api/funcionario";
      const method = editingFuncionario ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(funcionarioData),
      });

      const data = await response.json();

      if (response.ok) {
        // Atualizar a lista de funcionários
        if (editingFuncionario) {
          setFuncionarios(
            funcionarios.map((f) =>
              f.objectId === editingFuncionario.objectId ? data : f
            )
          );
        } else {
          setFuncionarios([...funcionarios, data]);
        }
        // Limpar o formulário
        setNome("");
        setCargo("");
        setSalario(0);
        setIdade(18);
        setSexo("");
        setDeficiencia("");
        setEditingFuncionario(null);
      } else {
        setError(data.message || "Erro ao salvar funcionário.");
      }
    } catch (error) {
      setError("Erro ao conectar com o servidor.");
    }
  };

  // Excluir funcionário
  const handleDelete = async (objectId) => {
    try {
      const response = await fetch(`/api/funcionario?objectId=${objectId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setFuncionarios(funcionarios.filter((f) => f.objectId !== objectId));
      } else {
        const data = await response.json();
        setError(data.message || "Erro ao excluir funcionário.");
      }
    } catch (error) {
      setError("Erro ao conectar com o servidor.");
    }
  };

  // Preencher formulário para edição
  const handleEdit = (funcionario) => {
    setNome(funcionario.nome || "");
    setCargo(funcionario.cargo || "");
    setSalario(funcionario.salario || 0);
    setIdade(funcionario.idade || 18);
    setSexo(funcionario.sexo || "");
    setDeficiencia(funcionario.deficiencia || "");
    setEditingFuncionario(funcionario);
  };

  // Filtrar funcionários com base nos critérios de pesquisa
  const filteredFuncionarios = funcionarios.filter((funcionario) => {
    return (
      (searchNome === "" ||
        (funcionario.nome && funcionario.nome.toLowerCase().includes(searchNome.toLowerCase()))) &&
      (searchCargo === "" ||
        (funcionario.cargo && funcionario.cargo.toLowerCase().includes(searchCargo.toLowerCase()))) &&
      (searchIdade === "" || funcionario.idade === Number(searchIdade)) &&
      (searchSexo === "" ||
        (funcionario.sexo && funcionario.sexo.toLowerCase().includes(searchSexo.toLowerCase())))
    );
  });

  // Função para lidar com a pesquisa
  const handleSearch = () => {
    setShowResults(true); // Mostrar resultados após a pesquisa
  };

  return (
    <>
      <Head>
        <title>iShop Manager: Funcionários</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
        <link rel="icon" href="/favicon.ico" />
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

          <section id="top" className="d-flex flex-column min-vh-100">
            <div className="container row m-auto">
              <div className="col-md-8 mx-auto mt-5">
                <h2 className="text-center mb-4">Funcionários</h2>
                {error && <div className="alert alert-danger">{error}</div>}

                {/* Formulário para adicionar/editar funcionário */}
                <form onSubmit={handleSubmit} className="mb-4">
                  <div className="mb-3">
                    <label htmlFor="nome" className="form-label">Nome</label>
                    <input
                      type="text"
                      className="form-control"
                      id="nome"
                      placeholder="Digite o nome do funcionário"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="cargo" className="form-label">Cargo</label>
                    <input
                      type="text"
                      className="form-control"
                      id="cargo"
                      placeholder="Digite o cargo do funcionário"
                      value={cargo}
                      onChange={(e) => setCargo(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="salario" className="form-label">Salário</label>
                    <input
                      type="number"
                      className="form-control"
                      id="salario"
                      placeholder="Digite o salário do funcionário"
                      value={salario}
                      onChange={(e) => setSalario(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="idade" className="form-label">Idade</label>
                    <input
                      type="number"
                      className="form-control"
                      id="idade"
                      placeholder="Digite a idade do funcionário"
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
                      placeholder="Digite o sexo do funcionário"
                      value={sexo}
                      onChange={(e) => setSexo(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="deficiencia" className="form-label">Deficiência</label>
                    <input
                      type="text"
                      className="form-control"
                      id="deficiencia"
                      placeholder="Digite a deficiência do funcionário"
                      value={deficiencia}
                      onChange={(e) => setDeficiencia(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    {editingFuncionario ? "Atualizar Funcionário" : "Adicionar Funcionário"}
                  </button>
                </form>

                {/* Área de pesquisa e filtros */}
                <div className="mb-4">
                  <h3>Pesquisar Funcionários</h3>
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
                        type="text"
                        className="form-control"
                        placeholder="Cargo"
                        value={searchCargo}
                        onChange={(e) => setSearchCargo(e.target.value)}
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
                  </div>
                  <button
                    className="btn btn-secondary mt-2"
                    onClick={() => {
                      setSearchNome("");
                      setSearchCargo("");
                      setSearchIdade("");
                      setSearchSexo("");
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

                {/* Lista de funcionários (só aparece após a pesquisa) */}
                {showResults && (
                  <div className="list-group">
                    {filteredFuncionarios.length > 0 ? (
                      filteredFuncionarios.map((funcionario) => (
                        <div
                          key={funcionario.objectId}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <h5>{funcionario.nome}</h5>
                            <p>Cargo: {funcionario.cargo}</p>
                            <p>Salário: {funcionario.salario}</p>
                            <p>Idade: {funcionario.idade}</p>
                            <p>Sexo: {funcionario.sexo}</p>
                            <p>Deficiência: {funcionario.deficiencia}</p>
                          </div>
                          <div>
                            <button
                              className="btn btn-warning btn-sm me-2"
                              onClick={() => handleEdit(funcionario)}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(funcionario.objectId)}
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="alert alert-info">
                        Nenhum funcionário encontrado com os filtros aplicados.
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