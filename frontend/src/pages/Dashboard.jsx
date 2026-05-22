import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { api } from '../services/api';
import { Plus, BarChart3, LogOut } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) {
          navigate('/login');
          return;
        }
        setUser(currentUser);
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

  const getLatestScore = () => analyses && analyses.length > 0 ? analyses[0] : null;

  const getGradeColor = (grade) => {
    const colors = {
      'Excellent': 'text-green-600',
      'Good': 'text-blue-600',
      'Fair': 'text-yellow-600',
      'Needs Attention': 'text-orange-600',
      'Concerning': 'text-red-600',
    };
    return colors[grade] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const latestScore = getLatestScore();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-black">SkinIQ</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-black text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Welcome */}
        <div className="mb-16">
          <h2 className="text-5xl font-bold text-black mb-3">
            Welcome, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
          </h2>
          <p className="text-lg text-gray-600">Your personalized skin health dashboard</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Latest Scan */}
        {latestScore ? (
          <div className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-4">Latest Scan</h3>
              <div className="mb-8">
                <p className="text-6xl font-bold text-black mb-3">{latestScore.overall_score}</p>
                <p className={`text-lg font-semibold ${getGradeColor(latestScore.grade)}`}>
                  {latestScore.grade}
                </p>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="text-blue-500 hover:text-blue-600 font-medium text-sm"
              >
                View detailed analysis →
              </button>
            </div>
            <div>
              <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-4">Summary</h3>
              <p className="text-gray-700 leading-relaxed mb-8">
                {latestScore.clinical_summary}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Hydration</p>
                  <p className="text-2xl font-bold text-black">{latestScore.hydration_score}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Acne</p>
                  <p className="text-2xl font-bold text-black">{latestScore.acne_score}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-16 py-12">
            <p className="text-gray-600 text-lg">No scans yet. Start your first analysis.</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mb-16 py-20 border-t border-b border-gray-200">
          <div className="max-w-2xl">
            <h3 className="text-4xl font-bold text-black mb-6">
              Ready for a skin check?
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              Upload a photo to get a clinical-grade analysis across 8 skin parameters.
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-500 text-white hover:bg-blue-600 font-medium rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Start New Scan
            </button>
          </div>
        </div>

        {/* Recent Scans */}
        {analyses && analyses.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-black mb-6">Recent Scans</h3>
            <div className="space-y-4">
              {analyses.slice(0, 5).map((analysis) => (
                <div key={analysis.id} className="flex justify-between items-center py-4 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors cursor-pointer"
                  onClick={() => navigate('/profile')}>
                  <div>
                    <p className="font-medium text-black">{analysis.overall_score}/100</p>
                    <p className="text-sm text-gray-500">
                      {new Date(analysis.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <span className={`text-sm font-medium ${getGradeColor(analysis.grade)}`}>
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
