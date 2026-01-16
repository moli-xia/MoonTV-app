import React, { useState, useEffect } from 'react';
import { fullscreenController } from '../utils/fullscreen';
import { Expand, Minimize2 } from 'lucide-react';

interface FullscreenButtonProps {
  className?: string;
  size?: number;
  color?: string;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

export const FullscreenButton: React.FC<FullscreenButtonProps> = ({
  className = '',
  size = 24,
  color = 'currentColor',
  onFullscreenChange
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // 监听全屏状态变化
    const checkFullscreenStatus = () => {
      const status = fullscreenController.isInFullscreen();
      setIsFullscreen(status);
      onFullscreenChange?.(status);
    };

    // 定期检查状态
    const interval = setInterval(checkFullscreenStatus, 1000);
    
    // 初始检查
    checkFullscreenStatus();

    return () => clearInterval(interval);
  }, [onFullscreenChange]);

  const handleClick = async () => {
    try {
      await fullscreenController.toggleFullscreen();
      // 状态会在useEffect中自动更新
    } catch (error) {
      console.error('全屏按钮点击失败:', error);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`fullscreen-button ${className}`}
      aria-label={isFullscreen ? '退出全屏' : '进入全屏'}
      title={isFullscreen ? '退出全屏' : '进入全屏'}
    >
      {isFullscreen ? (
        <Minimize2 size={size} color={color} />
      ) : (
        <Expand size={size} color={color} />
      )}
    </button>
  );
};

export default FullscreenButton;
