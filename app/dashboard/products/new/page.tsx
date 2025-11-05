'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { CreateProductForm } from '@/types';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateProductForm>({
    name: '',
    description: '',
    type: 'B2C',
    category: '',
    target_markets: ['US'],
    target_languages: ['en-US'],
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMarketChange = (market: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      target_markets: checked
        ? [...prev.target_markets, market]
        : prev.target_markets.filter(m => m !== market),
    }));
  };

  const handleLanguageChange = (lang: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      target_languages: checked
        ? [...prev.target_languages, lang]
        : prev.target_languages.filter(l => l !== lang),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.type) {
      setError('Name and Type are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create product');
      }

      router.push('/dashboard/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const markets = ['US', 'EU', 'UK', 'APAC', 'China'];
  const languages = [
    { code: 'en-US', label: 'English (US)' },
    { code: 'en-GB', label: 'English (UK)' },
    { code: 'zh-CN', label: 'Chinese (Simplified)' },
    { code: 'fr-FR', label: 'French' },
    { code: 'de-DE', label: 'German' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard/products"
          className="text-blue-600 hover:underline"
        >
          ← Back to Products
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-6">Create New Product</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., AutoMarketing Pro"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              placeholder="Describe your product..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="B2C">B2C (Business to Consumer)</option>
              <option value="B2B">B2B (Business to Business)</option>
              <option value="B2B2C">B2B2C (Business to Business to Consumer)</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <input
              type="text"
              name="category"
              value={formData.category || ''}
              onChange={handleChange}
              placeholder="e.g., SaaS, AI, Marketing Tools"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* Target Markets */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Target Markets
            </label>
            <div className="space-y-2">
              {markets.map(market => (
                <label key={market} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.target_markets.includes(market)}
                    onChange={e =>
                      handleMarketChange(market, e.target.checked)
                    }
                    className="w-4 h-4"
                    disabled={loading}
                  />
                  <span className="ml-2 text-gray-700">{market}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Target Languages */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Target Languages
            </label>
            <div className="space-y-2">
              {languages.map(lang => (
                <label key={lang.code} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.target_languages.includes(lang.code)}
                    onChange={e =>
                      handleLanguageChange(lang.code, e.target.checked)
                    }
                    className="w-4 h-4"
                    disabled={loading}
                  />
                  <span className="ml-2 text-gray-700">{lang.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
            <Link
              href="/dashboard/products"
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
