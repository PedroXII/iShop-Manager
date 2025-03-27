import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import Navbar from './components/NavbarUser';

export default function HomeUser() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
            <Navbar />
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