import { useState, useEffect } from "react";
import { Sparkles, Menu, X } from "lucide-react";

const navLinks = [
  { name: "Início", href: "#home" },
  { name: "Serviços", href: "#services" },
  { name: "Sobre", href: "#about" },
  { name: "Galeria", href: "#gallery" },
  { name: "Depoimentos", href: "#testimonials" },
  { name: "Contato", href: "#contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span
              className={`text-xl transition-colors ${
                isScrolled ? "text-gray-900" : "text-white"
              }`}
            >
              Estética Premium
            </span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`transition-colors hover:text-rose-500 ${
                  isScrolled ? "text-gray-700" : "text-white"
                }`}
              >
                {link.name}
              </a>
            ))}
            <button className="px-6 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full hover:shadow-lg hover:scale-105 transition-all">
              Agendar
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden transition-colors ${
              isScrolled ? "text-gray-900" : "text-white"
            }`}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 bg-white rounded-2xl shadow-xl">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-6 py-3 text-gray-700 hover:bg-rose-50 hover:text-rose-500 transition-colors"
              >
                {link.name}
              </a>
            ))}
            <div className="px-6 pt-4">
              <button className="w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full hover:shadow-lg transition-all">
                Agendar
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
