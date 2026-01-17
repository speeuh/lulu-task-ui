import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Layout from '../components/Layout';
import ConfirmModal from '../components/ConfirmModal';
import { ShopItem } from '../types';
import * as api from '../services/api';
import { Star, Gift, Sparkles } from 'lucide-react';
import './Shop.css';

const Shop: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  
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
  
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemingItemId, setRedeemingItemId] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    item: ShopItem | null;
  }>({ isOpen: false, item: null });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const shopItems = await api.getShopItems();
      setItems(shopItems);
    } catch (error) {
      console.error('Failed to load shop items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemClick = (item: ShopItem) => {
    if (!user) return;

    if (user.points < item.pointsCost) {
      toast.error('Você não tem pontos suficientes para resgatar este item!');
      return;
    }

    setConfirmModal({ isOpen: true, item });
  };

  const handleConfirmRedeem = async () => {
    const item = confirmModal.item;
    if (!item) return;

    setConfirmModal({ isOpen: false, item: null });
    setRedeemingItemId(item.id);
    
    try {
      await api.redeemItem(item.id);
      await refreshUser();
      toast.success(`🎉 Parabéns! Você resgatou: ${item.name}`);
    } catch (error: any) {
      console.error('Failed to redeem item:', error);
      toast.error(error.response?.data?.message || 'Erro ao resgatar item');
    } finally {
      setRedeemingItemId(null);
    }
  };

  return (
    <Layout>
      <div className="shop-page">
        <div className="shop-header">
          <div>
            <h1>🛍️ Lojinha da {user?.fullName || 'Lulu'}</h1>
            <p>Troque seus pontos por recompensas especiais, aceito sugestões de itens!</p>
          </div>
          <div className="points-display">
            <Star size={24} />
            <div>
              <span className="points-label">Seus pontos</span>
              <span className="points-value">{user?.points}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Carregando itens...</div>
        ) : items.length === 0 ? (
          <div className="empty-shop">
            <Gift size={64} />
            <h3>Loja vazia</h3>
            <p>Não há itens disponíveis no momento.</p>
          </div>
        ) : (
          <div className="shop-grid">
            {items.map((item) => {
              const canAfford = (user?.points || 0) >= item.pointsCost;
              const isRedeeming = redeemingItemId === item.id;

              return (
                <div
                  key={item.id}
                  className={`shop-item-card ${!canAfford ? 'locked' : ''}`}
                >
                  {item.imageUrl ? (
                    <div className="item-image">
                      <img src={getImageUrl(item.imageUrl)} alt={item.name} />
                    </div>
                  ) : (
                    <div className="item-image placeholder">
                      <Gift size={48} />
                    </div>
                  )}

                  <div className="item-content">
                    <h3>{item.name}</h3>
                    {item.description && <p>{item.description}</p>}
                  </div>

                  <div className="item-footer">
                    <div className="item-cost">
                      <Star size={18} />
                      <span>{item.pointsCost} pontos</span>
                    </div>

                    <button
                      onClick={() => handleRedeemClick(item)}
                      disabled={!canAfford || isRedeeming}
                      className="redeem-button"
                    >
                      {isRedeeming ? (
                        <>✨ Resgatando...</>
                      ) : !canAfford ? (
                        <>🔒 Pontos insuficientes</>
                      ) : (
                        <>
                          <Sparkles size={18} />
                          Resgatar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title="Resgatar Item"
          message={`Deseja resgatar "${confirmModal.item?.name}" por ${confirmModal.item?.pointsCost} pontos?`}
          confirmText="Resgatar"
          cancelText="Cancelar"
          onConfirm={handleConfirmRedeem}
          onCancel={() => setConfirmModal({ isOpen: false, item: null })}
          type="warning"
        />
      </div>
    </Layout>
  );
};

export default Shop;

