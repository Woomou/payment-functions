# 🚀 统一支付测试平台

这是一个支持 PayPal 和 Stripe 的统一支付测试页面，可以在同一个界面测试两种支付方式，并支持开发和生产环境切换。

## ✨ 功能特性

### 💳 支付方式支持
- **PayPal 支付**
  - PayPal 钱包支付（登录 PayPal 账户）
  - 信用卡直付（无需 PayPal 账户）
  - 支持多种货币：USD, EUR, GBP, CNY

- **Stripe 支付**
  - 信用卡支付（Visa, MasterCard, American Express）
  - 安全的卡片输入组件
  - 实时验证和错误提示

### 🔧 环境管理
- **开发环境 (Sandbox)**
  - PayPal Sandbox API
  - Stripe Test API
  - 测试用信用卡号码

- **生产环境 (Live)**
  - PayPal Live API
  - Stripe Live API
  - 真实交易处理

### 🎨 用户体验
- 响应式设计，支持移动端
- 直观的标签页切换
- 实时状态反馈
- 详细的支付结果显示

## 🚀 快速开始

### 1. 启动测试服务器

```bash
# 进入 test-page 目录
cd test-page

# 启动服务器（默认端口 8000）
python3 server-unified.py

# 或指定端口
python3 server-unified.py 8080
```

### 2. 访问测试页面

- **统一支付页面**: http://localhost:8000/unified
- **PayPal 专用页面**: http://localhost:8000/index.html
- **Stripe 专用页面**: http://localhost:8000/stripe.html

## ⚙️ 配置说明

### PayPal 配置

在 `unified-payment.html` 中更新 PayPal 配置：

```javascript
const PAYPAL_CONFIG = {
    development: {
        clientId: '你的_测试_PAYPAL_CLIENT_ID'
    },
    production: {
        clientId: '你的_生产_PAYPAL_CLIENT_ID'
    }
};
```

### Stripe 配置

在 `unified-payment.html` 中更新 Stripe 配置：

```javascript
const STRIPE_CONFIG = {
    development: {
        publishableKey: 'pk_test_你的_测试_STRIPE_PUBLISHABLE_KEY'
    },
    production: {
        publishableKey: 'pk_live_你的_生产_STRIPE_PUBLISHABLE_KEY'
    }
};
```

### API 端点配置

确保 API 端点配置正确：

```javascript
const API_ENDPOINTS = {
    development: {
        paypal: 'https://paypal-payments-development.realharryscissors.workers.dev',
        stripe: 'https://stripe-payments-development.realharryscissors.workers.dev'
    },
    production: {
        paypal: 'https://paypal-payments-production.realharryscissors.workers.dev',
        stripe: 'https://stripe-payments-production.realharryscissors.workers.dev'
    }
};
```

## 🧪 测试指南

### PayPal 测试

#### 开发环境测试卡号
- **Visa**: `4111111111111111`
- **MasterCard**: `5555555555554444`
- **American Express**: `371449635398431`
- **CVV**: `123` (AmEx 使用 `1234`)
- **有效期**: 任何未来日期（如 `12/25`）

#### PayPal 测试账户
在 PayPal Developer Dashboard 创建测试账户：
- 买家账户：用于支付测试
- 卖家账户：用于接收支付

### Stripe 测试

#### 开发环境测试卡号
- **成功支付**: `4242424242424242`
- **需要验证**: `4000002500003155`
- **被拒绝**: `4000000000000002`
- **CVV**: 任何3位数字
- **有效期**: 任何未来日期

## 📋 使用步骤

1. **选择环境**
   - 开发环境：用于测试，不会产生真实费用
   - 生产环境：真实交易，请谨慎使用

2. **填写支付信息**
   - 金额：输入支付金额
   - 货币：选择支付货币
   - 描述：输入订单描述

3. **选择支付方式**
   - PayPal：点击 PayPal 标签页
   - Stripe：点击 Stripe 标签页

4. **完成支付**
   - PayPal：选择钱包支付或信用卡直付
   - Stripe：输入信用卡信息并支付

5. **查看结果**
   - 支付成功后会显示详细的交易信息
   - 失败时会显示错误信息

## 🔧 故障排除

### 常见问题

1. **PayPal SDK 加载失败**
   - 检查网络连接
   - 确认 Client ID 正确
   - 检查浏览器控制台错误

2. **Stripe 初始化失败**
   - 确认 Publishable Key 正确
   - 检查 Stripe.js 是否加载

3. **API 连接失败**
   - 检查 API 端点是否正确
   - 确认服务器正在运行
   - 检查 CORS 设置

4. **支付失败**
   - 确认使用正确的测试卡号
   - 检查金额和货币设置
   - 查看浏览器控制台错误

### 调试技巧

1. **使用浏览器开发者工具**
   ```javascript
   // 在控制台检查 PayPal 对象
   console.log('PayPal object:', window.paypal);
   
   // 检查 Stripe 对象
   console.log('Stripe object:', window.Stripe);
   ```

2. **测试 API 连接**
   - 点击页面上的"测试 API 连接"按钮
   - 检查网络标签页中的请求响应

3. **查看错误日志**
   - 打开浏览器控制台
   - 查看错误消息和网络请求

## 📚 相关文档

- [PayPal Developer Documentation](https://developer.paypal.com/)
- [Stripe Documentation](https://stripe.com/docs)
- [项目主 README](../README.md)

## 🤝 支持

如果遇到问题，请：
1. 检查浏览器控制台错误
2. 确认配置信息正确
3. 查看网络请求状态
4. 参考官方文档

---

**注意**: 在生产环境中使用前，请确保：
- 已正确配置生产环境的 API 密钥
- 已完成相关的 KYC/合规审核
- 已设置适当的安全措施