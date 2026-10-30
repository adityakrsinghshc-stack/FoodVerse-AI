import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { foodApi } from '../services/api';
import {
  History,
  Trash2,
  Download,
  Filter,
  Eye,
  ScanEye,
  Activity,
  Apple,
  ShieldCheck,
  CalendarDays,
  X,
  Printer,
  Sparkles,
} from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { TableRowSkeleton } from '../components/LoadingSkeleton';

export default function AnalysisHistory() {
  const { addToast } = useApp();

  const [historyItems, setHistoryItems] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeModalItem, setActiveModalItem] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [selectedType]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const typeParam = selectedType === 'all' ? null : selectedType;
      const data = await foodApi.getHistory(typeParam, 50);
      setHistoryItems(data.items || []);
    } catch (err) {
      addToast('Error loading history records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this analysis record?')) return;
    try {
      await foodApi.deleteHistoryItem(id);
      setHistoryItems((prev) => prev.filter((item) => item.id !== id));
      addToast('Record deleted.', 'info');
      if (activeModalItem?.id === id) setActiveModalItem(null);
    } catch (err) {
      addToast('Failed to delete history record.', 'error');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all saved analysis records? This action cannot be undone.')) return;
    try {
      await foodApi.clearHistory();
      setHistoryItems([]);
      addToast('All history cleared.', 'info');
    } catch (err) {
      addToast('Failed to clear history.', 'error');
    }
  };

  const exportToCSV = () => {
    if (historyItems.length === 0) {
      addToast('No records to export.', 'info');
      return;
    }

    const headers = ['ID', 'Type', 'Title', 'Confidence', 'Timestamp', 'Summary'];
    const rows = historyItems.map((item) => [
      item.id,
      item.analysis_type,
      `"${(item.title || '').replace(/"/g, '""')}"`,
      item.confidence || '',
      new Date(item.created_at).toISOString(),
      `"${(item.summary || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `foodverse_analysis_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('History exported to CSV.', 'success');
  };

  const getIcon = (type) => {
    switch (type) {
      case 'food_recognition':
        return <ScanEye className="w-4 h-4 text-forest-700" />;
      case 'nutrition':
        return <Activity className="w-4 h-4 text-emerald-600" />;
      case 'freshness':
        return <Apple className="w-4 h-4 text-lime-600" />;
      case 'hygiene':
        return <ShieldCheck className="w-4 h-4 text-amber-600" />;
      case 'meal_plan':
        return <CalendarDays className="w-4 h-4 text-purple-600" />;
      default:
        return <History className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-xs font-semibold">
          <History className="w-3.5 h-3.5" />
          <span>Local Audit Trail & Diagnostics</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Analysis History
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
          Inspect past food classifications, calibrated nutritional reports, produce freshness ratings, and kitchen hygiene audits.
        </p>
      </div>

      {/* Filter and Export Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-soft flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Type Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'All Audits' },
            { id: 'food_recognition', label: 'Food Recognition' },
            { id: 'nutrition', label: 'Nutrition' },
            { id: 'freshness', label: 'Freshness' },
            { id: 'hygiene', label: 'Hygiene' },
            { id: 'meal_plan', label: 'Meal Plans' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setSelectedType(btn.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                selectedType === btn.id
                  ? 'bg-forest-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={exportToCSV}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleClearAll}
            className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* History Table Card */}
      <Card title={`Logged Records (${historyItems.length})`} icon={History}>
        {loading ? (
          <div className="space-y-2">
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
          </div>
        ) : historyItems.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs space-y-1">
            <p className="font-semibold text-slate-600">No records found for this filter.</p>
            <p className="text-[11px]">Run a food recognition, nutrition lookup, or freshness test to view entries here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {historyItems.map((item) => (
              <div
                key={item.id}
                className="py-3.5 px-2 flex items-center justify-between hover:bg-slate-50/80 rounded-xl transition-colors text-xs"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-forest-50 flex items-center justify-center shrink-0">
                    {getIcon(item.analysis_type)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-800 text-sm truncate">{item.title}</div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {item.summary || 'Completed successfully'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(item.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 ml-4">
                  {item.confidence && (
                    <Badge variant="forest" size="sm">
                      {item.confidence}%
                    </Badge>
                  )}
                  <button
                    onClick={() => setActiveModalItem(item)}
                    className="p-2 rounded-xl text-slate-500 hover:text-forest-800 hover:bg-slate-100 transition-colors"
                    title="View Inspection Report"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Detail Inspection Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Badge variant="forest">{activeModalItem.analysis_type.toUpperCase()}</Badge>
                  <span className="text-xs text-slate-400">
                    {new Date(activeModalItem.created_at).toLocaleString()}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{activeModalItem.title}</h3>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-2xl bg-forest-50/60 border border-forest-100 text-xs text-forest-900 space-y-1">
              <span className="font-bold block">Summary Findings:</span>
              <p className="leading-relaxed">{activeModalItem.summary}</p>
            </div>

            {/* JSON Data Preview */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-700 block">Inspection Metadata Payload:</span>
              <pre className="p-4 rounded-2xl bg-slate-900 text-lime-300 overflow-x-auto text-[11px] font-mono leading-relaxed max-h-64">
                {JSON.stringify(activeModalItem.data, null, 2)}
              </pre>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Record</span>
              </button>
              <button
                onClick={() => setActiveModalItem(null)}
                className="px-5 py-2 rounded-xl bg-forest-800 text-white font-semibold text-xs hover:bg-forest-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
