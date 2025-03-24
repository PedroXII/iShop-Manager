// pages/registro.js
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

  // Carregar lojas ao abrir o formulário
  useEffect(() => {
    const carregarLojas = async () => {
      try {
        const response = await fetch("/api/listar-lojas", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

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
      superiorUsername: "",
      superiorPassword: "",
      nomeLoja: "",
      lojaExistente: "",
    });
  };

  const handleAcaoChange = (acaoSelecionada) => {
    setAcao(acaoSelecionada);
    setFormData({
      ...formData,
      superiorUsername: "",
      superiorPassword: "",
      lojaExistente: "",
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação de senha
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    // Validação de idade mínima
    if (Number(formData.idade) < 18) {
      setError("É necessário ter pelo menos 18 anos para se registrar.");
      return;
    }

    // Verificação adicional para loja existente
    if ((nivel === "Usuário" || (nivel === "Administrador" && acao === "lojaExistente")) {
      if (!formData.lojaExistente) {
        setError("Por favor, selecione uma loja.");
        return;
      }
      if (!formData.superiorUsername || !formData.superiorPassword) {
        setError("Credenciais do administrador são obrigatórias.");
        return;
      }
    }

    // Verificação adicional para nova loja
    if (nivel === "Administrador" && acao === "novaLoja" && !formData.nomeLoja) {
      setError("O nome da nova loja é obrigatório.");
      return;
    }

    // Preparar dados para envio
    const userData = {
      username: formData.username,
      password: formData.password,
      acess: nivel,
      idade: Number(formData.idade),
      superiorUsername: (nivel === "Usuário" || (nivel === "Administrador" && acao === "lojaExistente")) ? formData.superiorUsername : undefined,
      superiorPassword: (nivel === "Usuário" || (nivel === "Administrador" && acao === "lojaExistente")) ? formData.superiorPassword : undefined,
      nomeLoja: (nivel === "Administrador" && acao === "novaLoja") ? formData.nomeLoja : undefined,
      lojaExistente: (nivel === "Usuário" || (nivel === "Administrador" && acao === "lojaExistente")) ? formData.lojaExistente : undefined,
      acao: nivel === "Administrador" ? acao : undefined,
    };

    try {
      setError("");
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Erro ao registrar usuário.");
      }

      alert("Usuário registrado com sucesso!");
      // Resetar formulário após sucesso
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
      setNivel("Usuário");
      setAcao(null);
    } catch (error) {
      setError(error.message || "Erro ao registrar usuário.");
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
      <div>
        <main>
          <section>
            <nav id="navbar" className="col-12 navbar navbar-expand-lg bg-primary position-fixed">
              <div className="col-11 container-fluid m-auto">
                <Link href="/index">
                  <Image src="/Varios-12-150ppp-01.jpg" alt="LOGO" width={40} height={40} />
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
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
                      <Link href="#top" className="nav-link text-light">Registre-se</Link>
                    </li>
                    <li className="nav-item">
                      <Link href="#bottom" className="nav-link text-light">Sobre</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </nav>
          </section>

          <section id="top" className="d-flex flex-column min-vh-100 justify-content-center">
            <div className="container row m-auto mb-lg-5 mt-lg-5">
              <div className="col-md-8 col-lg-6 bg-light border m-auto p-4 rounded shadow">
                <h2 className="text-center mb-4">Registro</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                {loading ? (
                  <div className="alert alert-info">Carregando lojas...</div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label className="form-label fw-bold">Nível de Acesso</label>
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
                              required
                            />
                            <label className="form-check-label">{opcao}</label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="row g-3 mb-3">
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
                        <label className="form-label">Idade (mínimo 18)</label>
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

                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Senha (mínimo 6 caracteres)</label>
                        <input
                          type="password"
                          className="form-control"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          minLength="6"
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
                          minLength="6"
                          required
                        />
                      </div>
                    </div>

                    {nivel === "Administrador" && (
                      <div className="mb-4">
                        <label className="form-label fw-bold">Tipo de Cadastro</label>
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className={`btn ${acao === "novaLoja" ? "btn-primary" : "btn-outline-primary"} flex-grow-1`}
                            onClick={() => handleAcaoChange("novaLoja")}
                          >
                            Nova Loja
                          </button>
                          <button
                            type="button"
                            className={`btn ${acao === "lojaExistente" ? "btn-primary" : "btn-outline-primary"} flex-grow-1`}
                            onClick={() => handleAcaoChange("lojaExistente")}
                          >
                            Loja Existente
                          </button>
                        </div>
                      </div>
                    )}

                    {nivel === "Administrador" && acao === "novaLoja" && (
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

                    {(nivel === "Usuário" || (nivel === "Administrador" && acao === "lojaExistente")) && (
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
                            <option value="">Selecione uma loja</option>
                            {lojas.map((loja) => (
                              <option key={loja.objectId} value={loja.objectId}>
                                {loja.nome}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="bg-white border p-3 rounded mb-4">
                          <h5 className="mb-3">Autenticação do Administrador</h5>
                          <div className="mb-3">
                            <label className="form-label">Nome de Usuário do Administrador</label>
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
                      </>
                    )}

                    <button type="submit" className="btn btn-primary w-100 py-2">
                      Registrar
                    </button>
                  </form>
                )}
              </div>
            </div>
          </section>

          <footer className="d-flex align-items-center justify-content-center py-3" id="bottom">
            <p className="mb-0">&copy;iShop Manager 2025. Todos os direitos reservados.</p>
          </footer>
        </main>
      </div>
    </>
  );
}