import { Input, Space, Button } from 'antd';
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons';

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
  placeholder = 'Ara...',
  filters,
}: SearchBarProps) => {
  return (
    <div className="mb-4 flex items-center justify-between">
      <Space size="middle">
        {/* Arama */}
        <Input.Search
          placeholder={placeholder}
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
            Filtreler
          </Button>
        )}
      </Space>

      {/* Yenile butonu */}
      {onRefresh && (
        <Button icon={<ReloadOutlined />} onClick={onRefresh} size="large">
          Yenile
        </Button>
      )}
    </div>
  );
};

