#!/usr/bin/env python3
"""
Simple HTTP server for testing payment integrations (PayPal and Stripe)
"""

import http.server
import socketserver
import webbrowser
import os
import argparse

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def start_server(page="paypal"):
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🚀 Test server running at http://localhost:{PORT}")

        if page == "switcher":
            print(f"📝 PayPal Environment Switcher: http://localhost:{PORT}/index-switcher.html")
            print("🔄 Switch between Sandbox and Live environments")
            page_url = f"http://localhost:{PORT}/index-switcher.html"
        elif page == "stripe":
            print(f"📝 Stripe Test Page: http://localhost:{PORT}/stripe.html")
            page_url = f"http://localhost:{PORT}/stripe.html"
        else:
            print(f"📝 PayPal Test Page: http://localhost:{PORT}/index.html")
            page_url = f"http://localhost:{PORT}/index.html"

        print("🔧 Press Ctrl+C to stop the server")
        print("")
        print("Available pages:")
        print(f"  • PayPal Basic: http://localhost:{PORT}/index.html")
        print(f"  • PayPal Switcher: http://localhost:{PORT}/index-switcher.html")
        print(f"  • Stripe Test: http://localhost:{PORT}/stripe.html")

        webbrowser.open(page_url)

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Local test page server")
    group = parser.add_mutually_exclusive_group()
    group.add_argument('--switcher', action='store_true', help='Open PayPal environment switcher page')
    group.add_argument('--stripe', action='store_true', help='Open Stripe test page')
    args = parser.parse_args()

    if args.switcher:
        start_server("switcher")
    elif args.stripe:
        start_server("stripe")
    else:
        start_server("paypal")
