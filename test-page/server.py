#!/usr/bin/env python3
"""
Simple HTTP server for testing PayPal payment integration
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def start_server(use_switcher=False):
    # Change to the test-page directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🚀 PayPal All-in-One Test Server running at http://localhost:{PORT}")
        
        if use_switcher:
            print(f"📝 Environment Switcher: http://localhost:{PORT}/index-switcher.html")
            print(f"🔄 Switch between Sandbox and Live environments")
            page_url = f'http://localhost:{PORT}/index-switcher.html'
        else:
            print(f"📝 All-in-One Test Suite: http://localhost:{PORT}/index.html")
            print(f"🧪 Comprehensive PayPal API testing")
            page_url = f'http://localhost:{PORT}/index.html'
        
        print(f"⚠️  Make sure PayPal services are deployed to Cloudflare Workers")
        print(f"🔧 Press Ctrl+C to stop the server")
        print(f"")
        print(f"🎯 Available Test Features:")
        print(f"  ✅ Basic Payment Processing")
        print(f"  ✅ Order Tracking & Management")
        print(f"  ✅ Payment Monitoring & Refunds")
        print(f"  ✅ Webhook Event Simulation")
        print(f"  ✅ API Explorer & Testing")
        print(f"")
        print(f"📄 Available pages:")
        print(f"  • All-in-One Test Suite: http://localhost:{PORT}/index.html")
        print(f"  • Environment Switcher: http://localhost:{PORT}/index-switcher.html")
        print(f"")
        print(f"🌐 Deployed PayPal Services:")
        print(f"  • Development: https://paypal-payments-development.realharryscissors.workers.dev")
        print(f"  • Production: https://paypal-payments-production.realharryscissors.workers.dev")
        
        # Auto-open browser
        webbrowser.open(page_url)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")

if __name__ == "__main__":
    use_switcher = len(sys.argv) > 1 and sys.argv[1] == '--switcher'
    start_server(use_switcher)