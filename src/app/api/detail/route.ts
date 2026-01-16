import { NextResponse } from 'next/server';

import { getAvailableApiSites, getCacheTime } from '@/lib/config';
import { getDetailFromApi, searchFromApi } from '@/lib/downstream';
import { SearchResult } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const sourceCode = searchParams.get('source');
  const title = searchParams.get('title');

  if (!id || !sourceCode) {
    return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
  }

  if (!/^[\w-]+$/.test(id)) {
    return NextResponse.json({ error: '无效的视频ID格式' }, { status: 400 });
  }

  try {
    const apiSites = await getAvailableApiSites();
    const apiSite = apiSites.find((site) => site.key === sourceCode);

    if (!apiSite) {
      return NextResponse.json({ error: '无效的API来源' }, { status: 400 });
    }

    let result;
    try {
      result = await getDetailFromApi(apiSite, id);
    } catch (error) {
      if (title) {
        const trimmed = title.trim();
        const candidates = Array.from(
          new Set([
            trimmed,
            trimmed.split(/[：:]/)[0]?.trim() || '',
            trimmed.split(/[\s\u3000]/)[0]?.trim() || '',
          ])
        ).filter((v) => v.length > 0);

        let exactMatch: SearchResult | undefined;

        for (const q of candidates) {
          const searchData = await searchFromApi(apiSite, q);
          exactMatch = searchData.find(
            (item) => item.source === sourceCode && item.id === id
          );
          if (exactMatch) break;
        }

        if (exactMatch) result = exactMatch;
        else throw error;
      } else {
        throw error;
      }
    }
    const cacheTime = await getCacheTime();

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': `public, max-age=${cacheTime}, s-maxage=${cacheTime}`,
        'CDN-Cache-Control': `public, s-maxage=${cacheTime}`,
        'Vercel-CDN-Cache-Control': `public, s-maxage=${cacheTime}`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
