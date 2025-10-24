import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global error boundary - Uygulama hatalarını yakalar
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          height: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Result
            status="error"
            title="Bir şeyler yanlış gitti"
            subTitle="Üzgünüz, beklenmeyen bir hata oluştu."
            extra={[
              <Button type="primary" key="home" onClick={this.handleReset}>
                Ana Sayfaya Dön
              </Button>,
              <Button key="reload" onClick={() => window.location.reload()}>
                Sayfayı Yenile
              </Button>
            ]}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
