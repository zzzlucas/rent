# 需求记录 (Common/Simple Requirements)

## 系统维护
- [x] **修复 Vercel 部署失败**:
  - 原因：`vue-tsc -b` 检查发现 `PropertyDetailModal.vue` 中存在未使用的图标导入 (`Calendar`)，以及 `FinanceView.vue` 中部分类型推导不严谨导致的 TS 错误。
  - 修复：删除了未使用的导入，并在 `FinanceView.vue` 中添加了 `Transaction` 接口及类型定义。 (2026-03-12)

- [ ] **修复 Vercel 部署失败 (Lockfile Outdated)**:
  - 原因：`package.json` 中更新了 `vue-router` 但 `pnpm-lock.yaml` 未同步，导致 Vercel 部署时 frozen-lockfile 检查失败。
  - 修复：本地运行 `pnpm install` 更新 lockfile 并提交。 (2026-03-13)
