'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setProducts(data.data || []);
      }
    } catch (err) {
      setError('Failed to fetch products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
      } else {
        setError('Failed to delete product');
      }
    } catch (err) {
      setError('Failed to delete product');
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-gray-600 mt-1">
            Manage your products and AI-generated content
          </p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          + New Product
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Products List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-4">No products yet</p>
          <Link
            href="/dashboard/products/new"
            className="text-blue-600 hover:underline"
          >
            Create your first product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 mt-1">{product.description}</p>
                  <div className="flex gap-4 mt-4 text-sm text-gray-500">
                    <span>Type: {product.type}</span>
                    <span>
                      Markets: {product.target_markets.join(', ') || 'N/A'}
                    </span>
                    <span>
                      Languages: {product.target_languages.join(', ') || 'en-US'}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : product.status === 'paused'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {product.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link
                    href={`/dashboard/products/${product.id}`}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
