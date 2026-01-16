/* eslint-disable no-console,react-hooks/exhaustive-deps */

'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getDoubanCategories } from '@/lib/douban.client';
import { DoubanItem } from '@/lib/types';

import DoubanCardSkeleton from '@/components/DoubanCardSkeleton';
import DoubanSelector from '@/components/DoubanSelector';
import PageLayout from '@/components/PageLayout';
import VideoCard from '@/components/VideoCard';

function DoubanPageClient() {
  const searchParams = useSearchParams();
  const [doubanData, setDoubanData] = useState<DoubanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectorsReady, setSelectorsReady] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const requestVersionRef = useRef(0);

  const type = searchParams?.get('type') || 'movie';
  const pageSize = type === 'movie' ? 20 : 25;

  // 选择器状态 - 完全独立，不依赖URL参数
  const [primarySelection, setPrimarySelection] = useState<string>(() => {
    return type === 'movie' ? '热门' : '';
  });
  const [secondarySelection, setSecondarySelection] = useState<string>(() => {
    if (type === 'movie') return '全部';
    if (type === 'tv') return 'tv';
    if (type === 'show') return 'show';
    return '全部';
  });
  const [yearSelection, setYearSelection] = useState<string>(() => {
    return type === 'movie' ? '全部' : '全部';
  });
  const [sortSelection, setSortSelection] = useState<string>(() => {
    return type === 'movie' ? '时间' : '时间';
  });
  const timeCursorYearRef = useRef<number>(new Date().getFullYear());
  const timeCursorStartRef = useRef<number>(0);
  const timeCursorExhaustedRef = useRef<boolean>(false);

  const isMovieTimeCursorMode =
    type === 'movie' && sortSelection === '时间' && yearSelection === '全部';

  // 初始化时标记选择器为准备好状态
  useEffect(() => {
    // 短暂延迟确保初始状态设置完成
    const timer = setTimeout(() => {
      setSelectorsReady(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []); // 只在组件挂载时执行一次

  // type变化时立即重置selectorsReady（最高优先级）
  useEffect(() => {
    setSelectorsReady(false);
    setLoading(true); // 立即显示loading状态
  }, [type]);

  // 当type变化时重置选择器状态
  useEffect(() => {
    // 批量更新选择器状态
    if (type === 'movie') {
      setPrimarySelection('热门');
      setSecondarySelection('全部');
      setYearSelection('全部');
      setSortSelection('时间');
    } else if (type === 'tv') {
      setPrimarySelection('');
      setSecondarySelection('tv');
      setYearSelection('全部');
      setSortSelection('时间');
    } else if (type === 'show') {
      setPrimarySelection('');
      setSecondarySelection('show');
      setYearSelection('全部');
      setSortSelection('时间');
    } else {
      setPrimarySelection('');
      setSecondarySelection('全部');
      setYearSelection('全部');
      setSortSelection('时间');
    }

    // 使用短暂延迟确保状态更新完成后标记选择器准备好
    const timer = setTimeout(() => {
      setSelectorsReady(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [type]);

  // 生成骨架屏数据
  const skeletonData = Array.from({ length: pageSize }, (_, index) => index);

  // 生成API请求参数的辅助函数
  const getRequestParams = useCallback(
    (pageStart: number) => {
      // 当type为tv或show时，kind统一为'tv'，category使用type本身
      if (type === 'tv' || type === 'show') {
        return {
          kind: 'tv' as const,
          category: type,
          type: secondarySelection,
          pageLimit: pageSize,
          pageStart,
        };
      }

      // 电影类型保持原逻辑
      return {
        kind: type as 'tv' | 'movie',
        category: primarySelection,
        type: secondarySelection,
        year: yearSelection,
        sort: sortSelection,
        pageLimit: pageSize,
        pageStart,
      };
    },
    [type, primarySelection, secondarySelection, yearSelection, sortSelection, pageSize]
  );

  const fetchMovieTimeSortedPage = useCallback(
    async (resetCursor: boolean) => {
      let nextYear = resetCursor
        ? new Date().getFullYear()
        : timeCursorYearRef.current;
      let nextStart = resetCursor ? 0 : timeCursorStartRef.current;
      let exhausted = resetCursor ? false : timeCursorExhaustedRef.current;
      const collected: DoubanItem[] = [];

      let safety = 0;
      while (collected.length < pageSize && !exhausted && safety < 200) {
        safety += 1;
        const remaining = pageSize - collected.length;

        const data = await getDoubanCategories({
          kind: 'movie',
          category: primarySelection,
          type: secondarySelection,
          year: String(nextYear),
          sort: sortSelection,
          pageLimit: remaining,
          pageStart: nextStart,
        });

        if (data.code !== 200) {
          throw new Error(data.message || '获取数据失败');
        }

        if (data.list.length > 0) {
          collected.push(...data.list);
        }

        if (data.list.length < remaining) {
          nextYear -= 1;
          nextStart = 0;
          if (nextYear < 1900) {
            exhausted = true;
          }
        } else {
          nextStart += data.list.length;
        }
      }

      return { collected, nextYear, nextStart, exhausted };
    },
    [
      pageSize,
      primarySelection,
      secondarySelection,
      sortSelection,
    ]
  );

  // 防抖的数据加载函数
  const loadInitialData = useCallback(async (requestVersion: number) => {
    try {
      setLoading(true);
      if (isMovieTimeCursorMode) {
        const { collected, nextYear, nextStart, exhausted } =
          await fetchMovieTimeSortedPage(true);
        if (requestVersionRef.current !== requestVersion) return;
        setDoubanData(collected);
        timeCursorYearRef.current = nextYear;
        timeCursorStartRef.current = nextStart;
        timeCursorExhaustedRef.current = exhausted;
        setHasMore(!exhausted && collected.length > 0);
        setLoading(false);
        return;
      }

      const data = await getDoubanCategories(getRequestParams(0));
      if (requestVersionRef.current !== requestVersion) return;

      if (data.code === 200) {
        setDoubanData(data.list);
        setHasMore(
          type === 'movie' ? data.list.length > 0 : data.list.length === pageSize
        );
        setLoading(false);
      } else {
        throw new Error(data.message || '获取数据失败');
      }
    } catch (err) {
      console.error(err);
      if (requestVersionRef.current !== requestVersion) return;
      setDoubanData([]);
      setHasMore(false);
      setLoading(false);
    }
  }, [
    fetchMovieTimeSortedPage,
    getRequestParams,
    isMovieTimeCursorMode,
    pageSize,
    primarySelection,
    secondarySelection,
    sortSelection,
    type,
  ]);

  // 只在选择器准备好后才加载数据
  useEffect(() => {
    // 只有在选择器准备好时才开始加载
    if (!selectorsReady) {
      return;
    }

    // 重置页面状态
    setDoubanData([]);
    setCurrentPage(0);
    setHasMore(true);
    setIsLoadingMore(false);
    timeCursorYearRef.current = new Date().getFullYear();
    timeCursorStartRef.current = 0;
    timeCursorExhaustedRef.current = false;

    requestVersionRef.current += 1;
    const requestVersion = requestVersionRef.current;

    // 清除之前的防抖定时器
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // 使用防抖机制加载数据，避免连续状态更新触发多次请求
    debounceTimeoutRef.current = setTimeout(() => {
      loadInitialData(requestVersion);
    }, 100); // 100ms 防抖延迟

    // 清理函数
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [
    selectorsReady,
    type,
    primarySelection,
    secondarySelection,
    yearSelection,
    sortSelection,
    loadInitialData,
  ]);

  // 单独处理 currentPage 变化（加载更多）
  useEffect(() => {
    if (currentPage > 0) {
      const fetchMoreData = async () => {
        try {
          const requestVersion = requestVersionRef.current;
          setIsLoadingMore(true);

          if (isMovieTimeCursorMode) {
            const { collected, nextYear, nextStart, exhausted } =
              await fetchMovieTimeSortedPage(false);
            if (requestVersionRef.current !== requestVersion) return;
            setDoubanData((prev) => [...prev, ...collected]);
            timeCursorYearRef.current = nextYear;
            timeCursorStartRef.current = nextStart;
            timeCursorExhaustedRef.current = exhausted;
            setHasMore(!exhausted && collected.length > 0);
            return;
          }

          const data = await getDoubanCategories(getRequestParams(currentPage * pageSize));
          if (requestVersionRef.current !== requestVersion) return;

          if (data.code === 200) {
            setDoubanData((prev) => [...prev, ...data.list]);
            setHasMore(
              type === 'movie' ? data.list.length > 0 : data.list.length === pageSize
            );
          } else {
            throw new Error(data.message || '获取数据失败');
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoadingMore(false);
        }
      };

      fetchMoreData();
    }
  }, [
    currentPage,
    fetchMovieTimeSortedPage,
    getRequestParams,
    isMovieTimeCursorMode,
    pageSize,
    primarySelection,
    secondarySelection,
    sortSelection,
    type,
    yearSelection,
  ]);

  // 设置滚动监听
  useEffect(() => {
    // 如果没有更多数据或正在加载，则不设置监听
    if (!hasMore || isLoadingMore || loading) {
      return;
    }

    // 确保 loadingRef 存在
    if (!loadingRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setCurrentPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadingRef.current);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoadingMore, loading]);

  // 处理选择器变化
  const handlePrimaryChange = useCallback(
    (value: string) => {
      // 只有当值真正改变时才设置loading状态
      if (value !== primarySelection) {
        setLoading(true);
        setPrimarySelection(value);
      }
    },
    [primarySelection]
  );

  const handleSecondaryChange = useCallback(
    (value: string) => {
      // 只有当值真正改变时才设置loading状态
      if (value !== secondarySelection) {
        setLoading(true);
        setSecondarySelection(value);
      }
    },
    [secondarySelection]
  );

  const handleYearChange = useCallback(
    (value: string) => {
      if (value !== yearSelection) {
        setLoading(true);
        setYearSelection(value);
      }
    },
    [yearSelection]
  );

  const handleSortChange = useCallback(
    (value: string) => {
      if (value !== sortSelection) {
        setLoading(true);
        setSortSelection(value);
      }
    },
    [sortSelection]
  );

  const getPageTitle = () => {
    // 根据 type 生成标题
    return type === 'movie' ? '电影' : type === 'tv' ? '电视剧' : '综艺';
  };

  const getActivePath = () => {
    const params = new URLSearchParams();
    if (type) params.set('type', type);

    const queryString = params.toString();
    const activePath = `/douban${queryString ? `?${queryString}` : ''}`;
    return activePath;
  };

  return (
    <PageLayout activePath={getActivePath()}>
      <div className='px-4 sm:px-10 py-4 sm:py-8 overflow-visible'>
        {/* 页面标题和选择器 */}
        <div className='mb-6 sm:mb-8 space-y-4 sm:space-y-6'>
          {/* 页面标题 */}
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2 dark:text-gray-200'>
              {getPageTitle()}
            </h1>
            <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400'>
              来自豆瓣的精选内容
            </p>
          </div>

          {/* 选择器组件 */}
          <div className='bg-white/60 dark:bg-gray-800/40 rounded-2xl p-4 sm:p-6 border border-gray-200/30 dark:border-gray-700/30 backdrop-blur-sm'>
            <DoubanSelector
              type={type as 'movie' | 'tv' | 'show'}
              primarySelection={primarySelection}
              secondarySelection={secondarySelection}
              yearSelection={yearSelection}
              sortSelection={sortSelection}
              onPrimaryChange={handlePrimaryChange}
              onSecondaryChange={handleSecondaryChange}
              onYearChange={handleYearChange}
              onSortChange={handleSortChange}
            />
          </div>
        </div>

        {/* 内容展示区域 */}
        <div className='max-w-[95%] mx-auto mt-8 overflow-visible'>
          {/* 内容网格 */}
          <div className='grid grid-cols-3 gap-x-2 gap-y-12 px-0 sm:px-2 sm:grid-cols-[repeat(auto-fit,minmax(160px,1fr))] sm:gap-x-8 sm:gap-y-20'>
            {loading || !selectorsReady
              ? // 显示骨架屏
                skeletonData.map((index) => <DoubanCardSkeleton key={index} />)
              : // 显示实际数据
                doubanData.map((item, index) => (
                  <div key={`${item.title}-${index}`} className='w-full'>
                    <VideoCard
                      from='douban'
                      title={item.title}
                      poster={item.poster}
                      douban_id={item.id}
                      rate={item.rate}
                      year={item.year}
                      type={type === 'movie' ? 'movie' : ''} // 电影类型严格控制，tv 不控
                    />
                  </div>
                ))}
          </div>

          {/* 加载更多指示器 */}
          {hasMore && !loading && (
            <div
              ref={(el) => {
                if (el && el.offsetParent !== null) {
                  (
                    loadingRef as React.MutableRefObject<HTMLDivElement | null>
                  ).current = el;
                }
              }}
              className='flex justify-center mt-12 py-8'
            >
              {isLoadingMore && (
                <div className='flex items-center gap-2'>
                  <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-green-500'></div>
                  <span className='text-gray-600'>加载中...</span>
                </div>
              )}
            </div>
          )}

          {/* 没有更多数据提示 */}
          {!hasMore && doubanData.length > 0 && (
            <div className='text-center text-gray-500 py-8'>已加载全部内容</div>
          )}

          {/* 空状态 */}
          {!loading && doubanData.length === 0 && (
            <div className='text-center text-gray-500 py-8'>
              暂无相关内容，试试更换分类、地区、年份或排序
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default function DoubanPage() {
  return (
    <Suspense>
      <DoubanPageClient />
    </Suspense>
  );
}
