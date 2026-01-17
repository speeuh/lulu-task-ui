import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Task } from '../types';
import * as api from '../services/api';
import { CheckCircle, Clock, Star } from 'lucide-react';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingTasks();
    
    // Listen for task completion events
    const handleTaskCompleted = () => {
      loadPendingTasks();
      refreshUser(); // Refresh user points
    };
    
    window.addEventListener('taskCompleted', handleTaskCompleted);
    
    return () => {
      window.removeEventListener('taskCompleted', handleTaskCompleted);
    };
  }, []);

  // Reload when navigating back to dashboard
  useEffect(() => {
    if (location.pathname === '/') {
      loadPendingTasks();
      refreshUser();
    }
  }, [location.pathname]);

  const loadPendingTasks = async () => {
    try {
      const tasks = await api.getPendingTasks();
      setPendingCount(tasks.length); // Total count
      setPendingTasks(tasks.slice(0, 3)); // Show only first 3 for preview
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="dashboard">
        <div className="welcome-section">
          <h1>Olá, {user?.fullName}! 👋</h1>
          <p>Bem-vinda ao seu sistema de tarefas e recompensas, meu amor! 💙</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card points">
            <div className="stat-icon">
              <Star size={28} />
            </div>
            <div className="stat-content">
              <h3>{user?.points}</h3>
              <p>Pontos Totais</p>
            </div>
          </div>

          <div className="stat-card tasks">
            <div className="stat-icon">
              <Clock size={28} />
            </div>
            <div className="stat-content">
              <h3>{pendingCount}</h3>
              <p>Tarefas Pendentes</p>
            </div>
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <h2>📝 Tarefas Pendentes</h2>
            <button onClick={() => navigate('/tasks')} className="view-all-button">
              Ver todas
            </button>
          </div>

          {loading ? (
            <div className="loading">Carregando...</div>
          ) : pendingTasks.length === 0 ? (
            <div className="empty-state">
              <CheckCircle size={48} />
              <p>Nenhuma tarefa pendente no momento!</p>
            </div>
          ) : (
            <div className="tasks-preview">
              {pendingTasks.map((task) => (
                <div key={task.id} className="task-preview-card">
                  <div className="task-info">
                    <h3>{task.title}</h3>
                    {task.description && <p>{task.description}</p>}
                  </div>
                  <div className="task-points">
                    <Star size={16} />
                    {task.points}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="quick-actions">
          <button onClick={() => navigate('/tasks')} className="action-card">
            <Clock size={32} />
            <h3>Minhas Tarefas</h3>
            <p>Veja e complete suas tarefas</p>
          </button>

          <button onClick={() => navigate('/shop')} className="action-card">
            <Star size={32} />
            <h3>Lojinha</h3>
            <p>Troque seus pontos por recompensas</p>
          </button>

          <button onClick={() => navigate('/history')} className="action-card">
            <CheckCircle size={32} />
            <h3>Meu Histórico</h3>
            <p>Veja suas conquistas</p>
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

