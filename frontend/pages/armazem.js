import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Armazem() {
  const router = useRouter();
  const [armazens, setArmazens] = useState([]);
  const [filtros, setFiltros] = useState({
    nome: '',
    localizacao: '',
    capacidadeMin: '',
    capacidadeMax: ''
  });
  const [novoArmazem, setNovoArmazem] = useState({
    nome: '',
    capacidadeTotal: '',
    pais: '',
    estado: '',
    cidade: '',
    rua: ''
  });
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [acess, setAcess] = useState('');
  const [loja, setLoja] = useState('');

  // Carregar dados do usuário
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userLoja = localStorage.getItem('loja');
      const userAcess = localStorage.getItem('acess');
      if (!userLoja) router.push('/login');
      setLoja(userLoja);
      setAcess(userAcess);
    }
  }, [router]);

  // Função genérica para chamadas API
  const fetchArmazem = async (method, body = null, params = '') => {
    try {
      const url = `/api/armazem${params}`;
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-User-Loja': loja,
          'X-User-Acess': acess
        },
        body: body && JSON.stringify(body)
      });
      
      if (!response.ok) throw new Error(await response.text());
      return await response.json();
    } catch (error) {
      setError(error.message);
      return null;
    }
  };

  // Pesquisar armazéns
  const handlePesquisa = async () => {
    const params = new URLSearchParams(filtros).toString();
    const data = await fetchArmazem('GET', null, `?${params}`);
    data && setArmazens(data);
  };

  // Salvar/Editar armazém
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!novoArmazem.nome || !novoArmazem.capacidadeTotal) {
      setAviso('Nome e capacidade total são obrigatórios!');
      return;
    }

    const method = editandoId ? 'PUT' : 'POST';
    const params = editandoId ? `?objectId=${editandoId}` : '';
    const data = await fetchArmazem(method, novoArmazem, params);
    
    if (data) {
      setNovoArmazem({ nome: '', capacidadeTotal: '', pais: '', estado: '', cidade: '', rua: '' });
      setEditandoId(null);
      setAviso('');
      handlePesquisa();
    }
  };

  // Excluir armazém
  const handleExcluir = async (objectId) => {
    if (acess === 'admin' && window.confirm('Confirmar exclusão?')) {
      const data = await fetchArmazem('DELETE', null, `?objectId=${objectId}`);
      data?.success && handlePesquisa();
    }
  };

  return (
    <>
      <Head>
        <title>iShop Manager: Armazém</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <nav className="navbar bg-primary navbar-expand-lg fixed-top">
          <div className="container-fluid col-11 m-auto">
            <Link href="/home">
              <Image
                src="/Varios-12-150ppp-01.jpg"
                alt="Logo"
                width={40}
                height={40}
                className="cursor-pointer"
              />
            </Link>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item"><Link href="/home" className="nav-link text-light">Home</Link></li>
                <li className="nav-item"><Link href="/funcionario" className="nav-link text-light">Funcionário</Link></li>
                <li className="nav-item"><Link href="/cliente" className="nav-link text-light">Cliente</Link></li>
                <li className="nav-item"><Link href="#top" className="nav-link text-light">Armazém</Link></li>
                <li className="nav-item"><Link href="/promocao" className="nav-link text-light">Promoção</Link></li>
                <li className="nav-item"><Link href="/produto" className="nav-link text-light">Produto</Link></li>
                <li className="nav-item"><Link href="/loja_parceira" className="nav-link text-light">Parceiro</Link></li>
                <li className="nav-item"><Link href="/index" className="nav-link text-light">Logout</Link></li>
              </ul>
            </div>
          </div>
        </nav>

        <main className="container mt-5 pt-5">
          <section className="my-4">
            <h2 className="text-center mb-4">Gerenciamento de Armazéns</h2>
            
            {/* Formulário de Cadastro */}
            <form onSubmit={handleSubmit} className="border p-3 mb-4 rounded">
              {aviso && <div className="alert alert-warning">{aviso}</div>}
              <div className="row g-2">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nome do Armazém *"
                    value={novoArmazem.nome}
                    onChange={(e) => setNovoArmazem({...novoArmazem, nome: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Capacidade Total *"
                    value={novoArmazem.capacidadeTotal}
                    onChange={(e) => setNovoArmazem({...novoArmazem, capacidadeTotal: e.target.value})}
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="País"
                    value={novoArmazem.pais}
                    onChange={(e) => setNovoArmazem({...novoArmazem, pais: e.target.value})}
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Estado"
                    value={novoArmazem.estado}
                    onChange={(e) => setNovoArmazem({...novoArmazem, estado: e.target.value})}
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Cidade"
                    value={novoArmazem.cidade}
                    onChange={(e) => setNovoArmazem({...novoArmazem, cidade: e.target.value})}
                  />
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary w-100">
                    {editandoId ? 'Salvar Alterações' : 'Cadastrar Novo Armazém'}
                  </button>
                </div>
              </div>
            </form>

            {/* Área de Pesquisa */}
            <div className="border p-3 mb-4 rounded">
              <h5 className="mb-3">Filtrar Armazéns</h5>
              <div className="row g-2">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nome"
                    value={filtros.nome}
                    onChange={(e) => setFiltros({...filtros, nome: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Localização"
                    value={filtros.localizacao}
                    onChange={(e) => setFiltros({...filtros, localizacao: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Capacidade Mínima"
                    value={filtros.capacidadeMin}
                    onChange={(e) => setFiltros({...filtros, capacidadeMin: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Capacidade Máxima"
                    value={filtros.capacidadeMax}
                    onChange={(e) => setFiltros({...filtros, capacidadeMax: e.target.value})}
                  />
                </div>
                <div className="col-12">
                  <button onClick={handlePesquisa} className="btn btn-success w-100">
                    🔍 Pesquisar Armazéns
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de Resultados */}
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="row row-cols-1 row-cols-md-2 g-4">
              {armazens.map((armazem) => (
                <div key={armazem.objectId} className="col">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title">{armazem.nome}</h5>
                      <div className="card-text">
                        <p>📍 {[armazem.rua, armazem.cidade, armazem.estado, armazem.pais].filter(Boolean).join(', ')}</p>
                        <p>📦 Capacidade: {armazem.capacidadeTotal} m³</p>
                      </div>
                      <div className="d-flex gap-2 mt-3">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => {
                            setEditandoId(armazem.objectId);
                            setNovoArmazem(armazem);
                          }}
                        >
                          ✏️ Editar
                        </button>
                        {acess === 'admin' && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleExcluir(armazem.objectId)}
                          >
                            🗑️ Excluir
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        <footer className="bg-dark text-white py-3 mt-5">
          <div className="container text-center">
            <span>© {new Date().getFullYear()} iShop Manager - Todos os direitos reservados</span>
          </div>
        </footer>
      </div>
    </>
  );
}