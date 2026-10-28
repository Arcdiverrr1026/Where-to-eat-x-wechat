# Where to Eat - 去哪吃

基于微信原生小程序的校园周边餐厅检索客户端，提供筛选、列表、地图、详情与评价交互。

## 功能特性

### 首页
- 多维度筛选：分类、预算、距离、场景
- 自定义预算范围输入
- 快速导航到推荐列表

### 推荐列表
- 骨架屏加载效果
- 下拉刷新支持
- 情感标签显示（推荐/评价数/吐槽）
- 评价数本地缓存

### 餐厅详情
- 内置地图展示位置
- 用户评价提交与展示
- 404 自动重试机制（最多2次）
- 评价乐观更新

### 地图页
- 全屏地图展示所有餐厅
- 标记点击查看详情
- 筛选功能
- 重新定位支持

## 技术栈

- **前端框架：** 微信小程序原生开发
- **UI 组件：** 自定义组件（5个）
- **后端 API：** FastAPI (https://where-to-eat.fastapicloud.dev)
- **地图服务：** 微信原生 map 组件

## 项目结构

```
├── pages/
│   ├── index/           # 首页
│   ├── recommendations/ # 推荐列表
│   ├── detail/          # 餐厅详情
│   └── map/             # 地图页
├── components/
│   ├── filter-picker/   # 筛选器组件
│   ├── restaurant-card/ # 餐厅卡片
│   ├── review-card/     # 评价卡片
│   ├── star-rating/     # 星级评分
│   └── sentiment-badge/ # 情感标签
├── utils/
│   ├── config.js        # 配置文件（API地址、选项）
│   ├── api.js           # HTTP 请求封装
│   ├── location.js      # 定位工具（5分钟缓存）
│   └── reviewStore.js   # 评价缓存管理
├── static/
│   └── images/          # 图标资源
├── app.js               # 应用入口
├── app.json             # 应用配置
└── app.wxss             # 全局样式
```

## 安装与使用

1. 克隆项目
```bash
git clone git@github.com:Arcdiverrr1026/Where-to-eat-x-wechat.git
```

2. 使用微信开发者工具打开项目

3. 配置 AppID
   - 在 `project.config.json` 中替换为你的 AppID
   - 或使用测试号

4. 运行项目
   - 在微信开发者工具中点击编译即可预览

## 配置说明

### API 配置
在 `utils/config.js` 中配置后端 API 地址：
```javascript
const API_BASE = 'https://where-to-eat.fastapicloud.dev'
```

### 分类选项
```javascript
const CATEGORIES = ['全部', '中餐', '西餐', '日料', '韩餐', '小吃', '饮品']
```

### 预算选项
```javascript
const BUDGETS = ['全部', '0-15元', '15-25元', '25-40元', '40元以上']
// 支持自定义预算范围：budget_min / budget_max
```

## 后端依赖

小程序依赖兼容的餐厅推荐、详情和评价接口，本仓库不包含后端。默认地址只是现有配置，不保证持续可用；使用自己的服务时同步修改 `utils/config.js`，并在微信公众平台配置合法请求域名。

项目与 [Where-To-Eat-](https://github.com/Arcdiverrr1026/Where-To-Eat-) 的 Python 原型接口相关。替换或升级后端时应逐项核对字段及路由兼容性。

## 项目范围

这是校园餐厅应用的微信小程序客户端。评价标签是页面展示信息，不代表经过验证的推荐准确率。运行与发布需要有效的小程序配置、定位授权和可访问的后端服务。
