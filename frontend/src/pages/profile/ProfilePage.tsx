import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  PageContainer, 
  ProCard, 
  ProForm, 
  ProFormText,
  ProFormTextArea
} from '@ant-design/pro-components';
import { 
  Avatar, 
  Button, 
  Space, 
  Typography, 
  Descriptions, 
  Divider,
  Upload,
  Row,
  Col
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  EditOutlined,
  SaveOutlined,
  CameraOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { useMessage } from '../../hooks/useMessage';
import type { UploadChangeParam } from 'antd/es/upload';
import './ProfilePage.css';

const { Title, Text } = Typography;

/**
 * Profil sayfası - Kullanıcı bilgilerini göster ve düzenle
 */
export const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const message = useMessage();
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar);

  /**
   * Profil güncelleme
   */
  const handleSubmit = async (values: any) => {
    try {
      console.log('Update profile:', values);
      // TODO: API call
      message.success(t('profile.updateSuccess'));
      setEditMode(false);
      return true;
    } catch (error) {
      message.error(t('profile.updateError'));
      return false;
    }
  };

  /**
   * Avatar yükleme
   */
  const handleAvatarChange = (info: UploadChangeParam) => {
    if (info.file.status === 'done') {
      // @ts-ignore
      setAvatarUrl(info.file.response?.url);
      message.success(t('profile.avatarUpdateSuccess'));
    } else if (info.file.status === 'error') {
      message.error(t('profile.avatarUpdateError'));
    }
  };

  // Avatar URL oluştur (kullanıcı adından)
  const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user?.name || 'User'
  )}&size=120&background=1890ff&color=fff`;

  return (
    <PageContainer
      header={{
        title: t('profile.title'),
        breadcrumb: {
          items: [
            { title: t('menu.home'), path: '/' },
            { title: t('menu.profile') }
          ]
        }
      }}
    >
      <ProCard>
        {/* Avatar ve temel bilgiler */}
        <Row gutter={24}>
          <Col xs={24} md={8} style={{ textAlign: 'center' }}>
            <div className="profile-avatar-section">
              <Avatar
                size={120}
                src={avatarUrl || defaultAvatarUrl}
                icon={<UserOutlined />}
              />
              <Upload
                showUploadList={false}
                action="/api/v1/users/avatar"
                onChange={handleAvatarChange}
                accept="image/*"
              >
                <Button 
                  icon={<CameraOutlined />}
                  size="small"
                  style={{ marginTop: 12 }}
                >
                  {t('profile.changeAvatar')}
                </Button>
              </Upload>
              
              <div className="profile-badges" style={{ marginTop: 16 }}>
                <span className="badge-primary">
                  {user?.role === 'admin' ? '👑 ' + t('profile.roles.admin') : '👤 ' + t('profile.roles.user')}
                </span>
                <span className="badge-success">✓ {t('common.active')}</span>
              </div>
            </div>
          </Col>

          <Col xs={24} md={16}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Title level={3} style={{ margin: 0 }}>
                {user?.name || 'User'}
              </Title>
              <Text type="secondary">{user?.email || 'user@example.com'}</Text>
              
              <div style={{ marginTop: 16 }}>
                {!editMode ? (
                  <Button 
                    type="primary" 
                    icon={<EditOutlined />}
                    onClick={() => setEditMode(true)}
                  >
                    {t('common.edit')}
                  </Button>
                ) : (
                  <Space>
                    <Button 
                      icon={<CloseOutlined />}
                      onClick={() => setEditMode(false)}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button 
                      type="primary" 
                      icon={<SaveOutlined />}
                      htmlType="submit"
                      form="profile-form"
                    >
                      {t('common.save')}
                    </Button>
                  </Space>
                )}
              </div>
            </Space>
          </Col>
        </Row>

        <Divider />

        {/* Bilgiler */}
        {!editMode ? (
          <Descriptions column={{ xs: 1, sm: 2 }} bordered>
            <Descriptions.Item label={t('profile.fields.fullName')} span={2}>
              {user?.name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('profile.fields.email')}>
              <Space>
                <MailOutlined />
                {user?.email || '-'}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label={t('profile.fields.phone')}>
              <Space>
                <PhoneOutlined />
                {user?.phone || '-'}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label={t('profile.fields.company')} span={2}>
              {user?.company || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('profile.fields.address')} span={2}>
              <Space>
                <EnvironmentOutlined />
                {user?.address || '-'}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label={t('profile.fields.role')}>
              {user?.role === 'admin' ? t('profile.roles.admin') : t('profile.roles.user')}
            </Descriptions.Item>
            <Descriptions.Item label={t('profile.fields.joinDate')}>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : '-'}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <ProForm
            id="profile-form"
            onFinish={handleSubmit}
            initialValues={user}
            layout="vertical"
            submitter={false}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <ProFormText
                  name="name"
                  label={t('profile.fields.fullName')}
                  rules={[{ required: true, message: t('profile.fields.fullNameRequired') }]}
                  placeholder={t('profile.fields.fullNamePlaceholder')}
                />
              </Col>
              <Col xs={24} md={12}>
                <ProFormText
                  name="phone"
                  label={t('profile.fields.phone')}
                  placeholder="+90 5XX XXX XX XX"
                />
              </Col>
            </Row>

            <ProFormText
              name="company"
              label={t('profile.fields.company')}
              placeholder={t('profile.fields.companyPlaceholder')}
            />

            <ProFormTextArea
              name="address"
              label={t('profile.fields.address')}
              placeholder={t('profile.fields.addressPlaceholder')}
              fieldProps={{ rows: 3 }}
            />
          </ProForm>
        )}
      </ProCard>

      {/* Şifre değiştirme kartı */}
      <ProCard 
        title={t('profile.security.title')}
        style={{ marginTop: 16 }}
        collapsible
        defaultCollapsed
      >
        <ProForm
          onFinish={async (values) => {
            try {
              console.log('Change password:', values);
              message.success(t('profile.security.passwordChanged'));
              return true;
            } catch (error) {
              message.error(t('profile.security.passwordChangeError'));
              return false;
            }
          }}
          submitter={{
            searchConfig: {
              submitText: t('profile.security.changePassword'),
              resetText: t('common.cancel')
            }
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <ProFormText.Password
                name="currentPassword"
                label={t('profile.security.currentPassword')}
                rules={[{ required: true, message: t('profile.security.currentPasswordRequired') }]}
                placeholder="••••••••"
              />
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <ProFormText.Password
                name="newPassword"
                label={t('profile.security.newPassword')}
                rules={[
                  { required: true, message: t('profile.security.newPasswordRequired') },
                  { min: 6, message: t('auth.passwordMinLength') }
                ]}
                placeholder="••••••••"
              />
            </Col>
            <Col xs={24} md={12}>
              <ProFormText.Password
                name="confirmPassword"
                label={t('profile.security.confirmPassword')}
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: t('profile.security.confirmPasswordRequired') },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error(t('auth.passwordMismatch')));
                    }
                  })
                ]}
                placeholder="••••••••"
              />
            </Col>
          </Row>
        </ProForm>
      </ProCard>
    </PageContainer>
  );
};
