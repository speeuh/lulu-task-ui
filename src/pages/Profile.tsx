import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Layout from '../components/Layout';
import ImageUpload from '../components/ImageUpload';
import { ThemeType } from '../types';
import * as api from '../services/api';
import { User as UserIcon, Palette, Save, Edit2 } from 'lucide-react';
import './Profile.css';

const Profile: React.FC = () => {
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
  
  const [profileImageUrl, setProfileImageUrl] = useState(user?.profileImageUrl || '');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [editingName, setEditingName] = useState(false);
  const [themeValue, setThemeValue] = useState(
    user?.themeValue && user.themeValue.startsWith('#') ? user.themeValue : '#90CAF9'
  );
  const [buttonColor, setButtonColor] = useState(user?.buttonColor || '#81D4FA');
  const [saving, setSaving] = useState(false);

  const handleImageUploaded = async (url: string) => {
    setProfileImageUrl(url);
    if (url) {
      setSaving(true);
      try {
        await api.updateProfileImage(url);
        await refreshUser();
        toast.success('✅ Imagem de perfil atualizada!');
      } catch (error) {
        console.error('Failed to update profile image:', error);
        toast.error('Erro ao atualizar imagem de perfil');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleUpdateName = async () => {
    if (!fullName.trim()) {
      toast.error('O nome não pode estar vazio');
      return;
    }

    setSaving(true);
    try {
      await api.updateUserName(fullName);
      await refreshUser();
      setEditingName(false);
      toast.success('✅ Nome atualizado!');
    } catch (error) {
      console.error('Failed to update name:', error);
      toast.error('Erro ao atualizar nome');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTheme = async () => {
    setSaving(true);
    try {
      await api.updateSettings({ 
        themeType: ThemeType.COLOR, 
        themeValue: themeValue.startsWith('#') ? themeValue : '#90CAF9', 
        buttonColor 
      });
      await refreshUser();
      toast.success('✅ Tema atualizado!');
    } catch (error) {
      console.error('Failed to update theme:', error);
      toast.error('Erro ao atualizar tema');
    } finally {
      setSaving(false);
    }
  };

  const presetColors = [
    '#FF9B8A',
    '#FFB5A7',
    '#FFC3BA',
    '#FFD4CC',
    '#A8E6CF',
    '#DCEDC8',
    '#FFE082',
    '#FFCCBC',
    '#CE93D8',
    '#B39DDB',
    '#90CAF9',
    '#81D4FA',
  ];

  const buttonPresetColors = [
    '#FF9B8A',
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FFEAA7',
    '#DFE6E9',
    '#74B9FF',
    '#A29BFE',
    '#FD79A8',
    '#FDCB6E',
    '#6C5CE7',
  ];

  return (
    <Layout>
      <div className="profile-page">
        <div className="profile-header">
          <h1>Oiii, coisinha linda!</h1>
          <p>Aqui você pode deixar um pouquinho mais do seu jeitinho!</p>
        </div>

        <div className="profile-sections">
          {/* User Info */}
          <div className="profile-section">
            <div className="section-title">
              <UserIcon size={24} />
              <h2>Informações do Perfil</h2>
            </div>
            
            <div className="profile-grid">
              <div className="profile-photo-section">
                <ImageUpload
                  currentImage={getImageUrl(profileImageUrl)}
                  onImageUploaded={handleImageUploaded}
                  label="Escolher Foto"
                  circular={true}
                />
              </div>

              <div className="profile-info-section">
                <div className="user-details-display">
                  {editingName ? (
                    <div className="name-edit-section">
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="name-input"
                        placeholder="Digite seu nome"
                        disabled={saving}
                      />
                      <div className="name-edit-buttons">
                        <button
                          onClick={handleUpdateName}
                          disabled={saving}
                          className="save-name-button"
                        >
                          <Save size={16} />
                          Salvar
                        </button>
                        <button
                          onClick={() => {
                            setEditingName(false);
                            setFullName(user?.fullName || '');
                          }}
                          disabled={saving}
                          className="cancel-name-button"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="name-display">
                        <h3>{user?.fullName}</h3>
                        <button
                          onClick={() => setEditingName(true)}
                          className="edit-name-button"
                          title="Editar nome"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                      <p className="username-display">@NamoradaDoLucas</p>
                      <div className="user-points-display">
                        ⭐ {user?.points} pontos
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="profile-section">
            <div className="section-title">
              <Palette size={24} />
              <h2>Configurações de Tema</h2>
            </div>

            <div className="color-section">
              <div className="form-group">
                <label>Escolha uma cor de fundo</label>
                <div className="color-input-wrapper">
                  <input
                    type="color"
                    value={themeValue.startsWith('#') ? themeValue : '#FF9B8A'}
                    onChange={(e) => setThemeValue(e.target.value)}
                    className="color-picker"
                  />
                  <input
                    type="text"
                    value={themeValue.startsWith('#') ? themeValue : '#FF9B8A'}
                    onChange={(e) => setThemeValue(e.target.value)}
                    placeholder="#FF9B8A"
                    className="color-text"
                  />
                </div>
              </div>

              <div className="preset-colors">
                <label>Cores de fundo sugeridas</label>
                <div className="color-grid">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`color-preset ${themeValue === color ? 'active' : ''}`}
                      style={{ background: color }}
                      onClick={() => setThemeValue(color)}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Button Color Section */}
            <div className="form-group">
              <label>Cor dos Botões</label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  value={buttonColor}
                  onChange={(e) => setButtonColor(e.target.value)}
                  className="color-picker"
                />
                <input
                  type="text"
                  value={buttonColor}
                  onChange={(e) => setButtonColor(e.target.value)}
                  placeholder="#FF9B8A"
                  className="color-text"
                />
              </div>
            </div>

            <div className="preset-colors">
              <label>Cores de botões sugeridas</label>
              <div className="color-grid">
                {buttonPresetColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`color-preset ${buttonColor === color ? 'active' : ''}`}
                    style={{ background: color }}
                    onClick={() => setButtonColor(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleUpdateTheme}
              disabled={saving}
              className="save-button"
            >
              <Save size={18} />
              {saving ? 'Salvando...' : 'Salvar Tema'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;

