import { CheckCircle, Award, Users, Heart } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";

const benefits = [
  "Profissionais certificados e experientes",
  "Equipamentos de última geração",
  "Produtos premium e dermatologicamente testados",
  "Ambiente acolhedor e relaxante",
  "Atendimento personalizado",
  "Resultados comprovados",
];

const stats = [
  { icon: Award, number: "10+", label: "Anos de Experiência" },
  { icon: Users, number: "5000+", label: "Clientes Satisfeitas" },
  { icon: Heart, number: "15+", label: "Tratamentos Disponíveis" },
];

export function About() {
  return (
    <section id="about" className="py-24 px-4 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBzYWxvbnxlbnwxfHx8fDE3NjM5MzcyMTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Clínica de Estética"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-gradient-to-br from-rose-400 to-pink-600 rounded-full blur-2xl opacity-50" />
            <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full blur-2xl opacity-50" />
            
            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="absolute -bottom-8 -right-8 bg-white p-8 rounded-3xl shadow-2xl max-w-xs"
            >
              <div className="grid grid-cols-3 gap-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="text-center">
                      <Icon className="w-6 h-6 text-rose-500 mx-auto mb-2" />
                      <div className="text-2xl bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                        {stat.number}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 bg-rose-100 text-rose-600 rounded-full tracking-wider uppercase mb-4">
              Sobre Nós
            </span>
            <h2 className="mt-4 mb-6 text-gray-900">
              Excelência em Estética e Cuidados com a Pele
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed text-lg">
              Nossa clínica de estética é referência em tratamentos faciais e corporais, oferecendo o que há de mais moderno e eficaz no mercado. Com uma equipe dedicada e apaixonada pelo que faz, transformamos sonhos de beleza em realidade.
            </p>

            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-3 group"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-rose-400 to-pink-600 rounded-full flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700">{benefit}</span>
                </motion.div>
              ))}
            </div>

            <button className="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-rose-500/50">
              Conheça Nossa Equipe
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
