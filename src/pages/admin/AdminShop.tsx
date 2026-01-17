import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import ConfirmModal from '../../components/ConfirmModal';
import ImageUpload from '../../components/ImageUpload';
import { useToast } from '../../context/ToastContext';
import { ShopItem, ShopItemRequest } from '../../types';
import * as api from '../../services/api';
import { Plus, Edit2, Trash2, X, Save, Gift } from 'lucide-react';
import './AdminTasks.css';

const AdminShop: React.FC = () => {
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
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    itemId: number | null;
    itemName: string;
  }>({ isOpen: false, itemId: null, itemName: '' });
  const [formData, setFormData] = useState<ShopItemRequest>({
    name: '',
    description: '',
    pointsCost: 50,
    imageUrl: '',
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const shopItems = await api.getAllShopItems();
      setItems(shopItems);
    } catch (error) {
      console.error('Failed to load shop items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item?: ShopItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || '',
        pointsCost: item.pointsCost,
        imageUrl: item.imageUrl || '',
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        pointsCost: 50,
        imageUrl: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        await api.updateShopItem(editingItem.id, formData);
        toast.success('✅ Item atualizado com sucesso!');
      } else {
        await api.createShopItem(formData);
        toast.success('✅ Item criado com sucesso!');
      }
      await loadItems();
      handleCloseModal();
    } catch (error: any) {
      console.error('Failed to save item:', error);
      toast.error(error.response?.data?.message || 'Erro ao salvar item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (item: ShopItem) => {
    setConfirmModal({
      isOpen: true,
      itemId: item.id,
      itemName: item.name,
    });
  };

  const handleConfirmDelete = async () => {
    const itemId = confirmModal.itemId;
    if (!itemId) return;

    setConfirmModal({ isOpen: false, itemId: null, itemName: '' });

    try {
      await api.deleteShopItem(itemId);
      await loadItems();
      toast.success('✅ Item removido com sucesso!');
    } catch (error: any) {
      console.error('Failed to delete item:', error);
      toast.error(error.response?.data?.message || 'Erro ao remover item');
    }
  };

  return (
    <Layout>
      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1>🛍️ Gerenciar Loja</h1>
            <p>Crie e gerencie itens da lojinha</p>
          </div>
          <button onClick={() => handleOpenModal()} className="add-button">
            <Plus size={20} />
            Novo Item
          </button>
        </div>

        {loading ? (
          <div className="loading-state">Carregando...</div>
        ) : (
          <div className="admin-grid">
            {items.map((item) => (
              <div key={item.id} className="admin-item-card shop">
                {item.imageUrl ? (
                  <div className="item-preview">
                    <img src={getImageUrl(item.imageUrl)} alt={item.name} />
                  </div>
                ) : (
                  <div className="item-preview placeholder">
                    <Gift size={40} />
                  </div>
                )}
                <div className="admin-item-content">
                  <h3>{item.name}</h3>
                  {item.description && <p>{item.description}</p>}
                  <div className="item-meta">
                    <span className="points-badge">{item.pointsCost} pontos</span>
                    <span className={`status-badge ${item.available ? 'available' : 'unavailable'}`}>
                      {item.available ? 'Disponível' : 'Indisponível'}
                    </span>
                  </div>
                </div>
                <div className="admin-item-actions">
                  <button onClick={() => handleOpenModal(item)} className="edit-btn">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDeleteClick(item)} className="delete-btn">
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
                <h2>{editingItem ? 'Editar Item' : 'Novo Item'}</h2>
                <button onClick={handleCloseModal} className="close-btn">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label>Nome *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Nome do item"
                  />
                </div>

                <div className="form-group">
                  <label>Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição do item (opcional)"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Custo em Pontos *</label>
                  <input
                    type="number"
                    value={formData.pointsCost}
                    onChange={(e) => setFormData({ ...formData, pointsCost: parseInt(e.target.value) })}
                    required
                    min="1"
                    placeholder="50"
                  />
                </div>

                <div className="form-group">
                  <label>Imagem do Item</label>
                  <ImageUpload
                    currentImage={getImageUrl(formData.imageUrl)}
                    onImageUploaded={(imageUrl) => setFormData({ ...formData, imageUrl })}
                    label="Escolher Imagem do Item"
                    circular={false}
                    aspect={4 / 3}
                  />
                  <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>
                    💡 Você pode ajustar, cortar e dar zoom na imagem antes de salvar
                  </small>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={handleCloseModal} className="cancel-btn" disabled={submitting}>
                    Cancelar
                  </button>
                  <button type="submit" className="submit-btn" disabled={submitting}>
                    <Save size={18} />
                    {submitting ? 'Salvando...' : (editingItem ? 'Atualizar' : 'Criar')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title="Remover Item"
          message={`Tem certeza que deseja remover o item "${confirmModal.itemName}"? Esta ação não pode ser desfeita.`}
          confirmText="Remover"
          cancelText="Cancelar"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmModal({ isOpen: false, itemId: null, itemName: '' })}
          type="warning"
        />
      </div>
    </Layout>
  );
};

export default AdminShop;

