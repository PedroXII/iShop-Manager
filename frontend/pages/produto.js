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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!loja) {
      setError("Loja não encontrada. Faça login novamente.");
      return;
    }

    if (!nome || !preco || !tipo) {
      setError("Nome, preço e tipo são obrigatórios.");
      return;
    }

    const produtoData = { nome, marca, preco, tipo, lojaVendedora: loja };
    setLoading(true);
    try {
      const url = editingProduto ? `/api/produto?objectId=${editingProduto.objectId}` : "/api/produto";
      const method = editingProduto ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(produtoData),
      });

      const data = await response.json();
      if (response.ok) {
        if (editingProduto) {
          setProdutos(produtos.map((p) => (p.objectId === editingProduto.objectId ? data : p)));
        } else {
          setProdutos([...produtos, data]);
        }
        setNome("");
        setMarca("");
        setPreco("");
        setTipo("");
        setEditingProduto(null);
      } else {
        setError(data.message || "Erro ao salvar produto.");
      }
    } catch (error) {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (objectId) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      setLoading(true);
      try {
        const response = await fetch(`/api/produto?objectId=${objectId}`, { method: "DELETE" });
        if (response.ok) {
          setProdutos(produtos.filter((p) => p.objectId !== objectId));
        } else {
          const data = await response.json();
          setError(data.message || "Erro ao excluir produto.");
        }
      } catch (error) {
        setError("Erro ao conectar com o servidor.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <Head>
        <title>iShop Manager: Produtos</title>
      </Head>
      <div>
        <main>
          <nav className="navbar bg-primary navbar-expand-lg">
            <div className="container-fluid">
              <Link href="/home">
                <Image src="/Varios-12-150ppp-01.jpg" alt="LOGO" width={40} height={40} />
              </Link>
            </div>
          </nav>
          <section className="container mt-5">
            <h2>Gerenciamento de Produtos</h2>
            {error && <div style={{ color: "red" }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
              <input type="text" placeholder="Marca" value={marca} onChange={(e) => setMarca(e.target.value)} />
              <input type="number" placeholder="Preço" value={preco} onChange={(e) => setPreco(e.target.value)} required />
              <input type="text" placeholder="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} required />
              <button type="submit" disabled={loading}>{editingProduto ? "Atualizar" : "Cadastrar"}</button>
            </form>
            <ul>
              {produtos.map((produto) => (
                <li key={produto.objectId}>
                  {produto.nome} - {produto.marca} - R${produto.preco}
                  <button onClick={() => setEditingProduto(produto)}>Editar</button>
                  <button onClick={() => handleDelete(produto.objectId)}>Excluir</button>
                </li>
              ))}
            </ul>
          </section>
          <footer className="d-flex align-items-center justify-content-center py-3 mt-4">
            <p className="mb-0">&copy; {new Date().getFullYear()} iShop Manager. Todos os direitos reservados.</p>
          </footer>
        </main>
      </div>
    </>
  );
}
