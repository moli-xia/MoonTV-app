/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import React from 'react';

interface SelectorOption {
  label: string;
  value: string;
}

interface DoubanSelectorProps {
  type: 'movie' | 'tv' | 'show';
  primarySelection?: string;
  secondarySelection?: string;
  yearSelection?: string;
  sortSelection?: string;
  onPrimaryChange: (value: string) => void;
  onSecondaryChange: (value: string) => void;
  onYearChange?: (value: string) => void;
  onSortChange?: (value: string) => void;
}

const DoubanSelector: React.FC<DoubanSelectorProps> = ({
  type,
  primarySelection,
  secondarySelection,
  yearSelection,
  sortSelection,
  onPrimaryChange,
  onSecondaryChange,
  onYearChange,
  onSortChange,
}) => {
  // 电影的一级选择器选项
  const moviePrimaryOptions: SelectorOption[] = [
    { label: '热门', value: '热门' },
    { label: '全部', value: '全部' },
    { label: '剧情', value: '剧情' },
    { label: '喜剧', value: '喜剧' },
    { label: '爱情', value: '爱情' },
    { label: '动作', value: '动作' },
    { label: '惊悚', value: '惊悚' },
    { label: '犯罪', value: '犯罪' },
    { label: '悬疑', value: '悬疑' },
    { label: '恐怖', value: '恐怖' },
    { label: '科幻', value: '科幻' },
    { label: '奇幻', value: '奇幻' },
    { label: '传记', value: '传记' },
    { label: '战争', value: '战争' },
    { label: '家庭', value: '家庭' },
    { label: '冒险', value: '冒险' },
    { label: '人性', value: '人性' },
    { label: '青春', value: '青春' },
  ];

  // 电影的二级选择器选项
  const movieSecondaryOptions: SelectorOption[] = [
    { label: '全部', value: '全部' },
    { label: '大陆', value: '大陆' },
    { label: '美国', value: '美国' },
    { label: '香港', value: '香港' },
    { label: '台湾', value: '台湾' },
    { label: '日本', value: '日本' },
    { label: '韩国', value: '韩国' },
    { label: '英国', value: '英国' },
    { label: '法国', value: '法国' },
    { label: '德国', value: '德国' },
    { label: '意大利', value: '意大利' },
    { label: '西班牙', value: '西班牙' },
    { label: '印度', value: '印度' },
    { label: '泰国', value: '泰国' },
    { label: '俄罗斯', value: '俄罗斯' },
  ];

  // 电视剧选择器选项
  const tvOptions: SelectorOption[] = [
    { label: '全部', value: 'tv' },
    { label: '国产', value: 'tv_domestic' },
    { label: '欧美', value: 'tv_american' },
    { label: '日本', value: 'tv_japanese' },
    { label: '韩国', value: 'tv_korean' },
    { label: '动漫', value: 'tv_animation' },
    { label: '纪录片', value: 'tv_documentary' },
  ];

  // 综艺选择器选项
  const showOptions: SelectorOption[] = [
    { label: '全部', value: 'show' },
    { label: '国内', value: 'show_domestic' },
    { label: '国外', value: 'show_foreign' },
  ];

  // 渲染胶囊式选择器
  const renderCapsuleSelector = (
    options: SelectorOption[],
    activeValue: string | undefined,
    onChange: (value: string) => void,
    keyPrefix: string
  ) => {
    return (
      <div
        className='flex flex-wrap gap-1 bg-gray-200/60 rounded-2xl p-1 dark:bg-gray-700/60 backdrop-blur-sm'
      >
        {options.map((option) => {
          const isActive = activeValue === option.value;
          return (
            <button
              key={`${keyPrefix}-${option.value}`}
              onClick={() => onChange(option.value)}
              className={`relative z-10 px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'bg-white dark:bg-gray-500 text-gray-900 dark:text-gray-100 shadow-sm cursor-default'
                  : 'text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 cursor-pointer'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    );
  };

  const currentYear = new Date().getFullYear();
  const movieYearOptions: SelectorOption[] = [
    { label: '全部', value: '全部' },
    ...Array.from({ length: 10 }, (_, idx) => {
      const year = String(currentYear - idx);
      return { label: year, value: year };
    }),
  ];

  const movieSortOptions: SelectorOption[] = [
    { label: '时间', value: '时间' },
    { label: '人气', value: '人气' },
    { label: '评分', value: '评分' },
  ];

  return (
    <div className='space-y-4 sm:space-y-6'>
      {/* 电影类型 - 显示两级选择器 */}
      {type === 'movie' && (
        <div className='space-y-3 sm:space-y-4'>
          {/* 一级选择器 */}
          <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
            <span className='text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[48px]'>
              分类
            </span>
            <div className='w-full'>
              {renderCapsuleSelector(
                moviePrimaryOptions,
                primarySelection || moviePrimaryOptions[0].value,
                onPrimaryChange,
                'movie-primary'
              )}
            </div>
          </div>

          {/* 二级选择器 */}
          <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
            <span className='text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[48px]'>
              地区
            </span>
            <div className='w-full'>
              {renderCapsuleSelector(
                movieSecondaryOptions,
                secondarySelection || movieSecondaryOptions[0].value,
                onSecondaryChange,
                'movie-secondary'
              )}
            </div>
          </div>

          <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
            <span className='text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[48px]'>
              年份
            </span>
            <div className='w-full'>
              {renderCapsuleSelector(
                movieYearOptions,
                yearSelection || movieYearOptions[0].value,
                (value) => onYearChange?.(value),
                'movie-year'
              )}
            </div>
          </div>

          <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
            <span className='text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[48px]'>
              排序
            </span>
            <div className='w-full'>
              {renderCapsuleSelector(
                movieSortOptions,
                sortSelection || movieSortOptions[0].value,
                (value) => onSortChange?.(value),
                'movie-sort'
              )}
            </div>
          </div>
        </div>
      )}

      {/* 电视剧类型 - 只显示一级选择器 */}
      {type === 'tv' && (
        <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
          <span className='text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[48px]'>
            类型
          </span>
          <div className='w-full'>
            {renderCapsuleSelector(
              tvOptions,
              secondarySelection || tvOptions[0].value,
              onSecondaryChange,
              'tv'
            )}
          </div>
        </div>
      )}

      {/* 综艺类型 - 只显示一级选择器 */}
      {type === 'show' && (
        <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
          <span className='text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[48px]'>
            类型
          </span>
          <div className='w-full'>
            {renderCapsuleSelector(
              showOptions,
              secondarySelection || showOptions[0].value,
              onSecondaryChange,
              'show'
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoubanSelector;
