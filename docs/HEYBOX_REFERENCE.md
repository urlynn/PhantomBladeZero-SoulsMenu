# Heybox installer reference

Checked on 2026-11-16 against:

https://github.com/xiaoheihe-lab/heybox-mod-extensions/blob/main/dist/PhantomBladeZero/index.cjs

Downloaded file SHA256:

```text
2efbec81187edeba2b5ba7de3ab418e4105e86a0d7b8264bc03413d88c6b44ff
```

The Heybox archive has one mod root, `PBZSoulsMenu/main.js`, and is classified as `4115450-pbzmodloader-mod`. Its payload is copied to `ProjectPBZ/PBZModLoader/mods/PBZSoulsMenu/`.

The Nexus manual archive uses a `ProjectPBZ/...` game-relative layout, classified as `4115450-root` by this extension. Only one archive should be installed.

The default INI template is named `settings.default.ini.example` to avoid the extension classifying a loose `.ini` file as a ReShade preset. Actual user settings are created by the mod in the engine Saved directory and are outside manager-controlled files.

To verify against a downloaded copy of the extension:

```text
python scripts/build.py
node scripts/check-heybox.cjs /path/to/index.cjs
```

The contract check covers classification, exact destinations, wrappers, payload equivalence, integrity, and preservation of unrelated files during simulated install/uninstall. It does not operate the Heybox UI or the game. The extension itself is not bundled with this project.
