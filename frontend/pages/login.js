export default function Login() {
  return (
    //O front-end.
    <>
      <div>
        <main>
          <section>
            <nav
              className="navbar bg-primary col-12 navbar-expand-lg position-fixed"
              style={{ zIndex: 99, top: 0, fontFamily: "monaco, verdana"}}
            >
              <div className="container-fluid col-11 m-auto">
                <Link href="#top">
                  <Image
                    src="frontend\public\Varios-12-150ppp-01.jpg"
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
                      <Link href="#top">
                        <a className="nav-link text-light">Home</a>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/login">
                        <a className="nav-link text-light">Login</a>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/registro">
                        <a className="nav-link text-light">Registre-se</a>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="#bottom">
                        <a className="nav-link text-light">Sobre</a>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </nav>
          </section>

          <section id="top" style={{backgroundColor: "#ffffcc"}}>
            <div className="container row m-auto">
              
            </div>
          </section>

          <footer
            className="d-flex justify-content-center mt-5"
            id="bottom"
            style={{backgroundColor: "#ac7339"}}
          >
            <p>&copy;iShop Manager 2025. Todos os direitos reservados.</p>
          </footer>
        </main>
      </div>
    </>
  );
}