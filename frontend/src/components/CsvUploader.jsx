import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { predictCsvBatch } from '../api/client';

export default function CsvUploader({ onBatchResults }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = await predictCsvBatch(file);
      onBatchResults(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process CSV file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2.5 bg-cyan-50 border border-cyan-200 rounded-xl text-cyan-700">
          <Upload className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Batch Prediction CSV Upload</h3>
          <p className="text-xs text-slate-500">Upload a CSV containing 22 voice feature columns for multi-patient batch inference.</p>
        </div>
      </div>

      <div className="border-2 border-dashed border-slate-300 hover:border-cyan-500 rounded-xl p-6 text-center transition bg-slate-50">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="csv-upload-input"
        />
        <label htmlFor="csv-upload-input" className="cursor-pointer flex flex-col items-center">
          <FileText className="w-8 h-8 text-slate-400 mb-2" />
          <span className="text-xs font-semibold text-slate-800">
            {file ? file.name : 'Click to select CSV file'}
          </span>
          <span className="text-[11px] text-slate-500 mt-1">Requires MDVP:Fo, jitter, shimmer, HNR, RPDE, spread, PPE columns</span>
        </label>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {file && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleUpload}
            disabled={loading}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing Batch...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Run Batch Diagnosis</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
