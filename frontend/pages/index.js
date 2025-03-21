import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import styles from "@/styles/Home.module.css";

export default function Home() {
  return (
    <>
      <Head>
        <title>iShop Manager</title>
        <meta name="description" content="Generated by create next app" />
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
                <Link href="#top">
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

          <section id="top" className="d-flex flex-column min-vh-100">
            <div className="container row m-auto">
              <Image
                src="/43160.jpg"
                alt="Uma loja rodeada por icones."
                className="col-sm-6 col-6 img-fluid"
                style={{ marginTop: "100px", width: "350px", height: "350px"}}
              />
              <div
                className="container d-flex align-items-center col-6"
                style={{ marginTop: "100px", textAlign: "justify" }}
              >
                Bem-vindo ao iShop Manager! Gerencie seus produtos e estoque de
                forma eficiente e segura.Mantenha o controle do seu estoque de 
                forma eficiente! Com o iShop Manager, você pode cadastrar produtos, 
                acompanhar movimentações e evitar perdas com uma gestão simplificada 
                e intuitiva.
              </div>
            </div>
          </section>

          <section id="top" className="d-flex flex-column min-vh-100">
            <div className="container row m-2">
              <div
                className="container d-flex align-items-center col-6"
                style={{ marginTop: "100px", textAlign: "justify" }}
              >
                Conheça melhor seus consumidores e ofereça a eles uma experiência 
                de compra personalizada. O iShop Manager permite que você analise 
                dados e otimize suas estratégias para aumentar a fidelidade à sua 
                marca.
              </div>
              <Image
                src="/brand-loyalty-concept-illustration_114360-12422.avif"
                alt="Uma pessoa atraindo outras com um imã."
                className="col-sm-6 col-6 img-fluid"
                style={{ marginTop: "100px", width: "350px", height: "350px"}}
              />
            </div>
          </section>

          <section className="d-flex flex-column min-vh-100">
            <div className="container row m-2">
              <Image
                src="/Wavy_Bus-17_Single-09.jpg"
                alt="Uma sacola com etiquetas de desconto"
                className="col-sm-6 col-6 img-fluid"
                style={{ marginTop: "100px", width: "350px", height: "350px"}}
              />
              <div
                  className="container d-flex align-items-center col-6"
                  style={{ marginTop: "100px", textAlign: "justify" }}
                >
                  Aproveite ferramentas inteligentes para criar promoções, ajustar 
                  preços e atrair mais clientes. Otimize seu faturamento oferecendo 
                  os produtos certos, no momento certo!
              </div>
            </div>
          </section>

          <section id="Cards" className="container d-flex justify-content-center mt-5 mb-5">
            <div className="card" style={{ width: "18rem" }}>
              <Image src="/i-m-waiting-delivery-fresh-ingredients_329181-2910.jpg" alt="mulher_esperando_produtos" className="card-img-top" width={250} height={220} />
              <div className="card-body">
                <h5 className="card-title">📦 Gestão de Pedidos</h5>
                <p className="card-text">
                Monitore seus pedidos e garanta que seus clientes 
                recebam seus produtos, sem complicações!
                </p>
              </div>
            </div>

            <div className="card" style={{ width: "18rem" }}>
              <Image src="/women-shopping-buying-consumer-products-customer-day-celebration_23-2151623462.jpg" alt="idosa_fazendo_compras" className="card-img-top" width={250} height={220} />
              <div className="card-body">
                <h5 className="card-title">🛒 Facilidade na Compra</h5>
                <p className="card-text">
                  Otimize o processo de compra e garanta que seus 
                  clientes tenham uma experiência rápida, segura e 
                  sem barreiras.
                </p>
              </div>
            </div>

            <div className="card" style={{ width: "18rem" }}>
              <Image src="/interior-large-distribution-warehouse-with-shelves-stacked-with-palettes-goods-ready-market_342744-1481.avif" alt="armazem" className="card-img-top" width={250} height={220} />
              <div className="card-body">
                <h5 className="card-title">🏭 Logística Eficiente</h5>
                <p className="card-text">
                  Gerencie seus fornecedores, acompanhe seus produtos 
                  desde o estoque até a entrega e reduza custos operacionais.
                </p>
              </div>
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
