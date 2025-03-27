import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import Navbar from './components/NavbarIntro';

export default function Login() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
            <Navbar />
          </section>

          <section id="top" className="d-flex flex-column align-items-center justify-content-center min-vh-100 pt-5">
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
