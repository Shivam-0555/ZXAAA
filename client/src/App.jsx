import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[var(--color-zxaaa-bg)] text-[var(--color-zxaaa-text)] flex">
        {/* Sidebar placeholder */}
        <aside className="w-64 border-r border-[var(--color-zxaaa-border)] hidden md:block glass-panel p-4">
          <div className="text-2xl font-bold mb-8 gradient-text">ZXAAA</div>
          <nav className="space-y-4">
            <div className="text-white bg-[var(--color-zxaaa-purple)] p-2 rounded-lg font-medium">Home</div>
            <div className="text-[var(--color-zxaaa-muted)] p-2">Explore</div>
            <div className="text-[var(--color-zxaaa-muted)] p-2">Sell Product</div>
          </nav>
        </aside>

        {/* Main Content placeholder */}
        <main className="flex-1 flex flex-col">
          {/* Topbar */}
          <header className="h-16 border-b border-[var(--color-zxaaa-border)] flex items-center justify-between px-6 glass-panel">
            <div className="text-[var(--color-zxaaa-muted)]">Vadodara, Gujarat</div>
            <div className="flex-1 max-w-md mx-8 hidden sm:block">
              <input 
                type="text" 
                placeholder="Search for items, brands or categories..." 
                className="w-full bg-[var(--color-zxaaa-card)] border border-[var(--color-zxaaa-border)] rounded-full px-4 py-2 text-white focus:outline-none focus:border-[var(--color-zxaaa-purple)]"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-[var(--color-zxaaa-purple)] flex items-center justify-center">S</div>
            </div>
          </header>

          <div className="flex-1 p-6 overflow-y-auto">
            <Routes>
              <Route path="/" element={
                <div>
                  <h1 className="text-4xl font-bold mb-4">Buy. Sell. Swap.<br/>Anything. Anywhere.</h1>
                  <p className="text-[var(--color-zxaaa-muted)] mb-8">Give your items a new life and find what you need nearby.</p>
                </div>
              } />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
