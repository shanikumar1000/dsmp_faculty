interface WelcomePageProps {
  onLoginClick: (role: 'faculty' | 'admin') => void;
}

export default function WelcomePage({ onLoginClick }: WelcomePageProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full text-center space-y-12">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
              Faculty Performance Management System
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Track, evaluate, and manage faculty achievements in one unified platform.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center max-w-2xl mx-auto">
            <button
              onClick={() => onLoginClick('faculty')}
              className="w-full sm:w-64 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out"
            >
              Login as Faculty
            </button>

            <button
              onClick={() => onLoginClick('admin')}
              className="w-full sm:w-64 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out"
            >
              Login as Admin
            </button>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center">
        <p className="text-gray-500 text-sm">
          Powered by Smart Education Initiative
        </p>
      </footer>
    </div>
  );
}
