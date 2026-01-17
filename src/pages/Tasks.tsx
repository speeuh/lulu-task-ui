import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Layout from '../components/Layout';
import { Task, TaskStatus, TaskRecurrence, TaskLog } from '../types';
import * as api from '../services/api';
import { CheckCircle, Clock, Star, Trophy, Repeat, ChevronLeft, ChevronRight } from 'lucide-react';
import './Tasks.css';

const Tasks: React.FC = () => {
  const { refreshUser } = useAuth();
  const toast = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'completed'>('pending');
  const [completingTaskId, setCompletingTaskId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    loadTasks();
    loadTaskLogs(); // Carrega logs sempre para contar corretamente
  }, []);

  useEffect(() => {
    if (filter === 'completed') {
      loadTaskLogs();
    }
  }, [filter]);

  const loadTasks = async () => {
    try {
      const allTasks = await api.getUserTasks();
      setTasks(allTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTaskLogs = async () => {
    try {
      const logs = await api.getTaskHistory();
      setTaskLogs(logs);
    } catch (error) {
      console.error('Failed to load task history:', error);
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    setCompletingTaskId(taskId);
    try {
      const completedTask = await api.completeTask(taskId);
      await loadTasks();
      await refreshUser();
      
      // Show success message with recurrence info
      let message = `✨ Tarefa completada! +${completedTask.points} pontos`;
      if (completedTask.recurrence !== TaskRecurrence.NONE) {
        const nextAvailable = getNextAvailableMessage(completedTask.recurrence);
        message += `\n🕐 ${nextAvailable}`;
      }
      toast.success(message);
      
      setTimeout(() => setCompletingTaskId(null), 1000);
    } catch (error: any) {
      console.error('Failed to complete task:', error);
      toast.error(error.response?.data?.message || 'Erro ao completar tarefa');
      setCompletingTaskId(null);
    }
  };

  // Filtra as tarefas (ordenação já vem do backend)
  const filteredTasks = filter === 'pending' 
    ? tasks.filter((task) => task.status === TaskStatus.PENDING)
    : [];

  const pendingCount = tasks.filter((t) => t.status === TaskStatus.PENDING).length;
  const completedCount = taskLogs.length; // Conta do histórico

  // Paginação
  const itemsToShow = filter === 'pending' ? filteredTasks : taskLogs;
  const totalPages = Math.ceil(itemsToShow.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = itemsToShow.slice(startIndex, endIndex);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const getRecurrenceLabel = (recurrence: TaskRecurrence) => {
    const labels = {
      [TaskRecurrence.NONE]: '',
      [TaskRecurrence.DAILY]: 'Diária',
      [TaskRecurrence.WEEKLY]: 'Semanal',
      [TaskRecurrence.MONTHLY]: 'Mensal',
    };
    return labels[recurrence];
  };

  const getNextAvailableMessage = (recurrence: TaskRecurrence) => {
    const now = new Date();
    
    switch (recurrence) {
      case TaskRecurrence.DAILY: {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const hours = Math.floor((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60));
        const minutes = Math.floor(((tomorrow.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60));
        return `Disponível novamente em ${hours}h ${minutes}min (à meia-noite)`;
      }
      
      case TaskRecurrence.WEEKLY: {
        // Próxima segunda-feira
        const nextMonday = new Date(now);
        const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
        nextMonday.setDate(now.getDate() + daysUntilMonday);
        nextMonday.setHours(0, 0, 0, 0);
        const days = Math.ceil((nextMonday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return `Disponível novamente em ${days} dia${days > 1 ? 's' : ''} (próxima segunda-feira)`;
      }
      
      case TaskRecurrence.MONTHLY: {
        // Primeiro dia do próximo mês
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const days = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return `Disponível novamente em ${days} dia${days > 1 ? 's' : ''} (próximo mês)`;
      }
      
      default:
        return '';
    }
  };

  return (
    <Layout>
      <div className="tasks-page">
        <div className="page-header">
          <div>
            <h1>📝 Minhas Tarefas</h1>
            <p>Complete suas tarefas e ganhe pontos!</p>
          </div>
          <div className="tasks-stats">
            <div className="stat">
              <Clock size={20} />
              <span>{pendingCount} pendentes</span>
            </div>
            <div className="stat">
              <Trophy size={20} />
              <span>{completedCount} concluídas</span>
            </div>
          </div>
        </div>

        <div className="filters">
          <button
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            Pendentes
          </button>
          <button
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
          >
            Concluídas
          </button>
        </div>

        {loading ? (
          <div className="loading-state">Carregando tarefas...</div>
        ) : itemsToShow.length === 0 ? (
          <div className="empty-tasks">
            <CheckCircle size={64} />
            <h3>Nenhuma tarefa encontrada</h3>
            <p>
              {filter === 'pending'
                ? 'Você não tem tarefas pendentes no momento!'
                : 'Você ainda não completou nenhuma tarefa.'}
            </p>
          </div>
        ) : (
          <>
            <div className="tasks-grid">
              {filter === 'pending' ? (
                // Renderiza tarefas pendentes
                paginatedItems.map((item) => {
                  const task = item as Task;
                  return (
                    <div key={task.id} className="task-card">
                      <div className="task-header">
                        <h3>{task.title}</h3>
                        {task.recurrence !== TaskRecurrence.NONE && (
                          <div className="recurrence-badge">
                            <Repeat size={16} />
                            {getRecurrenceLabel(task.recurrence)}
                          </div>
                        )}
                      </div>

                      {task.description && (
                        <p className="task-description">{task.description}</p>
                      )}

                      <div className="task-footer">
                        <div className="task-points-badge">
                          <Star size={18} />
                          <span>{task.points} pontos</span>
                        </div>

                        <button
                          onClick={() => handleCompleteTask(task.id)}
                          disabled={completingTaskId === task.id}
                          className="complete-button"
                        >
                          {completingTaskId === task.id ? (
                            <>✨ Completando...</>
                          ) : (
                            <>
                              <CheckCircle size={18} />
                              Completar
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                // Renderiza histórico de conclusões (TaskLogs)
                paginatedItems.map((item) => {
                  const log = item as TaskLog;
                  return (
                    <div key={log.id} className="task-card completed">
                      <div className="task-header">
                        <h3>{log.taskTitle}</h3>
                        <div className="completed-badge">
                          <CheckCircle size={18} />
                          Concluída
                        </div>
                      </div>

                      <div className="task-footer">
                        <div className="task-points-badge">
                          <Star size={18} />
                          <span>{log.pointsEarned} pontos</span>
                        </div>

                        <span className="completed-date">
                          {new Date(log.completedAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  <ChevronLeft size={20} />
                  Anterior
                </button>
                <div className="pagination-info">
                  Página {currentPage} de {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-button"
                >
                  Próxima
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Tasks;

