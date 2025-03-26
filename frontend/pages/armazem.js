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
  const [formData, setFormData] = useState({
    nome: '',
    capacidadeTotal: '',
    pais: '',
    estado: '',
    cidade: '',
    rua: ''
  });
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acess, setAcess] = useState('');
  const [loja, setLoja] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userLoja = localStorage.getItem('loja');
      const userAcess = localStorage.getItem('acess');
      if (!userLoja) router.push('/login');
      setLoja(userLoja);
      setAcess(userAcess);
    }
  }, [router]);

  const fetchArmazens = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtros.nome) params.append('nome', filtros.nome);
      if (filtros.localizacao) params.append('localizacao', filtros.localizacao);
      if (filtros.capacidadeMin) params.append('capacidadeMin', filtros.capacidadeMin);
      if (filtros.capacidadeMax) params.append('capacidadeMax', filtros.capacidadeMax);

      const response = await fetch(`/api/armazem?${params.toString()}`, {
        headers: {
          'X-User-Loja': loja,
          'X-User-Acess': acess
        }
      });

      if (!response.ok) throw new Error('Erro ao carregar armazéns');
      const data = await response.json();
      setArmazens(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.nome || !formData.capacidadeTotal) {
      setError('Nome e capacidade total são obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const url = editandoId 
        ? `/api/armazem?objectId=${editandoId}`
        : '/api/armazem';
      const method = editandoId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-User-Loja': loja,
          'X-User-Acess': acess
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao salvar armazém');
      }

      setFormData({ nome: '', capacidadeTotal: '', pais: '', estado: '', cidade: '', rua: '' });
      setEditandoId(null);
      fetchArmazens();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async (objectId) => {
    if (acess !== 'admin') {
      setError('Apenas administradores podem excluir armazéns');
      return;
    }

    if (!window.confirm('Tem certeza que deseja excluir este armazém?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/armazem?objectId=${objectId}`, {
        method: 'DELETE',
        headers: {
          'X-User-Loja': loja,
          'X-User-Acess': acess
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao excluir armazém');
      }

      setArmazens(armazens.filter(a => a.objectId !== objectId));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>iShop Manager: Armazém</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className="navbar bg-primary navbar-expand-lg fixed-top">
        <div className="container">
          <Link href="/home">
            <Image src="/Varios-12-150ppp-01.jpg" alt="Logo" width={40} height={40} />
          </Link>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item"><Link href="/home" className="nav-link text-light">Home</Link></li>
              <li className="nav-item"><Link href="/funcionario" className="nav-link text-light">Funcionário</Link></li>
              <li className="nav-item"><Link href="/cliente" className="nav-link text-light">Cliente</Link></li>
              <li className="nav-item"><Link href="#" className="nav-link text-light active">Armazém</Link></li>
              <li className="nav-item"><Link href="/promocao" className="nav-link text-light">Promoção</Link></li>
              <li className="nav-item"><Link href="/produto" className="nav-link text-light">Produto</Link></li>
              <li className="nav-item"><Link href="/loja_parceira" className="nav-link text-light">Parceiro</Link></li>
              <li className="nav-item"><Link href="/index" className="nav-link text-light">Logout</Link></li>
            </ul>
          </div>
        </div>
      </nav>

      <main className="container mt-5 pt-5">
        <h2 className="text-center mb-4">Gerenciar Armazéns</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="mb-4 card p-3">
          <h5>{editandoId ? 'Editar Armazém' : 'Novo Armazém'}</h5>
          <div className="row g-2 mb-3">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Nome *"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                required
              />
            </div>
            <div className="col-md-6">
              <input
                type="number"
                className="form-control"
                placeholder="Capacidade Total *"
                value={formData.capacidadeTotal}
                onChange={(e) => setFormData({...formData, capacidadeTotal: e.target.value})}
                required
              />
            </div>
          </div>
          <div className="row g-2 mb-3">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="País"
                value={formData.pais}
                onChange={(e) => setFormData({...formData, pais: e.target.value})}
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Estado"
                value={formData.estado}
                onChange={(e) => setFormData({...formData, estado: e.target.value})}
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Cidade"
                value={formData.cidade}
                onChange={(e) => setFormData({...formData, cidade: e.target.value})}
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
          {editandoId && (
            <button
              type="button"
              className="btn btn-outline-secondary ms-2"
              onClick={() => {
                setEditandoId(null);
                setFormData({ nome: '', capacidadeTotal: '', pais: '', estado: '', cidade: '', rua: '' });
              }}
            >
              Cancelar
            </button>
          )}
        </form>

        <div className="card p-3 mb-4">
          <h5>Pesquisar Armazéns</h5>
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
                placeholder="Localização (País/Estado/Cidade)"
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
              <button
                onClick={fetchArmazens}
                className="btn btn-success w-100"
                disabled={loading}
              >
                {loading ? 'Pesquisando...' : 'Pesquisar'}
              </button>
            </div>
          </div>
        </div>

        <div className="row row-cols-1 row-cols-md-2 g-4">
          {armazens.map((armazem) => (
            <div key={armazem.objectId} className="col">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{armazem.nome}</h5>
                  <p className="card-text">
                    <strong>Capacidade:</strong> {armazem.capacidadeTotal} m³<br />
                    <strong>Localização:</strong> {[armazem.cidade, armazem.estado, armazem.pais].filter(Boolean).join(', ')}
                  </p>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => {
                        setEditandoId(armazem.objectId);
                        setFormData(armazem);
                      }}
                    >
                      Editar
                    </button>
                    {acess === 'admin' && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleExcluir(armazem.objectId)}
                        disabled={loading}
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-dark text-white text-center py-3 mt-5">
        <div className="container">
          &copy; {new Date().getFullYear()} iShop Manager - Todos os direitos reservados
        </div>
      </footer>
    </>
  );
}