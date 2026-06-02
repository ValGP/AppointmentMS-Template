import { Sparkles, Instagram, Facebook, Youtube, Mail } from "lucide-react";
import { motion } from "motion/react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl">Estética Premium</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Transformando beleza em arte há mais de 10 anos. Cuidando de você com excelência e dedicação.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-br hover:from-rose-500 hover:to-pink-600 rounded-full flex items-center justify-center transition-all hover:scale-110"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-br hover:from-rose-500 hover:to-pink-600 rounded-full flex items-center justify-center transition-all hover:scale-110"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-br hover:from-rose-500 hover:to-pink-600 rounded-full flex items-center justify-center transition-all hover:scale-110"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="mb-4 bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
              Serviços
            </h4>
            <ul className="space-y-3 text-gray-400">
              {["Limpeza de Pele", "Massagem Relaxante", "Depilação a Laser", "Tratamento Facial", "Peeling Químico", "Drenagem Linfática"].map(
                (service) => (
                  <li key={service}>
                    <a href="#services" className="hover:text-rose-400 transition-colors inline-flex items-center group">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-2 group-hover:scale-150 transition-transform" />
                      {service}
                    </a>
                  </li>
                )
              )}
            </ul>
          </motion.div>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="mb-4 bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
              Links Rápidos
            </h4>
            <ul className="space-y-3 text-gray-400">
              {[
                { name: "Sobre Nós", href: "#about" },
                { name: "Nossa Equipe", href: "#about" },
                { name: "Depoimentos", href: "#testimonials" },
                { name: "Galeria", href: "#gallery" },
                { name: "Contato", href: "#contact" },
              ].map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="hover:text-rose-400 transition-colors inline-flex items-center group">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-2 group-hover:scale-150 transition-transform" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="mb-4 bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
              Newsletter
            </h4>
            <p className="text-gray-400 mb-4">
              Receba dicas de beleza e ofertas exclusivas
            </p>
            <div className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Seu e-mail"
                className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-rose-500 text-white placeholder-gray-500 transition-colors"
              />
              <button className="px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 rounded-xl transition-all hover:shadow-lg hover:shadow-rose-500/50 flex items-center justify-center gap-2">
                <Mail className="w-5 h-5" />
                Assinar
              </button>
            </div>
          </motion.div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400">
            © {currentYear} Estética Premium. Todos os direitos reservados. Feito com{" "}
            <span className="text-rose-500">♥</span> para você.
          </p>
        </div>
      </div>
    </footer>
  );
}
