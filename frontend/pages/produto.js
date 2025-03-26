import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Product() {
  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState("");
  const [marca, setMarca] = useState("");
  const [preco, setPreco] = useState(0);
  const [tipo, setTipo] = useState("");
  const [error, setError] = useState("");
  const [editingProduto, setEditingProduto] = useState(null);
  const [searchNome, setSearchNome] = useState("");
  const [searchMarca, setSearchMarca] = useState("");
  const [searchTipo, setSearchTipo] = useState("");
  const [searchPrecoMin, setSearchPrecoMin] = useState("");
  const [searchPrecoMax, setSearchPrecoMax] = useState("");
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

  // Carregar produtos da loja do usuário logado
  useEffect(() => {
    if (loja) {
      const fetchProdutos = async () => {
        try {
          const response = await fetch(`/api/produto?loja=${loja}`);
          const data = await response.json();
          if (response.ok) {
            setProdutos(data);
          } else {
            setError(data.message || "Erro ao carregar produtos.");
          }
        } catch (error) {
          setError("Erro ao conectar com o servidor.");
        }
      };

      fetchProdutos();
    }
  }, [loja]);

  // Adicionar ou editar produto
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nome || !loja) {
      setError("Nome e loja são campos obrigatórios.");
      return;
    }

    const produtoData = {
      nome,
      marca,
      preco: Number(preco),
      tipo,
      loja,
    };

    try {
      const url = editingProduto
        ? `/api/produto?objectId=${editingProduto.objectId}`
        : "/api/produto";
      const method = editingProduto ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(produtoData),
      });

      const data = await response.json();

      if (response.ok) {
        // Atualizar a lista de produtos
        if (editingProduto) {
          setProdutos(
            produtos.map((p) =>
              p.objectId === editingProduto.objectId ? data : p
            )
          );
        } else {
          setProdutos([...produtos, data]);
        }
        // Limpar o formulário
        setNome("");
        setMarca("");
        setPreco(0);
        setTipo("");
        setEditingProduto(null);
      } else {
        setError(data.message || "Erro ao salvar produto.");
      }
    } catch (error) {
      setError("Erro ao conectar com o servidor.");
    }
  };

  // Excluir produto
  const handleDelete = async (objectId) => {
    try {
      const response = await fetch(`/api/produto?objectId=${objectId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProdutos(produtos.filter((p) => p.objectId !== objectId));
      } else {
        const data = await response.json();
        setError(data.message || "Erro ao excluir produto.");
      }
    } catch (error) {
      setError("Erro ao conectar com o servidor.");
    }
  };

  // Preencher formulário para edição
  const handleEdit = (produto) => {
    setNome(produto.nome);
    setMarca(produto.marca || "");
    setPreco(produto.preco || 0);
    setTipo(produto.tipo || "");
    setEditingProduto(produto);
  };

  // Filtrar produtos com base nos critérios de pesquisa
  const filteredProdutos = produtos.filter((produto) => {
    return (
      (searchNome === "" ||
        produto.nome.toLowerCase().includes(searchNome.toLowerCase())) &&
      (searchMarca === "" ||
        (produto.marca &&
          produto.marca.toLowerCase().includes(searchMarca.toLowerCase()))) &&
      (searchTipo === "" ||
        (produto.tipo &&
          produto.tipo.toLowerCase().includes(searchTipo.toLowerCase()))) &&
      (searchPrecoMin === "" || produto.preco >= Number(searchPrecoMin)) &&
      (searchPrecoMax === "" || produto.preco <= Number(searchPrecoMax))
    );
  });

  // Função para lidar com a pesquisa
  const handleSearch = () => {
    setShowResults(true);
  };

  return (
    <>
      <Head>
        <title>iShop Manager: Produtos</title>
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
                      <Link href="/armazem">
                        <a className="nav-link text-light">Armazém</a>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/fornecedor">
                        <a className="nav-link text-light">Fornecedor</a>
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
                        <a className="nav-link text-light">Produto</a>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/promocao">
                        <a className="nav-link text-light">Promoção</a>
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
                <h2 className="text-center mb-4">Produtos</h2>
                {error && <div className="alert alert-danger">{error}</div>}

                {/* Formulário para adicionar/editar produto */}
                <form onSubmit={handleSubmit} className="mb-4">
                  <div className="mb-3">
                    <label htmlFor="nome" className="form-label">Nome*</label>
                    <input
                      type="text"
                      className="form-control"
                      id="nome"
                      placeholder="Digite o nome do produto"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="marca" className="form-label">Marca</label>
                    <input
                      type="text"
                      className="form-control"
                      id="marca"
                      placeholder="Digite a marca do produto"
                      value={marca}
                      onChange={(e) => setMarca(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="preco" className="form-label">Preço</label>
                    <input
                      type="number"
                      className="form-control"
                      id="preco"
                      placeholder="Digite o preço do produto"
                      value={preco}
                      onChange={(e) => setPreco(e.target.value)}
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="tipo" className="form-label">Tipo</label>
                    <input
                      type="text"
                      className="form-control"
                      id="tipo"
                      placeholder="Digite o tipo do produto"
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    {editingProduto ? "Atualizar Produto" : "Adicionar Produto"}
                  </button>
                </form>

                {/* Área de pesquisa e filtros */}
                <div className="mb-4">
                  <h3>Pesquisar Produtos</h3>
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
                        placeholder="Marca"
                        value={searchMarca}
                        onChange={(e) => setSearchMarca(e.target.value)}
                      />
                    </div>
                    <div className="col-md-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Tipo"
                        value={searchTipo}
                        onChange={(e) => setSearchTipo(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="row mt-2">
                    <div className="col-md-3">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Preço mínimo"
                        value={searchPrecoMin}
                        onChange={(e) => setSearchPrecoMin(e.target.value)}
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div className="col-md-3">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Preço máximo"
                        value={searchPrecoMax}
                        onChange={(e) => setSearchPrecoMax(e.target.value)}
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                  <button
                    className="btn btn-secondary mt-2"
                    onClick={() => {
                      setSearchNome("");
                      setSearchMarca("");
                      setSearchTipo("");
                      setSearchPrecoMin("");
                      setSearchPrecoMax("");
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

                {/* Lista de produtos (só aparece após a pesquisa) */}
                {showResults && (
                  <div className="list-group">
                    {filteredProdutos.length > 0 ? (
                      filteredProdutos.map((produto) => (
                        <div
                          key={produto.objectId}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <h5>{produto.nome}</h5>
                            <p>Marca: {produto.marca || "Não informado"}</p>
                            <p>Preço: R$ {produto.preco?.toFixed(2) || "0,00"}</p>
                            <p>Tipo: {produto.tipo || "Não informado"}</p>
                          </div>
                          <div>
                            <button
                              className="btn btn-warning btn-sm me-2"
                              onClick={() => handleEdit(produto)}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(produto.objectId)}
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="alert alert-info">
                        Nenhum produto encontrado com os filtros aplicados.
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