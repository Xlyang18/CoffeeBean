# CoffeeBean

## 项目名称
CoffeeBean

## 项目描述
CoffeeBean 是一个咖啡豆管理应用，帮助用户追踪和管理咖啡豆库存，包括已购买的咖啡豆和愿望单。用户可以记录咖啡豆的名称、价格、重量、风味特征、烘焙日期、购买日期等信息。应用提供养豆期计算、最佳赏味期追踪、剩余可冲泡杯数计算、每杯成本估算等功能。所有数据存储在本地浏览器中，支持数据导出和导入。

## 项目版本
1.0.0

## 相关技术选型
- **前端框架**：React (with TypeScript)
- **构建工具**：Vite
- **样式**：Tailwind CSS, PostCSS
- **数据存储**：IndexedDB (通过自定义 db.ts 实现本地持久化)
- **状态管理**：React Hooks (useState, useEffect)
- **路由**：React Router
- **图表**：Recharts
- **通知**：Sonner
- **包管理**：pnpm
- **其他**：Font Awesome 图标, date-fns 等工具库

## 技术思路
项目采用单页应用 (SPA) 架构，完全运行在浏览器端，无需后端服务器。数据使用 IndexedDB 进行本地存储，确保数据持久化。核心功能围绕咖啡豆实体展开，包括 CRUD 操作、日期计算和统计分析。界面使用响应式设计，支持明暗主题。计算逻辑分离到 utils 目录，便于维护。服务层 (services/storage.ts) 封装数据访问，页面组件聚焦于 UI 渲染和交互。

## 模块构建
项目结构如下：

- **src/components/**：UI 组件
  - BeanCard.tsx：咖啡豆卡片组件，显示详情和状态
  - BeanForm.tsx：咖啡豆表单组件，用于添加/编辑
  - Empty.tsx：空状态组件
  - Navigation.tsx：导航组件
  - StatsCard.tsx：统计卡片组件

- **src/contexts/**：上下文提供者
  - authContext.ts：认证上下文 (若有)

- **src/hooks/**：自定义 Hooks
  - useTheme.ts：主题切换 Hook

- **src/lib/**：核心库
  - db.ts：IndexedDB 封装，提供数据存储操作
  - utils.ts：通用工具函数

- **src/pages/**：页面组件
  - AddBean.tsx：添加咖啡豆页面
  - Dashboard.tsx：仪表盘页面，显示统计和概览
  - Home.tsx：首页
  - PurchasedBeans.tsx：已购买咖啡豆列表
  - Settings.tsx：设置页面
  - WishlistBeans.tsx：愿望单列表

- **src/services/**：服务层
  - storage.ts：数据存储服务，封装咖啡豆和设置的 CRUD

- **src/types/**：类型定义
  - index.ts：CoffeeBean, Settings 等接口定义

- **src/utils/**：工具函数
  - brewCalculations.ts：冲泡计算 (杯数、成本等)
  - dateCalculations.ts：日期计算 (养豆期、最佳期等)

- **其他**：index.css (全局样式), main.tsx (入口), vite-env.d.ts (环境类型)

## 每个模块的功能介绍
- **components**：提供可复用的 UI 元素，如卡片、表单，支持编辑和删除操作。
- **contexts**：管理全局状态，如主题或认证。
- **hooks**：封装可复用逻辑，如主题切换。
- **lib**：核心数据管理和工具，支持数据导出/导入。
- **pages**：应用的主要视图，支持列表查看、添加、统计图表显示。
- **services**：抽象数据操作层，提供获取、添加、更新、删除咖啡豆和设置的功能。
- **types**：定义数据模型，确保类型安全。
- **utils**：计算逻辑模块，处理日期和冲泡相关计算。

## 项目的启动流程
### 环境准备
- 安装 [Node.js](https://nodejs.org/en) (推荐 v18 或更高)
- 安装 [pnpm](https://pnpm.io/installation)

### 操作步骤
1. 克隆仓库：
   ```bash
   git clone https://github.com/yourusername/CoffeeBean.git
   cd CoffeeBean
   ```

2. 安装依赖：
   ```bash
   pnpm install
   ```

3. 启动开发服务器：
   ```bash
   pnpm run dev
   ```

4. 在浏览器访问 http://localhost:5173 (Vite 默认端口)

### 其他命令
- 构建生产版本：`pnpm run build`
- 预览生产构建：`pnpm run preview`
- 运行 lint：`pnpm run lint`

## 开发进度
- 当前进度：项目核心功能已完成，包括数据管理、计算逻辑、UI 界面。
- 待优化：添加更多统计图表、支持数据备份到云端、移动端适配。
- 更新日志：初始版本，实现基本 CRUD 和计算功能。

如果您有任何问题或建议，欢迎提交 Issue 或 Pull Request！
        
