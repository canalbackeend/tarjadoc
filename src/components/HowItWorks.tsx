import React from 'react';
import { Shield, Lock, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export default function HowItWorks() {
  const steps = [
    {
      icon: <Zap className="w-6 h-6 text-emerald-500" />,
      title: "Upload Local",
      description: "Seu arquivo é processado inteiramente no seu navegador. Nada é enviado para nossos servidores."
    },
    {
      icon: <Shield className="w-6 h-6 text-emerald-500" />,
      title: "Identificação",
      description: "Você informa quais termos deseja ocultar (nomes, CPFs, telefones) e nossa ferramenta localiza no documento."
    },
    {
      icon: <Lock className="w-6 h-6 text-emerald-500" />,
      title: "Tarja Permanente",
      description: "O PDF é modificado com camadas pretas sobre o texto, garantindo que a informação não possa ser recuperada."
    }
  ];

  return (
    <section id="como-funciona" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-display font-bold text-slate-900 sm:text-4xl">
            Privacidade em Primeiro Lugar
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Entenda como garantimos a segurança dos seus dados durante o processo de redigir informações.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 transition-transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 border border-slate-100">
                {step.icon}
              </div>
              <h3 className="text-xl font-display font-semibold text-slate-900 mb-3">
                {step.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
