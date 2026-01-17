import React, { useEffect, useState } from 'react';
import { RedemptionLog } from '../types';
import * as api from '../services/api';
import Pagination from '../components/Pagination';
import { ShoppingBag, Calendar, Star, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import './History.css';

const ITEMS_PER_PAGE = 10;

const RedemptionHistory: React.FC = () => {
  const [logs, setLogs] = useState<RedemptionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const history = await api.getRedemptionHistory();
      setLogs(history);
    } catch (error) {
      console.error('Failed to load redemption history:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = logs.reduce((sum, log) => sum + log.pointsSpent, 0);

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
            <h1>🎁 Histórico de Resgates</h1>
            <p>Veja todos os itens que você resgatou</p>
          </div>
          <div className="total-spent">
            <TrendingDown size={24} />
            <div>
              <span className="label">Total gasto</span>
              <span className="value">{totalSpent} pontos</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Carregando histórico...</div>
        ) : logs.length === 0 ? (
          <div className="empty-history">
            <ShoppingBag size={64} />
            <h3>Nenhum resgate ainda</h3>
            <p>Troque seus pontos na lojinha para ver seus resgates aqui!</p>
          </div>
        ) : (
          <div className="history-container">
            <div className="history-stats">
              <div className="stat-card">
                <ShoppingBag size={28} />
                <div>
                  <h3>{logs.length}</h3>
                  <p>Itens Resgatados</p>
                </div>
              </div>
              <div className="stat-card">
                <Star size={28} />
                <div>
                  <h3>{totalSpent}</h3>
                  <p>Pontos Gastos</p>
                </div>
              </div>
            </div>

            <div className="history-list">
              {paginatedLogs.map((log) => (
                <div key={log.id} className="history-item">
                  <div className="item-icon spent">
                    <ShoppingBag size={20} />
                  </div>
                  <div className="item-content">
                    <h4>{log.itemName}</h4>
                    <div className="item-meta">
                      <span className="date">
                        <Calendar size={14} />
                        {format(new Date(log.redeemedAt), "dd/MM/yyyy")}
                      </span>
                      <span className="time">
                        {format(new Date(log.redeemedAt), 'HH:mm')}
                      </span>
                    </div>
                  </div>
                  <div className="item-points spent">
                    <Star size={16} />
                    -{log.pointsSpent}
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

export default RedemptionHistory;

