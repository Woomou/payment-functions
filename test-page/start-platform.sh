#!/bin/bash

# Payment Test Platform Startup Script
# 支付测试平台启动脚本

set -e

echo "🚀 启动支付测试平台..."
echo "================================"

# 检查依赖
check_dependencies() {
    echo "📋 检查依赖项..."
    
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python3 未安装，请先安装 Python3"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ NPM 未安装，请先安装 Node.js 和 NPM"
        exit 1
    fi
    
    echo "✅ 依赖检查完成"
}

# 启动后端服务
start_backend() {
    echo "🔧 启动 Python 后端服务..."
    cd backend
    python3 server.py &
    BACKEND_PID=$!
    echo "📌 后端服务 PID: $BACKEND_PID"
    echo "🌐 后端地址: http://localhost:3001"
    cd ..
}

# 安装前端依赖并启动
start_frontend() {
    echo "⚛️  启动 React Next.js 前端..."
    cd frontend
    
    if [ ! -d "node_modules" ]; then
        echo "📦 安装前端依赖..."
        npm install lucide-react --save
    fi
    
    echo "🌟 启动前端开发服务器..."
    npm run dev &
    FRONTEND_PID=$!
    echo "📌 前端服务 PID: $FRONTEND_PID"
    echo "🌐 前端地址: http://localhost:3002"
    cd ..
}

# 清理函数
cleanup() {
    echo ""
    echo "🛑 正在停止服务..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        echo "⚰️  后端服务已停止"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        echo "⚰️  前端服务已停止"
    fi
    echo "👋 再见！"
    exit 0
}

# 捕获中断信号
trap cleanup INT TERM

# 主函数
main() {
    check_dependencies
    echo ""
    start_backend
    sleep 2
    start_frontend
    
    echo ""
    echo "🎉 支付测试平台已启动！"
    echo "================================"
    echo "📊 前端界面: http://localhost:3002"
    echo "🔧 后端 API: http://localhost:3001"
    echo "🩺 健康检查: http://localhost:3001/health"
    echo ""
    echo "💡 提示:"
    echo "   - 先选择支付方式（PayPal 或 Stripe）"
    echo "   - 再选择环境（Sandbox 或 Live）"
    echo "   - 设置支付金额和货币"
    echo "   - 点击支付按钮进行测试"
    echo ""
    echo "🛑 按 Ctrl+C 停止所有服务"
    echo "================================"
    
    # 等待用户中断
    while true; do
        sleep 1
    done
}

# 检查是否在正确目录
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ 请在 test-page 目录下运行此脚本"
    echo "📁 当前目录应包含 backend/ 和 frontend/ 文件夹"
    exit 1
fi

main