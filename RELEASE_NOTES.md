## PBZ SoulsMenu 0.5.1

战斗中更换、卸下戒指／饰品的可配置菜单版本。保留原版槽位锁、剧情锁、重复装备和同类饰品数量限制。

Configurable combat equipment menus with accessory replacement/unequip. Requires **PBZModLoader**, installed separately. Target game build: Steam **26367565**.

### Choose one installation archive

- **Nexus / manual:** `PBZ_SoulsMenu-0.5.1-Nexus-Manual.zip` — merge `ProjectPBZ` into the game root.
- **Heybox / 小黑盒:** `PBZ_SoulsMenu-0.5.1-Heybox.zip` — import, enable and deploy using the PhantomBladeZero extension.

Only one archive should be enabled. Both contain identical mod files and use the existing `PBZSoulsMenu` mod ID. The Heybox extension also checks its shared UE4SS prerequisite.

### Local settings / 本地配置

首次启动后编辑 / created on first launch:

```text
%LOCALAPPDATA%\ProjectPBZ\Saved\PBZSoulsMenu.ini
```

19 项设置，包括暂停、战斗戒指换装、菜单内移动、上下槽位映射、切换能力、固定排序、详情按键、透明度与死区。修改后重启游戏；已有配置和个人排序会保留。

Combat accessories require `[Menu] AllowInCombat=true` and `AllowAccessoryInCombat=true`. Missing new settings use their defaults. [Configuration guide](https://github.com/zangielfwin-gif/PhantomBladeZero-SoulsMenu/blob/main/CONFIGURATION.md).

Defaults retain L3 tap-to-hide, L3+D-pad sorting, F6 keyboard hide, locked camera, and disabled green notifications. The native current-slot `.UI` ability request remains optional and follows game restrictions.

### Validation

188 simulated gameplay/lifecycle checks, 11 configuration checks and 9 Heybox contract/deployment checks passed. Packaging checks include CRC, manifest SHA256, archive classification and exact installation destinations. Simulation results do not replace game acceptance of accessory stats/effects.

`NEXUS_DESCRIPTION.txt` contains ready-to-copy publishing information. `SHA256SUMS.txt` verifies the downloadable release files. Full instructions and source are in the repository.
