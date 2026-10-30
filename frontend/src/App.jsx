import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RouteLoadingFallback from './components/RouteLoadingFallback';
import ChunkErrorBoundary from './components/ChunkErrorBoundary';
import BundleInspectorModal from './components/BundleInspectorModal';
import EventArchitectureModal from './components/EventArchitectureModal';
import NotificationToast from './components/NotificationToast';
import AuthModal from './components/AuthModal';
import { AuthProvider } from './context/AuthContext';
import { lazyWithMinDelay } from './utils/lazyWithMinDelay';

// ============================================================================
// DYNAMIC IMPORTS VIA lazyWithMinDelay() - PRACTICAL 8 CORE CODE SPLITTING
// Enforces a minimum 300ms fallback duration to eliminate UI flicker (Supplementary Problem 2)
// ============================================================================
const HomePage = lazyWithMinDelay(() => import('./pages/HomePage'), 250);
const ProjectsPage = lazyWithMinDelay(() => import('./pages/ProjectsPage'), 250);
const ContactPage = lazyWithMinDelay(() => import('./pages/ContactPage'), 250);
const PerformancePage = lazyWithMinDelay(() => import('./pages/PerformancePage'), 250);
const AboutPage = lazyWithMinDelay(() => import('./pages/AboutPage'), 250);

function AppRoutes({ addToast, onOpenAuthModal, trackChunkLoaded }) {
  const location = useLocation();

  const getRouteLabel = (path) => {
    switch (path) {
      case '/projects': return 'Projects';
      case '/contact': return 'Contact';
      case '/performance': return 'Performance';
      case '/about': return 'About';
      default: return 'Home';
    }
  };

  useEffect(() => {
    trackChunkLoaded(location.pathname);
  }, [location.pathname]);

  return (
    <Suspense fallback={<RouteLoadingFallback routeName={getRouteLabel(location.pathname)} />}>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              addToast={addToast}
              onOpenAuthModal={onOpenAuthModal}
            />
          }
        />
        <Route
          path="/projects"
          element={
            <ProjectsPage
              addToast={addToast}
            />
          }
        />
        <Route
          path="/contact"
          element={
            <ContactPage
              addToast={addToast}
            />
          }
        />
        <Route
          path="/performance"
          element={
            <PerformancePage
              addToast={addToast}
            />
          }
        />
        <Route
          path="/about"
          element={
            <AboutPage />
          }
        />
      </Routes>
    </Suspense>
  );
}

function MainApp() {
  const [toasts, setToasts] = useState([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [loadedChunks, setLoadedChunks] = useState(['/']);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const trackChunkLoaded = (path) => {
    setLoadedChunks((prev) => {
      if (!prev.includes(path)) {
        return [...prev, path];
      }
      return prev;
    });
  };

  return (
    <div className="app-container">
      <Navbar
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenInspector={() => setIsInspectorOpen(true)}
        onOpenEventModal={() => setIsEventModalOpen(true)}
        loadedRoutesCount={loadedChunks.length}
      />

      <main className="main-content">
        <ChunkErrorBoundary>
          <AppRoutes
            addToast={addToast}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            trackChunkLoaded={trackChunkLoaded}
          />
        </ChunkErrorBoundary>
      </main>

      <EventArchitectureModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        addToast={addToast}
      />

      <BundleInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        loadedChunks={loadedChunks}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        addToast={addToast}
      />

      <NotificationToast toasts={toasts} onDismiss={removeToast} />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainApp />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
