import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden animate-fade-in">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px] animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28 animate-slide-up">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl drop-shadow-lg">
                  <span className="block xl:inline">Master your day with</span>{' '}
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 xl:inline">TaskMaster</span>
                </h1>
                <p className="mt-3 text-base text-gray-400 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Stay organized, focused, and get more done. The simple, elegant way to manage your tasks and boost your productivity.
                </p>
                <div className="mt-8 sm:mt-10 sm:flex sm:justify-center lg:justify-start gap-4">
                  <div className="rounded-xl shadow-lg shadow-indigo-500/20">
                    <Link href="/signup" className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 md:text-lg transition-all duration-300 transform hover:-translate-y-1">
                      Get started
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0">
                    <Link href="/login" className="w-full flex items-center justify-center px-8 py-4 border border-white/10 text-base font-bold rounded-xl text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm md:text-lg transition-all duration-300 transform hover:-translate-y-1">
                      Log in
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        
        {/* Abstract shape illustration */}
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 flex items-center justify-center pointer-events-none opacity-60 lg:opacity-100">
           <div className="relative w-full h-96 lg:h-full overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-full blur-3xl animate-pulse-slow"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <svg className="w-96 h-96 text-white/5 animate-spin-slow" viewBox="0 0 100 100" fill="currentColor">
                  <path d="M50 0 L100 50 L50 100 L0 50 Z" />
                </svg>
              </div>
           </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-base text-indigo-400 font-bold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
              Everything you need to stay on track
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-400 lg:mx-auto">
              Focus on what matters most with our streamlined task management tools.
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="glass p-8 rounded-2xl hover:bg-white/5 transition-colors duration-300 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <dt>
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg shadow-indigo-500/30 mb-4">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-lg leading-6 font-bold text-white">Lightning Fast</p>
                </dt>
                <dd className="mt-2 text-base text-gray-400">
                  Built for speed so you can add and manage tasks without missing a beat.
                </dd>
              </div>

              <div className="glass p-8 rounded-2xl hover:bg-white/5 transition-colors duration-300 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <dt>
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-lg shadow-purple-500/30 mb-4">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-lg leading-6 font-bold text-white">Simple Statuses</p>
                </dt>
                <dd className="mt-2 text-base text-gray-400">
                  Easily track what's done and what's pending with clear visual cues.
                </dd>
              </div>

              <div className="glass p-8 rounded-2xl hover:bg-white/5 transition-colors duration-300 animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <dt>
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 mb-4">
                     <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                     </svg>
                  </div>
                  <p className="text-lg leading-6 font-bold text-white">Secure by Design</p>
                </dt>
                <dd className="mt-2 text-base text-gray-400">
                  Your data is protected with industry-standard authentication and security.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
