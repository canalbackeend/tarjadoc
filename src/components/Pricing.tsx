import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, X, Loader2, Info } from 'lucide-react';
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
    ],
    buttonText: 'Começar Grátis',
    buttonVariant: 'outline',
    popular: false,
  },
  {
    name: 'Plano Pro',
    price: 'R$ 9,90',
    period: '/mês',
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
    promotional: true,
  },
  {
    name: 'Empresarial',
    price: 'Sob Consulta',
    period: '',
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
  const [showTerms, setShowTerms] = useState(false);

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
    <>
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

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-3xl p-8 ${
                  plan.popular
                    ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 shadow-xl relative'
                    : 'bg-white border border-slate-200 shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-emerald-600 px-4 py-1 rounded-full text-sm font-medium">
                    Mais Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className={`text-xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                      {plan.price}
                    </span>
                    {plan.period && <span className={plan.popular ? 'text-emerald-100' : 'text-slate-500'}>
                      {plan.period}
                    </span>}
                  </div>
                  {plan.promotional && (
                    <div className="mt-2">
                      <span className="text-emerald-100 text-sm">
                        Promocional 6 meses
                      </span>
                      <button 
                        onClick={() => setShowTerms(true)}
                        className="block mx-auto mt-1 text-xs text-emerald-200 underline hover:text-emerald-100"
                      >
                        Ver condições
                      </button>
                    </div>
                  )}
                  <p className={`text-sm mt-2 ${plan.popular ? 'text-emerald-100' : 'text-slate-600'}`}>
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-white' : 'text-emerald-600'}`} />
                      ) : (
                        <X className="w-5 h-5 text-slate-300 flex-shrink-0" />
                      )}
                      <span className={feature.included 
                        ? (plan.popular ? 'text-white' : 'text-slate-700')
                        : 'text-slate-400'
                      }>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleSubscribe}
                  disabled={isLoading || (currentUser && isPro && plan.name === 'Plano Pro')}
                  className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-white text-emerald-600 hover:bg-emerald-50'
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

      {showTerms && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Condições da Promoção</h3>
            <div className="text-slate-600 space-y-3 text-sm">
              <p><strong>Preço Promocional:</strong> R$ 9,90/mês durante 6 meses.</p>
              <p><strong>Após o período promocional:</strong> O valor ajusta automaticamente para R$ 35,90/mês.</p>
              <p><strong>Cancelamento:</strong> Você pode cancelar a qualquer momento sem taxas adicionais.</p>
              <p><strong>Renovação:</strong> A assinatura renova automaticamente a cada mês.</p>
            </div>
            <button
              onClick={() => setShowTerms(false)}
              className="w-full mt-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-500"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
