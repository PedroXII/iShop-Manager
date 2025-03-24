import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { useState, useEffect } from "react";

export default function Registro() {
  const [nivel, setNivel] = useState("Usuário");
  const [acao, setAcao] = useState(null);
  const [lojas, setLojas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    idade: "",
    superiorUsername: "",
    superiorPassword: "",
    nomeLoja: "",
    lojaExistente: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const carregarLojas = async () => {
      try {
        const response = await fetch("/api/listar-lojas");
        const data = await response.json();
        if (response.ok) {
          setLojas(data.lojas);
        } else {
          setError("Erro ao carregar lojas.");
        }
      } catch (error) {
        setError("Erro ao conectar com o servidor.");
      } finally {
        setLoading(false);
      }
    };
    carregarLojas();
  }, []);

  const handleNivelChange = (e) => {
    const novoNivel = e.target.value;
    setNivel(novoNivel);
    setAcao(null);
    setFormData({
      ...formData,
      lojaExistente: "",
      nomeLoja: "",
      superiorUsername: "",
      superiorPassword: ""
    });
  };

  const handleAcaoChange = (acaoSelecionada) => {
    setAcao(acaoSelecionada);
    setFormData({
      ...formData,
      lojaExistente: "",
      nomeLoja: ""
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          acess: nivel,
          idade: Number(formData.idade),
          acao: nivel === "Administrador" ? acao : null
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert("Registro realizado com sucesso!");
        setFormData({
          username: "",
          password: "",
          confirmPassword: "",
          idade: "",
          superiorUsername: "",
          superiorPassword: "",
          nomeLoja: "",
          lojaExistente: "",
        });
        setAcao(null);
      } else {
        setError(data.message || "Erro ao registrar usuário.");
      }
    } catch (error) {
      setError("Erro na conexão com o servidor");
    }
  };

  return (
    <>
      <Head>
        <title>iShop Manager: Registro</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className="navbar navbar-expand-lg bg-primary fixed-top">
        <div className="container-fluid col-11 m-auto">
          <Link href="/index">
            <Image
              src="/Varios-12-150ppp-01.jpg"
              alt="LOGO"
              width={40}
              height={40}
              className="d-inline-block align-text-top"
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
                <Link href="/index" className="nav-link text-light">Home</Link>
              </li>
              <li className="nav-item">
                <Link href="/login" className="nav-link text-light">Login</Link>
              </li>
              <li className="nav-item">
                <Link href="/registro" className="nav-link text-light active">Registre-se</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <section className="d-flex min-vh-100 align-items-center">
        <div className="container mt-5 pt-5">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="card shadow-lg border-0">
                <div className="card-body p-4">
                  <h2 className="text-center mb-4">Criar Nova Conta</h2>
                  {error && <div className="alert alert-danger">{error}</div>}

                  {loading ? (
                    <div className="text-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Carregando...</span>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      <div className="mb-4">
                        <label className="form-label">Tipo de Conta</label>
                        <div className="d-flex gap-4">
                          {["Usuário", "Administrador"].map((opcao) => (
                            <div className="form-check" key={opcao}>
                              <input
                                className="form-check-input"
                                type="radio"
                                name="nivel"
                                value={opcao}
                                checked={nivel === opcao}
                                onChange={handleNivelChange}
                              />
                              <label className="form-check-label">{opcao}</label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="row g-3 mb-4">
                        <div className="col-md-6">
                          <label className="form-label">Nome de Usuário</label>
                          <input
                            type="text"
                            className="form-control"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Idade</label>
                          <input
                            type="number"
                            className="form-control"
                            name="idade"
                            value={formData.idade}
                            onChange={handleChange}
                            min="18"
                            required
                          />
                        </div>
                      </div>

                      <div className="row g-3 mb-4">
                        <div className="col-md-6">
                          <label className="form-label">Senha</label>
                          <input
                            type="password"
                            className="form-control"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Confirmar Senha</label>
                          <input
                            type="password"
                            className="form-control"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      {nivel === "Administrador" && (
                        <div className="mb-4">
                          <div className="d-grid gap-2 mb-3">
                            <button
                              type="button"
                              className={`btn ${acao === "novaLoja" ? "btn-primary" : "btn-outline-primary"}`}
                              onClick={() => handleAcaoChange("novaLoja")}
                            >
                              Criar Nova Loja
                            </button>
                            <button
                              type="button"
                              className={`btn ${acao === "lojaExistente" ? "btn-primary" : "btn-outline-primary"}`}
                              onClick={() => handleAcaoChange("lojaExistente")}
                            >
                              Usar Loja Existente
                            </button>
                          </div>

                          {acao === "novaLoja" && (
                            <div className="mb-3">
                              <label className="form-label">Nome da Nova Loja</label>
                              <input
                                type="text"
                                className="form-control"
                                name="nomeLoja"
                                value={formData.nomeLoja}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          )}

                          {acao === "lojaExistente" && (
                            <>
                              <div className="mb-3">
                                <label className="form-label">Selecione a Loja</label>
                                <select
                                  className="form-select"
                                  name="lojaExistente"
                                  value={formData.lojaExistente}
                                  onChange={handleChange}
                                  required
                                >
                                  <option value="">Selecione uma loja...</option>
                                  {lojas.map((loja) => (
                                    <option key={loja.objectId} value={loja.objectId}>
                                      {loja.nome}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="card bg-light p-3 mb-3">
                                <div className="card-body">
                                  <h6 className="card-title mb-3">Autenticação do Administrador Responsável</h6>
                                  <div className="mb-3">
                                    <label className="form-label">Nome de Usuário</label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      name="superiorUsername"
                                      value={formData.superiorUsername}
                                      onChange={handleChange}
                                      required
                                    />
                                  </div>
                                  <div className="mb-3">
                                    <label className="form-label">Senha</label>
                                    <input
                                      type="password"
                                      className="form-control"
                                      name="superiorPassword"
                                      value={formData.superiorPassword}
                                      onChange={handleChange}
                                      required
                                    />
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {nivel === "Usuário" && (
                        <div className="card bg-light p-3 mb-4">
                          <div className="card-body">
                            <h6 className="card-title mb-3">Dados da Loja</h6>
                            <div className="mb-3">
                              <label className="form-label">Selecione a Loja</label>
                              <select
                                className="form-select"
                                name="lojaExistente"
                                value={formData.lojaExistente}
                                onChange={handleChange}
                                required
                              >
                                <option value="">Selecione uma loja...</option>
                                {lojas.map((loja) => (
                                  <option key={loja.objectId} value={loja.objectId}>
                                    {loja.nome}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Usuário do Administrador</label>
                              <input
                                type="text"
                                className="form-control"
                                name="superiorUsername"
                                value={formData.superiorUsername}
                                onChange={handleChange}
                                required
                              />
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Senha do Administrador</label>
                              <input
                                type="password"
                                className="form-control"
                                name="superiorPassword"
                                value={formData.superiorPassword}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <button type="submit" className="btn btn-primary w-100 py-2">
                        Registrar
                      </button>
                    </form>
                  )}

                  <p className="text-center mt-4 mb-0">
                    Já tem uma conta? <Link href="/login" className="text-primary">Faça login</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-primary text-light py-3">
        <div className="container text-center">
          <p className="mb-0">&copy;iShop Manager {new Date().getFullYear()}</p>
        </div>
      </footer>
    </>
  );
}