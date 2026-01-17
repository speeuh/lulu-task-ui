import React, { useEffect, useState } from 'react';
import { TaskLog } from '../types';
import * as api from '../services/api';
import Pagination from '../components/Pagination';
import { CheckCircle, Calendar, Star, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import './History.css';

const ITEMS_PER_PAGE = 10;

const TaskHistory: React.FC = () => {
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const history = await api.getTaskHistory();
      setLogs(history);
    } catch (error) {
      console.error('Failed to load task history:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPoints = logs.reduce((sum, log) => sum + log.pointsEarned, 0);

  // Pagination
  const totalPages = Math.ceil(logs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedLogs = logs.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
      <div className="history-page">
        <div className="history-header">
          <div>
            <h1>📜 Meu Histórico de Tarefas</h1>
            <p>Veja todas as tarefas que você completou</p>
          </div>
          <div className="total-earned">
            <TrendingUp size={24} />
            <div>
              <span className="label">Total ganho</span>
              <span className="value">{totalPoints} pontos</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Carregando histórico...</div>
        ) : logs.length === 0 ? (
          <div className="empty-history">
            <CheckCircle size={64} />
            <h3>Nenhuma tarefa completada ainda</h3>
            <p>Complete suas primeiras tarefas para vê-las aqui!</p>
          </div>
        ) : (
          <div className="history-container">
            <div className="history-stats">
              <div className="stat-card">
                <CheckCircle size={28} />
                <div>
                  <h3>{logs.length}</h3>
                  <p>Tarefas Completadas</p>
                </div>
              </div>
              <div className="stat-card">
                <Star size={28} />
                <div>
                  <h3>{totalPoints}</h3>
                  <p>Pontos Ganhos</p>
                </div>
              </div>
            </div>

            <div className="history-list">
              {paginatedLogs.map((log) => (
                <div key={log.id} className="history-item">
                  <div className="item-icon earned">
                    <CheckCircle size={20} />
                  </div>
                  <div className="item-content">
                    <h4>{log.taskTitle}</h4>
                    <div className="item-meta">
                      <span className="date">
                        <Calendar size={14} />
                        {format(new Date(log.completedAt), "dd/MM/yyyy")}
                      </span>
                      <span className="time">
                        {format(new Date(log.completedAt), 'HH:mm')}
                      </span>
                    </div>
                  </div>
                  <div className="item-points earned">
                    <Star size={16} />
                    +{log.pointsEarned}
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
  );
};

export default TaskHistory;

