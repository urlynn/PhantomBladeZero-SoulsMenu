# 更新记录 / Changelog

## 0.5.1 — 2026-11-16

- 允许战斗中进入戒指／饰品二级菜单，更换与卸下饰品。
- 饰品更换使用原生接口，保留槽位锁、剧情锁、重复装备和同类饰品数量限制。
- 新增 `[Menu] AllowAccessoryInCombat`，默认开启，需 `AllowInCombat=true`；旧配置无需重置。
- 提供 Nexus 手动安装与小黑盒导入的独立压缩包，19 项设置集中在外部 INI。

Combat accessory entry and accessory-only unequip are now configurable. Existing equipment restrictions remain. This release packages the existing 0.5.1 gameplay implementation with publishing documentation and reproducible build scripts.

## 0.5.0

- 将暂停／不暂停、请求／不请求切换能力版本合并为本地 INI 配置。
- 个人设置位于 Saved 目录，升级和卸载后保留。

## 0.4.2

- 单按 L3 隐藏详情，L3＋十字键排序；在松开时区分单按和组合键。

## 0.4.1

- 默认关闭绿色版本与操作说明提示。
