import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";
import { useState } from "react";

const galleryImages = [
  {
    url: "https://images.unsplash.com/photo-1664549760921-2198b054a592?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWNpYWwlMjB0cmVhdG1lbnQlMjBzcGF8ZW58MXx8fHwxNzYzOTkwNTMxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "Tratamento Facial",
    category: "Facial",
  },
  {
    url: "https://images.unsplash.com/photo-1598901986949-f593ff2a31a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXNzYWdlJTIwdGhlcmFweXxlbnwxfHx8fDE3NjM5MjAwODV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "Massagem Relaxante",
    category: "Corporal",
  },
  {
    url: "https://images.unsplash.com/photo-1683408640631-2c99fff964d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBza2luY2FyZXxlbnwxfHx8fDE3NjQwMTU5Njd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "Skincare Premium",
    category: "Facial",
  },
  {
    url: "https://images.unsplash.com/photo-1613487700221-38271bedcb52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjByZWxheGF0aW9ufGVufDF8fHx8MTc2Mzk1Njk1OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "Ambiente Relaxante",
    category: "Ambiente",
  },
];

export function Gallery() {
  const [activeFilter, setActiveFilter] = useState("Todos");
  const filters = ["Todos", "Facial", "Corporal", "Ambiente"];

  const filteredImages =
    activeFilter === "Todos"
      ? galleryImages
      : galleryImages.filter((img) => img.category === activeFilter);

  return (
    <section id="gallery" className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-0 w-96 h-96 bg-pink-200 rounded-full blur-3xl opacity-20" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-2 bg-rose-100 text-rose-600 rounded-full tracking-wider uppercase mb-4">
            Galeria
          </span>
          <h2 className="mt-4 text-gray-900">
            Nosso Espaço & Tratamentos
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Conheça nosso ambiente sofisticado e alguns dos nossos tratamentos mais procurados
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 rounded-full transition-all ${
                activeFilter === filter
                  ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {filter}
            </button>
          ))}
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="relative group overflow-hidden rounded-3xl aspect-square shadow-lg hover:shadow-2xl transition-all cursor-pointer"
            >
              <ImageWithFallback
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm mb-2">
                    {image.category}
                  </div>
                  <h3 className="text-white">{image.title}</h3>
                </div>
              </div>

              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
