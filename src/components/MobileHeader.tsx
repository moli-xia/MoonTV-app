'use client';

import Link from 'next/link';

import { BackButton } from './BackButton';
import { useSite } from './SiteProvider';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

interface MobileHeaderProps {
  showBackButton?: boolean;
}

const MobileHeader = ({ showBackButton = false }: MobileHeaderProps) => {
  const { siteName } = useSite();
  return (
    <header className='md:hidden w-full bg-white/70 backdrop-blur-xl border-b border-gray-200/50 shadow-sm dark:bg-gray-900/70 dark:border-gray-700/50 mobile-header-safe'>
      {/* 单行布局 - 所有元素在同一水平线 */}
      <div className='h-14 flex items-center px-4'>
        {/* 左侧：返回按钮 - 固定宽度确保居中 */}
        <div className='flex items-center gap-2 w-20 justify-start'>
          {showBackButton && <BackButton />}
        </div>

        {/* 中间：Logo - 绝对居中 */}
        <div className='flex-1 flex justify-center'>
          <Link
            href='/'
            className='text-xl font-bold text-green-600 tracking-tight hover:opacity-80 transition-opacity'
          >
            {siteName}
          </Link>
        </div>

        {/* 右侧：主题切换和用户菜单 - 固定宽度确保居中 */}
        <div className='flex items-center gap-2 w-20 justify-end'>
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
