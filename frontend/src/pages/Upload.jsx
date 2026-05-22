import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { X } from 'lucide-react';

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }
    setFile(selectedFile);
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(['dragenter', 'dragover'].includes(e.type));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleInputChange = (e) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
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
      navigate(`/analysis/${result.analysis_id}`, {
        state: {
          analysisId: result.analysis_id,
          baseScores: result.base_scores,
          questions: result.questions,
        },
      });
    } catch (err) {
      setError(err.message || 'Failed to analyze image');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-500 hover:text-blue-600 text-sm font-medium mb-6"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold text-black">Upload Photo</h1>
          <p className="text-gray-600 mt-2">Upload a clear frontal photo of your face</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Upload Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="mb-6">
              <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-black mb-2">Drag and drop</h3>
            <p className="text-gray-600 mb-6">or click to select</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
              id="file-input"
              disabled={loading}
            />
            <label htmlFor="file-input">
              <button
                onClick={() => document.getElementById('file-input').click()}
                className="px-6 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                disabled={loading}
                type="button"
              >
                Select Photo
              </button>
            </label>
            <p className="text-xs text-gray-500 mt-4">JPEG, PNG, or WebP up to 10MB</p>
          </div>

          {/* Preview */}
          {preview && (
            <div className="relative">
              <img src={preview} alt="Preview" className="w-full h-auto rounded-lg object-cover" />
              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="mt-12 pt-12 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-black mb-4">Tips for best results</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
            <li className="flex gap-3">
              <span className="text-blue-500">✓</span>
              <span>Good natural lighting, no harsh shadows</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-500">✓</span>
              <span>Face directly toward camera</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-500">✓</span>
              <span>Remove glasses and sunglasses</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-500">✓</span>
              <span>Minimal makeup or filters</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className="flex-1 px-6 py-3 bg-blue-500 text-white hover:bg-blue-600 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Analyze Photo'}
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            disabled={loading}
            className="px-6 py-3 bg-gray-100 text-black hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
