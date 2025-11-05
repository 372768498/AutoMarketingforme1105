'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [status, setStatus] = useState<{
    supabase: boolean;
    claude: boolean;
    redis: boolean;
  }>({
    supabase: false,
    claude: false,
    redis: false,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        setStatus(data.services);
      } catch (error) {
        console.error('Failed to check status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to AutoMarketing Pro
        </h1>
        <p className="text-xl mb-6">
          AI-driven global marketing automation system for your products
        </p>
        <div className="flex gap-4">
          <Link
            href="/dashboard/products"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
          >
            Go to Dashboard
          </Link>
          <a
            href="#status"
            className="border-2 border-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Check Status
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">📊 Product Management</h3>
          <p className="text-gray-600">
            Manage multiple products across different markets and languages
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">🤖 AI Analysis</h3>
          <p className="text-gray-600">
            Generate user personas and market insights automatically with AI
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">✍️ Content Generation</h3>
          <p className="text-gray-600">
            Create optimized marketing content for multiple platforms
          </p>
        </div>
      </section>

      {/* Status Section */}
      <section id="status" className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">System Status</h2>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="spinner"></div>
            <span className="ml-3 text-gray-600">Checking services...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${status.supabase ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="font-semibold">Supabase</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {status.supabase ? '✅ Connected' : '❌ Disconnected'}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${status.claude ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="font-semibold">Claude API</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {status.claude ? '✅ Working' : '❌ Not configured'}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${status.redis ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="font-semibold">Redis Cache</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {status.redis ? '✅ Connected' : '⚠️ Optional'}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Quick Start */}
      <section className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
        <h2 className="text-xl font-bold mb-4">Quick Start</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Configure your environment variables in `.env.local`</li>
          <li>Create a Supabase project and initialize the database</li>
          <li>Add your API keys (Claude, OpenAI, Redis)</li>
          <li>Go to <Link href="/dashboard/products" className="text-blue-600 hover:underline">Products</Link> to start managing your products</li>
          <li>Generate user personas and market analysis with AI</li>
        </ol>
      </section>
    </div>
  );
}
