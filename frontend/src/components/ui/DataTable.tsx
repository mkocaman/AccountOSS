import { Table } from 'antd';
import { useTranslation } from 'react-i18next';
import type { TableProps, ColumnsType } from 'antd/es/table';

// Genel amaçlı DataTable bileşeni
interface DataTableProps<T> extends Omit<TableProps<T>, 'columns'> {
  columns: ColumnsType<T>;
  data: T[];
  loading?: boolean;
  onRowClick?: (record: T) => void;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  loading,
  onRowClick,
  ...tableProps
}: DataTableProps<T>) {
  const { t } = useTranslation();
  
  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 50,
        showSizeChanger: true,
        showTotal: (total) => t('common.totalRecords', { total }),
        pageSizeOptions: ['10', '20', '50', '100'],
        ...tableProps.pagination,
      }}
      onRow={(record) => ({
        onClick: () => onRowClick?.(record),
        style: { cursor: onRowClick ? 'pointer' : 'default' },
      })}
      scroll={{ x: 1200 }}
      {...tableProps}
    />
  );
}

