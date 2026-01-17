import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { ListTodo, ShoppingBag } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="admin-dashboard">
        <div className="admin-header">
          <h1>🔧 Painel de Administração</h1>
          <p>Gerencie tarefas e itens da loja</p>
        </div>

        <div className="admin-cards">
          <button onClick={() => navigate('/admin/tasks')} className="admin-card">
            <div className="card-icon tasks">
              <ListTodo size={48} />
            </div>
            <h2>Gerenciar Tarefas</h2>
            <p>Crie, edite e remova tarefas para os usuários</p>
          </button>

          <button onClick={() => navigate('/admin/shop')} className="admin-card">
            <div className="card-icon shop">
              <ShoppingBag size={48} />
            </div>
            <h2>Gerenciar Loja</h2>
            <p>Crie, edite e remova itens da lojinha</p>
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;

