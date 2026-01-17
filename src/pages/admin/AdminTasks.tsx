import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import ConfirmModal from '../../components/ConfirmModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Task, TaskRequest, TaskRecurrence } from '../../types';
import * as api from '../../services/api';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import './AdminTasks.css';

const AdminTasks: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    taskId: number | null;
    taskTitle: string;
  }>({ isOpen: false, taskId: null, taskTitle: '' });
  const [formData, setFormData] = useState<TaskRequest>({
    title: '',
    description: '',
    points: 10,
    userId: 0,
    recurrence: TaskRecurrence.NONE,
  });

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    if (user && formData.userId === 0) {
      // Set default userId to Lulu's ID (assuming ID 2)
      setFormData((prev) => ({ ...prev, userId: 2 }));
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      const allTasks = await api.getAllTasks();
      setTasks(allTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        points: task.points,
        userId: 2, // Default to Lulu
        recurrence: task.recurrence || TaskRecurrence.NONE,
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        points: 10,
        userId: 2, // Default to Lulu
        recurrence: TaskRecurrence.NONE,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingTask) {
        await api.updateTask(editingTask.id, formData);
        toast.success('✅ Tarefa atualizada com sucesso!');
      } else {
        await api.createTask(formData);
        toast.success('✅ Tarefa criada com sucesso!');
      }
      await loadTasks();
      handleCloseModal();
    } catch (error: any) {
      console.error('Failed to save task:', error);
      toast.error(error.response?.data?.message || 'Erro ao salvar tarefa');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (task: Task) => {
    setConfirmModal({
      isOpen: true,
      taskId: task.id,
      taskTitle: task.title,
    });
  };

  const handleConfirmDelete = async () => {
    const taskId = confirmModal.taskId;
    if (!taskId) return;

    setConfirmModal({ isOpen: false, taskId: null, taskTitle: '' });

    try {
      await api.deleteTask(taskId);
      await loadTasks();
      toast.success('✅ Tarefa removida com sucesso!');
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      toast.error(error.response?.data?.message || 'Erro ao remover tarefa');
    }
  };

  return (
    <Layout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1>📝 Gerenciar Tarefas</h1>
            <p>Crie e gerencie tarefas para os usuários</p>
          </div>
          <button onClick={() => handleOpenModal()} className="add-button">
            <Plus size={20} />
            Nova Tarefa
          </button>
        </div>

        {loading ? (
          <div className="loading-state">Carregando...</div>
        ) : (
          <div className="admin-grid">
            {tasks.map((task) => (
              <div key={task.id} className="admin-item-card">
                <div className="admin-item-content">
                  <h3>{task.title}</h3>
                  {task.description && <p>{task.description}</p>}
                  <div className="item-meta">
                    <span className="points-badge">{task.points} pontos</span>
                    <span className={`status-badge ${task.status.toLowerCase()}`}>
                      {task.status === 'PENDING' ? 'Pendente' : 'Concluída'}
                    </span>
                  </div>
                </div>
                <div className="admin-item-actions">
                  <button onClick={() => handleOpenModal(task)} className="edit-btn">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDeleteClick(task)} className="delete-btn">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
                <button onClick={handleCloseModal} className="close-btn">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label>Título *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Nome da tarefa"
                  />
                </div>

                <div className="form-group">
                  <label>Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição da tarefa (opcional)"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Pontos *</label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                    required
                    min="1"
                    placeholder="10"
                  />
                </div>

                <div className="form-group">
                  <label>Recorrência</label>
                  <select
                    value={formData.recurrence}
                    onChange={(e) => setFormData({ ...formData, recurrence: e.target.value as TaskRecurrence })}
                  >
                    <option value={TaskRecurrence.NONE}>Não recorrente</option>
                    <option value={TaskRecurrence.DAILY}>Diária</option>
                    <option value={TaskRecurrence.WEEKLY}>Semanal</option>
                    <option value={TaskRecurrence.MONTHLY}>Mensal</option>
                  </select>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={handleCloseModal} className="cancel-btn" disabled={submitting}>
                    Cancelar
                  </button>
                  <button type="submit" className="submit-btn" disabled={submitting}>
                    <Save size={18} />
                    {submitting ? 'Salvando...' : (editingTask ? 'Atualizar' : 'Criar')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title="Remover Tarefa"
          message={`Tem certeza que deseja remover a tarefa "${confirmModal.taskTitle}"? Esta ação não pode ser desfeita.`}
          confirmText="Remover"
          cancelText="Cancelar"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmModal({ isOpen: false, taskId: null, taskTitle: '' })}
          type="warning"
        />
      </div>
    </Layout>
  );
};

export default AdminTasks;

