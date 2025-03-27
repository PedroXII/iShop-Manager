import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Todos os campos são obrigatórios.");
      return;
    }

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Usuário autenticado:", data);

        // Salvar loja e nível de acesso no localStorage
        localStorage.setItem("loja", data.user.loja);
        localStorage.setItem("acess", data.nivelAcesso); // ✅ Correção aqui

        // Redirecionar para a página Home
        router.push("/home");
      } else {
        setError(data.message || "Erro ao fazer login.");
      }
    } catch (error) {
      setError("Erro ao conectar com o servidor.");
    }
  };

  return (
    <>
      <Head>
        <title>iShop Manager: Login</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <main>
          <section>
            <nav className="navbar navbar-expand-lg bg-primary fixed-top">
              <div className="container-fluid">
                <Link href="/index" className="navbar-brand">
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
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-expanded={isMenuOpen}
                  aria-label="Toggle navigation"
                >
                  <span className="navbar-toggler-icon"></span>
                </button>

                <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
                  <ul className="navbar-nav ms-auto">
                    <li className="nav-item">
                      <Link href="#top" className="nav-link text-light">
                        Home
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/login" className="nav-link text-light">
                        Login
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/registro" className="nav-link text-light">
                        Registro
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="#bottom" className="nav-link text-light">
                        Sobre
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </nav>
          </section>

          <section id="top" className="d-flex flex-column align-items-center justify-content-center min-vh-100">
            <div className="container row m-auto">
              <div className="col-md-6 bg-white border p-4 rounded shadow mx-auto">
                <h2 className="text-center mb-4">Login</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">Nome de Usuário</label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      placeholder="Digite seu nome de usuário"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Senha</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">Entrar</button>
                </form>
                <p className="text-center mt-3">
                  Não tem uma conta? <Link href="/registro">Registre-se</Link>
                </p>
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
