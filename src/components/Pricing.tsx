import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, X, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const plans = [
  {
    name: 'Grátis',
    price: 'R$ 0,00',
    period: '/mês',
    description: 'Para testar a ferramenta e pequenas necessidades.',
    features: [
      { text: 'Até 2 páginas por documento', included: true },
      { text: 'Tarjamento manual e automático', included: true },
      { text: 'Exportação em PDF', included: true },
      { text: 'Processamento local (seguro)', included: true },
      { text: 'Suporte prioritário', included: false },
      { text: 'Processamento em lote', included: false },
    ],
    buttonText: 'Começar Grátis',
    buttonVariant: 'outline',
    popular: false,
  },
  {
    name: 'Plano Pro',
    price: 'R$ 35,00',
    period: '/mês',
    description: 'Ideal para profissionais autônomos e pequenos escritórios.',
    features: [
      { text: 'Páginas ilimitadas', included: true },
      { text: 'Tarjamento manual e automático', included: true },
      { text: 'Exportação em PDF', included: true },
      { text: 'Processamento local (seguro)', included: true },
      { text: 'Suporte por e-mail', included: true },
      { text: 'Processamento em lote', included: false },
    ],
    buttonText: 'Assinar Plano Pro',
    buttonVariant: 'primary',
    popular: true,
  },
  {
    name: 'Empresarial',
    price: 'R$ 199,00',
    period: '/mês',
    description: 'Para equipes e empresas com alto volume de documentos.',
    features: [
      { text: 'Páginas ilimitadas', included: true },
      { text: 'Tarjamento manual e automático', included: true },
      { text: 'Exportação em PDF', included: true },
      { text: 'Processamento local (seguro)', included: true },
      { text: 'Suporte prioritário 24/7', included: true },
      { text: 'Processamento em lote (API)', included: true },
    ],
    buttonText: 'Falar com Vendas',
    buttonVariant: 'outline',
    popular: false,
  },
];

export default function Pricing() {
  const { currentUser, isPro } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }

    if (isPro) {
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          uid: currentUser.uid,
          email: currentUser.email,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Erro ao criar sessão de checkout');
      }
    } catch (error: any) {
      console.error('Error:', error);
      alert(`Erro ao iniciar assinatura: ${error.message || 'Tente novamente mais tarde.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="precos" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-display font-bold text-slate-900 sm:text-4xl"
          >
            Planos e Preços
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto"
          >
            Escolha o plano ideal para a sua necessidade de segurança e agilidade.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-8 rounded-3xl border ${
                plan.popular 
                  ? 'bg-emerald-600 border-emerald-600 shadow-xl shadow-emerald-200 text-white transform md:-translate-y-4' 
                  : 'bg-white border-slate-200 text-slate-900 hover:border-emerald-200 hover:shadow-lg'
              } transition-all flex flex-col`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="bg-emerald-200 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Mais Escolhido
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className={`text-xl font-bold mb-2 ${plan.popular ? 'text-emerald-50' : 'text-slate-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm h-10 ${plan.popular ? 'text-emerald-100' : 'text-slate-500'}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display font-bold">{plan.price}</span>
                  <span className={`text-sm font-medium ${plan.popular ? 'text-emerald-200' : 'text-slate-500'}`}>
                    {plan.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className={`w-5 h-5 shrink-0 ${plan.popular ? 'text-emerald-200' : 'text-emerald-500'}`} />
                    ) : (
                      <X className={`w-5 h-5 shrink-0 ${plan.popular ? 'text-emerald-400/50' : 'text-slate-300'}`} />
                    )}
                    <span className={`text-sm ${
                      !feature.included 
                        ? (plan.popular ? 'text-emerald-200/70 line-through' : 'text-slate-400 line-through') 
                        : (plan.popular ? 'text-white' : 'text-slate-700')
                    }`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {plan.name === 'Plano Pro' ? (
                <button
                  onClick={handleSubscribe}
                  disabled={isLoading || isPro}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-center transition-all flex items-center justify-center gap-2 ${
                    isPro 
                      ? 'bg-emerald-100 text-emerald-500 cursor-not-allowed'
                      : plan.popular
                        ? 'bg-white text-emerald-600 hover:bg-emerald-50'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isPro ? 'EU JÁ SOU PRO' : plan.buttonText)}
                </button>
              ) : (
                <a
                  href="#ferramenta"
                  className={`w-full py-4 px-6 rounded-xl font-bold text-center transition-all ${
                    plan.popular
                      ? 'bg-white text-emerald-600 hover:bg-emerald-50'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {plan.buttonText}
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
