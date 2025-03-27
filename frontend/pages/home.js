import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import Navbar from './components/NavbarUser';
import { useState } from 'react'; 

export default function HomeUser() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const buttons = [
    { title: "Armazém", link: "/armazem", color: "bg-primary" },
    { title: "Fornecedor", link: "/fornecedor", color: "bg-success" },
    { title: "Funcionário", link: "/funcionario", color: "bg-info" },
    { title: "Cliente", link: "/cliente", color: "bg-warning" },
    { title: "Produto", link: "/produto", color: "bg-danger" },
    { title: "Promoção", link: "/promocao", color: "bg-secondary" }
  ];

  return (
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
            <Navbar />
          </section>

          {/* Adicionei padding-top para compensar a navbar fixa */}
          <section id="top" className="d-flex flex-column min-vh-100 pt-5">
            <div className="container my-auto">
              <div className="row justify-content-center">
                <div className="col-12 text-center mb-5">
                  <h2 className="display-4">Bem-vindo ao iShop Manager</h2>
                  <p className="lead">Selecione uma opção abaixo para começar</p>
                </div>
                
                <div className="col-10">
                  <div className="row g-4">
                    {buttons.map((button, index) => (
                      <div key={index} className="col-md-4 col-sm-6">
                        <Link href={button.link} passHref legacyBehavior>
                          <div 
                            className={`card ${button.color} text-white text-center p-4 rounded-3 shadow-sm h-100 d-flex align-items-center justify-content-center`} 
                            style={{ 
                              minHeight: '150px', 
                              cursor: 'pointer', 
                              transition: 'transform 0.2s',
                              textDecoration: 'none' // Remove sublinhado
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            <h3 className="m-0" style={{ textDecoration: 'none' }}>{button.title}</h3>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
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