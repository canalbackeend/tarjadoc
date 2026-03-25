import React from 'react';
import { motion } from 'motion/react';
import { Scale, HeartPulse, Users, Code } from 'lucide-react';

const audiences = [
  {
    title: 'Setor Jurídico e Legaltechs',
    description: 'Escritórios que precisam publicar sentenças ou documentos sem expor dados sensíveis de clientes.',
    icon: Scale,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
  {
    title: 'Saúde (Healthtechs)',
    description: 'Hospitais e clínicas que precisam compartilhar prontuários para pesquisa ou seguros sem violar a privacidade do paciente.',
    icon: HeartPulse,
    color: 'text-rose-600',
    bgColor: 'bg-rose-100',
  },
  {
    title: 'Recursos Humanos',
    description: 'Empresas que lidam com milhares de currículos e dados de funcionários diariamente.',
    icon: Users,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
  },
  {
    title: 'Desenvolvedores e QA',
    description: 'Equipes que precisam de dados "reais" para testes, mas não podem usar CPFs ou nomes verdadeiros no ambiente de homologação.',
    icon: Code,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
];

export default function TargetAudience() {
  return (
    <section id="casos-de-uso" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-display font-bold text-slate-900 sm:text-4xl"
          >
            Invista na segurança
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto font-medium"
          >
            Você não procura apenas "tarjamento". Você busca <span className="text-emerald-600 font-bold">segurança jurídica e agilidade</span>.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {audiences.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg hover:border-emerald-100 transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl ${item.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <item.icon className={`w-7 h-7 ${item.color}`} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {item.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
