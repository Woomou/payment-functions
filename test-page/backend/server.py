#!/usr/bin/env python3
"""
Payment Test Platform Backend Server
支持 PayPal 和 Stripe 的统一后端服务
"""

import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, urlparse
import requests
import base64
from datetime import datetime

class PaymentHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """处理 CORS 预检请求"""
        self.send_response(200)
        self.send_headers()
        self.end_headers()

    def do_GET(self):
        """处理 GET 请求"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/health':
            self.send_response(200)
            self.send_headers()
            self.end_headers()
            response = {
                'status': 'healthy',
                'service': 'payment-test-backend',
                'timestamp': datetime.now().isoformat(),
                'endpoints': {
                    'paypal': [
                        'POST /api/paypal/create-order',
                        'POST /api/paypal/capture-order',
                        'GET /api/paypal/order/{order_id}'
                    ],
                    'stripe': [
                        'POST /api/stripe/create-payment-intent',
                        'POST /api/stripe/confirm-payment'
                    ]
                }
            }
            self.wfile.write(json.dumps(response, indent=2).encode())
        else:
            self.send_error(404, 'Endpoint not found')

    def do_POST(self):
        """处理 POST 请求"""
        parsed_path = urlparse(self.path)
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            request_data = json.loads(post_data.decode('utf-8'))
        except json.JSONDecodeError:
            self.send_error(400, 'Invalid JSON')
            return

        if parsed_path.path == '/api/paypal/create-order':
            self.handle_paypal_create_order(request_data)
        elif parsed_path.path == '/api/paypal/capture-order':
            self.handle_paypal_capture_order(request_data)
        elif parsed_path.path == '/api/stripe/create-payment-intent':
            self.handle_stripe_create_payment_intent(request_data)
        elif parsed_path.path == '/api/stripe/confirm-payment':
            self.handle_stripe_confirm_payment(request_data)
        else:
            self.send_error(404, 'API endpoint not found')

    def send_headers(self):
        """发送 CORS 头信息"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Content-Type', 'application/json')

    def handle_paypal_create_order(self, data):
        """处理 PayPal 创建订单请求"""
        try:
            # 这里应该调用实际的 PayPal API
            # 现在返回模拟数据
            response = {
                'id': f'mock_order_{datetime.now().timestamp()}',
                'status': 'CREATED',
                'amount': data.get('amount', 10.00),
                'currency': data.get('currency', 'USD'),
                'environment': data.get('environment', 'sandbox')
            }
            
            self.send_response(200)
            self.send_headers()
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            self.send_error(500, f'PayPal order creation failed: {str(e)}')

    def handle_paypal_capture_order(self, data):
        """处理 PayPal 捕获订单请求"""
        try:
            order_id = data.get('orderID')
            if not order_id:
                self.send_error(400, 'Order ID is required')
                return

            response = {
                'id': order_id,
                'status': 'COMPLETED',
                'timestamp': datetime.now().isoformat(),
                'payer': {
                    'email_address': 'test@example.com',
                    'name': {'given_name': 'Test', 'surname': 'User'}
                }
            }
            
            self.send_response(200)
            self.send_headers()
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            self.send_error(500, f'PayPal order capture failed: {str(e)}')

    def handle_stripe_create_payment_intent(self, data):
        """处理 Stripe 创建支付意图请求"""
        try:
            response = {
                'id': f'pi_mock_{datetime.now().timestamp()}',
                'client_secret': f'pi_mock_{datetime.now().timestamp()}_secret',
                'status': 'requires_payment_method',
                'amount': int(data.get('amount', 1000)),
                'currency': data.get('currency', 'usd').lower(),
                'environment': data.get('environment', 'test')
            }
            
            self.send_response(200)
            self.send_headers()
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            self.send_error(500, f'Stripe payment intent creation failed: {str(e)}')

    def handle_stripe_confirm_payment(self, data):
        """处理 Stripe 确认支付请求"""
        try:
            payment_intent_id = data.get('payment_intent_id')
            if not payment_intent_id:
                self.send_error(400, 'Payment Intent ID is required')
                return

            response = {
                'id': payment_intent_id,
                'status': 'succeeded',
                'timestamp': datetime.now().isoformat(),
                'amount_received': data.get('amount', 1000)
            }
            
            self.send_response(200)
            self.send_headers()
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            self.send_error(500, f'Stripe payment confirmation failed: {str(e)}')

def run_server(port=3001):
    """启动后端服务器"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, PaymentHandler)
    
    print(f'Payment Backend Server started on port {port}')
    print(f'Health check: http://localhost:{port}/health')
    print(f'API Endpoints:')
    print(f'  PayPal: http://localhost:{port}/api/paypal/*')
    print(f'  Stripe: http://localhost:{port}/api/stripe/*')
    print('Press Ctrl+C to stop the server')
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\nServer stopped')
        httpd.server_close()

if __name__ == '__main__':
    import sys
    port = 3001
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print('Invalid port number')
            sys.exit(1)
    
    run_server(port)