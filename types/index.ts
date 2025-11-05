// Product Types
export interface Product {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description?: string;
  slug?: string;
  type: 'B2B' | 'B2C' | 'B2B2C';
  category?: string;
  price_model?: string;
  target_markets: string[];
  target_languages: string[];
  status: 'active' | 'paused' | 'archived';
  metadata?: Record<string, any>;
  total_content_count?: number;
  published_content_count?: number;
  average_engagement_rate?: number;
}

// User Persona Types
export interface UserPersona {
  id: string;
  product_id: string;
  created_at: string;
  updated_at: string;
  persona_name: string;
  demographics: Record<string, any>;
  psychographics: Record<string, any>;
  platforms: string[];
  content_preferences: Record<string, any>;
  buying_triggers: string[];
  ai_insights?: string;
  confidence_score: number;
  version: number;
  is_active: boolean;
}

// Market Analysis Types
export interface MarketAnalysis {
  id: string;
  product_id: string;
  created_at: string;
  market: string;
  trends?: Record<string, any>;
  competitors?: Record<string, any>;
  opportunities?: Record<string, any>;
  keyword_data?: Record<string, any>;
  ai_summary?: string;
  confidence_score: number;
}

// Content Piece Types
export interface ContentPiece {
  id: string;
  product_id: string;
  created_at: string;
  updated_at: string;
  title: string;
  content: string;
  excerpt?: string;
  slug?: string;
  content_type: 'blog' | 'social' | 'email' | 'landing_page' | 'video_script';
  language: string;
  based_on_persona_id?: string;
  based_on_analysis_ids?: string[];
  keywords?: string[];
  meta_description?: string;
  seo_score?: number;
  readability_score?: number;
  status: 'draft' | 'ready' | 'scheduled' | 'published' | 'archived';
  scheduled_date?: string;
  published_date?: string;
  publish_platform?: string;
  publish_url?: string;
  predicted_performance?: Record<string, any>;
  version: number;
  metadata?: Record<string, any>;
}

// AI Task Types
export interface AITask {
  id: string;
  created_at: string;
  updated_at: string;
  task_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  input_data?: Record<string, any>;
  output_data?: Record<string, any>;
  model_used?: string;
  tokens_used?: number;
  cost_usd?: number;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  attempts: number;
  max_attempts: number;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface ListResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  page_size?: number;
}

// Form Types
export interface CreateProductForm {
  name: string;
  description?: string;
  type: 'B2B' | 'B2C' | 'B2B2C';
  category?: string;
  target_markets: string[];
  target_languages: string[];
}

export interface UpdateProductForm {
  name?: string;
  description?: string;
  type?: 'B2B' | 'B2C' | 'B2B2C';
  category?: string;
  target_markets?: string[];
  target_languages?: string[];
  status?: 'active' | 'paused' | 'archived';
}
