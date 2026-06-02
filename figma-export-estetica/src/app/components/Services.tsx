import { Sparkles, Heart, Zap, Star, Droplet, Wind } from "lucide-react";
import { motion } from "motion/react";

const services = [
  {
    icon: Sparkles,
    title: "Limpeza de Pele",
    description: "Tratamento profundo para remover impurezas e renovar a pele do rosto",
    price: "R$ 150",
    gradient: "from-rose-500 to-pink-500",
  },
  {
    icon: Heart,
    title: "Massagem Relaxante",
    description: "Técnicas especializadas para alívio do estresse e tensão muscular",
    price: "R$ 180",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Zap,
    title: "Depilação a Laser",
    description: "Remoção permanente de pelos com tecnologia de ponta",
    price: "A partir de R$ 200",
    gradient: "from-orange-500 to-rose-500",
  },
  {
    icon: Star,
    title: "Tratamento Facial",
    description: "Procedimentos personalizados para rejuvenescimento e hidratação",
    price: "R$ 250",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    icon: Droplet,
    title: "Peeling Químico",
    description: "Renovação celular para uma pele mais jovem e radiante",
    price: "R$ 300",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Wind,
    title: "Drenagem Linfática",
    description: "Redução de inchaço e melhora da circulação corporal",
    price: "R$ 160",
    gradient: "from-teal-500 to-emerald-500",
  },
];

export function Services() {
  return (
    <section id="services" className="py-24 px-4 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-100 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-100 rounded-full blur-3xl opacity-30" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-rose-100 text-rose-600 rounded-full tracking-wider uppercase mb-4">
            Nossos Serviços
          </span>
          <h2 className="mt-4 text-gray-900">
            Tratamentos Exclusivos para Você
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Oferecemos uma ampla gama de tratamentos estéticos com equipamentos modernos e profissionais altamente qualificados
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all overflow-hidden"
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="mb-3 text-gray-900">
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className={`bg-gradient-to-r ${service.gradient} bg-clip-text text-transparent`}>
                      {service.price}
                    </span>
                    <button className="text-gray-900 hover:text-rose-500 transition-colors group-hover:translate-x-1 transform duration-300">
                      Saiba mais →
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <a href="#contact">
            <button className="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full hover:shadow-lg hover:shadow-rose-500/50 hover:scale-105 transition-all">
              Ver Todos os Serviços
            </button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
