import React, { useState, useEffect, useRef, useMemo } from 'react';

// Simple Virtual List Implementation
export default function VirtualizedList({
  items,
  itemHeight = 80, // Approximate height of each item
  renderItem,
  containerHeight = '100%',
  className = ''
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const [viewHeight, setViewHeight] = useState(600);
  const containerRef = useRef(null);

  // Flatten the grouped data if needed, or handle flat list
  // Assuming items is structure: [{ type: 'header', ... }, { type: 'item', ... }]

  const totalHeight = items.length * itemHeight; // Simplified estimation

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setViewHeight(el.clientHeight || 600);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Determine range to render
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 5);
  const endIndex = Math.min(items.length, Math.ceil((scrollTop + viewHeight) / itemHeight) + 5);

  const visibleItems = useMemo(() => {
    const visible = [];
    for (let i = startIndex; i < endIndex; i++) {
      visible.push({
        index: i,
        data: items[i],
        offset: i * itemHeight
      });
    }
    return visible;
  }, [items, startIndex, endIndex, itemHeight]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`overflow-y-auto relative custom-scrollbar ${className}`}
      style={{ height: containerHeight }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ index, data, offset }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${offset}px)`,
            }}
          >
            {renderItem(data, index)}
          </div>
        ))}
      </div>
    </div>
  );
}
