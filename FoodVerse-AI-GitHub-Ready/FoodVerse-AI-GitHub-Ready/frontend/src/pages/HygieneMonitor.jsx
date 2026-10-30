import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { foodApi } from '../services/api';
import {
  ShieldCheck,
  Video,
  UploadCloud,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  ShieldAlert,
  ArrowRight,
  Sliders,
  Check,
} from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';

export default function HygieneMonitor() {
  const { addToast } = useApp();

  const [selectedFile, setSelectedFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState(null);
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);

  const fileInputRef = useRef(null);

  const handleVideoSelect = (file) => {
    if (!file) return;

    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (!validTypes.includes(file.type)) {
      addToast('Please upload a valid kitchen video (MP4, WebM, MOV).', 'error');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      addToast('Video size exceeds 50MB limit.', 'error');
      return;
    }

    setSelectedFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
    setReport(null);
    setUploadProgress(0);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoPreviewUrl(null);
    setReport(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    setUploadProgress(10);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const data = await foodApi.analyzeHygiene(formData, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 90) / progressEvent.total);
        setUploadProgress(percent);
      });
      setUploadProgress(100);
      setReport(data);
      addToast(`Video audited: Score ${data.overall_hygiene_score}/100`, 'success');
    } catch (err) {
      addToast(err.message || 'Video hygiene audit failed.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const selectedObservation =
    report?.frame_observations && report.frame_observations[activeFrameIndex]
      ? report.frame_observations[activeFrameIndex]
      : null;

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Computer Vision Hygiene & Sanitation Audit</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Restaurant & Kitchen Hygiene Monitor
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
          Upload short kitchen video clips to audit observable food-handling indicators: head coverings, nitrile gloves, workstation clutter, and cross-contamination markers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Column */}
        <div className="lg:col-span-5 space-y-4">
          <Card title="Upload Kitchen Clip" icon={Video}>
            {!videoPreviewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-forest-400 rounded-2xl p-8 text-center cursor-pointer bg-slate-50/50 hover:bg-white transition-colors flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Select Short Kitchen Video</p>
                  <p className="text-[11px] text-slate-400 mt-1">MP4, WebM, MOV (Max 45s, 50MB)</p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleVideoSelect(e.target.files[0])}
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-black aspect-video flex items-center justify-center">
                  <video
                    src={videoPreviewUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={clearSelection}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition-colors z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span className="truncate max-w-[200px] font-medium text-slate-700">
                    {selectedFile?.name}
                  </span>
                  <span>{((selectedFile?.size || 0) / (1024 * 1024)).toFixed(1)} MB</span>
                </div>

                {/* Progress Bar when analyzing */}
                {analyzing && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold">
                      <span>Extracting Keyframes via OpenCV...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-forest-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="w-full py-3 px-4 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  {analyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Auditing Video Frames...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-lime-400" />
                      <span>Audit Kitchen Hygiene</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </Card>

          {/* Model Notice */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
            <span className="font-bold text-slate-800 flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-forest-700" />
              <span>Observable Indicators Mode</span>
            </span>
            <p className="text-[11px] leading-relaxed">
              Video is sampled at ~1.5s intervals. Facial contour boundaries check for hair restraints, lower quadrant HSV segmentation tracks disposable gloves, and edge variance measures countertop clutter.
            </p>
          </div>
        </div>

        {/* Audit Results Column */}
        <div className="lg:col-span-7 space-y-4">
          {report ? (
            <div className="space-y-4">
              {/* Overall Score Banner */}
              <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-forest-900 text-white rounded-3xl p-6 shadow-card flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-forest-300 uppercase tracking-wider block">
                    Composite Hygiene Score
                  </span>
                  <div className="flex items-baseline space-x-2 mt-0.5">
                    <span className="text-4xl font-black text-lime-400">
                      {report.overall_hygiene_score}
                    </span>
                    <span className="text-xs text-forest-300 font-medium">/ 100</span>
                  </div>
                  <p className="text-xs text-forest-200 mt-1 max-w-sm">
                    {report.compliance_summary}
                  </p>
                </div>

                <div className="text-right">
                  <Badge
                    variant={
                      report.overall_hygiene_score >= 80
                        ? 'emerald'
                        : report.overall_hygiene_score >= 60
                        ? 'amber'
                        : 'rose'
                    }
                    size="lg"
                  >
                    {report.risk_level}
                  </Badge>
                  <span className="text-[11px] text-forest-300 block mt-2">
                    {report.frames_analyzed} keyframes audited ({report.duration_sec}s)
                  </span>
                </div>
              </div>

              {/* Three Core Pillars Compliance */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-center space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">
                    Hair Covering
                  </span>
                  <span className="text-lg font-bold text-forest-800">
                    {report.hair_covering_compliance_pct}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">Cap / Net Adherence</span>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-center space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">
                    Glove Protection
                  </span>
                  <span className="text-lg font-bold text-forest-800">
                    {report.glove_compliance_pct}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">Contact Safety</span>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-center space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">
                    Counter Cleanliness
                  </span>
                  <span className="text-lg font-bold text-forest-800">
                    {report.surface_cleanliness_pct}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">Surface Clarity</span>
                </div>
              </div>

              {/* Interactive Keyframe Evidence Viewer */}
              {report.frame_observations && report.frame_observations.length > 0 && (
                <Card
                  title="Evidence Timeline & Keyframes"
                  subtitle={`Frame ${activeFrameIndex + 1} of ${report.frame_observations.length}`}
                  icon={Clock}
                >
                  <div className="space-y-4">
                    {/* Thumbnail Selector Strip */}
                    <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
                      {report.frame_observations.map((frame, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveFrameIndex(idx)}
                          className={`relative shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                            activeFrameIndex === idx
                              ? 'border-forest-700 ring-2 ring-lime-400'
                              : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                          }`}
                        >
                          {frame.thumbnail_base64 && (
                            <img
                              src={frame.thumbnail_base64}
                              alt={`Frame ${idx}`}
                              className="w-16 h-12 object-cover"
                            />
                          )}
                          <span className="absolute bottom-0.5 right-1 text-[9px] font-bold text-white bg-black/70 px-1 rounded">
                            {frame.timestamp_sec}s
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Selected Frame Detail Card */}
                    {selectedObservation && (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">
                            Frame Timestamp: {selectedObservation.timestamp_sec}s
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            Certainty: {Math.round(selectedObservation.confidence * 100)}%
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                          <div className="p-2 rounded-xl bg-white border border-slate-100">
                            <span className="text-slate-400 block text-[10px]">Head Covering:</span>
                            <span className="font-semibold text-slate-800">
                              {selectedObservation.hair_covering_status}
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-white border border-slate-100">
                            <span className="text-slate-400 block text-[10px]">Gloves:</span>
                            <span className="font-semibold text-slate-800">
                              {selectedObservation.glove_status}
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-white border border-slate-100">
                            <span className="text-slate-400 block text-[10px]">Workstation:</span>
                            <span className="font-semibold text-slate-800">
                              {selectedObservation.cleanliness_indicator}
                            </span>
                          </div>
                        </div>

                        {selectedObservation.concerns.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-amber-800 font-bold block text-[11px]">
                              Identified Observations:
                            </span>
                            <ul className="list-disc pl-4 text-slate-600 text-[11px] space-y-0.5">
                              {selectedObservation.concerns.map((c, i) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Recommended Corrective Actions */}
              {report.corrective_actions && report.corrective_actions.length > 0 && (
                <Card title="Recommended Corrective Sanitation Actions" icon={CheckCircle2}>
                  <div className="space-y-2.5 text-xs">
                    {report.corrective_actions.map((act, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 flex items-start space-x-3 transition-colors"
                      >
                        <Badge
                          variant={act.urgency === 'High' ? 'rose' : 'amber'}
                          size="sm"
                          className="shrink-0 mt-0.5"
                        >
                          {act.urgency} Urgency
                        </Badge>
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 block">{act.area}</span>
                          <p className="text-slate-600 leading-relaxed text-[11px]">
                            {act.recommendation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Mandatory Regulatory Disclaimer Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start space-x-2.5 leading-relaxed">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-900">
                  <span className="font-bold">Compliance Boundary:</span> {report.disclaimer} {report.uncertainty_statement}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
              <ShieldCheck className="w-10 h-10 text-slate-300" />
              <div>
                <p className="font-semibold text-slate-700 text-sm">Awaiting Kitchen Video</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Upload a kitchen clip on the left to extract keyframes, inspect glove and hairnet compliance, and receive actionable corrective recommendations.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
