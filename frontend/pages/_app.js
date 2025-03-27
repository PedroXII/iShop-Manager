import { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/globals.css';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Carrega o Bootstrap JS apenas no cliente
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return <Component {...pageProps} />;
}