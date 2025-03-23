import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Funcionario() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchFuncionarios = async () => {
      const loja = localStorage.getItem("loja");
      if (!loja) {
        setError("Loja não encontrada.");
        return;
      }

      try {
        const response = await fetch(`/api/funcionario?loja=${loja}`);
        const data = await response.json();

        if (response.ok) {
          setFuncionarios(data);
        } else {
          setError(data.message || "Erro ao buscar funcionários.");
        }
      } catch (error) {
        setError("Erro ao conectar com o servidor.");
      }
    };

    fetchFuncionarios();
  }, []);

  return (
    <>
      <Head>
        <title>iShop Manager: Funcionário</title>
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
                      <Link href="/produto">
                        <a className="nav-link text-light">Produto</a>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/loja_parceira">
                        <a className="nav-link text-light">Parceiro</a>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </nav>
          </section>

          <section id="top" className="d-flex flex-column min-vh-100">
            <div className="container row m-auto">
              <h2 className="text-center mb-4">Funcionários</h2>
              {error && <div className="alert alert-danger">{error}</div>}
              <table className="table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Cargo</th>
                    <th>Salário</th>
                    <th>Idade</th>
                    <th>Sexo</th>
                    <th>Deficiência</th>
                  </tr>
                </thead>
                <tbody>
                  {funcionarios.map((funcionario) => (
                    <tr key={funcionario.objectId}>
                      <td>{funcionario.nome}</td>
                      <td>{funcionario.cargo}</td>
                      <td>{funcionario.salario}</td>
                      <td>{funcionario.idade}</td>
                      <td>{funcionario.sexo}</td>
                      <td>{funcionario.deficiencia}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <footer
            className="d-flex align-items-center justify-content-center py-2"
            id="bottom"
          >
            <p>&copy;iShop Manager 2025. Todos os direitos reservados.</p>
          </footer>
        </main>
      </div>
    </>
  );
}