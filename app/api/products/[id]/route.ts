import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { cacheManager } from '@/lib/cache/manager';
import type { UpdateProductForm } from '@/types';

// GET single product
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 尝试从缓存获取
    const cacheKey = `product:${id}`;
    const cached = await cacheManager.get(cacheKey);
    if (cached) {
      return NextResponse.json({ data: cached });
    }

    const { data, error } = await supabaseServer
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // 缓存结果（1小时）
    await cacheManager.set(cacheKey, data, 3600);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('GET /api/products/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH update product
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body: UpdateProductForm = await req.json();

    const { data, error } = await supabaseServer
      .from('products')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // 清空相关缓存
    await cacheManager.delete(`product:${id}`);
    await cacheManager.deletePattern('products:list:*');

    return NextResponse.json({ data });
  } catch (error) {
    console.error('PATCH /api/products/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { error } = await supabaseServer
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // 清空相关缓存
    await cacheManager.delete(`product:${id}`);
    await cacheManager.deletePattern('products:list:*');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/products/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
