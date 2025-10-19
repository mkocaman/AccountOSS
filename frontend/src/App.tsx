import { ConfigProvider, App as AntApp } from 'antd';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import trTR from 'antd/locale/tr_TR';
import enUS from 'antd/locale/en_US';
import { useTranslation } from 'react-i18next';

function App() {
  const { i18n } = useTranslation();
  
  // Dile göre Ant Design locale seç
  const antdLocale = i18n.language === 'en' ? enUS : trTR;

  return (
    <ConfigProvider
      locale={antdLocale}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <AntApp>
        <RouterProvider router={router} />
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
