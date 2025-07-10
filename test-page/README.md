# PayPal Payment Test Page

这是一个最小化的测试网页，用于测试PayPal支付功能是否正常工作。

## 文件结构

```
test-page/
├── index.html              # 基础测试页面 (仅Sandbox)
├── index-switcher.html     # 环境切换测试页面 (Sandbox + Live)
├── server.py               # 简单的HTTP服务器
└── README.md               # 说明文档
```

## 使用方法

### 1. 启动测试服务器

```bash
# 进入test-page目录
cd test-page

# 启动基础测试服务器 (仅Sandbox)
python3 server.py

# 启动环境切换版本服务器 (Sandbox + Live)
python3 server.py --switcher
```

服务器会自动在 `http://localhost:8000` 启动并打开浏览器。

### 页面选择：

1. **基础测试页面** (`index.html`): 仅支持Sandbox环境
2. **环境切换页面** (`index-switcher.html`): 支持Sandbox和Live环境切换

### 2. 配置PayPal环境变量

在使用前，请确保已在Cloudflare Dashboard中配置以下环境变量：

**开发环境变量：**
- `PAYPAL_CLIENT_ID` - 你的PayPal沙盒客户端ID
- `PAYPAL_CLIENT_SECRET` - 你的PayPal沙盒客户端密钥
- `PAYPAL_ENVIRONMENT` - "development"

### 3. 测试流程

现在支持两种支付方式：

#### 方式1：PayPal JavaScript SDK (推荐)
1. **PayPal账户支付**：
   - 输入金额、币种和描述
   - 点击PayPal按钮
   - 使用PayPal账户登录支付
   - 支付完成后自动显示结果

2. **信用卡直接支付**：
   - 输入金额、币种和描述
   - 使用下方的信用卡输入表单
   - 输入测试信用卡信息：
     - 卡号：`4111111111111111` (Visa)
     - 有效期：任何未来日期 (如 `12/25`)
     - CVV：`123`
     - 姓名：任何名字
   - 点击"Submit Payment"按钮
   - 支付完成后自动显示结果

#### 方式2：手动API调用 (备用)
1. **创建订单**：
   - 输入金额、币种和描述
   - 点击"Create PayPal Order"按钮
   - 系统会调用你的Cloudflare Worker创建PayPal订单

2. **PayPal批准**：
   - 会自动打开PayPal沙盒登录页面
   - 使用PayPal沙盒测试账户登录并批准支付

3. **捕获支付**：
   - 回到测试页面，点击"Capture Payment"按钮
   - 系统会调用你的Worker捕获支付

## 测试账户

你可以使用PayPal沙盒测试账户：
- 买家账户：在PayPal开发者控制台创建
- 卖家账户：你的沙盒商户账户

## 功能特点

- ✅ 简单直观的界面
- ✅ 实时状态显示
- ✅ **完整的PayPal支付流程** (包括信用卡支付)
- ✅ **PayPal JavaScript SDK集成** - 支持信用卡直接支付
- ✅ 详细的订单信息显示
- ✅ 错误处理和用户反馈
- ✅ 支持多种货币
- ✅ 自动开启浏览器
- ✅ 动态更新支付按钮
- ✅ 后端交易记录

## 故障排除

1. **订单创建失败**：
   - 检查Cloudflare Worker的环境变量是否正确设置
   - 确认PayPal客户端ID和密钥是否有效

2. **CardFields不可用**：
   - 确保你的PayPal商户账户支持"Advanced Credit and Debit Card Payments"
   - 检查是否在沙盒环境中正确设置了账户

3. **支付失败**：
   - 使用正确的测试信用卡号码
   - 确保有效期是未来日期
   - 检查CVV格式是否正确

4. **网络错误**：
   - 检查Cloudflare Worker是否正常运行
   - 确认API端点URL是否正确

5. **AXO SDK错误**：
   - 这是PayPal已废弃的功能，现在使用CardFields代替
   - 确保使用最新的PayPal SDK配置

## 注意事项

- 这是开发环境测试，使用PayPal沙盒API
- 不会产生真实的资金交易
- 测试完成后记得关闭服务器(Ctrl+C)