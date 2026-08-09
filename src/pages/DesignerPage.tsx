import React, { useState } from 'react';
import { Wand2, Download, Image as ImageIcon, MessageSquareText, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { ColorPaletteEditor } from '../components/designer/ColorPaletteEditor';
import type { ColorSwatch } from '../components/designer/ColorPaletteEditor';
import { useToast } from '../components/ui/ToastContext';
import { generateDesignerQuestions, enhanceImagePrompt, type DesignerQuestion } from '../lib/gemini';

type DesignerStep = 'initial' | 'asking' | 'answering' | 'generating' | 'result';

export const DesignerPage: React.FC = () => {
  const [step, setStep] = useState<DesignerStep>('initial');
  
  // Basic Form State
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('Minimalista');
  const [occasion, setOccasion] = useState('Cumpleaños');
  const [palette, setPalette] = useState<ColorSwatch[]>([
    { id: '1', hex: '#FFB6C1' },
    { id: '2', hex: '#E6E6FA' },
  ]);

  // AI Conversational State
  const [questions, setQuestions] = useState<DesignerQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // Result State
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [promptUsed, setPromptUsed] = useState('');
  
  const { toast } = useToast();

  const styles = ['Minimalista', 'Romántico', 'Boho', 'Elegante', 'Infantil', 'Moderno'];
  const occasions = ['Cumpleaños', 'Boda', 'Baby Shower', 'Graduación', 'Corporativo', 'San Valentín'];

  const handleConsultAI = async () => {
    if (!description.trim()) {
      toast.error('Por favor, describe tu pastel antes de consultar a la IA.');
      return;
    }

    setStep('asking');
    try {
      const q = await generateDesignerQuestions(description, style, occasion);
      setQuestions(q);
      
      // Initialize answers
      const initialAnswers: Record<string, string> = {};
      q.forEach(question => {
        initialAnswers[question.id] = question.options[0]; // default to first option
      });
      setAnswers(initialAnswers);
      
      setStep('answering');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error al consultar a la IA.');
      setStep('initial');
    }
  };

  const handleGenerateFinal = async () => {
    setStep('generating');
    
    // Cleanup previous object URL to avoid memory leaks
    if (generatedImage && generatedImage.startsWith('blob:')) {
      URL.revokeObjectURL(generatedImage);
    }
    setGeneratedImage(null);
    
    try {
      const colors = palette.map(p => p.hex).join(', ');
      
      // Step 1: Enhance prompt using Gemini
      const masterPrompt = await enhanceImagePrompt(description, style, occasion, colors, answers);
      setPromptUsed(masterPrompt);
      
      // Step 2: Generate image using custom API
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer saraReyna.664'
        },
        body: JSON.stringify({ prompt: masterPrompt })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${errorText}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      setGeneratedImage(objectUrl);
      setStep('result');
      toast.success('¡Diseño monumental generado con éxito!');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error al generar la imagen definitiva.');
      setStep('answering'); // return to previous state so they can retry
    }
  };

  const handleReset = () => {
    setStep('initial');
    setQuestions([]);
    setAnswers({});
  };

  const downloadImage = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `marea-render-master.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title text-2xl font-bold font-poppins text-gray-900 flex items-center gap-2">
          Diseñador IA <Sparkles className="text-primary w-6 h-6" />
        </h1>
        <p className="page-subtitle text-gray-500">Asistente creativo interactivo para pastelería de alta gama</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT FORM PANEL */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* STEP 1: Basic Info */}
          <div className={`bg-white p-6 rounded-2xl shadow-sm border ${step === 'initial' || step === 'asking' ? 'border-primary ring-1 ring-primary/20' : 'border-gray-100 opacity-60'} transition-all`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-poppins text-gray-800">1. Idea Base</h2>
              {step !== 'initial' && step !== 'asking' && (
                <button onClick={handleReset} className="text-xs text-primary font-semibold hover:underline">Editar</button>
              )}
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">¿Qué tienes en mente?</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={step !== 'initial'}
                  placeholder="Ej: Pastel de dos pisos con decoración de flores de azúcar, temática de baseball..."
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Estilo Visual</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {styles.map(s => (
                    <button
                      key={s}
                      onClick={() => setStyle(s)}
                      disabled={step !== 'initial'}
                      className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                        style === s ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      } disabled:opacity-70`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">Ocasión</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {occasions.map(o => (
                    <button
                      key={o}
                      onClick={() => setOccasion(o)}
                      disabled={step !== 'initial'}
                      className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                        occasion === o ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      } disabled:opacity-70`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <div className={step !== 'initial' ? 'pointer-events-none' : ''}>
                  <ColorPaletteEditor value={palette} onChange={setPalette} />
                </div>
              </div>

              {step === 'initial' && (
                <button
                  onClick={handleConsultAI}
                  disabled={!description}
                  className="w-full btn-primary bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30 mt-4"
                >
                  <MessageSquareText className="w-5 h-5" />
                  Consultar con IA Asistente
                </button>
              )}
              
              {step === 'asking' && (
                <div className="w-full py-3 flex items-center justify-center gap-3 text-primary font-medium bg-primary/5 rounded-xl border border-primary/20">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  Analizando y preparando preguntas...
                </div>
              )}
            </div>
          </div>

          {/* STEP 2: Interactive QA */}
          {(step === 'answering' || step === 'generating' || step === 'result') && (
            <div className={`bg-white p-6 rounded-2xl shadow-sm border ${step === 'answering' ? 'border-primary ring-1 ring-primary/20' : 'border-gray-100'} transition-all animate-fade-in`}>
              <h2 className="text-lg font-bold font-poppins text-gray-800 mb-4 flex items-center gap-2">
                2. Detalles de Diseño <CheckCircle2 className="w-5 h-5 text-green-500" />
              </h2>
              
              <div className="space-y-6">
                {questions.map((q, idx) => (
                  <div key={q.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="font-semibold text-gray-800 mb-3 text-sm">{idx + 1}. {q.question}</p>
                    <div className="space-y-2">
                      {q.options.map(opt => (
                        <label key={opt} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${answers[q.id] === opt ? 'bg-primary/5 border-primary' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                          <input
                            type="radio"
                            name={q.id}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                            className="mt-1 text-primary focus:ring-primary"
                            disabled={step !== 'answering'}
                          />
                          <span className={`text-sm ${answers[q.id] === opt ? 'text-primary font-medium' : 'text-gray-600'}`}>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                {step === 'answering' && (
                  <button
                    onClick={handleGenerateFinal}
                    className="w-full btn-primary bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-lg shadow-primary/30"
                  >
                    <Wand2 className="w-5 h-5" />
                    Crear Diseño Fotorealista
                  </button>
                )}
                
                {step === 'generating' && (
                  <div className="w-full py-4 flex flex-col items-center justify-center gap-3 text-primary font-medium bg-primary/5 rounded-xl border border-primary/20">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span>Renderizando modelo monumental...</span>
                    <span className="text-xs font-normal text-gray-500 text-center px-4">Optimizando calidad 8k de estudio, por favor espera un momento.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT GALLERY PANEL */}
        <div className="lg:col-span-7">
          <div className="bg-gray-50 rounded-2xl p-6 h-full min-h-[600px] border border-gray-100 flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 z-10 relative">
              <h2 className="text-lg font-bold font-poppins text-gray-900">Resultado Maestro</h2>
              {step === 'result' && (
                <span className="text-xs font-medium bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200 shadow-sm">
                  Render 8K Completado
                </span>
              )}
            </div>

            {step === 'generating' ? (
              <div className="w-full flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center min-h-[400px] p-8 z-10 relative">
                <div className="w-full max-w-md space-y-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                  <div className="h-64 bg-gray-100 rounded-xl animate-pulse mt-8 flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-gray-300 animate-pulse" />
                  </div>
                </div>
              </div>
            ) : step === 'result' && generatedImage ? (
              <div className="space-y-4 flex-1 flex flex-col z-10 relative">
                <div className="group relative rounded-xl overflow-hidden border-4 border-white shadow-xl bg-white flex-1 flex items-center justify-center min-h-[400px]">
                  <img
                    src={generatedImage}
                    alt={`Render Maestro`}
                    className="w-full h-auto max-h-[700px] object-cover transition-transform duration-700 hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end pb-8 gap-3">
                    <button
                      onClick={() => window.open(generatedImage, '_blank')}
                      className="px-8 py-3 bg-white text-gray-900 rounded-full text-sm font-bold hover:bg-gray-100 transition-colors shadow-lg"
                    >
                      Ver a pantalla completa
                    </button>
                    <button
                      onClick={() => downloadImage(generatedImage)}
                      className="px-8 py-3 bg-primary text-white rounded-full text-sm font-bold hover:bg-primary-dark transition-colors shadow-lg flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Descargar Alta Resolución
                    </button>
                  </div>
                </div>
                
                <details className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-sm text-gray-600">
                  <summary className="font-semibold text-gray-800 cursor-pointer flex items-center gap-2">
                    <ChevronRight className="w-4 h-4" /> Ver Prompt Optimizado por Gemini
                  </summary>
                  <p className="mt-3 font-mono text-xs bg-gray-50 p-3 rounded-lg border border-gray-100 overflow-x-auto">
                    {promptUsed}
                  </p>
                </details>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-6 z-10 relative bg-white/50 rounded-xl border border-dashed border-gray-300 m-2">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <ImageIcon className="w-12 h-12 text-gray-300" />
                </div>
                <div className="text-center max-w-sm">
                  <p className="font-medium text-gray-600 mb-2">Lienzo en Blanco</p>
                  <p className="text-sm">
                    Inicia el proceso en el panel izquierdo para recibir asesoría de la IA y generar tu obra maestra.
                  </p>
                </div>
              </div>
            )}
            
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
