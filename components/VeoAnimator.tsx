
import React, { useState } from 'react';
import { Play, Loader2, Sparkles, Upload, FileVideo, AlertCircle } from 'lucide-react';
import { generateVeoVideo } from '../services/geminiService';

const VeoAnimator: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image) return;

    // Check if user has selected API key (Veo requirement)
    if (!(window as any).aistudio?.hasSelectedApiKey()) {
      await (window as any).aistudio?.openSelectKey();
      // Proceed assuming success as per guidelines (mitigating race condition)
    }

    setLoading(true);
    setError(null);
    try {
      const url = await generateVeoVideo(image, prompt, aspectRatio);
      setVideoUrl(url);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Requested entity was not found")) {
        setError("API Key issue. Please re-select your key.");
        await (window as any).aistudio?.openSelectKey();
      } else {
        setError("Generation failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 bg-slate-900 text-white rounded-xl p-8 border-4 border-slate-800 shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles size={120} />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row gap-8">
        {/* Left: Controls */}
        <div className="flex-1 space-y-6">
          <div>
            <h2 className="text-3xl font-black mb-2 flex items-center gap-2 italic">
              VEO ANIMATOR <Sparkles className="text-yellow-400" />
            </h2>
            <p className="text-slate-400 text-sm">Upload a photo of your goal and watch Gemini Veo bring it to life.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">1. Upload Image</label>
              <div className="relative group h-48 rounded-lg border-2 border-dashed border-slate-700 bg-slate-800/50 hover:border-blue-500 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                {image ? (
                  <img src={image} className="w-full h-full object-cover" alt="Source" />
                ) : (
                  <>
                    <Upload className="text-slate-500 mb-2" />
                    <span className="text-slate-400 text-sm">Click to upload</span>
                  </>
                )}
                <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">2. Animation Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe how it should move... e.g., 'A vibrant animation showing this fitness goal being crushed with confetti'"
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none h-24"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Aspect Ratio</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setAspectRatio('16:9')}
                    className={`flex-1 py-2 px-4 rounded border-2 text-xs font-bold ${aspectRatio === '16:9' ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-slate-700 text-slate-500'}`}
                  >
                    16:9 Landscape
                  </button>
                  <button 
                    onClick={() => setAspectRatio('9:16')}
                    className={`flex-1 py-2 px-4 rounded border-2 text-xs font-bold ${aspectRatio === '9:16' ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-slate-700 text-slate-500'}`}
                  >
                    9:16 Portrait
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 text-red-400 p-3 rounded-lg flex items-center gap-2 text-sm">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button
              disabled={loading || !image}
              onClick={handleGenerate}
              className={`w-full py-4 rounded-lg font-black text-xl flex items-center justify-center gap-3 transition-all ${loading || !image ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'}`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" /> GENERATING...
                </>
              ) : (
                <>
                  <Play fill="white" size={20} /> ANIMATE SUCCESS
                </>
              )}
            </button>
            <p className="text-[10px] text-slate-500 italic text-center">Note: AI generation can take 1-2 minutes. Please stay on this page.</p>
          </div>
        </div>

        {/* Right: Output */}
        <div className="lg:w-1/2 flex flex-col items-center justify-center bg-black/40 rounded-xl border-2 border-slate-800 relative min-h-[400px]">
          {videoUrl ? (
            <video src={videoUrl} controls autoPlay loop className="w-full h-full rounded-lg object-contain" />
          ) : (
            <div className="text-center p-8">
              {loading ? (
                <div className="space-y-4">
                  <Loader2 size={48} className="animate-spin text-blue-500 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-xl font-bold">Painting with Light...</p>
                    <p className="text-slate-500 text-xs">Our AI is dreaming up your achievement video</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 opacity-30">
                  <FileVideo size={64} className="mx-auto" />
                  <p className="font-bold">YOUR VIDEO WILL APPEAR HERE</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-800 text-xs text-slate-500 text-center">
        Powered by <span className="text-slate-300 font-bold">Google Gemini Veo 3.1</span>. High-quality video generation requires a valid API key with billing enabled.
        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline ml-2 text-blue-400">View Billing Docs</a>
      </div>
    </div>
  );
};

export default VeoAnimator;
