import Link from "next/link";
import Image from "next/image";
import Head from "next/head";

export default function HomeUser() {
  return (
    //O front-end.
    <>
      <Head>
        <title>iShop Manager: Home</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
        <link rel="icon" href="/favicon.ico"/>
      </Head>
      <div>
        <main>
          <section>
            <nav className="navbar navbar-expand-lg bg-primary fixed-top">
              <div className="container-fluid">
                <Link href="/home" className="navbar-brand">
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
                      <Link href="/home" className="nav-link text-light">
                        Home
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/armazem" className="nav-link text-light">
                        Armazém
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/fornecedor" className="nav-link text-light">
                        Fornecedor
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/funcionario" className="nav-link text-light">
                        Funcionário
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/cliente" className="nav-link text-light">
                        Cliente
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/produto" className="nav-link text-light">
                        Produto
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/promocao" className="nav-link text-light">
                        Promoção
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/index" className="nav-link text-light">
                        Logout
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