import { NextResponse } from 'next/server';

import { getCacheTime } from '@/lib/config';
import { DoubanItem, DoubanResult } from '@/lib/types';

interface DoubanCategoryApiResponse {
  total: number;
  items: Array<{
    id: string;
    title: string;
    card_subtitle: string;
    pic: {
      large: string;
      normal: string;
    };
    rating: {
      value: number;
    };
  }>;
}

interface DoubanSubjectCollectionApiResponse {
  total: number;
  subject_collection_items: Array<{
    id: string;
    title: string;
    card_subtitle?: string;
    cover?: {
      url?: string;
    };
    cover_url?: string;
    pic?: {
      large?: string;
      normal?: string;
    };
    rating?: {
      value?: number;
    };
  }>;
}

async function fetchDoubanData(
  url: string,
  extraHeaders: Record<string, string> = {}
): Promise<unknown> {
  // 添加超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

  // 设置请求选项，包括信号和头部
  const fetchOptions = {
    signal: controller.signal,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      Referer: 'https://movie.douban.com/',
      Accept: 'application/json, text/plain, */*',
      Origin: 'https://movie.douban.com',
      ...extraHeaders,
    },
  };

  try {
    // 尝试直接访问豆瓣API
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // 获取参数
  const kind = searchParams.get('kind') || 'movie';
  const category = searchParams.get('category');
  const type = searchParams.get('type');
  const year = searchParams.get('year');
  const sort = searchParams.get('sort');
  const pageLimit = parseInt(searchParams.get('limit') || '20');
  const pageStart = parseInt(searchParams.get('start') || '0');

  // 验证参数
  if (!kind || !category || !type) {
    return NextResponse.json(
      { error: '缺少必要参数: kind 或 category 或 type' },
      { status: 400 }
    );
  }

  if (!['tv', 'movie'].includes(kind)) {
    return NextResponse.json(
      { error: 'kind 参数必须是 tv 或 movie' },
      { status: 400 }
    );
  }

  if (pageLimit < 1 || pageLimit > 100) {
    return NextResponse.json(
      { error: 'pageSize 必须在 1-100 之间' },
      { status: 400 }
    );
  }

  if (pageStart < 0) {
    return NextResponse.json(
      { error: 'pageStart 不能小于 0' },
      { status: 400 }
    );
  }

  const movieGenresFromSelector = new Set([
    '剧情',
    '喜剧',
    '爱情',
    '动作',
    '惊悚',
    '犯罪',
    '悬疑',
    '恐怖',
    '科幻',
    '奇幻',
    '传记',
    '战争',
    '家庭',
    '冒险',
    '人性',
    '青春',
  ]);
  const movieRegionsFromSelector = new Set([
    '全部',
    '大陆',
    '美国',
    '香港',
    '台湾',
    '日本',
    '韩国',
    '英国',
    '法国',
    '德国',
    '意大利',
    '西班牙',
    '印度',
    '泰国',
    '俄罗斯',
  ]);
  const currentYear = new Date().getFullYear();
  const movieYearsFromSelector = new Set(
    Array.from({ length: 10 }, (_, idx) => String(currentYear - idx))
  );

  const isMovieTagsFilter =
    kind === 'movie' &&
    (category === '全部' || movieGenresFromSelector.has(category)) &&
    movieRegionsFromSelector.has(type) &&
    (!year || year === '全部' || movieYearsFromSelector.has(year));

  const tags = isMovieTagsFilter
    ? [category === '全部' ? null : category, type === '全部' ? null : type].filter(
        (v): v is string => Boolean(v)
      )
    : [];
  const yearRange =
    isMovieTagsFilter && year && year !== '全部' ? `${year},${year}` : null;
  const sortValue =
    sort === '人气'
      ? 'U'
      : sort === '评分'
        ? 'S'
        : sort === '时间'
          ? 'T'
          : sort && ['T', 'U', 'S', 'R'].includes(sort)
            ? sort
            : 'T';

  const isMovieSubjectCollection = kind === 'movie' && category.startsWith('movie_');
  const target = isMovieSubjectCollection
    ? `https://m.douban.com/rexxar/api/v2/subject_collection/${category}/items?start=${pageStart}&count=${pageLimit}`
    : isMovieTagsFilter
      ? (() => {
          const sp = new URLSearchParams({
            sort: sortValue,
            range: '0,10',
            tags: tags.join(','),
            start: String(pageStart),
            count: String(pageLimit),
          });
          if (yearRange) {
            sp.set('year_range', yearRange);
          }
          return `https://movie.douban.com/j/new_search_subjects?${sp}`;
        })()
      : `https://m.douban.com/rexxar/api/v2/subject/recent_hot/${kind}?start=${pageStart}&limit=${pageLimit}&category=${category}&type=${type}`;

  try {
    // 调用豆瓣 API
    const doubanData = await fetchDoubanData(
      target,
      isMovieTagsFilter ? { Referer: 'https://movie.douban.com/explore' } : {}
    );

    // 转换数据格式
    const list: DoubanItem[] =
      isMovieSubjectCollection
      ? (doubanData as DoubanSubjectCollectionApiResponse).subject_collection_items.map(
          (item) => ({
            id: item.id,
            title: item.title,
            poster:
              item.pic?.normal ||
              item.pic?.large ||
              item.cover?.url ||
              item.cover_url ||
              '',
            rate:
              item.rating?.value !== undefined
                ? Number(item.rating.value).toFixed(1)
                : '',
            year: item.card_subtitle?.match(/(\d{4})/)?.[1] || '',
          })
        )
      : isMovieTagsFilter
        ? (doubanData as { data: Array<{ id: string; title: string; cover: string; rate: string }> }).data
            .slice(0, pageLimit)
            .map((item) => ({
              id: item.id,
              title: item.title,
              poster: item.cover,
              rate: item.rate,
              year: year && year !== '全部' ? year : '',
            }))
        : (doubanData as DoubanCategoryApiResponse).items.map((item) => ({
            id: item.id,
            title: item.title,
            poster: item.pic?.normal || item.pic?.large || '',
            rate: item.rating?.value ? item.rating.value.toFixed(1) : '',
            year: item.card_subtitle?.match(/(\d{4})/)?.[1] || '',
          }));

    const response: DoubanResult = {
      code: 200,
      message: '获取成功',
      list: list,
    };

    const cacheTime = await getCacheTime();
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': `public, max-age=${cacheTime}, s-maxage=${cacheTime}`,
        'CDN-Cache-Control': `public, s-maxage=${cacheTime}`,
        'Vercel-CDN-Cache-Control': `public, s-maxage=${cacheTime}`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: '获取豆瓣数据失败', details: (error as Error).message },
      { status: 500 }
    );
  }
}
