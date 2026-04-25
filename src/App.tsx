/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Camera, Type, Utensils, AlertTriangle, CheckCircle, Info, UploadCloud, Loader2, XCircle, Shield, Activity, ArrowRight, ChevronDown, Leaf, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PROFILES, analyzeFood, AnalysisResult } from './lib/analyzer';

type ProfileKey = keyof typeof PROFILES;
type InputMode = 'photo' | 'text' | 'dish';

const DISH_PRESETS = [
  "Pork Adobo", "Beef Sinigang", "Kinilaw (Raw Fish Ceviche)", 
  "Balut (Developing Duck Egg)", "Dinuguan (Pork Blood Stew)",
  "Taho (Silken Tofu)", "Burong Isda (Fermented Fish)", 
  "Sisig with Raw Egg", "Isaw (Grilled Intestines)", "Chicken Inasal"
];

export default function App() {
  const [profile, setProfile] = useState<ProfileKey | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('photo');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [textInput, setTextInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<HTMLElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const scrollToScanner = () => {
    scannerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetAnalysis = () => {
    setResult(null);
    setError(null);
    setTextInput("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleProfileSelect = (key: ProfileKey) => {
    setProfile(key);
    setIsDropdownOpen(false);
    resetAnalysis();
  };

  const executeAnalysis = async (contents: any[]) => {
    if (!profile) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    try {
      const contentsWithPrompt = [
         { text: "Analyze this food for safety." },
         ...contents
      ];
      const res = await analyzeFood(profile, contentsWithPrompt);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const resultStr = reader.result as string;
      setImagePreview(resultStr);
      const base64Data = resultStr.split(',')[1];
      
      executeAnalysis([{
        inlineData: {
          mimeType: file.type,
          data: base64Data
        }
      }]);
    };
    reader.readAsDataURL(file);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    executeAnalysis([{ text: `Ingredients/Food: ${textInput}` }]);
  };

  const handleDishSelect = (dish: string) => {
    executeAnalysis([{ text: `Filipino Dish: ${dish}` }]);
  };

  return (
    <div className="font-sans selection:bg-blue-200">
      
      {/* Hero Landing Page Section */}
      <section className="relative min-h-screen flex flex-col px-4 sm:px-6 lg:px-8 bg-blue-50 overflow-hidden">
        {/* Background Aesthetic */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-blue-200 z-0"></div>
        {/* Texture/Image Overlay */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1543362906-acfc16c67564?q=80&w=2000&auto=format&fit=crop')] opacity-[0.03] bg-cover bg-center mix-blend-multiply"></div>
        
        {/* Header */}
        <header className="relative z-10 py-6 flex justify-between items-center max-w-7xl w-full mx-auto">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-black tracking-tight text-blue-950">ImmunoGuard<span className="text-blue-500">.</span></span>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex items-center justify-center text-center max-w-5xl mx-auto flex-col space-y-8 pb-20">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="inline-flex items-center space-x-2 border border-blue-200 bg-white/60 backdrop-blur-md px-5 py-2.5 rounded-full text-xs font-bold text-blue-800 uppercase tracking-widest shadow-sm"
           >
             <Heart className="h-4 w-4 text-blue-500" />
             <span>Inspired by real journeys. Built for the Philippines.</span>
           </motion.div>
           
           <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="text-5xl md:text-7xl lg:text-[5.5rem] font-serif text-blue-950 tracking-tight leading-[1.05]"
           >
             A seat at the table,<br/>
             <span className="text-blue-600 font-light">for immunocompromised people.</span>
           </motion.h1>
           
           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="text-lg md:text-xl text-slate-600 max-w-3xl font-medium leading-relaxed"
           >
             For immunocompromised individuals, every meal is a risk assessment. 
             We replace fear with knowledge, using AI to evaluate Filipino food, ingredients, and dishes instantly.
           </motion.p>

           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
           >
             <button 
               onClick={scrollToScanner}
               className="group mt-6 inline-flex items-center space-x-3 bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-all active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]"
             >
               <span>Begin Analysis</span>
               <div className="bg-white/20 text-white rounded-full p-1.5 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                 <ArrowRight className="h-4 w-4" />
               </div>
             </button>
           </motion.div>
        </div>
      </section>

      {/* Scanner Engine Section */}
      <section ref={scannerRef} className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-blue-100 text-slate-800 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col">
          
          <div className="mb-12 text-center max-w-2xl mx-auto">
             <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
               <Activity className="h-3 w-3" />
               <span>Fast Analysis</span>
             </div>
             <h2 className="text-4xl lg:text-5xl font-black text-blue-950 mb-4 tracking-tight">Risk Classifier Engine.</h2>
             <p className="text-slate-500 font-medium text-lg leading-relaxed">Select your health profile and submit the food details below for clinical-grade safety analysis.</p>
          </div>

          <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
            
            {/* Left Column: Controls */}
            <div className="lg:col-span-5 space-y-6">


            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
              
              {/* Step 1: Profile Selection */}
              <div className="mb-8 relative" style={{ zIndex: 50 }}>
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">1. Select Health Profile</label>
                <div className="relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-slate-50 border-2 border-slate-100 hover:border-blue-200 text-left px-5 py-4 rounded-2xl flex items-center justify-between transition-all"
                  >
                    <div>
                      {profile ? (
                        <span className="font-bold text-blue-950 text-lg">{PROFILES[profile].label}</span>
                      ) : (
                        <span className="font-semibold text-slate-400 text-lg">Choose condition...</span>
                      )}
                    </div>
                    <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl shadow-blue-900/10 border border-slate-100 overflow-hidden"
                      >
                        {(Object.entries(PROFILES) as [ProfileKey, typeof PROFILES[ProfileKey]][]).map(([key, prof]) => (
                          <button
                            key={key}
                            onClick={() => handleProfileSelect(key)}
                            className="w-full text-left px-5 py-4 hover:bg-blue-50 border-b border-slate-50 last:border-0 transition-colors flex justify-between items-center group"
                          >
                            <span className="font-semibold text-slate-700 group-hover:text-blue-950">{prof.label}</span>
                            {profile === key && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Step 2: Input Method */}
              <div className={!profile ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">2. Submit Food Info</label>
                
                {/* Tabs */}
                <div className="flex p-1 bg-slate-100 rounded-2xl mb-6">
                  <button 
                    onClick={() => setInputMode('photo')} 
                    className={`flex-1 py-3 text-sm font-bold rounded-xl flex items-center justify-center space-x-2 transition-all ${inputMode === 'photo' ? 'bg-white shadow text-blue-900' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Camera className="h-4 w-4" /> <span>Photo</span>
                  </button>
                  <button 
                    onClick={() => setInputMode('text')} 
                    className={`flex-1 py-3 text-sm font-bold rounded-xl flex items-center justify-center space-x-2 transition-all ${inputMode === 'text' ? 'bg-white shadow text-blue-900' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Type className="h-4 w-4" /> <span>Text</span>
                  </button>
                  <button 
                    onClick={() => setInputMode('dish')} 
                    className={`flex-1 py-3 text-sm font-bold rounded-xl flex items-center justify-center space-x-2 transition-all ${inputMode === 'dish' ? 'bg-white shadow text-blue-900' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Utensils className="h-4 w-4" /> <span>Dish</span>
                  </button>
                </div>

                {/* Content */}
                <div>
                  {inputMode === 'photo' && (
                    <div className="space-y-4">
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-10 rounded-2xl bg-blue-50/50 border-2 border-dashed border-blue-200 hover:bg-blue-50 hover:border-blue-400 transition-all flex flex-col items-center justify-center space-y-3 group"
                      >
                        <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm group-hover:scale-110 transition-transform">
                          <UploadCloud className="h-6 w-6" />
                        </div>
                        <span className="font-bold text-blue-900">Upload or Capture Image</span>
                        <span className="text-xs text-blue-400 font-medium">JPEG, PNG up to 10MB</span>
                      </button>
                    </div>
                  )}

                  {inputMode === 'text' && (
                    <form onSubmit={handleTextSubmit} className="space-y-4">
                      <textarea 
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        className="w-full h-32 p-4 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none resize-none bg-slate-50 text-slate-800 font-medium placeholder:text-slate-400 transition-all font-sans"
                        placeholder="e.g. Pork face, onions, chicken liver, calamansi, raw egg on top"
                      ></textarea>
                      <button 
                        type="submit" 
                        disabled={!textInput.trim() || !profile}
                        className="w-full bg-blue-950 hover:bg-blue-900 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center space-x-2"
                      >
                        <span>Analyze Ingredients</span>
                        <ArrowRight className="h-5 w-5" />
                      </button>
                    </form>
                  )}

                  {inputMode === 'dish' && (
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {DISH_PRESETS.map((dish) => (
                        <button
                          key={dish}
                          onClick={() => handleDishSelect(dish)}
                          className="px-4 py-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-sm font-bold text-slate-600 rounded-xl border border-slate-200 transition-all text-left"
                        >
                          {dish}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: Results / Status */}
          <div className="lg:col-span-7 h-full flex flex-col">
             <AnimatePresence mode="wait">
               
               {/* Idle State */}
               {!isAnalyzing && !result && !error && (
                 <motion.div 
                   key="idle"
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="flex-1 flex flex-col items-center justify-center py-20 lg:py-0"
                 >
                   <div className="relative w-64 h-64 mb-8">
                     {/* Decorative abstract elements similar to the requested design */}
                     <div className="absolute inset-0 bg-blue-200/40 rounded-full blur-3xl filter"></div>
                     <div className="absolute inset-4 bg-gradient-to-tr from-blue-100 to-white rounded-[3rem] rotate-12 shadow-xl opacity-70"></div>
                     <div className="absolute inset-4 bg-white/60 backdrop-blur-md border border-white shadow-xl rounded-[3rem] -rotate-6 flex items-center justify-center overflow-hidden">
                        <Shield className="h-24 w-24 text-blue-200 opacity-50" />
                     </div>
                     {/* Float badge */}
                     <div className="absolute top-8 -right-4 bg-white rounded-2xl shadow-lg border border-slate-50 px-4 py-3 flex items-center space-x-3">
                        <div className="h-8 w-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                        <div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Analysis</p>
                           <p className="text-sm font-black text-blue-950">AI Powered</p>
                        </div>
                     </div>
                   </div>
                   <h3 className="text-2xl font-black text-blue-950 mb-2">Ready to Scan</h3>
                   <p className="text-slate-500 font-medium text-center max-w-sm">Select your profile and provide food details on the left to receive a comprehensive safety analysis.</p>
                 </motion.div>
               )}

               {/* Loading State */}
               {isAnalyzing && (
                 <motion.div 
                   key="loading"
                   initial={{ opacity: 0 }} 
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="flex-1 flex flex-col items-center justify-center py-20"
                 >
                   <div className="relative mb-8">
                     <div className="absolute inset-0 bg-blue-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                     <div className="h-24 w-24 bg-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-blue-900/5 relative border border-white">
                       <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                     </div>
                   </div>
                   <h3 className="text-2xl font-black text-blue-950 mb-2">Analyzing Risks...</h3>
                   <p className="text-slate-500 font-medium">Evaluating against clinical protocols for {profile ? PROFILES[profile].label : ''}...</p>
                 </motion.div>
               )}

               {/* Error State */}
               {error && !isAnalyzing && (
                 <motion.div 
                   key="error"
                   initial={{ opacity: 0, y: 20 }} 
                   animate={{ opacity: 1, y: 0 }} 
                   className="w-full bg-red-50/80 backdrop-blur-md p-8 rounded-[2rem] border border-red-100 shadow-xl shadow-red-900/5"
                 >
                   <div className="flex items-start space-x-4">
                     <div className="h-12 w-12 bg-red-100 text-red-600 rounded-2xl flex flex-shrink-0 items-center justify-center">
                       <AlertTriangle className="h-6 w-6" />
                     </div>
                     <div>
                       <h3 className="text-xl font-black text-red-900 mb-2">Analysis Interrupted</h3>
                       <p className="text-red-700 font-medium mb-6 leading-relaxed">{error}</p>
                       <button onClick={resetAnalysis} className="text-sm font-bold text-red-800 bg-white border border-red-200 px-6 py-3 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all shadow-sm">
                         Dismiss & Try Again
                       </button>
                     </div>
                   </div>
                 </motion.div>
               )}

               {/* Result State */}
               {result && !isAnalyzing && (
                 <motion.div 
                   key="result"
                   initial={{ opacity: 0, x: 50 }} 
                   animate={{ opacity: 1, x: 0 }}
                   className="w-full bg-white/70 backdrop-blur-xl border border-white rounded-[2rem] p-6 lg:p-10 shadow-xl shadow-blue-900/5 overflow-y-auto max-h-[85vh] custom-scrollbar"
                 >
                   {/* Verdict Header */}
                   <div className={`p-8 rounded-[1.5rem] border mb-8 flex flex-col md:flex-row md:items-center md:space-x-8 ${
                     result.risk_level === 'ALLOWED' ? 'bg-emerald-50 border-emerald-100 text-emerald-950' :
                     result.risk_level === 'CAUTION' ? 'bg-amber-50 border-amber-100 text-amber-950' :
                     'bg-red-50 border-red-100 text-red-950'
                   }`}>
                     <div className="mb-4 md:mb-0 flex-shrink-0">
                       {result.risk_level === 'ALLOWED' && (
                         <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                            <CheckCircle className="h-10 w-10" />
                         </div>
                       )}
                       {result.risk_level === 'CAUTION' && (
                         <div className="h-20 w-20 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-600/20">
                            <AlertTriangle className="h-10 w-10" />
                         </div>
                       )}
                       {result.risk_level === 'AVOID' && (
                         <div className="h-20 w-20 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/20">
                            <XCircle className="h-10 w-10" />
                         </div>
                       )}
                     </div>
                     <div>
                       <div className="flex items-center space-x-3 mb-2">
                         <h2 className="text-3xl font-black tracking-tight">{result.risk_level}</h2>
                         {profile && (
                           <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-white/50 rounded filter mix-blend-multiply opacity-80">
                             For {PROFILES[profile].label}
                           </span>
                         )}
                       </div>
                       <p className={`text-base font-medium opacity-80 leading-relaxed max-w-xl`}>{result.summary}</p>
                     </div>
                   </div>

                   {/* Split Content: Image (if any) & Details */}
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     
                     {inputMode === 'photo' && imagePreview ? (
                        <div className="lg:col-span-2 mb-2">
                           <div className="h-48 w-full rounded-[1.5rem] overflow-hidden relative shadow-md border border-slate-100">
                             <img src={imagePreview} className="w-full h-full object-cover" alt="Scanned item" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                                <span className="text-white text-xs font-bold tracking-wider uppercase flex items-center space-x-2">
                                  <Camera className="h-3 w-3" /> <span>Analyzed Source</span>
                                </span>
                             </div>
                           </div>
                        </div>
                     ) : null}

                     {/* Flagged Items Column (if any) otherwise full width */}
                     <div className={result.flagged_items.length > 0 ? "lg:col-span-1" : "hidden"}>
                       {result.flagged_items.length > 0 && (
                         <div className="space-y-4">
                           <div className="flex items-center space-x-2 text-slate-400 mb-2">
                             <AlertTriangle className="h-4 w-4" />
                             <h3 className="text-sm font-bold uppercase tracking-widest">Flagged Ingredients</h3>
                           </div>
                           <div className="space-y-3">
                             {result.flagged_items.map((item, idx) => (
                               <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                                 <div className="flex items-start justify-between mb-2">
                                   <span className="font-bold text-slate-800">{item.ingredient}</span>
                                   <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider ${
                                     item.severity === 'HIGH' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                                   }`}>
                                     {item.severity}
                                   </span>
                                 </div>
                                 <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.reason}</p>
                               </div>
                             ))}
                           </div>
                         </div>
                       )}
                     </div>

                     {/* Safe Alternatives Column */}
                     <div className={result.flagged_items.length > 0 ? "lg:col-span-1" : "lg:col-span-2"}>
                       {result.safe_alternatives.length > 0 && (
                         <div className="space-y-4">
                           <div className="flex items-center space-x-2 text-slate-400 mb-2">
                             <Leaf className="h-4 w-4" />
                             <h3 className="text-sm font-bold uppercase tracking-widest">Safe Alternatives</h3>
                           </div>
                           <ul className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-3">
                             {result.safe_alternatives.map((alt, idx) => (
                               <li key={idx} className="text-sm font-bold text-blue-900 flex items-start space-x-3">
                                 <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-blue-400 flex-shrink-0"></div>
                                 <span className="leading-snug">{alt}</span>
                               </li>
                             ))}
                           </ul>
                         </div>
                       )}

                       {/* Disclaimer */}
                       <div className="mt-8 bg-blue-50/50 rounded-2xl p-5 border border-blue-100 flex items-start space-x-3">
                         <Info className="h-5 w-5 text-blue-400 flex-shrink-0" />
                         <p className="text-xs text-blue-900/60 font-medium leading-relaxed">
                           <strong className="text-blue-900">Disclaimer:</strong> {result.disclaimer}
                         </p>
                       </div>
                     </div>

                   </div>

                 </motion.div>
               )}
             </AnimatePresence>
          </div>
          
        </main>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap');
        
        .font-serif {
          font-family: 'Playfair Display', serif;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
      `}} />
    </div>
  );
}


