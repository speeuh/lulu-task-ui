import React, { useState } from 'react';
import Layout from '../components/Layout';
import TaskHistory from './TaskHistory';
import RedemptionHistory from './RedemptionHistory';
import { ListTodo, ShoppingBag } from 'lucide-react';
import './HistoryTabs.css';

const History: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'redemptions'>('tasks');

  return (
    <Layout>
      <div className="history-tabs-container">
        <div className="tabs-header">
          <button
            className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            <ListTodo size={20} />
            <span>Tarefas Completadas</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'redemptions' ? 'active' : ''}`}
            onClick={() => setActiveTab('redemptions')}
          >
            <ShoppingBag size={20} />
            <span>Itens Resgatados</span>
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'tasks' ? (
            <div className="tab-panel">
              <TaskHistory />
            </div>
          ) : (
            <div className="tab-panel">
              <RedemptionHistory />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default History;

