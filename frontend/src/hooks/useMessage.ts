import { App } from 'antd';

/**
 * Ant Design message hook - context ile çalışır
 * Static message yerine bu hook'u kullan
 */
export const useMessage = () => {
  const { message } = App.useApp();
  return message;
};

/**
 * Ant Design notification hook
 */
export const useNotification = () => {
  const { notification } = App.useApp();
  return notification;
};

/**
 * Ant Design modal hook
 */
export const useModal = () => {
  const { modal } = App.useApp();
  return modal;
};
