import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Drawer,
  Form,
  Button,
  Space,
  DatePicker,
  Select,
  InputNumber,
  Row,
  Col,
  Divider,
  Tag
} from 'antd';
import {
  FilterOutlined,
  CloseOutlined,
  SaveOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import './AdvancedFilter.css';

const { RangePicker } = DatePicker;

/**
 * Gelişmiş filtre component'i
 * Tüm listelerde kullanılabilir
 */

interface FilterField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'dateRange' | 'number' | 'numberRange';
  options?: Array<{ label: string; value: any }>;
  placeholder?: string;
}

interface FilterPreset {
  id: string;
  name: string;
  filters: Record<string, any>;
}

interface AdvancedFilterProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: Record<string, any>) => void;
  fields: FilterField[];
  presets?: FilterPreset[];
  onSavePreset?: (name: string, filters: Record<string, any>) => void;
  onDeletePreset?: (id: string) => void;
}

export const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  visible,
  onClose,
  onApply,
  fields,
  presets = [],
  onSavePreset,
  onDeletePreset
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [presetName, setPresetName] = useState('');

  /**
   * Filtreleri uygula
   */
  const handleApply = () => {
    const values = form.getFieldsValue();
    
    // Boş değerleri temizle
    const cleanedValues = Object.entries(values).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    setActiveFilters(cleanedValues);
    onApply(cleanedValues);
    onClose();
  };

  /**
   * Filtreleri temizle
   */
  const handleClear = () => {
    form.resetFields();
    setActiveFilters({});
    onApply({});
  };

  /**
   * Preset yükle
   */
  const handleLoadPreset = (preset: FilterPreset) => {
    form.setFieldsValue(preset.filters);
  };

  /**
   * Preset kaydet
   */
  const handleSavePreset = () => {
    if (!presetName.trim()) return;

    const values = form.getFieldsValue();
    onSavePreset?.(presetName, values);
    setPresetName('');
  };

  /**
   * Field render
   */
  const renderField = (field: FilterField) => {
    switch (field.type) {
      case 'select':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
          >
            <Select
              placeholder={field.placeholder || t('common.select')}
              options={field.options}
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label?.toString() || '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>
        );

      case 'date':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder={field.placeholder}
            />
          </Form.Item>
        );

      case 'dateRange':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
          >
            <RangePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder={[t('common.startDate'), t('common.endDate')]}
            />
          </Form.Item>
        );

      case 'number':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder={field.placeholder}
            />
          </Form.Item>
        );

      case 'numberRange':
        return (
          <Row gutter={8} key={field.name}>
            <Col span={12}>
              <Form.Item
                name={[field.name, 'min']}
                label={field.label + ' (Min)'}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder={t('common.min')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={[field.name, 'max']}
                label={field.label + ' (Max)'}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder={t('common.max')}
                />
              </Form.Item>
            </Col>
          </Row>
        );

      default:
        return null;
    }
  };

  return (
    <Drawer
      title={
        <Space>
          <FilterOutlined />
          {t('filters.advanced')}
        </Space>
      }
      placement="right"
      width={400}
      open={visible}
      onClose={onClose}
      extra={
        <Button icon={<CloseOutlined />} onClick={onClose} type="text" />
      }
      footer={
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Button onClick={handleClear}>
            {t('filters.clear')}
          </Button>
          <Space>
            <Button onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="primary" onClick={handleApply}>
              {t('filters.apply')}
            </Button>
          </Space>
        </Space>
      }
    >
      {/* Saved Presets */}
      {presets.length > 0 && (
        <>
          <div className="filter-presets">
            <div className="filter-section-title">
              {t('filters.savedPresets')}
            </div>
            <Space wrap>
              {presets.map(preset => (
                <Tag
                  key={preset.id}
                  className="filter-preset-tag"
                  onClick={() => handleLoadPreset(preset)}
                  closable
                  onClose={(e) => {
                    e.preventDefault();
                    onDeletePreset?.(preset.id);
                  }}
                >
                  {preset.name}
                </Tag>
              ))}
            </Space>
          </div>
          <Divider />
        </>
      )}

      {/* Filter Form */}
      <Form
        form={form}
        layout="vertical"
        initialValues={activeFilters}
      >
        {fields.map(field => renderField(field))}
      </Form>

      {/* Save Preset */}
      {onSavePreset && (
        <>
          <Divider />
          <div className="filter-save-preset">
            <div className="filter-section-title">
              {t('filters.savePreset')}
            </div>
            <Space.Compact style={{ width: '100%' }}>
              <input
                type="text"
                className="ant-input"
                placeholder={t('filters.presetName')}
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
              />
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSavePreset}
                disabled={!presetName.trim()}
              >
                {t('common.save')}
              </Button>
            </Space.Compact>
          </div>
        </>
      )}
    </Drawer>
  );
};
