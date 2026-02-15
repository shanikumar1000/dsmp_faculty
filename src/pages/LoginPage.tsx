import { useState } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginPageProps {
  role: 'faculty' | 'admin';
  onBack: () => void;
  onSignIn: () => void;
}

export default function LoginPage({ role, onBack, onSignIn }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const roleLabel = role === 'faculty' ? 'Faculty' : 'Admin';

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('No user returned after login');
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profileData && role === 'faculty') {
        const { error: insertError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          full_name: 'Faculty User',
          email: authData.user.email || email,
          department: 'Not Set',
          designation: 'Not Set',
          employee_id: authData.user.id.substring(0, 8).toUpperCase(),
          google_scholar_id: '',
          years_of_experience: 0,
          specialization: '',
          contact_number: '',
          role: 'faculty',
        });
        if (insertError) throw insertError;
        localStorage.setItem('userRole', 'faculty');
        onSignIn();
        return;
      }

      if (!profileData) {
        throw new Error('No profile found for user');
      }

      if (profileData.role !== role) {
        await supabase.auth.signOut();
        throw new Error(`This account is not registered as ${role}`);
      }

      localStorage.setItem('userRole', profileData.role);
      onSignIn();
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-sm font-semibold text-primary-900 tracking-tight">FPMS</h1>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-primary-900 text-sm font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-[400px]">
          <div className="bg-white rounded-card border border-slate-200 shadow-card p-8">
            <div className="mb-6">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                {roleLabel} access
              </p>
              <h2 className="text-xl font-semibold text-primary-900 tracking-tight">
                Sign in
              </h2>
            </div>

            {error && (
              <div className="mb-6 p-3.5 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSignIn}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.edu"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors placeholder:text-slate-400"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors placeholder:text-slate-400"
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-3 bg-primary-900 text-white text-sm font-semibold rounded-button hover:bg-primary-800 active:bg-primary-950 transition-colors disabled:opacity-60 disabled:pointer-events-none"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-500 text-center">
              Authorized faculty and administrators only.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
