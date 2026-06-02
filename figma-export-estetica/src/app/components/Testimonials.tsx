import { Star, Quote } from "lucide-react";
import { motion } from "motion/react";

const testimonials = [
  {
    name: "Maria Silva",
    treatment: "Limpeza de Pele",
    text: "Experiência maravilhosa! A equipe é super atenciosa e o resultado foi incrível. Minha pele nunca esteve tão bonita e saudável.",
    rating: 5,
    avatar: "MS",
  },
  {
    name: "Ana Santos",
    treatment: "Massagem Relaxante",
    text: "Lugar perfeito para relaxar e cuidar de si mesma. O ambiente é acolhedor e os profissionais são extremamente qualificados.",
    rating: 5,
    avatar: "AS",
  },
  {
    name: "Julia Oliveira",
    treatment: "Tratamento Facial",
    text: "Resultados visíveis desde a primeira sessão! Estou impressionada com a qualidade dos produtos e do atendimento. Super recomendo!",
    rating: 5,
    avatar: "JO",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-4 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-100 rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-100 rounded-full blur-3xl opacity-40" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-rose-100 text-rose-600 rounded-full tracking-wider uppercase mb-4">
            Depoimentos
          </span>
          <h2 className="mt-4 text-gray-900">
            O Que Nossas Clientes Dizem
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            A satisfação das nossas clientes é nossa maior conquista
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all relative overflow-hidden group"
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                {/* Quote Icon */}
                <div className="w-14 h-14 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Quote className="w-7 h-7 text-rose-500" />
                </div>
                
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-rose-500 text-rose-500" />
                  ))}
                </div>

                {/* Text */}
                <p className="text-gray-700 mb-6 italic leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-gray-900">{testimonial.name}</div>
                    <div className="text-rose-500">{testimonial.treatment}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Rating Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-full border border-rose-100">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-rose-500 text-rose-500" />
              ))}
            </div>
            <span className="text-gray-900">
              <strong className="text-2xl bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                4.9
              </strong>
              /5.0 baseado em 500+ avaliações
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
