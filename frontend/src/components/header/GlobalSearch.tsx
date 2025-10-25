import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Input, Dropdown, Spin, Empty, Tag } from 'antd';
import {
  SearchOutlined,
  FileTextOutlined,
  TeamOutlined,
  ShoppingOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import client from '../../utils/client';
import './GlobalSearch.css';

/**
 * Global arama component'i
 * Tüm entity'lerde arama yapar
 */

interface SearchResult {
  type: 'invoice' | 'partner' | 'product' | 'payment';
  id: string;
  title: string;
  subtitle: string;
  url: string;
}

export const GlobalSearch: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  
  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  /**
   * Arama yap
   */
  useEffect(() => {
    const search = async () => {
      if (!debouncedSearch || debouncedSearch.length < 2) {
        setResults([]);
        setOpen(false);
        return;
      }

      setLoading(true);
      setOpen(true);

      try {
        const response = await client.get('/search/global', {
          params: { query: debouncedSearch, limit: 10 }
        });
        setResults(response.data);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedSearch]);

  /**
   * Sonuca tıklama
   */
  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    setSearchTerm('');
    setOpen(false);
  };

  /**
   * Entity icon
   */
  const getEntityIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'invoice':
        return <FileTextOutlined style={{ color: '#1890ff' }} />;
      case 'partner':
        return <TeamOutlined style={{ color: '#52c41a' }} />;
      case 'product':
        return <ShoppingOutlined style={{ color: '#faad14' }} />;
      case 'payment':
        return <DollarOutlined style={{ color: '#722ed1' }} />;
    }
  };

  /**
   * Entity label
   */
  const getEntityLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'invoice':
        return t('search.invoice');
      case 'partner':
        return t('search.partner');
      case 'product':
        return t('search.product');
      case 'payment':
        return t('search.payment');
    }
  };

  /**
   * Dropdown content
   */
  const dropdownContent = (
    <div className="global-search-dropdown">
      {loading ? (
        <div className="search-loading">
          <Spin />
        </div>
      ) : results.length > 0 ? (
        <div className="search-results">
          {results.map(result => (
            <div
              key={`${result.type}-${result.id}`}
              className="search-result-item"
              onClick={() => handleResultClick(result)}
            >
              <div className="result-icon">
                {getEntityIcon(result.type)}
              </div>
              <div className="result-content">
                <div className="result-title">{result.title}</div>
                <div className="result-subtitle">{result.subtitle}</div>
              </div>
              <Tag className="result-type">{getEntityLabel(result.type)}</Tag>
            </div>
          ))}
        </div>
      ) : debouncedSearch ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('search.noResults')}
          style={{ padding: '20px 0' }}
        />
      ) : null}
    </div>
  );

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      popupRender={() => dropdownContent}
      placement="bottom"
      trigger={['click']}
      overlayClassName="global-search-dropdown-overlay"
    >
      <Input
        placeholder={t('search.placeholder')}
        prefix={<SearchOutlined />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: 300 }}
        allowClear
      />
    </Dropdown>
  );
};
