import Link from "next/link";
import Image from "next/image";
import Head from "next/head";

export default function Produto() {
  return (
    //O front-end.
    <>
      <Head>
        <title>iShop Manager: Produtos</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
        <link rel="icon" href="/favicon.ico"/>
      </Head>
      <div>
        <main>
        <section>
            <nav
            id="navbar"
              className="navbar bg-primary col-12 navbar-expand-lg position-fixed"
            >
              <div className="container-fluid col-11 m-auto">
                <Link href="/home">
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
                      <Link href="/home">
                        <a className="nav-link text-light">Home</a>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/funcionario">
                        <a className="nav-link text-light">Funcionário</a>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/cliente">
                        <a className="nav-link text-light">Cliente</a>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/armazem">
                        <a className="nav-link text-light">Armazém</a>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/promocao">
                        <a className="nav-link text-light">Promoção</a>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="#top">
                        <a className="nav-link text-light">Produto</a>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/loja_parceira">
                        <a className="nav-link text-light">Parceiro</a>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/index">
                        <a className="nav-link text-light">Logout</a>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </nav>
          </section>

          <section id="top" className="d-flex flex-column min-vh-100">
            <div className="container row m-auto">
              
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