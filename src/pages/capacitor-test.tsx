import React, { useState } from 'react';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { StatusBar } from '@capacitor/status-bar';

const CapacitorTest: React.FC = () => {
  const [status, setStatus] = useState<string>('准备测试');
  const [isLandscape, setIsLandscape] = useState<boolean>(false);

  const testScreenOrientation = async () => {
    try {
      setStatus('测试屏幕方向锁定...');
      
      if (!isLandscape) {
        // 锁定横屏
        await ScreenOrientation.lock({ orientation: 'landscape' });
        setStatus('✅ 横屏锁定成功');
        setIsLandscape(true);
        
        // 隐藏状态栏
        try {
          await StatusBar.hide();
          setStatus('✅ 横屏锁定成功，状态栏已隐藏');
        } catch (e) {
          setStatus('✅ 横屏锁定成功，但状态栏隐藏失败');
        }
      } else {
        // 解锁屏幕方向
        await ScreenOrientation.unlock();
        setStatus('✅ 屏幕方向解锁成功');
        setIsLandscape(false);
        
        // 显示状态栏
        try {
          await StatusBar.show();
          setStatus('✅ 屏幕方向解锁成功，状态栏已显示');
        } catch (e) {
          setStatus('✅ 屏幕方向解锁成功，但状态栏显示失败');
        }
      }
    } catch (error) {
      console.error('屏幕方向测试失败:', error);
      setStatus(`❌ 测试失败: ${error}`);
    }
  };

  const getCurrentOrientation = async () => {
    try {
      const orientation = await ScreenOrientation.orientation();
      setStatus(`当前屏幕方向: ${orientation.type}`);
    } catch (error) {
      setStatus(`获取屏幕方向失败: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Capacitor插件测试</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold text-blue-800 mb-2">测试状态</h2>
            <p className="text-blue-700">{status}</p>
          </div>
          
          <button
            onClick={testScreenOrientation}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            {isLandscape ? '解锁屏幕方向' : '锁定横屏'}
          </button>
          
          <button
            onClick={getCurrentOrientation}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            获取当前屏幕方向
          </button>
          
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">测试说明</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 点击&quot;锁定横屏&quot;按钮测试屏幕旋转功能</li>
              <li>• 如果功能正常，设备应该自动旋转到横屏</li>
              <li>• 状态栏应该隐藏/显示</li>
              <li>• 点击&quot;解锁屏幕方向&quot;恢复正常</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapacitorTest;
