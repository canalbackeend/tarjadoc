import React from 'react';
import { Shield, Github, Twitter, Mail } from 'lucide-react';
import { motion } from 'motion/react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16"
        >
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-8 h-8 text-emerald-500" />
              <span className="text-2xl font-display font-bold text-white tracking-tight">
                Redigir<span className="text-emerald-500">PDF</span>
              </span>
            </div>
            <p className="max-w-sm text-lg leading-relaxed">
              Ferramenta empresarial focada em privacidade para redigir documentos sensíveis sem nunca enviar seus arquivos para a nuvem.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Links</h4>
            <ul className="space-y-4">
              <li><a href="#como-funciona" className="hover:text-emerald-400 transition-colors">Como Funciona</a></li>
              <li><a href="#ferramenta" className="hover:text-emerald-400 transition-colors">Ferramenta</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacidade</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Contato</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="pt-8 border-t border-slate-800 text-center text-sm"
        >
          <p>© {new Date().getFullYear()} RedigirPDF. Todos os direitos reservados. Processamento 100% local.</p>
        </motion.div>
      </div>
    </footer>
  );
}
