import { ScreenOrientation } from '@capacitor/screen-orientation';
import { StatusBar } from '@capacitor/status-bar';

export class FullscreenController {
  private isFullscreen = false;

  /**
   * 切换全屏模式
   */
  async toggleFullscreen() {
    try {
      if (this.isFullscreen) {
        await this.exitFullscreen();
      } else {
        await this.enterFullscreen();
      }
    } catch (error) {
      console.error('全屏切换失败:', error);
    }
  }

  /**
   * 进入全屏模式
   */
  async enterFullscreen() {
    try {
      // 锁定为横屏
      await ScreenOrientation.lock({ orientation: 'landscape' });
      
      // 隐藏状态栏
      await StatusBar.hide();
      
      // 设置全屏样式
      document.documentElement.style.setProperty('--vh', '100vh');
      document.body.classList.add('fullscreen-mode');
      
      this.isFullscreen = true;
      console.log('已进入全屏模式');
    } catch (error) {
      console.error('进入全屏模式失败:', error);
    }
  }

  /**
   * 退出全屏模式
   */
  async exitFullscreen() {
    try {
      // 解锁屏幕方向
      await ScreenOrientation.unlock();
      
      // 显示状态栏
      await StatusBar.show();
      
      // 移除全屏样式
      document.body.classList.remove('fullscreen-mode');
      
      this.isFullscreen = false;
      console.log('已退出全屏模式');
    } catch (error) {
      console.error('退出全屏模式失败:', error);
    }
  }

  /**
   * 检查当前是否为全屏模式
   */
  isInFullscreen(): boolean {
    return this.isFullscreen;
  }

  /**
   * 获取当前屏幕方向
   */
  async getCurrentOrientation(): Promise<string> {
    try {
      const result = await ScreenOrientation.orientation();
      return result.type;
    } catch (error) {
      console.error('获取屏幕方向失败:', error);
      return 'unknown';
    }
  }
}

// 创建全局实例
export const fullscreenController = new FullscreenController();

// 监听屏幕方向变化
ScreenOrientation.addListener('screenOrientationChange', (orientation) => {
  console.log('屏幕方向变化:', orientation);
});

// 导出便捷函数
export const toggleFullscreen = () => fullscreenController.toggleFullscreen();
export const enterFullscreen = () => fullscreenController.enterFullscreen();
export const exitFullscreen = () => fullscreenController.exitFullscreen();
export const isFullscreen = () => fullscreenController.isInFullscreen();
