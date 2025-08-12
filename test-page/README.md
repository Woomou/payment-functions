# Payment Test Platform

统一支付测试平台 - 支持 PayPal 和 Stripe 的前后端分离架构

## 📁 项目结构

```
test-page/
├── backend/                 # Python 后端服务
│   └── server.py           # Flask-like HTTP 服务器
├── frontend/               # React Next.js 前端
│   ├── src/app/page.tsx   # 主支付页面
│   ├── package.json       # 前端依赖配置
│   └── ...                # Next.js 标准结构
├── start-platform.sh      # 一键启动脚本
├── unified-payment.html   # 旧版统一页面 (已废弃)
├── index.html             # PayPal 单独测试页
├── stripe.html            # Stripe 单独测试页
└── README.md              # 项目文档
```

## 🚀 快速启动

### 方式一：一键启动（推荐）
```bash
cd /Users/harryneo/re8ch/payment-functions/test-page
./start-platform.sh
```

### 方式二：手动启动

1. **启动后端服务**
```bash
cd backend
python3 server.py
# 后端运行在 http://localhost:3001
```

2. **启动前端服务**
```bash
cd frontend
npm install lucide-react
npm run dev
# 前端运行在 http://localhost:3000
```

## 🎯 功能特点

### 用户体验优化
- **先选择支付方式，再选择环境** - 符合用户决策流程
- **使用 Lucide React 图标** - 专业、现代的图标库
- **响应式设计** - 支持桌面和移动设备
- **清晰的视觉层次** - 渐变色彩和卡片式布局

### 技术架构
- **前端**: React 19 + Next.js 15 + TypeScript + Tailwind CSS
- **后端**: Python 3 原生 HTTP 服务器
- **图标**: Lucide React (替代 emoji)
- **通信**: RESTful API

### 支付功能
- **PayPal 集成** - 支持订单创建和捕获
- **Stripe 集成** - 支持支付意图创建和确认
- **环境切换** - Sandbox/Live 环境一键切换
- **多货币支持** - USD, EUR, GBP, CNY

## 🛠️ API 端点

### 后端服务 (http://localhost:3001)

#### 健康检查
```
GET /health
```

#### PayPal API
```
POST /api/paypal/create-order
POST /api/paypal/capture-order
```

#### Stripe API
```
POST /api/stripe/create-payment-intent
POST /api/stripe/confirm-payment
```

## 🎨 UI 设计改进

### 原有问题
- UI 布局混乱
- 环境选择和支付方式选择顺序不合理
- 使用 emoji 图标不够专业

### 改进方案
1. **重新设计用户流程**
   - 首页显示支付方式选择
   - 选择后进入配置页面，再选择环境
   
2. **专业图标系统**
   - 使用 Lucide React 图标库
   - 统一的图标风格和大小

3. **现代化界面**
   - 渐变背景和阴影效果
   - 清晰的卡片式布局
   - 响应式网格系统

## 📋 使用说明

1. **访问前端界面**: http://localhost:3000
2. **选择支付方式**: 点击 PayPal 或 Stripe 卡片
3. **配置支付参数**:
   - 环境: Sandbox (测试) / Live (生产)
   - 金额: 自定义支付金额
   - 货币: 支持多种货币
4. **执行测试**: 点击支付按钮
5. **查看结果**: 右侧面板显示测试结果

## 🔧 开发说明

### 前端开发
- 基于 Next.js 15 App Router
- TypeScript 严格模式
- Tailwind CSS 样式系统
- 客户端状态管理

### 后端开发
- Python 3 原生 HTTP 服务器
- CORS 跨域支持
- JSON API 接口
- 错误处理和日志

## 📊 测试环境

- **开发环境**: Sandbox 模式，用于测试
- **生产环境**: Live 模式，真实支付
- **本地开发**: 使用 mock 数据进行测试

## 🛡️ 注意事项

- 确保 Python 3 和 Node.js 已安装
- 生产环境需要配置真实的 PayPal 和 Stripe API 密钥
- 注意 API 密钥的安全管理
- 建议在生产环境使用 HTTPS

## 🤝 支持

如需帮助，请查看：
- 后端健康检查: http://localhost:3001/health
- 浏览器开发者工具网络面板
- 服务器终端日志输出