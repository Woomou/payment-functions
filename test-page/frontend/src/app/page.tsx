'use client';

import { useState } from 'react';
import { CreditCard, DollarSign, Settings, Shield, CheckCircle } from 'lucide-react';

type PaymentProvider = 'paypal' | 'stripe';
type Environment = 'sandbox' | 'live';

export default function PaymentTestPlatform() {
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
  const [environment, setEnvironment] = useState<Environment>('sandbox');
  const [amount, setAmount] = useState(10.00);
  const [currency, setCurrency] = useState('USD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleProviderSelect = (provider: PaymentProvider) => {
    setSelectedProvider(provider);
    setResult(null);
  };

  const handlePayment = async () => {
    if (!selectedProvider) return;

    setIsProcessing(true);
    setResult(null);

    try {
      const backendUrl = 'http://localhost:3001';
      const endpoint = selectedProvider === 'paypal' 
        ? '/api/paypal/create-order'
        : '/api/stripe/create-payment-intent';

      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedProvider === 'stripe' ? amount * 100 : amount,
          currency: currency.toLowerCase(),
          environment
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetFlow = () => {
    setSelectedProvider(null);
    setResult(null);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Payment Test Platform
          </h1>
          <p className="text-gray-600">
            统一支付测试平台 - 支持 PayPal 和 Stripe
          </p>
        </header>

        {!selectedProvider ? (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              选择支付方式
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div
                onClick={() => handleProviderSelect('paypal')}
                className="group cursor-pointer bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-8 text-white hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
              >
                <div className="flex items-center justify-center mb-4">
                  <DollarSign size={48} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-center mb-2">PayPal</h3>
                <p className="text-blue-100 text-center text-sm">
                  全球领先的在线支付平台
                </p>
                <div className="mt-4 flex items-center justify-center">
                  <span className="bg-blue-400 bg-opacity-30 px-3 py-1 rounded-full text-xs">
                    支持多种支付方式
                  </span>
                </div>
              </div>

              <div
                onClick={() => handleProviderSelect('stripe')}
                className="group cursor-pointer bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-8 text-white hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
              >
                <div className="flex items-center justify-center mb-4">
                  <CreditCard size={48} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-center mb-2">Stripe</h3>
                <p className="text-purple-100 text-center text-sm">
                  现代化的支付处理平台
                </p>
                <div className="mt-4 flex items-center justify-center">
                  <span className="bg-purple-400 bg-opacity-30 px-3 py-1 rounded-full text-xs">
                    开发者友好
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                {selectedProvider === 'paypal' ? 'PayPal' : 'Stripe'} 支付测试
              </h2>
              <button
                onClick={resetFlow}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                返回选择
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <Shield size={24} className="text-gray-600" />
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      环境选择
                    </label>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setEnvironment('sandbox')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          environment === 'sandbox'
                            ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Sandbox
                      </button>
                      <button
                        onClick={() => setEnvironment('live')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          environment === 'live'
                            ? 'bg-green-100 text-green-700 border-2 border-green-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Live
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    支付金额
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(parseFloat(e.target.value))}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0.01"
                      step="0.01"
                    />
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CNY">CNY</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-colors ${
                    selectedProvider === 'paypal'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-purple-600 hover:bg-purple-700'
                  } ${
                    isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isProcessing ? '处理中...' : `使用 ${selectedProvider === 'paypal' ? 'PayPal' : 'Stripe'} 支付`}
                </button>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>当前环境: <span className={environment === 'sandbox' ? 'text-orange-600' : 'text-green-600'}>{environment}</span></p>
                  <p>后端服务: http://localhost:3001</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">测试结果</h3>
                <div className="bg-gray-50 rounded-lg p-4 min-h-[200px]">
                  {result ? (
                    <div className="space-y-3">
                      {result.error ? (
                        <div className="text-red-600 text-sm">
                          <strong>错误:</strong> {result.error}
                        </div>
                      ) : (
                        <div className="text-green-600 text-sm">
                          <div className="flex items-center space-x-2 mb-3">
                            <CheckCircle size={16} />
                            <strong>测试成功</strong>
                          </div>
                        </div>
                      )}
                      <pre className="text-xs text-gray-600 bg-white p-3 rounded border overflow-x-auto">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-center py-8">
                      点击支付按钮开始测试
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
