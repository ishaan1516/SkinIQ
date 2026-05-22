import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await api.getHistory();
        setAnalyses(history || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

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

  // Prepare data for line chart
  const lineChartData = (analyses || [])
    .slice()
    .reverse()
    .map((analysis) => ({
      date: new Date(analysis.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: analysis.overall_score,
    }));

  // Prepare data for latest radar chart
  const latestAnalysis = analyses && analyses.length > 0 ? analyses[0] : null;
  const radarData = latestAnalysis ? [
    { parameter: 'Acne', value: latestAnalysis.acne_score, fullMark: 10 },
    { parameter: 'Scarring', value: latestAnalysis.scarring_score, fullMark: 10 },
    { parameter: 'Pigmentation', value: latestAnalysis.pigmentation_score, fullMark: 10 },
    { parameter: 'Open Pores', value: latestAnalysis.open_pores_score, fullMark: 10 },
    { parameter: 'Redness', value: latestAnalysis.redness_score, fullMark: 10 },
    { parameter: 'Inflammation', value: latestAnalysis.inflammation_score, fullMark: 10 },
    { parameter: 'Puffiness', value: latestAnalysis.puffiness_score, fullMark: 10 },
    { parameter: 'Hydration', value: latestAnalysis.hydration_score, fullMark: 10 },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-600">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Analysis History</h1>
          <p className="text-slate-600">Track your skin health over time</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {analyses && analyses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-600 mb-6">No analyses yet. Start with your first skin scan.</p>
            <button
              onClick={() => navigate('/upload')}
              className="px-8 py-3 bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-colors font-semibold"
            >
              Take First Scan
            </button>
          </div>
        ) : (
          <>
            {/* Score Trend Chart */}
            {lineChartData.length > 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Score Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#1e293b"
                      dot={{ fill: '#1e293b', r: 5 }}
                      activeDot={{ r: 7 }}
                      name="Overall Score"
                      isAnimationActive={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Latest Parameter Radar */}
            {radarData.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Latest Parameter Breakdown</h2>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="parameter" />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke="#1e293b"
                      fill="#1e293b"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Analysis List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">All Scans</h2>
              <div className="space-y-4">
                {analyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="p-6 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {/* Score Section */}
                      <div>
                        <p className="text-sm text-slate-600 mb-2">Overall Score</p>
                        <p className="text-3xl font-bold text-slate-900">{analysis.overall_score}</p>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getGradeColor(analysis.grade)}`}>
                          {analysis.grade}
                        </span>
                      </div>

                      {/* Date Section */}
                      <div>
                        <p className="text-sm text-slate-600 mb-2">Date</p>
                        <p className="text-lg font-semibold text-slate-900">
                          {new Date(analysis.created_at).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(analysis.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      {/* Top Parameters */}
                      <div>
                        <p className="text-sm text-slate-600 mb-2">Top Parameters</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-700">Hydration</span>
                            <span className="font-semibold text-slate-900">{analysis.hydration_score}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-700">Acne</span>
                            <span className="font-semibold text-slate-900">{analysis.acne_score}</span>
                          </div>
                        </div>
                      </div>

                      {/* Summary */}
                      <div>
                        <p className="text-sm text-slate-600 mb-2">Summary</p>
                        <p className="text-sm text-slate-700 line-clamp-3">
                          {analysis.clinical_summary}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
