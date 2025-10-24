import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import './SettingsButton.css';

/**
 * Ayarlar butonu
 */
export const SettingsButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Tooltip title="Ayarlar">
      <div 
        className="settings-button"
        onClick={() => navigate('/settings')}
      >
        <SettingOutlined style={{ fontSize: 18 }} />
      </div>
    </Tooltip>
  );
};
