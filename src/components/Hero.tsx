import React from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Hero() {
  return (
    <section className="relative pt-20 pb-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium mb-8"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>100% Seguro e Privado</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl md:text-7xl font-display font-bold text-slate-900 tracking-tight mb-6"
        >
          Segurança jurídica e agilidade <br />
          <span className="text-emerald-600">ao tarjar documentos.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Proteja dados sensíveis de clientes, pacientes ou funcionários ocultando nomes, CPFs e informações confidenciais de forma definitiva e 100% segura.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a 
            href="#ferramenta"
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-semibold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
          >
            Começar Agora
            <ArrowRight className="w-5 h-5" />
          </a>
          <a 
            href="#como-funciona"
            className="px-8 py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-semibold hover:bg-slate-50 transition-all"
          >
            Como funciona?
          </a>
        </motion.div>
      </div>
    </section>
  );
}
