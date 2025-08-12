#!/usr/bin/env python3
"""
统一支付测试页面服务器
支持 PayPal 和 Stripe 的本地测试服务器
"""

import http.server
import socketserver
import os
import sys
from urllib.parse import parse_qs
import json

class UnifiedPaymentHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/' or self.path == '/unified':
            # 服务统一支付页面
            self.path = '/unified-payment.html'
        elif self.path == '/paypal':
            # 重定向到 PayPal 部分
            self.send_response(302)
            self.send_header('Location', '/#paypal')
            self.end_headers()
            return
        elif self.path == '/stripe':
            # 重定向到 Stripe 部分
            self.send_response(302)
            self.send_header('Location', '/#stripe')
            self.end_headers()
            return
        elif self.path == '/health':
            # 健康检查
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                'status': 'healthy',
                'service': 'unified-payment-test-server',
                'pages': {
                    'unified': '/unified',
                    'paypal_legacy': '/index.html',
                    'stripe_legacy': '/stripe.html'
                }
            }
            self.wfile.write(json.dumps(response, indent=2).encode())
            return
        
        super().do_GET()
    
    def do_POST(self):
        # 处理配置更新等POST请求
        if self.path == '/config':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                config = json.loads(post_data.decode('utf-8'))
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                
                response = {
                    'status': 'success',
                    'message': 'Configuration updated',
                    'config': config
                }
                self.wfile.write(json.dumps(response).encode())
            except json.JSONDecodeError:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                
                response = {
                    'status': 'error',
                    'message': 'Invalid JSON'
                }
                self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()

def run_server(port=8000):
    """运行统一支付测试服务器"""
    
    # 确保在正确的目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    print(f"🚀 启动统一支付测试服务器...")
    print(f"📁 服务目录: {script_dir}")
    print(f"🌐 服务端口: {port}")
    print()
    print("📋 可用页面:")
    print(f"   🔗 统一支付页面: http://localhost:{port}/unified")
    print(f"   🔗 PayPal 测试页面: http://localhost:{port}/index.html")
    print(f"   🔗 Stripe 测试页面: http://localhost:{port}/stripe.html")
    print(f"   🔗 健康检查: http://localhost:{port}/health")
    print()
    print("💡 提示:")
    print("   - 统一页面支持 PayPal 和 Stripe 双重集成")
    print("   - 可在开发和生产环境间切换")
    print("   - 支持多种货币和支付方式")
    print()
    print("🛑 按 Ctrl+C 停止服务器")
    print("=" * 60)
    
    try:
        with socketserver.TCPServer(("", port), UnifiedPaymentHandler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 服务器已停止")
        sys.exit(0)
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ 端口 {port} 已被占用")
            print(f"💡 尝试使用其他端口: python server-unified.py {port + 1}")
        else:
            print(f"❌ 服务器启动失败: {e}")
        sys.exit(1)

if __name__ == '__main__':
    port = 8000
    
    # 检查命令行参数
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("❌ 无效的端口号")
            sys.exit(1)
    
    run_server(port)