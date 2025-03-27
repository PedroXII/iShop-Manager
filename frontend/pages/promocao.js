import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from './components/NavbarUser';

export default function Promocao() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [promocoes, setPromocoes] = useState([]);
  const [nome, setNome] = useState("");
  const [porcentagemDesconto, setPorcentagemDesconto] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [produto, setProduto] = useState("");
  const [tipoProduto, setTipoProduto] = useState("");
  const [error, setError] = useState("");
  const [editingPromocao, setEditingPromocao] = useState(null);
  const [searchNome, setSearchNome] = useState("");
  const [searchPorcentagem, setSearchPorcentagem] = useState("");
  const [searchProduto, setSearchProduto] = useState("");
  const [searchTipoProduto, setSearchTipoProduto] = useState("");
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

  // Adicionar ou editar promoção
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!loja) {
      setError("Loja não encontrada. Faça login novamente.");
      return;
    }

    if (!nome) {
      setError("O campo 'nome' é obrigatório.");
      return;
    }

    if (produto && tipoProduto) {
      setError("Uma promoção não pode ter ambos 'produto' e 'tipo de produto' preenchidos.");
      return;
    }

    const promocaoData = {
      nome,
      porcentagemDesconto,
      loja,
      inicio,
      fim,
      produto: produto || null,
      tipoProduto: tipoProduto || null,
    };

    try {
      const url = editingPromocao
        ? `/api/promocao?objectId=${editingPromocao.objectId}`
        : "/api/promocao";
      const method = editingPromocao ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(promocaoData),
      });

      const data = await response.json();

      if (response.ok) {
        if (editingPromocao) {
          setPromocoes(
            promocoes.map((p) =>
              p.objectId === editingPromocao.objectId ? { ...data, inicio: data.inicio?.iso, fim: data.fim?.iso } : p
            )
          );
        } else {
          setPromocoes([...promocoes, { ...data, inicio: data.inicio?.iso, fim: data.fim?.iso }]);
        }
        
        setNome("");
        setPorcentagemDesconto("");
        setInicio("");
        setFim("");
        setProduto("");
        setTipoProduto("");
        setEditingPromocao(null);
        setError("");
      } else {
        setError(data.message || "Erro ao salvar promoção.");
      }
    } catch (error) {
      setError("Erro ao conectar com o servidor.");
    }
  };

  // Excluir promoção
  const handleDelete = async (objectId) => {
    try {
      const response = await fetch(`/api/promocao?objectId=${objectId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPromocoes(promocoes.filter((p) => p.objectId !== objectId));
      } else {
        const data = await response.json();
        setError(data.message || "Erro ao excluir promoção.");
      }
    } catch (error) {
      setError("Erro ao conectar com o servidor.");
    }
  };

  // Preencher formulário para edição
  const handleEdit = (promocao) => {
    setNome(promocao.nome);
    setPorcentagemDesconto(promocao.porcentagemDesconto || "");
    
    // Corrigindo o tratamento das datas
    setInicio(promocao.inicio ? promocao.inicio.split('T')[0] : "");
    setFim(promocao.fim ? promocao.fim.split('T')[0] : "");
    
    setProduto(promocao.produto || "");
    setTipoProduto(promocao.tipoProduto || "");
    setEditingPromocao(promocao);
  };

  // Filtrar promoções com base nos critérios de pesquisa
  const handleSearch = async () => {
    if (!loja) {
      setError("Loja não encontrada. Faça login novamente.");
      return;
    }

    try {
      let query = `loja=${loja}`;
      if (searchNome) query += `&nome=${searchNome}`;
      if (searchPorcentagem) query += `&porcentagemDesconto=${searchPorcentagem}`;
      if (searchProduto) query += `&produto=${searchProduto}`;
      if (searchTipoProduto) query += `&tipoProduto=${searchTipoProduto}`;

      const response = await fetch(`/api/promocao?${query}`);
      const data = await response.json();

      if (response.ok) {
        setPromocoes(data);
        setShowResults(true);
      } else {
        setError(data.message || "Erro ao buscar promoções.");
      }
    } catch (error) {
      setError("Erro ao conectar com o servidor.");
    }
  };

  // Função para formatar a data para exibição
  const formatDate = (dateString) => {
    if (!dateString) return "Não definido";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "Não definido" : date.toLocaleDateString();
    } catch {
      return "Não definido";
    }
  };

  return (
    <>
      <Head>
        <title>iShop Manager: Promoções</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <main>
          <section>
            <Navbar />
          </section>

          <section id="top" className="d-flex flex-column min-vh-100">
            <div className="container row m-auto">
              <div className="col-md-8 mx-auto mt-5">
                <h2 className="text-center mb-4">Promoções</h2>
                {error && <div className="alert alert-danger">{error}</div>}

                {/* Formulário para adicionar/editar promoção */}
                <form onSubmit={handleSubmit} className="mb-4">
                  <div className="mb-3">
                    <label htmlFor="nome" className="form-label">Nome da Promoção*</label>
                    <input
                      type="text"
                      className="form-control"
                      id="nome"
                      placeholder="Digite o nome da promoção"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="porcentagemDesconto" className="form-label">Porcentagem de Desconto</label>
                    <input
                      type="number"
                      className="form-control"
                      id="porcentagemDesconto"
                      placeholder="Digite a porcentagem de desconto"
                      value={porcentagemDesconto}
                      onChange={(e) => setPorcentagemDesconto(e.target.value)}
                    />
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="inicio" className="form-label">Data de Início</label>
                      <input
                        type="date"
                        className="form-control"
                        id="inicio"
                        value={inicio}
                        onChange={(e) => setInicio(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="fim" className="form-label">Data de Término</label>
                      <input
                        type="date"
                        className="form-control"
                        id="fim"
                        value={fim}
                        onChange={(e) => setFim(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="produto" className="form-label">Produto Específico</label>
                    <input
                      type="text"
                      className="form-control"
                      id="produto"
                      placeholder="Digite o nome do produto"
                      value={produto}
                      onChange={(e) => {
                        setProduto(e.target.value);
                        if (e.target.value) setTipoProduto("");
                      }}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="tipoProduto" className="form-label">Tipo de Produto</label>
                    <input
                      type="text"
                      className="form-control"
                      id="tipoProduto"
                      placeholder="Digite o tipo de produto"
                      value={tipoProduto}
                      onChange={(e) => {
                        setTipoProduto(e.target.value);
                        if (e.target.value) setProduto("");
                      }}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    {editingPromocao ? "Atualizar Promoção" : "Adicionar Promoção"}
                  </button>
                </form>

                {/* Área de pesquisa e filtros */}
                <div className="mb-4">
                  <h3>Pesquisar Promoções</h3>
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
                        placeholder="% Desconto"
                        value={searchPorcentagem}
                        onChange={(e) => setSearchPorcentagem(e.target.value)}
                      />
                    </div>
                    <div className="col-md-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Produto"
                        value={searchProduto}
                        onChange={(e) => setSearchProduto(e.target.value)}
                      />
                    </div>
                    <div className="col-md-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Tipo de Produto"
                        value={searchTipoProduto}
                        onChange={(e) => setSearchTipoProduto(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    className="btn btn-secondary mt-2"
                    onClick={() => {
                      setSearchNome("");
                      setSearchPorcentagem("");
                      setSearchProduto("");
                      setSearchTipoProduto("");
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

                {/* Lista de promoções (só aparece após a pesquisa) */}
                {showResults && (
                  <div className="list-group">
                    {promocoes.length > 0 ? (
                      promocoes.map((promocao) => (
                        <div
                          key={promocao.objectId}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <h5>{promocao.nome}</h5>
                            <p>Desconto: {promocao.porcentagemDesconto}%</p>
                            <p>
                              Período: {formatDate(promocao.inicio)} - {formatDate(promocao.fim)}
                            </p>
                            {promocao.produto && <p>Produto: {promocao.produto}</p>}
                            {promocao.tipoProduto && <p>Tipo de Produto: {promocao.tipoProduto}</p>}
                          </div>
                          <div>
                            <button
                              className="btn btn-warning btn-sm me-2"
                              onClick={() => handleEdit(promocao)}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(promocao.objectId)}
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="alert alert-info">
                        Nenhuma promoção encontrada com os filtros aplicados.
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