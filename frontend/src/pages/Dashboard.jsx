import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { api } from '../services/api';
import { Activity, Plus, BarChart3, LogOut } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) {
          navigate('/login');
          return;
        }
        setUser(currentUser);

        // Get user's analysis history
        const history = await api.getHistory();
        setAnalyses(history || []);
      } catch (err) {
        setError(err.message);
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const getLatestScore = () => {
    if (!analyses || analyses.length === 0) return null;
    return analyses[0];
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4 animate-spin" />
          <p className="text-slate-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const latestScore = getLatestScore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">SkinIQ</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
          </h2>
          <p className="text-slate-600">Your skin health dashboard</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Latest Score Card */}
        {latestScore ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-12">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Latest Scan</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <p className="text-sm text-slate-600 mb-2">Overall Score</p>
                <p className="text-5xl font-bold text-slate-900">{latestScore.overall_score}</p>
                <span className={`inline-block mt-3 px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(latestScore.grade)}`}>
                  {latestScore.grade}
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-4">Key Parameters</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-700">Hydration</span>
                    <span className="font-semibold text-slate-900">{latestScore.hydration_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-700">Acne</span>
                    <span className="font-semibold text-slate-900">{latestScore.acne_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-700">Redness</span>
                    <span className="font-semibold text-slate-900">{latestScore.redness_score}</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-4">Summary</p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {latestScore.clinical_summary}
                </p>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 px-6 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors font-medium"
              >
                <BarChart3 className="w-5 h-5" />
                View History
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-12 text-center">
            <p className="text-slate-600 mb-6">No scans yet. Start your first skin analysis.</p>
          </div>
        )}

        {/* New Scan CTA */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl shadow-lg p-12 text-center text-white">
          <Activity className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-3">Ready for a Skin Check?</h3>
          <p className="text-slate-300 mb-8">Upload a facial image to get a clinical-grade analysis across 8 skin parameters.</p>
          <button
            onClick={() => navigate('/upload')}
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-semibold"
          >
            <Plus className="w-5 h-5" />
            Start New Scan
          </button>
        </div>

        {/* Analysis History */}
        {analyses && analyses.length > 0 && (
          <div className="mt-12 bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Recent Scans</h3>
            <div className="space-y-4">
              {analyses.slice(0, 5).map((analysis) => (
                <div key={analysis.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                  <div>
                    <p className="font-medium text-slate-900">Score: {analysis.overall_score}</p>
                    <p className="text-sm text-slate-600">
                      {new Date(analysis.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(analysis.grade)}`}>
                    {analysis.grade}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
