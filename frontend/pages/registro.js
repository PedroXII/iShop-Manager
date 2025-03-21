import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { useState } from "react";

export default function Registro() {
  const [nivel, setNivel] = useState("Vendedor parceiro");
  const [requerAutenticacao, setRequerAutenticacao] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    idade: "",
    superiorUsername: "",
    superiorPassword: "",
  });

  const handleNivelChange = (e) => {
    const selectedNivel = e.target.value;
    setNivel(selectedNivel);
    setRequerAutenticacao(selectedNivel !== "Primeiro Administrador");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      username: formData.username,
      password: formData.password,
      idade: formData.idade,
      nivel,
      superior: requerAutenticacao
        ? { username: formData.superiorUsername, password: formData.superiorPassword }
        : null,
    };

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Usuário registrado com sucesso!");
      } else {
        alert("Erro: " + data.message);
      }
    } catch (error) {
      alert("Erro ao registrar usuário");
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
                      <Link href="#top" className="nav-link text-light">Login</Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/registro" className="nav-link text-light">Registre-se</Link>
                    </li>
                    <li className="nav-item">
                      <Link href="#bottom" className="nav-link text-light">Sobre</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </nav>
          </section>

          <section id="top" className="d-flex flex-column min-vh-100">
            <div className="container row m-auto mb-lg-5 mt-lg-5">
              <div className="col-md-6 bg-light border m-auto p-4 rounded">
                <h2 className="text-center">Registro</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Nome de Usuário</label>
                    <input type="text" className="form-control" name="username" value={formData.username} onChange={handleChange} required />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Senha</label>
                    <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} required />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Idade</label>
                    <input type="number" className="form-control" name="idade" value={formData.idade} onChange={handleChange} required />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Nível de Acesso</label>
                    <div>
                      {["Vendedor parceiro", "Funcionário", "Administrador", "Primeiro Administrador"].map((opcao) => (
                        <div className="form-check" key={opcao}>
                          <input className="form-check-input" type="radio" name="nivel" value={opcao} checked={nivel === opcao} onChange={handleNivelChange} />
                          <label className="form-check-label">{opcao}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {requerAutenticacao && (
                    <div className="bg-white border p-3 rounded mb-3">
                      <h5>Autenticação do Superior</h5>
                      <div className="mb-2">
                        <label className="form-label">Nome de Usuário</label>
                        <input type="text" className="form-control" name="superiorUsername" value={formData.superiorUsername} onChange={handleChange} required />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Senha</label>
                        <input type="password" className="form-control" name="superiorPassword" value={formData.superiorPassword} onChange={handleChange} required />
                      </div>
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary w-100">Registrar</button>
                </form>
              </div>
            </div>
          </section>

          <footer className="d-flex align-items-center justify-content-center py-2" id="bottom">
            <p>&copy;iShop Manager 2025. Todos os direitos reservados.</p>
          </footer>
        </main>
      </div>
    </>
  );
}
