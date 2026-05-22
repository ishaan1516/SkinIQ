import { supabase } from '../services/supabase';
import { Activity } from 'lucide-react';

export default function Login() {
    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`,
                },
            });
            if (error) throw error;
        } catch (error) {
            console.error('Error logging in:', error.message);
            alert('Failed to log in. Please try again.');
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-slate-900 p-3 rounded-xl shadow-lg">
                        <Activity className="w-8 h-8 text-white" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">SkinIQ</h1>
                <p className="text-slate-500 mb-8">Clinical-grade skin intelligence platform.</p>

                <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors font-medium py-3 px-4 rounded-xl"
                >
                    <img
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        alt="Google"
                        className="w-5 h-5"
                    />
                    Continue with Google
                </button>

                <p className="mt-6 text-xs text-slate-400">
                    Secure, HIPAA-compliant authentication via Supabase.
                </p>
            </div>
        </div>
    );
}