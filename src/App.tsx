import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import TargetAudience from './components/TargetAudience';
import PDFRedactor from './components/PDFRedactor';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import { motion, AnimatePresence } from 'motion/react';
import { Shield } from 'lucide-react';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-20 h-20 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/50 mb-6"
          >
            <Shield className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-display font-bold text-white tracking-tight"
          >
            tarja<span className="text-emerald-500">DOC</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-400 mt-2 text-sm"
          >
            Carregando ambiente seguro...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <TargetAudience />
      <section id="ferramenta" className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-display font-bold text-slate-900 sm:text-4xl">
              Oculte seus dados agora
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Faça o upload do seu PDF e adicione os termos que deseja tarjar. O resultado é gerado instantaneamente.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <PDFRedactor />
          </motion.div>
        </div>
      </section>
      <Pricing />
      <section className="py-24 bg-emerald-600">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="text-3xl font-display font-bold text-white mb-6">
            Pronto para proteger seus documentos?
          </h2>
          <p className="text-emerald-50 text-xl mb-10 opacity-90">
            Não arrisque sua privacidade enviando arquivos para servidores desconhecidos. Use o tarjaDOC e mantenha seus dados sob seu controle.
          </p>
          <a 
            href="#ferramenta"
            className="inline-flex items-center px-8 py-4 bg-white text-emerald-600 rounded-2xl font-bold text-lg hover:bg-emerald-50 transition-all shadow-xl"
          >
            Começar a Tarjar
          </a>
        </motion.div>
      </section>
    </>
  );
}

export default function App() {
  const [key, setKey] = useState(0);

  return (
    <BrowserRouter key={key}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
