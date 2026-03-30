import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';

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

const DashboardPlaceholder = () => {
    const { user, logout } = useAuth();
    return (
        <div className="flex min-h-screen flex-col items-center justify-center space-y-4 bg-slate-50">
            <h1 className="text-4xl font-bold text-slate-800">Welcome, {user?.name}!</h1>
            <p className="text-slate-500">You have successfully breached the mainframe.</p>
            <button 
                onClick={logout} 
                className="rounded-lg bg-red-500 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 shadow-md"
            >
                Secure Logout
            </button>
        </div>
    );
};


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
            path="/login" 
            element={ 
                <PublicRoute> 
                    <Login /> 
                </PublicRoute> 
            } 
        />

        <Route 
            path="/dashboard" 
            element={ 
                <ProtectedRoute> 
                    <DashboardPlaceholder /> 
                </ProtectedRoute> 
            } 
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;