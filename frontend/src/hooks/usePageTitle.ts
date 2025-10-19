import { useEffect } from 'react';

export const usePageTitle = (title: string) => {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = title ? `${title} - AccountOS` : 'AccountOS';
    
    return () => {
      document.title = originalTitle;
    };
  }, [title]);
};
