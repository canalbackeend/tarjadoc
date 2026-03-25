import React, { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import PdfWorker from '../pdf.worker.ts?worker';
import { FileUp, X, Download, Loader2, AlertCircle, CheckCircle2, Plus, Zap, Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

interface RedactorProps {
  onSuccess?: () => void;
}

export default function PDFRedactor({ onSuccess }: RedactorProps) {
  const { currentUser, isPro } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [terms, setTerms] = useState<string[]>([]);
  const [currentTerm, setCurrentTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [pageWarning, setPageWarning] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const pdfFile = acceptedFiles[0];
    if (pdfFile && pdfFile.type === 'application/pdf') {
      setFile(pdfFile);
      setResultUrl(null);
      setError(null);
      setPageWarning(false);
    } else {
      setError('Por favor, selecione um arquivo PDF válido.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    disabled: !currentUser
  } as any);

  const addTerm = () => {
    if (currentTerm.trim() && !terms.includes(currentTerm.trim())) {
      setTerms([...terms, currentTerm.trim()]);
      setCurrentTerm('');
    }
  };

  const removeTerm = (termToRemove: string) => {
    setTerms(terms.filter(t => t !== termToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTerm();
    }
  };

  const processPDF = async () => {
    if (!file || terms.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    let pdf: pdfjsLib.PDFDocumentProxy | null = null;
    let worker: Worker | null = null;
    let pdfWorker: pdfjsLib.PDFWorker | null = null;

    try {
      // Use FileReader for better compatibility with older iPadOS/Safari
      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(new Error('Erro ao ler o arquivo.'));
        reader.readAsArrayBuffer(file);
      });
      
      // 1. Load PDF with PDF.js to find text positions
      if (!pdfjsLib.getDocument) {
        throw new Error('O motor de PDF não pôde ser carregado. Verifique sua conexão com a internet.');
      }
      
      // Create a new worker for each processing task
      worker = new PdfWorker();
      pdfWorker = pdfjsLib.PDFWorker.create({ port: worker });

      // Pass a copy of the ArrayBuffer as Uint8Array to prevent it from being detached and avoid stream issues
      const loadingTask = pdfjsLib.getDocument({ 
        data: new Uint8Array(arrayBuffer.slice(0)),
        worker: pdfWorker
      });
      pdf = await loadingTask.promise;
      
      // 2. Load PDF with pdf-lib to modify it
      const pdfDoc = await PDFDocument.load(arrayBuffer.slice(0));
      const pages = pdfDoc.getPages();

      let totalMatches = 0;
      const maxPages = isPro ? pdf.numPages : Math.min(pdf.numPages, 2);
      
      if (!isPro && pdf.numPages > 2) {
        setPageWarning(true);
        setError('O plano Grátis permite processar apenas documentos de até 2 páginas. Por favor, faça upgrade para o plano Profissional para processar documentos maiores.');
        setIsProcessing(false);
        return;
      }

      // Remove extra pages beyond the limit (should not happen anymore with the block above, but keeping for safety)
      while (pdfDoc.getPageCount() > maxPages) {
        pdfDoc.removePage(maxPages);
      }

      for (let i = 1; i <= maxPages; i++) {
        setProgress(Math.round((i / maxPages) * 100));
        // Pequeno delay para permitir que a UI atualize a barra de progresso
        await new Promise(resolve => setTimeout(resolve, 50));
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        if (textContent.items.length === 0) {
          console.warn(`Página ${i} não contém texto selecionável. Pode ser uma imagem.`);
        }

        const libPage = pages[i - 1];
        const { width, height } = libPage.getSize();

        // Iterate through text items
        for (const item of textContent.items as any[]) {
          const itemText = item.str;
          
          // Check if any term is in this text item
          for (const term of terms) {
            if (itemText.toLowerCase().includes(term.toLowerCase())) {
              totalMatches++;
              const transform = item.transform; // [a, b, c, d, e, f]
              // transform[4] is x, transform[5] is y
              // PDF coordinates start from bottom-left
              
              // Scale coordinates to pdf-lib page size
              // PDF.js viewport might have different scale/rotation
              const x = transform[4];
              const y = transform[5];
              const textWidth = item.width;
              const textHeight = item.height;

              // Draw black rectangle
              // pdf-lib also uses bottom-left origin
              libPage.drawRectangle({
                x: x,
                y: y,
                width: textWidth,
                height: textHeight || 12, // fallback height
                color: rgb(0, 0, 0),
              });
            }
          }
        }
      }

      if (totalMatches === 0) {
        setError('Nenhum dos termos informados foi encontrado no documento. Verifique se o texto é selecionável ou se os termos estão corretos.');
        setIsProcessing(false);
        return;
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(`Erro ao processar: ${err.message || err.toString()}`);
    } finally {
      setIsProcessing(false);
      if (pdf) {
        try {
          await pdf.destroy();
        } catch (e) {
          console.error('Error destroying PDF', e);
        }
      }
      if (pdfWorker) {
        try {
          pdfWorker.destroy();
        } catch (e) {
          console.error('Error destroying PDFWorker', e);
        }
      }
      if (worker) {
        worker.terminate();
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="p-8 md:p-12">
        {!currentUser ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-display font-bold text-slate-900 mb-4">
              Faça login para usar a ferramenta
            </h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Para garantir a segurança e privacidade dos seus documentos, o uso da ferramenta é restrito a usuários cadastrados.
            </p>
            <Link
              to="/register"
              className="px-8 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-xl inline-flex items-center gap-2"
            >
              Criar Conta Grátis
            </Link>
          </div>
        ) : !file ? (
          <div 
            {...getRootProps()} 
            className={cn(
              "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all",
              isDragActive ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            )}
          >
            <input {...getInputProps()} />
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileUp className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-display font-semibold text-slate-900 mb-2">
              Selecione seu PDF
            </h3>
            <p className="text-slate-500">
              Arraste e solte ou clique para procurar no seu computador
            </p>
            <p className="mt-4 text-xs text-slate-400 uppercase tracking-widest font-semibold">
              Máximo 20MB • Apenas PDF • Grátis: Até 2 páginas
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <FileUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 truncate max-w-[200px] md:max-w-md">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setFile(null)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Dados para Tarjar
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentTerm}
                  onChange={(e) => setCurrentTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ex: João Silva, 123.456.789-00..."
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
                <button
                  onClick={addTerm}
                  disabled={!currentTerm.trim()}
                  className="px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Adicionar</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Dica: Use termos exatos como aparecem no documento para melhores resultados.
              </p>

              <div className="flex flex-wrap gap-2 min-h-[40px]">
                {terms.map((term) => (
                  <span 
                    key={term}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-sm font-medium"
                  >
                    {term}
                    <button onClick={() => removeTerm(term)} className="hover:text-emerald-900">
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
                {terms.length === 0 && (
                  <p className="text-sm text-slate-400 italic">Nenhum termo adicionado ainda.</p>
                )}
              </div>
            </div>

            <div className="pt-4">
              {isProcessing && (
                <div className="mb-6 space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <span>Analisando e tarjando páginas...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {pageWarning && !error && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3 text-amber-700 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p><strong>Aviso:</strong> Você está no plano Grátis. Apenas as 2 primeiras páginas do documento foram processadas. Faça upgrade para processar documentos completos.</p>
                </div>
              )}

              {resultUrl ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-700 text-sm">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <p>Documento processado com sucesso!</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                      href={resultUrl}
                      download={`redigido-${file.name}`}
                      className="py-4 bg-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                    >
                      <Download className="w-5 h-5" />
                      Baixar PDF
                    </a>
                    <button
                      onClick={() => window.open(resultUrl, '_blank')}
                      className="py-4 bg-slate-100 text-slate-700 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
                    >
                      Visualizar PDF
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      setFile(null);
                      setTerms([]);
                      setResultUrl(null);
                    }}
                    className="w-full py-3 text-slate-500 font-medium hover:text-slate-700 transition-all"
                  >
                    Processar outro arquivo
                  </button>
                </div>
              ) : (
                <button
                  onClick={processPDF}
                  disabled={isProcessing || terms.length === 0}
                  className="w-full py-4 bg-slate-900 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Tarjar Documento
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
