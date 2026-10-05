import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Camera, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  Droplet, 
  ShieldCheck, 
  Leaf, 
  HelpCircle,
  FileImage
} from 'lucide-react';

export interface PlantDiagnosis {
  plantName: string;
  diseaseName: string;
  isHealthy: boolean;
  confidence: string;
  severity: 'None' | 'Mild' | 'Moderate' | 'Severe';
  symptoms: string[];
  cause: string;
  treatment: string;
  wateringAdvice: string;
  prevention: string;
}

interface PlantDiseaseScannerProps {
  onDiagnosisComplete?: (diagnosis: PlantDiagnosis, updatedTelemetry?: any) => void;
}

export const PlantDiseaseScanner: React.FC<PlantDiseaseScannerProps> = ({ 
  onDiagnosisComplete 
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<PlantDiagnosis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ready-to-test sample crop leaves (Vector SVG data URLs for instant 1-click test)
  const sampleLeaves = [
    {
      name: 'Tomato Blight',
      desc: 'Blight spots on leaf',
      color: '#b45309',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="#0f172a"/><path d="M150 40 C70 80 50 180 150 260 C250 180 230 80 150 40 Z" fill="#22c55e"/><circle cx="120" cy="110" r="22" fill="#78350f" stroke="#fbbf24" stroke-width="3"/><circle cx="170" cy="160" r="28" fill="#78350f" stroke="#fbbf24" stroke-width="4"/><circle cx="110" cy="180" r="16" fill="#78350f"/><line x1="150" y1="40" x2="150" y2="260" stroke="#16a34a" stroke-width="4"/><text x="150" y="285" fill="#f8fafc" font-size="14" text-anchor="middle" font-family="sans-serif">Sample: Tomato Leaf with Spots</text></svg>`,
      hint: 'Tomato plant leaf with brown concentric circular spots and yellowing halo'
    },
    {
      name: 'Healthy Crop',
      desc: 'Clean lush green leaf',
      color: '#10b981',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="#0f172a"/><path d="M150 30 C60 70 40 180 150 270 C260 180 240 70 150 30 Z" fill="#22c55e"/><line x1="150" y1="30" x2="150" y2="270" stroke="#86efac" stroke-width="5"/><path d="M150 90 Q110 80 80 100" stroke="#86efac" stroke-width="3" fill="none"/><path d="M150 150 Q190 140 220 160" stroke="#86efac" stroke-width="3" fill="none"/><text x="150" y="285" fill="#86efac" font-size="14" text-anchor="middle" font-family="sans-serif">Sample: Healthy Green Leaf</text></svg>`,
      hint: 'Crisp green healthy agricultural crop leaf with zero disease or lesions'
    },
    {
      name: 'Powdery Mildew',
      desc: 'White fungal powder',
      color: '#94a3b8',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="#0f172a"/><path d="M150 40 C70 80 50 180 150 260 C250 180 230 80 150 40 Z" fill="#15803d"/><ellipse cx="140" cy="120" rx="35" ry="25" fill="#e2e8f0" opacity="0.85"/><ellipse cx="160" cy="170" rx="40" ry="25" fill="#e2e8f0" opacity="0.85"/><ellipse cx="120" cy="190" rx="25" ry="18" fill="#e2e8f0" opacity="0.8"/><line x1="150" y1="40" x2="150" y2="260" stroke="#166534" stroke-width="4"/><text x="150" y="285" fill="#cbd5e1" font-size="14" text-anchor="middle" font-family="sans-serif">Sample: White Powdery Mildew</text></svg>`,
      hint: 'Cucumber / Squash leaf with white powdery fungal growth on surface'
    }
  ];

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || 'image/jpeg');
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      analyzeImage(base64, file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  // Analyze image via server Gemini endpoint
  const analyzeImage = async (base64Data: string, type: string, cropHint?: string) => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    setDiagnosis(null);

    try {
      const res = await fetch('/api/crop/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: type,
          cropHint: cropHint || 'Agricultural crop disease scan',
        }),
      });

      if (!res.ok) {
        throw new Error(`Diagnosis server error (${res.status})`);
      }

      const data = await res.json();
      if (data.diagnosis) {
        setDiagnosis(data.diagnosis);
        if (onDiagnosisComplete) {
          onDiagnosisComplete(data.diagnosis, data.currentTelemetry);
        }
      } else {
        throw new Error('No diagnosis received');
      }
    } catch (err: any) {
      console.warn('Diagnosis error:', err);
      setErrorMsg(err.message || 'Could not analyze image. Please try another photo.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadSample = (sample: typeof sampleLeaves[0]) => {
    const dataUrl = `data:image/svg+xml;base64,${btoa(sample.svg)}`;
    setImagePreview(dataUrl);
    setMimeType('image/svg+xml');
    analyzeImage(dataUrl, 'image/svg+xml', sample.hint);
  };

  const resetScanner = () => {
    setImagePreview(null);
    setDiagnosis(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Severe':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500/20 text-rose-400 border border-rose-500/40">SEVERE</span>;
      case 'Moderate':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">MODERATE</span>;
      case 'Mild':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">MILD</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">HEALTHY</span>;
    }
  };

  return (
    <div className="glow-card rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:border-emerald-500/40 h-full relative">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <span>Plant Disease Doctor</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono-numbers">
                  AI Vision
                </span>
              </h2>
              <span className="text-[11px] text-slate-400">
                Upload leaf photo to diagnose disease & get cure
              </span>
            </div>
          </div>

          {imagePreview && (
            <button
              onClick={resetScanner}
              className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
              title="Upload another leaf"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Main View Area */}
      {!imagePreview ? (
        /* 1. UPLOAD VIEW */
        <div className="flex-1 flex flex-col justify-between py-2">
          {/* Drag & Drop Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex-1 min-h-[140px] border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 rounded-xl bg-black/40 hover:bg-emerald-950/20 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-white block">
              Click to Upload Plant / Leaf Photo
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              Supports Camera capture, JPG, PNG, WEBP
            </span>
          </div>

          {/* Quick 1-Click Samples for Farmers / Testing */}
          <div className="mt-3">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              Or test with sample diseased leaves:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {sampleLeaves.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => loadSample(sample)}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-900/60 text-left transition-all text-xs"
                >
                  <div className="font-bold text-slate-200 truncate">{sample.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{sample.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* 2. DIAGNOSIS RESULTS VIEW */
        <div className="flex-1 flex flex-col justify-between py-1 overflow-y-auto max-h-[310px] pr-1 space-y-3">
          {/* Top: Image Thumbnail + Quick Status */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/40 border border-emerald-950">
            <div className="w-16 h-16 rounded-lg overflow-hidden border border-emerald-500/30 flex-shrink-0 bg-slate-900">
              <img 
                src={imagePreview} 
                alt="Plant Leaf Scan" 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              {isAnalyzing ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>AI Pathologist Examining Leaf...</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    Checking for fungal blight, pests, and nutrient stress
                  </span>
                </div>
              ) : diagnosis ? (
                <div>
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-xs font-bold text-white truncate">
                      {diagnosis.plantName || 'Plant'}
                    </span>
                    {getSeverityBadge(diagnosis.severity)}
                  </div>
                  <div className="text-sm font-extrabold text-emerald-300 truncate">
                    {diagnosis.diseaseName}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono-numbers">
                    Confidence: {diagnosis.confidence}
                  </span>
                </div>
              ) : errorMsg ? (
                <div className="text-xs text-rose-400">{errorMsg}</div>
              ) : null}
            </div>
          </div>

          {/* Actionable Treatment Card for the Farmer */}
          {diagnosis && !isAnalyzing && (
            <div className="space-y-2.5 animate-in fade-in">
              {/* Treatment Remedy Box */}
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                <span className="text-[11px] font-bold text-emerald-300 block mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Recommended Cure & Treatment:
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {diagnosis.treatment}
                </p>
              </div>

              {/* Watering & Pump Guidance */}
              <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-2">
                <Droplet className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-bold text-cyan-300 block">
                    Irrigation & Pump Advice:
                  </span>
                  <span className="text-xs text-slate-300">
                    {diagnosis.wateringAdvice}
                  </span>
                </div>
              </div>

              {/* Observed Symptoms */}
              {diagnosis.symptoms && diagnosis.symptoms.length > 0 && (
                <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-950 text-xs">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Observed Symptoms:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                    {diagnosis.symptoms.map((s, idx) => (
                      <li key={idx} className="truncate">{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Upload Another Button */}
              <button
                onClick={resetScanner}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Upload Another Leaf Photo</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
