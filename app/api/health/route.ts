import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { cacheManager } from '@/lib/cache/manager';

export async function GET() {
  const services = {
    supabase: false,
    claude: false,
    redis: false,
  };

  // Check Supabase
  try {
    const { data, error } = await supabase
      .from('products')
      .select('count', { count: 'exact', head: true });

    if (!error) {
      services.supabase = true;
    }
  } catch (error) {
    console.error('Supabase check failed:', error);
  }

  // Check Claude API
  try {
    const claudeKey = process.env.CLAUDE_API_KEY;
    services.claude = !!claudeKey;
  } catch (error) {
    console.error('Claude check failed:', error);
  }

  // Check Redis
  try {
    const size = await cacheManager.size();
    services.redis = true;
  } catch (error) {
    console.error('Redis check failed:', error);
  }

  return NextResponse.json({
    status: 'ok',
    services,
    timestamp: new Date().toISOString(),
  });
}
