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
      { text: 'Suporte por e-mail', included: false },
    ],
    buttonText: 'Começar Grátis',
    buttonVariant: 'outline',
    popular: false,
  },
  {
    name: 'Plano Pro',
    price: 'R$ 9,99',
    period: '/mês',
    promotional: 'R$ 35,90 por 6 meses',
    description: 'Ideal para profissionais autônomos e pequenos escritórios.',
    features: [
      { text: 'Páginas ilimitadas', included: true },
      { text: 'Tarjamento manual e automático', included: true },
      { text: 'Exportação em PDF', included: true },
      { text: 'Processamento local (seguro)', included: true },
      { text: 'Suporte por e-mail', included: true },
    ],
    buttonText: 'Assinar Plano Pro',
    buttonVariant: 'primary',
    popular: true,
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
          <h2 className="text-3xl font-display font-bold text-slate-900 sm:text-4xl">
            Escolha seu plano
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Comece gratuitamente e faça upgrade quando precisar de mais recursos.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-3xl p-8 ${
                plan.popular
                  ? 'ring-2 ring-emerald-600 shadow-xl scale-105 relative'
                  : 'border border-slate-200 shadow-lg'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Mais Popular
                </div>
              )}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-500">{plan.period}</span>
                </div>
                {plan.promotional && (
                  <p className="text-sm text-emerald-600 font-medium mt-1">{plan.promotional}</p>
                )}
                <p className="text-slate-600 text-sm mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-slate-300 flex-shrink-0" />
                    )}
                    <span className={feature.included ? 'text-slate-700' : 'text-slate-400'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleSubscribe}
                disabled={isLoading || (currentUser && isPro && plan.name === 'Plano Pro')}
                className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  plan.buttonVariant === 'primary'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : currentUser && isPro && plan.name === 'Plano Pro' ? (
                  'Plano Ativo'
                ) : (
                  plan.buttonText
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
