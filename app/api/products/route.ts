import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { cacheManager } from '@/lib/cache/manager';
import type { Product, CreateProductForm } from '@/types';

// GET all products
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    // 尝试从缓存获取
    const cacheKey = `products:list:${status || 'all'}`;
    const cached = await cacheManager.get<Product[]>(cacheKey);
    if (cached) {
      return NextResponse.json({ data: cached });
    }

    let query = supabaseServer.from('products').select('*');

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // 缓存结果（1小时）
    await cacheManager.set(cacheKey, data, 3600);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create product
export async function POST(req: NextRequest) {
  try {
    const body: CreateProductForm = await req.json();

    // 验证必填字段
    if (!body.name || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from('products')
      .insert({
        name: body.name,
        description: body.description,
        type: body.type,
        category: body.category,
        target_markets: body.target_markets || [],
        target_languages: body.target_languages || ['en-US'],
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // 清空缓存
    await cacheManager.deletePattern('products:list:*');

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('POST /api/products error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
