import React, { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, ListTodo, ShoppingBag, History, User, LogOut, Settings } from 'lucide-react';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  // Update page title dynamically
  useEffect(() => {
    document.title = `✨ Tarefas da ${user?.fullName || 'Lulu'}`;
  }, [user?.fullName]);

  // Helper function to get full image URL
  const getImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url; // Already absolute
    const apiUrl = import.meta.env.VITE_API_URL || '';
    if (!apiUrl) return url;
    
    // Remove /api prefix from url if it exists (backend returns /api/files/...)
    let cleanUrl = url.startsWith('/api/') ? url.substring(4) : url;
    // Ensure url starts with /
    cleanUrl = cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl;
    
    // Remove trailing /api from apiUrl if exists
    const cleanApiUrl = apiUrl.replace(/\/api\/?$/, '');
    
    return `${cleanApiUrl}${cleanUrl}`;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = isAdmin
    ? [
        { path: '/admin', icon: Settings, label: 'Admin' },
        { path: '/admin/tasks', icon: ListTodo, label: 'Tarefas' },
        { path: '/admin/shop', icon: ShoppingBag, label: 'Loja' },
      ]
    : [
        { path: '/', icon: Home, label: 'Início' },
        { path: '/tasks', icon: ListTodo, label: 'Tarefas' },
        { path: '/shop', icon: ShoppingBag, label: 'Lojinha' },
        { path: '/history', icon: History, label: 'Histórico' },
        { path: '/profile', icon: User, label: 'Perfil' },
      ];

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="app-title">✨ Tarefas da {user?.fullName || 'Lulu'}</h1>
          </div>
          <div className="header-right">
            <div className="user-info">
              {user?.profileImageUrl && (
                <img
                  src={getImageUrl(user.profileImageUrl)}
                  alt={user.fullName}
                  className="user-avatar"
                />
              )}
              <div className="user-details">
                <span className="user-name">{user?.fullName}</span>
                <span className="user-points">{user?.points} pontos</span>
              </div>
            </div>
            <button onClick={handleLogout} className="logout-button">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="main-container">
        <aside className="sidebar">
          <nav className="nav-menu">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;

