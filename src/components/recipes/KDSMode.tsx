import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Clock, AlertTriangle } from 'lucide-react';

interface KDSModeProps {
  recipe: any;
  onClose: () => void;
}

export const KDSMode: React.FC<KDSModeProps> = ({ recipe, onClose }) => {
  const steps = recipe?.steps || [
    "Precalentar el horno a 180°C. Preparar el molde engrasado.",
    "Mezclar los ingredientes secos en un bol grande.",
    "Agregar los ingredientes húmedos y batir hasta integrar.",
    "Hornear por 45 minutos."
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-text z-50 flex flex-col text-white">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-700">
        <h2 className="text-2xl font-bold font-poppins">{recipe.name}</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition-colors">
          <X size={32} />
        </button>
      </div>

      {/* Climate Banner Mock */}
      <div className="bg-yellow-500 text-yellow-900 py-2 px-6 flex items-center justify-center font-semibold">
        <AlertTriangle size={18} className="mr-2" />
        Alerta de Clima: Temperatura ideal para fondant (18-22°C). Actualmente 25°C.
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-10 relative">
        <div className="text-secondary font-bold text-xl mb-8">
          Paso {currentStep + 1} de {steps.length}
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-center leading-tight max-w-4xl font-poppins">
          {steps[currentStep]}
        </h1>

        {/* Timer Section */}
        <div className="mt-16 flex flex-col items-center">
          {timeLeft !== null && timeLeft > 0 ? (
            <div className="text-6xl font-mono text-primary font-bold bg-white px-8 py-4 rounded-2xl shadow-lg">
              {formatTime(timeLeft)}
            </div>
          ) : (
            <button 
              onClick={() => setTimeLeft(5 * 60)} 
              className="flex items-center text-xl bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-full transition-colors"
            >
              <Clock size={24} className="mr-3" />
              Iniciar Timer (5 min)
            </button>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="p-6 flex justify-between items-center border-t border-gray-700 bg-gray-900">
        <button 
          onClick={prevStep} 
          disabled={currentStep === 0}
          className="px-8 py-4 bg-gray-800 text-white rounded-xl text-xl font-bold disabled:opacity-50 flex items-center hover:bg-gray-700"
        >
          <ChevronLeft size={28} className="mr-2" /> Anterior
        </button>
        <button 
          onClick={nextStep} 
          disabled={currentStep === steps.length - 1}
          className="px-8 py-4 bg-primary text-white rounded-xl text-xl font-bold disabled:opacity-50 flex items-center hover:bg-primary-dark"
        >
          Siguiente <ChevronRight size={28} className="ml-2" />
        </button>
      </div>
    </div>
  );
};
