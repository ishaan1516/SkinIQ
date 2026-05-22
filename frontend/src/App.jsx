import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen font-sans">
        <main className="max-w-5xl mx-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            {/* We will build these next */}
            <Route path="/dashboard" element={<div className="text-2xl font-bold">Dashboard Coming Soon</div>} />
            <Route path="/upload" element={<div className="text-2xl font-bold">Upload Scan Coming Soon</div>} />
            <Route path="/analysis/:id" element={<div className="text-2xl font-bold">Analysis Results Coming Soon</div>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;