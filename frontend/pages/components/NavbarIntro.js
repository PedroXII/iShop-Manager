import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="navbar navbar-expand-lg bg-primary fixed-top">
      <div className="container-fluid">
        <Link href="/index" className="navbar-brand">
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
                <Link href="/index" className="nav-link text-light">
                    Home
                    </Link>
                </li>
                <li className="nav-item">
                    <Link href="/login" className="nav-link text-light">
                    Login
                    </Link>
                </li>
                <li className="nav-item">
                    <Link href="/registro" className="nav-link text-light">
                    Registre-se
                    </Link>
                </li>
                <li className="nav-item">
                    <Link href="#bottom" className="nav-link text-light">
                    Sobre
                    </Link>
                </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}