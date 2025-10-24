import React, { useRef, useState } from 'react';
import { Spin } from 'antd';
import './VirtualList.css';

/**
 * Virtual scrolling list component
 * Büyük listeler için performans optimizasyonu
 */

interface VirtualListProps<T> {
  data: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function VirtualList<T extends { id: string }>({
  data,
  itemHeight,
  containerHeight,
  renderItem,
  loading = false,
  onLoadMore,
  hasMore = false
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Görünür aralığı hesapla
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 5);
  const endIndex = Math.min(
    data.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + 5
  );

  const visibleItems = data.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;
  const totalHeight = data.length * itemHeight;

  /**
   * Scroll event handler
   */
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollTop(target.scrollTop);

    // Load more when near bottom
    if (
      onLoadMore &&
      hasMore &&
      !loading &&
      target.scrollHeight - target.scrollTop - target.clientHeight < 200
    ) {
      onLoadMore();
    }
  };

  return (
    <div
      ref={containerRef}
      className="virtual-list-container"
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={item.id}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <div className="virtual-list-loading">
          <Spin />
        </div>
      )}
    </div>
  );
}
