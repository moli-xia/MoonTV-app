import React, { useState } from 'react';
import FullscreenButton from '../components/FullscreenButton';
import '../styles/fullscreen.css';

const FullscreenDemo: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className={`min-h-screen bg-gray-100 ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          全屏播放演示
        </h1>
        
        <div className="max-w-4xl mx-auto">
          {/* 视频播放器区域 */}
          <div className="bg-black rounded-lg overflow-hidden mb-6 relative">
            <div className="aspect-video bg-gray-800 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-6xl mb-4">🎬</div>
                <p className="text-lg">视频播放区域</p>
                <p className="text-sm text-gray-400 mt-2">
                  点击右下角的全屏按钮进入横屏全屏模式
                </p>
              </div>
            </div>
            
            {/* 全屏按钮 */}
            <div className="absolute bottom-4 right-4">
              <FullscreenButton
                size={32}
                color="white"
                onFullscreenChange={setIsFullscreen}
              />
            </div>
          </div>
          
          {/* 说明文字 */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">功能说明</h2>
            <ul className="space-y-2 text-gray-700">
              <li>• 点击全屏按钮进入横屏全屏模式</li>
              <li>• 全屏模式下自动锁定横屏方向</li>
              <li>• 隐藏状态栏和导航栏</li>
              <li>• 支持触摸手势控制</li>
              <li>• 再次点击退出全屏模式</li>
            </ul>
          </div>
          
          {/* 当前状态显示 */}
          <div className="mt-6 text-center">
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
              isFullscreen 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              当前状态: {isFullscreen ? '全屏模式' : '普通模式'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullscreenDemo;
