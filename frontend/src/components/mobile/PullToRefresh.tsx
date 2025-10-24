import React, { useState, useRef, useEffect } from 'react';
import { Spin } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import './PullToRefresh.css';

/**
 * Pull-to-refresh component
 * Mobilde aşağı kaydırarak yenileme
 */

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  disabled = false
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  const PULL_THRESHOLD = 80; // Minimum pull distance to trigger refresh
  const MAX_PULL = 120; // Maximum pull distance

  /**
   * Touch start
   */
  const handleTouchStart = (e: TouchEvent) => {
    if (disabled || isRefreshing) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  /**
   * Touch move
   */
  const handleTouchMove = (e: TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return;

    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;

    if (diff > 0) {
      e.preventDefault();
      const distance = Math.min(diff * 0.5, MAX_PULL);
      setPullDistance(distance);
    }
  };

  /**
   * Touch end
   */
  const handleTouchEnd = async () => {
    if (!isPulling || disabled || isRefreshing) return;

    setIsPulling(false);

    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  /**
   * Add touch event listeners
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, isRefreshing, pullDistance, disabled]);

  const rotation = (pullDistance / PULL_THRESHOLD) * 360;
  const opacity = Math.min(pullDistance / PULL_THRESHOLD, 1);

  return (
    <div ref={containerRef} className="pull-to-refresh-container">
      <div
        className="pull-indicator"
        style={{
          height: pullDistance,
          opacity: opacity
        }}
      >
        {isRefreshing ? (
          <Spin />
        ) : (
          <ReloadOutlined
            style={{
              transform: `rotate(${rotation}deg)`,
              fontSize: 20,
              color: pullDistance >= PULL_THRESHOLD ? '#1890ff' : '#8c8c8c'
            }}
          />
        )}
      </div>
      {children}
    </div>
  );
};
