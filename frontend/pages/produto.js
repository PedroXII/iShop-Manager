import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Produto() {
  const router = useRouter();
  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState("");
  const [marca, setMarca] = useState("");
  const [preco, setPreco] = useState("");
  const [tipo, setTipo] = useState("");
  const [loja, setLoja] = useState(null);
  const [editingProduto, setEditingProduto] = useState(null);
  const [searchNome, setSearchNome] = useState("");
  const [searchTipo, setSearchTipo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loja = localStorage.getItem("loja");
      setLoja(loja);
    }
  }, []);

  useEffect(() => {
    if (loja) {
      fetchProdutos();
    }
  }, [loja]);

  const fetchProdutos = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>iShop Manager: Produtos</title>
      </Head>
      <div>
        <main>
          <section>
            <nav className="navbar bg-primary navbar-expand-lg position-fixed">
              <div className="container-fluid col-11 m-auto">
                <Link href="/home">
                  <Image src="/Varios-12-150ppp-01.jpg" alt="LOGO" width={40} height={40} />
                </Link>
              </div>
            </nav>
          </section>
          <section id="top" className="d-flex flex-column min-vh-100" style={{ paddingTop: '80px' }}>
            <div className="container">
              <h2 className="text-center mb-4">Gerenciamento de Produtos</h2>
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="card p-4 mb-4">
                <h5 className="mb-3">Adicionar/Editar Produto</h5>
                <form>
                  <div className="row g-3">
                    <div className="col-md-3">
                      <input type="text" className="form-control" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
                    </div>
                    <div className="col-md-3">
                      <input type="text" className="form-control" placeholder="Marca" value={marca} onChange={(e) => setMarca(e.target.value)} />
                    </div>
                    <div className="col-md-3">
                      <input type="number" className="form-control" placeholder="Preço" value={preco} onChange={(e) => setPreco(e.target.value)} required />
                    </div>
                    <div className="col-md-3">
                      <input type="text" className="form-control" placeholder="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} required />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-success mt-3 w-100">Salvar</button>
                </form>
              </div>
              <div className="card p-4">
                <h5 className="mb-3">Lista de Produtos</h5>
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Marca</th>
                      <th>Preço</th>
                      <th>Tipo</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtos.map((produto) => (
                      <tr key={produto.objectId}>
                        <td>{produto.nome}</td>
                        <td>{produto.marca}</td>
                        <td>R${produto.preco}</td>
                        <td>{produto.tipo}</td>
                        <td>
                          <button className="btn btn-primary btn-sm me-2">Editar</button>
                          <button className="btn btn-danger btn-sm">Excluir</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
          <footer className="d-flex align-items-center justify-content-center py-3 mt-4">
            <p className="mb-0">&copy; {new Date().getFullYear()} iShop Manager. Todos os direitos reservados.</p>
          </footer>
        </main>
      </div>
    </>
  );
}
