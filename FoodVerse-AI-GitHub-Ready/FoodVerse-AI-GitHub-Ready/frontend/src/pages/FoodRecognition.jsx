import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { foodApi } from '../services/api';
import {
  UploadCloud,
  FileImage,
  X,
  ScanEye,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Activity,
  Layers,
  Palette,
  Sparkles,
} from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';

export default function FoodRecognition() {
  const navigate = useNavigate();
  const { addToast, setPendingFoodToAnalyze } = useApp();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      addToast('Please upload a valid image (JPG, PNG, or WEBP).', 'error');
      return;
    }

    // Validate size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      addToast('Image size exceeds 15MB limit.', 'error');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setErrorMsg(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setResult(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const data = await foodApi.recognizeFood(formData);
      setResult(data);
      addToast(`Identified '${data.primary_prediction.food_name}' successfully!`, 'success');
    } catch (err) {
      setErrorMsg(err.message || 'Image classification failed.');
      addToast(err.message || 'Analysis error occurred.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const transferToNutrition = (foodName) => {
    setPendingFoodToAnalyze({
      food_name: foodName,
      image_url: result?.image_url,
    });
    navigate('/nutrition');
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-xs font-semibold">
          <ScanEye className="w-3.5 h-3.5" />
          <span>Computer Vision Intelligence</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Food Recognition Module
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
          Upload meals, produce, or dishes. Our computer vision pipeline extracts dominant visual features, identifies food items, and estimates confidence levels.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload & Preview Column */}
        <div className="lg:col-span-6 space-y-4">
          <Card title="Upload Food Image" icon={UploadCloud}>
            {!previewUrl ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-3 ${
                  isDragging
                    ? 'border-lime-500 bg-lime-50/50'
                    : 'border-slate-300 hover:border-forest-400 bg-slate-50/50 hover:bg-white'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-forest-50 text-forest-700 flex items-center justify-center">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Click to browse or drag & drop image
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports JPG, PNG, WEBP (Max 15MB)
                  </p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  accept=".jpg,.jpeg,.png,.webp"
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 aspect-video flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Food Preview"
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={clearSelection}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition-colors shadow-sm"
                    title="Remove Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span className="truncate max-w-[200px] font-medium text-slate-700">
                    {selectedFile?.name}
                  </span>
                  <span>{((selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB</span>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="flex-1 py-3 px-4 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all disabled:opacity-50"
                  >
                    {analyzing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processing Food Vision...</span>
                      </>
                    ) : (
                      <>
                        <ScanEye className="w-4 h-4 text-lime-400" />
                        <span>Run Food Classifier</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={clearSelection}
                    disabled={analyzing}
                    className="py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
                  >
                    Replace
                  </button>
                </div>
              </div>
            )}
          </Card>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <span className="font-bold block">Recognition Error</span>
                <p className="mt-0.5 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-6 space-y-4">
          {result ? (
            <div className="space-y-4">
              {/* Primary Prediction Card */}
              <Card
                title="Classification Result"
                subtitle={`Model: ${result.model_name}`}
                icon={CheckCircle2}
                badge={
                  <Badge
                    variant={result.primary_prediction.confidence >= 70 ? 'emerald' : 'amber'}
                    size="sm"
                  >
                    {result.primary_prediction.confidence}% Confidence
                  </Badge>
                }
              >
                <div className="space-y-6">
                  {/* Food Name Display */}
                  <div className="space-y-1">
                    <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">
                      Primary Match
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      {result.primary_prediction.food_name}
                    </h3>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Badge variant="forest">{result.primary_prediction.category}</Badge>
                      <Badge variant="lime">
                        Typical: {result.primary_prediction.serving_description}
                      </Badge>
                    </div>
                  </div>

                  {/* Confidence Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>Model Confidence</span>
                      <span>{result.primary_prediction.confidence}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-forest-600 h-full rounded-full transition-all duration-700"
                        style={{ width: `${result.primary_prediction.confidence}%` }}
                      />
                    </div>
                  </div>

                  {/* Uncertainty Banner if applicable */}
                  {result.is_uncertain && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-2.5">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                      <div className="leading-relaxed">
                        <span className="font-bold">Uncertain Prediction:</span>{' '}
                        {result.uncertainty_message}
                      </div>
                    </div>
                  )}

                  {/* Health & Nutritional Notes */}
                  {result.primary_prediction.notes && (
                    <div className="p-3.5 rounded-xl bg-cream-100 border border-cream-200 text-slate-700 text-xs leading-relaxed">
                      <span className="font-bold text-forest-900 block mb-1">
                        Nutritional Profile Note:
                      </span>
                      {result.primary_prediction.notes}
                    </div>
                  )}

                  {/* Action to Jump to Nutrition Analyzer */}
                  <button
                    onClick={() => transferToNutrition(result.primary_prediction.food_name)}
                    className="w-full py-3 px-4 rounded-xl bg-lime-500 hover:bg-lime-400 text-forest-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all"
                  >
                    <Activity className="w-4 h-4" />
                    <span>Analyze Full Nutrition for {result.primary_prediction.food_name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </Card>

              {/* Alternative Candidates */}
              {result.candidate_predictions && result.candidate_predictions.length > 0 && (
                <Card title="Alternative Candidate Matches" icon={Layers}>
                  <div className="space-y-2.5 text-xs">
                    {result.candidate_predictions.map((c, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 flex items-center justify-between transition-colors"
                      >
                        <div>
                          <span className="font-bold text-slate-800 text-sm block">
                            {c.food_name}
                          </span>
                          <span className="text-slate-400 text-[11px]">{c.category}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-semibold text-slate-600">{c.confidence}%</span>
                          <button
                            onClick={() => transferToNutrition(c.food_name)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-forest-100 text-forest-800 font-semibold text-[11px] transition-colors"
                          >
                            Analyze
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[300px] rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center">
                <ScanEye className="w-6 h-6" />
              </div>
              <div className="max-w-xs">
                <p className="font-semibold text-slate-700 text-sm">Awaiting Image Input</p>
                <p className="text-xs text-slate-400 mt-1">
                  Upload an image on the left to see instant classification, candidate rankings, and nutrient links.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
