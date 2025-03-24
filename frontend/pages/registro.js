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
    setNivel(e.target.value);
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
      nomeLoja: "",
      superiorUsername: "",
      superiorPassword: ""
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

    const payload = {
      ...formData,
      acess: nivel,
      idade: Number(formData.idade),
      acao: nivel === "Administrador" ? acao : null
    };

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
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
        setError(data.message || "Erro ao registrar");
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
      </Head>
      
      <nav className="navbar navbar-expand-lg bg-primary">
        {/* ... (código do navbar igual ao original) ... */}
      </nav>

      <section className="container mt-5">
        <div className="card shadow">
          <div className="card-body">
            <h2 className="text-center mb-4">Registro</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            
            {loading ? (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Nível de Acesso</label>
                  <div className="d-flex gap-3">
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

                <div className="mb-3">
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

                <div className="row g-3 mb-3">
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

                <div className="mb-3">
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

                {nivel === "Administrador" && (
                  <div className="mb-4">
                    <div className="d-grid gap-2 mb-3">
                      <button
                        type="button"
                        className={`btn ${acao === "novaLoja" ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => handleAcaoChange("novaLoja")}
                      >
                        Nova Loja
                      </button>
                      <button
                        type="button"
                        className={`btn ${acao === "lojaExistente" ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => handleAcaoChange("lojaExistente")}
                      >
                        Loja Existente
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
                            <option value="">Selecione...</option>
                            {lojas.map((loja) => (
                              <option key={loja.objectId} value={loja.objectId}>
                                {loja.nome}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="card mb-3">
                          <div className="card-body">
                            <h5 className="card-title">Autenticação do Administrador</h5>
                            <div className="mb-3">
                              <label className="form-label">Usuário</label>
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
                  <div className="card mb-4">
                    <div className="card-body">
                      <h5 className="card-title">Dados da Loja</h5>
                      <div className="mb-3">
                        <label className="form-label">Selecione a Loja</label>
                        <select
                          className="form-select"
                          name="lojaExistente"
                          value={formData.lojaExistente}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Selecione...</option>
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

                <button type="submit" className="btn btn-primary w-100">
                  Registrar
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="mt-5 py-4 bg-light">
        <div className="container text-center">
          <p>&copy; iShop Manager 2024</p>
        </div>
      </footer>
    </>
  );
}