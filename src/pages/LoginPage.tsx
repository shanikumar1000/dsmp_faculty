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
  const roleBadgeColor = role === 'faculty' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700';

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
        console.log(`New faculty profile created for ${authData.user.id}`);

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
        console.log(`User logged in as faculty`);
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
      console.log(`User logged in as ${profileData.role}`);

      onSignIn();
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-gray-200 bg-white bg-opacity-70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Faculty Performance System</h1>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
            <div className="space-y-2 text-center">
              <div className="flex justify-center mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleBadgeColor}`}>
                  {roleLabel}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Sign in to your account
              </h2>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSignIn}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter official email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:bg-blue-600 disabled:transform-none"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                Only authorized faculty and administrators may access this system.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
