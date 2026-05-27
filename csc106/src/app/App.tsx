import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';

type View = 'login' | 'register' | 'admin' | 'user';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('login');
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const role = session.user.user_metadata?.role || 'user';
        setUser(session.user);
        setUserRole(role);
        setCurrentView(role === 'admin' ? 'admin' : 'user');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRole('');
        setCurrentView('login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const role = session.user.user_metadata?.role || 'user';
        setUser(session.user);
        setUserRole(role);
        setCurrentView(role === 'admin' ? 'admin' : 'user');
      }
    } catch (error) {
      console.log('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (user: any, role: string) => {
    setUser(user);
    setUserRole(role);
    setCurrentView(role === 'admin' ? 'admin' : 'user');
  };

  const handleRegisterSuccess = (user: any, role: string) => {
    setUser(user);
    setUserRole(role);
    setCurrentView(role === 'admin' ? 'admin' : 'user');
  };

  const handleLogout = () => {
    setUser(null);
    setUserRole('');
    setCurrentView('login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading ART5MATA...</p>
        </div>
      </div>
    );
  }

  if (currentView === 'login') {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onNavigateToRegister={() => setCurrentView('register')}
      />
    );
  }

  if (currentView === 'register') {
    return (
      <Register
        onRegisterSuccess={handleRegisterSuccess}
        onNavigateToLogin={() => setCurrentView('login')}
      />
    );
  }

  if (currentView === 'admin' && userRole === 'admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  if (currentView === 'user' && userRole === 'user') {
    return <UserDashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-600">Unauthorized access</p>
    </div>
  );
}