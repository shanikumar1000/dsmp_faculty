interface WelcomePageProps {
  onLoginClick: (role: 'faculty' | 'admin') => void;
}

export default function WelcomePage({ onLoginClick }: WelcomePageProps) {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full">
          <div className="text-center space-y-10">
            <div className="space-y-4">
              <p className="text-sm font-medium tracking-wide text-primary-600 uppercase">
                Faculty Performance Management System
              </p>
              <h1 className="text-3xl sm:text-4xl font-semibold text-primary-900 tracking-tight leading-tight">
                Track, evaluate, and manage faculty achievements in one platform.
              </h1>
              <p className="text-base text-slate-600 max-w-lg mx-auto">
                Sign in with your role to access your dashboard, submit activities, and view reports.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center pt-4">
              <button
                onClick={() => onLoginClick('faculty')}
                className="flex-1 sm:flex-none sm:w-52 px-6 py-3.5 bg-primary-900 text-white text-sm font-semibold rounded-button shadow-card hover:bg-primary-800 active:bg-primary-950 transition-colors"
              >
                Faculty login
              </button>
              <button
                onClick={() => onLoginClick('admin')}
                className="flex-1 sm:flex-none sm:w-52 px-6 py-3.5 bg-white text-primary-800 text-sm font-semibold rounded-button border border-slate-200 shadow-card hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 transition-colors"
              >
                Admin login
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center border-t border-slate-200/80 bg-white/50">
        <p className="text-slate-500 text-xs font-medium">
          Smart Education Initiative
        </p>
      </footer>
    </div>
  );
}
