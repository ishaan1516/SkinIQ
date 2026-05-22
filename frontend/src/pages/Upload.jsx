import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Upload, X, AlertCircle } from 'lucide-react';

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await api.analyzeImage(file);

      // Navigate to analysis page with the analysis_id
      navigate(`/analysis/${result.analysis_id}`, {
        state: {
          analysisId: result.analysis_id,
          baseScores: result.base_scores,
          questions: result.questions,
        },
      });
    } catch (err) {
      setError(err.message || 'Failed to analyze image. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-slate-600 hover:text-slate-900 mb-6 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Upload Skin Image</h1>
          <p className="text-slate-600">
            Upload a clear frontal photo of your face for analysis. Ensure good lighting and no filters.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Preview Section */}
        {preview && (
          <div className="mb-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="relative inline-block w-full">
              <img src={preview} alt="Preview" className="w-full h-auto rounded-lg max-h-96 object-cover" />
              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`bg-white rounded-2xl shadow-sm border-2 border-dashed p-12 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'
          }`}
        >
          <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-blue-500' : 'text-slate-400'}`} />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Drag and drop your image</h3>
          <p className="text-slate-600 mb-6">or click to select</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
            id="file-input"
            disabled={loading}
          />
          <label htmlFor="file-input" className="inline-block">
            <button
              onClick={() => document.getElementById('file-input').click()}
              className="px-8 py-3 bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
              type="button"
            >
              Select Image
            </button>
          </label>
          <p className="text-xs text-slate-500 mt-6">JPEG, PNG, or WebP • Max 10MB</p>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className="flex-1 px-8 py-3 bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Analyzing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Analyze Image
              </>
            )}
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            disabled={loading}
            className="px-8 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-blue-50 rounded-xl border border-blue-200 p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Tips for best results:</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>✓ Use natural lighting (avoid shadows)</li>
            <li>✓ Face the camera directly</li>
            <li>✓ Remove glasses and sunglasses</li>
            <li>✓ Avoid heavy makeup or filters</li>
            <li>✓ Ensure the entire face is visible</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
