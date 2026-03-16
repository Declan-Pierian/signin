import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import NewRequest from './pages/NewRequest';
import RequestDetail from './pages/RequestDetail';

function PageTransition({ children }) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('enter');

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage('exit');
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('enter');
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location, displayLocation]);

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        transitionStage === 'enter'
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2'
      }`}
    >
      {children}
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <PageTransition>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/new" element={<NewRequest />} />
            <Route path="/request/:id" element={<RequestDetail />} />
          </Routes>
        </PageTransition>
      </main>
    </div>
  );
}