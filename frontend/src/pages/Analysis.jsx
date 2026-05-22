import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';

export default function AnalysisPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [stage, setStage] = useState('questions'); // 'questions' or 'results'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [analysisId] = useState(location.state?.analysisId || id);
  const [baseScores] = useState(location.state?.baseScores || {});
  const [questions] = useState(location.state?.questions || []);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [results, setResults] = useState(null);

  // If no state data, try to redirect
  useEffect(() => {
    if (!analysisId || Object.keys(baseScores).length === 0) {
      navigate('/upload');
    }
  }, [analysisId, baseScores, navigate]);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswer = (value) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value,
    });

    if (!isLastQuestion) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.submitQA(analysisId, baseScores, answers);
      setResults(response.data);
      setStage('results');
    } catch (err) {
      setError(err.message || 'Failed to submit answers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    const colors = {
      'Excellent': 'bg-green-100 text-green-800',
      'Good': 'bg-blue-100 text-blue-800',
      'Fair': 'bg-yellow-100 text-yellow-800',
      'Needs Attention': 'bg-orange-100 text-orange-800',
      'Concerning': 'bg-red-100 text-red-800',
    };
    return colors[grade] || 'bg-slate-100 text-slate-800';
  };

  const getParameterColor = (score) => {
    if (score >= 8) return 'bg-green-50 border-green-200';
    if (score >= 6) return 'bg-blue-50 border-blue-200';
    if (score >= 4) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  // Q&A Stage
  if (stage === 'questions') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-slate-600 hover:text-slate-900 mb-6 flex items-center gap-2"
            >
              ← Cancel
            </button>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Context Questions</h1>
            <p className="text-slate-600">
              Answer a few questions about your lifestyle to refine your skin score.
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mb-8 bg-white rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-slate-700">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-sm text-slate-600">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-slate-900 h-2 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          {currentQuestion && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-8">
                {currentQuestion.text}
              </h2>

              <div className="space-y-4">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      answers[currentQuestion.id] === option
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          answers[currentQuestion.id] === option
                            ? 'border-slate-900 bg-slate-900'
                            : 'border-slate-300'
                        }`}
                      >
                        {answers[currentQuestion.id] === option && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="font-medium text-slate-900">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            {currentQuestionIndex > 0 && (
              <button
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                className="px-8 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors font-medium"
              >
                Back
              </button>
            )}
            {!isLastQuestion && (
              <button
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                disabled={!answers[currentQuestion?.id]}
                className="flex-1 px-8 py-3 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
            {isLastQuestion && (
              <button
                onClick={handleSubmit}
                disabled={!answers[currentQuestion?.id] || loading}
                className="flex-1 px-8 py-3 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Generating Results...
                  </>
                ) : (
                  <>
                    Get Results
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Results Stage
  if (stage === 'results' && results) {
    const overall_score = results.overall_score || baseScores.overall_score;
    const grade = results.grade || baseScores.grade;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <h1 className="text-3xl font-bold text-slate-900">Your Results</h1>
            </div>
          </div>

          {/* Overall Score Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <p className="text-sm text-slate-600 mb-2">Overall Skin Health Score</p>
                <p className="text-6xl font-bold text-slate-900 mb-4">{overall_score}</p>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getGradeColor(grade)}`}>
                  {grade}
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-4">Clinical Summary</p>
                <p className="text-lg leading-relaxed text-slate-700">
                  {results.clinical_summary}
                </p>
              </div>
            </div>
          </div>

          {/* Parameter Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">8 Clinical Parameters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Acne', key: 'acne_score' },
                { name: 'Scarring', key: 'scarring_score' },
                { name: 'Pigmentation', key: 'pigmentation_score' },
                { name: 'Open Pores', key: 'open_pores_score' },
                { name: 'Redness', key: 'redness_score' },
                { name: 'Inflammation', key: 'inflammation_score' },
                { name: 'Puffiness', key: 'puffiness_score' },
                { name: 'Hydration', key: 'hydration_score' },
              ].map((param) => {
                const score = results[param.key] || baseScores[param.key] || 0;
                return (
                  <div
                    key={param.key}
                    className={`p-4 rounded-lg border ${getParameterColor(score)}`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-slate-900">{param.name}</span>
                      <span className="text-lg font-bold text-slate-900">{score}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-slate-900 h-2 rounded-full"
                        style={{ width: `${(score / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Medical Disclaimer */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 mb-8">
            <p className="text-xs text-blue-700 leading-relaxed">
              <strong>Medical Disclaimer:</strong> This assessment is generated by an AI wellness tool for informational purposes only.
              It is not a medical diagnosis and should not replace professional dermatological evaluation. Scores and recommendations
              are based on visual analysis and self-reported information. Individual results may vary based on image quality, lighting,
              and skin tone. If you have concerns about your skin health, please consult a qualified dermatologist.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 px-8 py-3 bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-colors font-semibold"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate('/upload')}
              className="flex-1 px-8 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors font-semibold"
            >
              New Scan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
