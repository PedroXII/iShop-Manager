import Link from "next/link";
import Image from "next/image";
import Head from "next/head";

export default function Login() {
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
            <nav
              id="navbar"
              className="navbar bg-primary col-12 navbar-expand-lg position-fixed"
            >
              <div className="container-fluid col-11 m-auto">
                <Link href="/index">
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

          <section id="top" className="d-flex flex-column min-vh-100 justify-content-center align-items-center">
            <div className="container row m-auto">
              <div className="col-md-6 mx-auto p-4 border rounded shadow bg-white">
                <h2 className="text-center mb-4">Login</h2>
                <form>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">Nome de Usuário</label>
                    <input type="text" className="form-control" id="username" placeholder="Digite seu nome de usuário" required />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Senha</label>
                    <input type="password" className="form-control" id="password" placeholder="Digite sua senha" required />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">Entrar</button>
                </form>
                <p className="text-center mt-3">
                  Não tem uma conta? <Link href="/registro">Registre-se</Link>
                </p>
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
