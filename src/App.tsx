import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';

const FullPageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-slate-50">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <FullPageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <FullPageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};


function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* PUBLIC ROUTES */}

        <Route 
            path="/register" 
            element={ <PublicRoute> <Register /> </PublicRoute> } 
        />
        <Route 
            path="/login" 
            element={ <PublicRoute> <Login /> </PublicRoute> } 
        />
        
        {/* PROTECTED ROUTES - 2. Swap the placeholder for the real <Dashboard /> */}
        <Route 
            path="/dashboard" 
            element={ <ProtectedRoute> <Dashboard /> </ProtectedRoute> } 
        />

        {/* DEFAULT FALLBACK */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;