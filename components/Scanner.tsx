
import React, { useState, useRef } from 'react';
import { recognizeFood } from '../services/geminiService';
import { FoodItem } from '../types';

const resizeImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const MAX_WIDTH = 512;
        const MAX_HEIGHT = 512;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

interface ScannerProps {
  onFoodLogged: (item: FoodItem) => void;
  onCancel: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onFoodLogged, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<Partial<FoodItem> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const resizedDataUrl = await resizeImage(file);
      setPreviewUrl(resizedDataUrl);
      
      const base64Data = resizedDataUrl.split(',')[1];

      const foodData = await recognizeFood(base64Data);
      setResult(foodData);
    } catch (err) {
      alert("Failed to recognize food. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmLog = () => {
    if (result) {
      onFoodLogged({
        id: Date.now().toString(),
        name: result.name || 'Unknown Food',
        calories: result.calories || 0,
        protein: result.protein || 0,
        carbs: result.carbs || 0,
        fat: result.fat || 0,
        ingredients: result.ingredients || [],
        timestamp: Date.now(),
        imageUrl: previewUrl || undefined
      });
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col ${previewUrl ? 'bg-slate-950' : 'bg-white'}`}>
      {/* Header - Fixed at top */}
      <div className={`p-6 flex justify-between items-center relative z-20 shrink-0 ${previewUrl ? 'text-white' : 'text-slate-900'}`}>
        <button onClick={onCancel} className={`w-12 h-12 flex items-center justify-center rounded-2xl active:scale-90 transition-all ${previewUrl ? 'bg-white/10 backdrop-blur-xl' : 'bg-slate-100'}`}>
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        {previewUrl && <span className="font-black text-xs tracking-[0.3em] uppercase opacity-70">Analysis</span>}
        <div className="w-12"></div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative">
        <div className="min-h-full flex flex-col items-center justify-center p-6 pb-24">
          {!previewUrl ? (
            <div className="text-center max-w-xs space-y-8 my-auto animate-fadeIn">
              {/* Food Scanning Image/Illustration */}
              <div className="relative group mx-auto mb-10">
                <div className="absolute inset-0 bg-emerald-500/5 blur-[60px] rounded-full"></div>
                <div className="w-56 h-56 bg-slate-50 rounded-[3.5rem] flex items-center justify-center relative z-10 border border-slate-100 shadow-sm overflow-hidden group-hover:scale-105 transition-transform duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50"></div>
                  {/* Modern Scanning Iconography */}
                  <div className="relative">
                    <i className="fa-solid fa-bowl-rice text-6xl text-slate-200 mb-2"></i>
                    <div className="absolute -inset-4 border-2 border-emerald-500/20 rounded-2xl animate-[pulse_2s_infinite]"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40">
                      <i className="fa-solid fa-magnifying-glass text-white text-[10px]"></i>
                    </div>
                  </div>
                  {/* Simulated scan line */}
                  <div className="absolute inset-x-0 h-0.5 bg-emerald-500/30 blur-[1px] animate-[scan_3s_linear_infinite]"></div>
                </div>
              </div>

              <div className="space-y-6">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-slate-900 text-white font-black py-5 px-8 rounded-[2rem] shadow-2xl shadow-slate-900/10 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <i className="fa-solid fa-camera text-lg"></i>
                  OPEN CAMERA
                </button>
                <p className="text-slate-400 text-xs font-black uppercase tracking-[0.15em] opacity-80">
                  Track your Food calories
                </p>
              </div>
              
              <input type="file" ref={fileInputRef} onChange={handleCapture} accept="image/*" capture="environment" className="hidden" />
            </div>
          ) : (
            <div className="w-full space-y-6">
              <div className="relative aspect-square w-full rounded-[2.5rem] overflow-hidden bg-slate-900 border border-white/10 shadow-2xl">
                <img src={previewUrl} className="w-full h-full object-cover" />
                
                {/* Modern AI Scanning Overlay */}
                <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-[2px] bg-emerald-400/50 blur-[1px] animate-[scan_2s_ease-in-out_infinite]"></div>
                
                {isProcessing && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
                    <div className="relative w-20 h-20 mb-8">
                      <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
                    </div>
                    <h4 className="text-white text-xl font-bold mb-2">Analyzing Food</h4>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.2em] animate-pulse">Recognizing Tamil Cuisine</p>
                  </div>
                )}
              </div>

              {result && !isProcessing && (
                <div className="bg-white rounded-[2.5rem] p-8 space-y-6 animate-fadeIn shadow-2xl mb-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{result.name}</h3>
                      <p className="text-emerald-600 font-extrabold text-lg">{result.calories} Calories</p>
                    </div>
                    <div className="bg-slate-100 px-3 py-1.5 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-200 shrink-0">AI Detected</div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                     <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
                        <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Protein</p>
                        <p className="font-black text-slate-800 text-lg">{result.protein}g</p>
                     </div>
                     <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
                        <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Carbs</p>
                        <p className="font-black text-slate-800 text-lg">{result.carbs}g</p>
                     </div>
                     <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
                        <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Fat</p>
                        <p className="font-black text-slate-800 text-lg">{result.fat}g</p>
                     </div>
                  </div>

                  {result.ingredients && result.ingredients.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Key Ingredients</p>
                      <div className="flex flex-wrap gap-2">
                        {result.ingredients.map((ing, i) => (
                          <span key={i} className="text-[10px] font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 pt-2">
                     <button 
                      onClick={() => { setPreviewUrl(null); setResult(null); }}
                      className="flex-1 py-4 rounded-2xl border-2 border-slate-100 text-slate-400 font-black uppercase text-[11px] tracking-widest active:bg-slate-50 transition-all"
                     >
                       Redo
                     </button>
                     <button 
                      onClick={confirmLog}
                      className="flex-[2] py-4 rounded-2xl bg-slate-900 text-white font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
                     >
                       Add to Log
                     </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { top: 10%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Scanner;
