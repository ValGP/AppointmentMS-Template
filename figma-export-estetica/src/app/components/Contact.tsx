import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Mensagem enviada com sucesso! Entraremos em contato em breve.");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Endereço",
      details: ["Rua das Flores, 123 - Centro", "São Paulo, SP - CEP 01234-567"],
      gradient: "from-rose-500 to-pink-500",
    },
    {
      icon: Phone,
      title: "Telefone",
      details: ["(11) 98765-4321", "(11) 3456-7890"],
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Mail,
      title: "E-mail",
      details: ["contato@estetica.com.br"],
      gradient: "from-orange-500 to-rose-500",
    },
    {
      icon: Clock,
      title: "Horário de Funcionamento",
      details: ["Segunda a Sexta: 9h às 19h", "Sábado: 9h às 14h"],
      gradient: "from-teal-500 to-cyan-500",
    },
  ];

  return (
    <section id="contact" className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-rose-100 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-100 rounded-full blur-3xl opacity-30" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-rose-100 text-rose-600 rounded-full tracking-wider uppercase mb-4">
            Contato
          </span>
          <h2 className="mt-4 text-gray-900">
            Agende Sua Consulta
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Entre em contato conosco e descubra como podemos realçar sua beleza natural
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact Info */}
          <div className="space-y-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group"
                >
                  <div className="flex items-start gap-4 bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
                    <div className={`w-14 h-14 bg-gradient-to-br ${info.gradient} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="text-gray-900 mb-2">{info.title}</div>
                      {info.details.map((detail, i) => (
                        <p key={i} className="text-gray-600">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl p-8 lg:p-10 shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-rose-500 transition-colors"
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-rose-500 transition-colors"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-rose-500 transition-colors"
                  placeholder="(11) 98765-4321"
                  required
                />
              </div>

              <div>
                <label htmlFor="service" className="block text-gray-700 mb-2">
                  Serviço de Interesse
                </label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-rose-500 transition-colors"
                  required
                >
                  <option value="">Selecione um serviço</option>
                  <option value="limpeza">Limpeza de Pele</option>
                  <option value="massagem">Massagem Relaxante</option>
                  <option value="laser">Depilação a Laser</option>
                  <option value="facial">Tratamento Facial</option>
                  <option value="peeling">Peeling Químico</option>
                  <option value="drenagem">Drenagem Linfática</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-gray-700 mb-2">
                  Mensagem
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-rose-500 transition-colors resize-none"
                  placeholder="Conte-nos um pouco sobre o que você busca..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="group w-full px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl transition-all transform hover:scale-[1.02] hover:shadow-lg hover:shadow-rose-500/50 flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                Enviar Mensagem
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
