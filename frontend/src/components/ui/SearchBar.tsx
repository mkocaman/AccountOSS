import { Input, Space, Button } from 'antd';
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

// Arama ve filtre çubuğu
interface SearchBarProps {
  onSearch: (value: string) => void;
  onFilter?: () => void;
  onRefresh?: () => void;
  placeholder?: string;
  filters?: React.ReactNode;
}

export const SearchBar = ({
  onSearch,
  onFilter,
  onRefresh,
  placeholder,
  filters,
}: SearchBarProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="mb-4 flex items-center justify-between">
      <Space size="middle">
        {/* Arama */}
        <Input.Search
          placeholder={placeholder || t('common.searchPlaceholder')}
          onSearch={onSearch}
          style={{ width: 300 }}
          size="large"
          allowClear
        />

        {/* Filtreler (opsiyonel) */}
        {filters}

        {/* Filtre butonu */}
        {onFilter && (
          <Button icon={<FilterOutlined />} onClick={onFilter} size="large">
            {t('common.filters')}
          </Button>
        )}
      </Space>

      {/* Yenile butonu */}
      {onRefresh && (
        <Button icon={<ReloadOutlined />} onClick={onRefresh} size="large">
          {t('common.refresh')}
        </Button>
      )}
    </div>
  );
};

