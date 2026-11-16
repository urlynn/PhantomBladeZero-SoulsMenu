"use strict";
const UE=require("ue"),puerts_1=require("puerts"),TsHelper_1=require("Library/TsHelper"),UIHelper_1=require("Library/UIHelper");
const ordering=require("./order"),switchSkill=require("./switchskill");
exports.expected={"ReplaceMainWeapon":"ReplaceMainWeapon() {\n        if (!this.IsSecondStep()) {\n            return;\n        }\n        let Button = this.W_SystemPanel_V1.ButtonGroup.GetSelectedButtonBase();\n        if (!Button) {\n            return;\n        }\n        if (this.isLoadoutLockedByStory()) {\n            this.pushTips(\"UI_Character_72\");\n            return;\n        }\n        let isEquip = this.isButtonEquipItem(Button);\n        if (isEquip) {\n            this.pushTips(\"UI_Character_35\");\n        }\n        else {\n            let backPackSubsystem = TsHelper_1.default.getWorldSubsystem(this, UE.PBZBackPackSubsystem.StaticClass());\n            let FirstSelectedButton = this.ButtonGroup.GetSelectedButtonBase();\n            let ReplaceIndex = 0;\n            let currentWeaponID = this.getItemFromButton(FirstSelectedButton);\n            if (currentWeaponID == \"\" || currentWeaponID.toLowerCase() == \"none\") {\n                ReplaceIndex = 1 - backPackSubsystem.GetCurrentMainWeaponIndex();\n            }\n            else {\n                ReplaceIndex = backPackSubsystem.MainWeapons.FindIndex(currentWeaponID);\n            }\n            let ReplaceWeapon = this.getItemFromButton(Button);\n            if (ReplaceIndex < 0 || ReplaceIndex > 1 || !ReplaceWeapon || ReplaceWeapon.toLowerCase() == \"none\")\n                return;\n            backPackSubsystem.ReplaceWeaponByIndex(ReplaceWeapon, ReplaceIndex);\n            if (backPackSubsystem.MainWeapons.IsValidIndex(ReplaceIndex)) {\n                const equippedWeapon = backPackSubsystem.MainWeapons.Get(ReplaceIndex);\n                if (UE.KismetMathLibrary.EqualEqual_NameName(equippedWeapon, ReplaceWeapon))\n                    this.playWeaponActionClickSound();\n            }\n            // Preserve the previous return flow even when the backpack rejects the operation.\n            this.navigateBack();\n        }\n    }","initMainWeaponByTabID":"initMainWeaponByTabID(tabID, backpackSubsystem, selectedID) {\n        let Weapons = UIHelper_1.default.getSortedMainWeaponArray(backpackSubsystem);\n        switch (tabID.toLowerCase()) {\n            case \"all\":\n                break;\n            case \"singleweapon\":\n                UIHelper_1.default.getAllowedWeapon(backpackSubsystem, UE.EWeaponType.Blade, (0, puerts_1.$ref)(Weapons));\n                break;\n            case \"doubleweapon\":\n                UIHelper_1.default.getAllowedWeapon(backpackSubsystem, UE.EWeaponType.DoubleBlade, (0, puerts_1.$ref)(Weapons));\n                break;\n            case \"longweapon\":\n                UIHelper_1.default.getAllowedWeapon(backpackSubsystem, UE.EWeaponType.GreatBlade, (0, puerts_1.$ref)(Weapons));\n                break;\n            default:\n                break;\n        }\n        let Ids = Array.from(Weapons);\n        this.ChangeInputBar.Broadcast(Ids.length != 0, \"WeaponConfirm\");\n        let mainWeaponClass = this.PanelSlot_MainWeapon;\n        let panelInterface = this.W_SystemPanel_V1;\n        panelInterface.createSlotsByClass(Ids, mainWeaponClass, 0, this.PanelSlotSelectedLambda, this.PanelSlotClickLambda, this.PanelSlotInitLambda);\n        this.playSystemPanelSlotFadeInIfVisible();\n        this.updateRatioBoxBackground(Ids.length);\n        //this.W_Character_Switcher['Init Switcher']($ref(Weapons), selectedID, mainWeaponClass);\n        if (Ids.length == 0) {\n            this.resetWeaponDescriptionSwitchContext();\n            this.checkItemValid(\"\", undefined);\n            this.WidgetSwitcher_98.SetActiveWidgetIndex(1);\n            this.RenderIcon.SetVisibility(UE.ESlateVisibility.Collapsed);\n            this.W_UnifiedTextDescription_Weapon.SetVisibility(UE.ESlateVisibility.Collapsed);\n            this.W_UnifiedTextDescription.SetVisibility(UE.ESlateVisibility.Collapsed);\n            this.NavigationInputWidget.SetVisibility(UE.ESlateVisibility.Collapsed);\n        }\n        else {\n            this.WidgetSwitcher_98.SetActiveWidgetIndex(0);\n            this.RenderIcon.SetVisibility(UE.ESlateVisibility.SelfHitTestInvisible);\n            this.NavigationInputWidget.SetVisibility(UE.ESlateVisibility.SelfHitTestInvisible);\n        }\n    }","initShaChiWeaponByTabID":"initShaChiWeaponByTabID(tabID, backpackSubsystem, selectedID) {\n        let Weapons = UIHelper_1.default.getSortedShaChiWeaponArray(backpackSubsystem);\n        switch (tabID.toLowerCase()) {\n            case \"all\":\n                break;\n            case \"damage\":\n                UIHelper_1.default.getAllowedShaChiWeapon(backpackSubsystem, UE.EShaChiWeaponType.Damage, (0, puerts_1.$ref)(Weapons));\n                break;\n            case \"stunt\":\n                UIHelper_1.default.getAllowedShaChiWeapon(backpackSubsystem, UE.EShaChiWeaponType.Stunt, (0, puerts_1.$ref)(Weapons));\n                break;\n            case \"combatskills\":\n                UIHelper_1.default.getAllowedShaChiWeapon(backpackSubsystem, UE.EShaChiWeaponType.CombatSkills, (0, puerts_1.$ref)(Weapons));\n                break;\n            case \"magictricks\":\n                UIHelper_1.default.getAllowedShaChiWeapon(backpackSubsystem, UE.EShaChiWeaponType.MagicTricks, (0, puerts_1.$ref)(Weapons));\n                break;\n            case \"summon\":\n                UIHelper_1.default.getAllowedShaChiWeapon(backpackSubsystem, UE.EShaChiWeaponType.Summon, (0, puerts_1.$ref)(Weapons));\n                break;\n            default:\n                break;\n        }\n        let Ids = Array.from(Weapons);\n        this.ChangeInputBar.Broadcast(Ids.length != 0, \"WeaponConfirm\");\n        let shachiWeaponClass = this.PanelSlot_ShaChiWeapon;\n        let panelInterface = this.W_SystemPanel_V1;\n        panelInterface.createSlotsByClass(Ids, shachiWeaponClass, 0, this.PanelSlotSelectedLambda, this.PanelSlotClickLambda, this.PanelSlotInitLambda);\n        this.playSystemPanelSlotFadeInIfVisible();\n        this.updateRatioBoxBackground(Ids.length);\n        if (Ids.length == 0) {\n            this.resetWeaponDescriptionSwitchContext();\n            this.checkItemValid(\"\", undefined);\n            this.WidgetSwitcher_98.SetActiveWidgetIndex(1);\n            this.RenderIcon.SetVisibility(UE.ESlateVisibility.Collapsed);\n            this.W_UnifiedTextDescription_Weapon.SetVisibility(UE.ESlateVisibility.Collapsed);\n            this.W_UnifiedTextDescription.SetVisibility(UE.ESlateVisibility.Collapsed);\n            this.NavigationInputWidget.SetVisibility(UE.ESlateVisibility.Collapsed);\n        }\n        else {\n            this.WidgetSwitcher_98.SetActiveWidgetIndex(0);\n            this.RenderIcon.SetVisibility(UE.ESlateVisibility.SelfHitTestInvisible);\n            this.NavigationInputWidget.SetVisibility(UE.ESlateVisibility.SelfHitTestInvisible);\n        }\n    }"};
exports.replacement=({
ReplaceMainWeapon() {
        if (!this.IsSecondStep()) {
            return;
        }
        let Button = this.W_SystemPanel_V1.ButtonGroup.GetSelectedButtonBase();
        if (!Button) {
            return;
        }
        if (this.isLoadoutLockedByStory()) {
            this.pushTips("UI_Character_72");
            return;
        }
        let isEquip = this.isButtonEquipItem(Button);
        if (isEquip) {
            this.pushTips("UI_Character_35");
        }
        else {
            let backPackSubsystem = TsHelper_1.default.getWorldSubsystem(this, UE.PBZBackPackSubsystem.StaticClass());
            let FirstSelectedButton = this.ButtonGroup.GetSelectedButtonBase();
            let ReplaceIndex = 0;
            let currentWeaponID = this.getItemFromButton(FirstSelectedButton);
            if (currentWeaponID == "" || currentWeaponID.toLowerCase() == "none") {
                ReplaceIndex = 1 - backPackSubsystem.GetCurrentMainWeaponIndex();
            }
            else {
                ReplaceIndex = backPackSubsystem.MainWeapons.FindIndex(currentWeaponID);
            }
            let ReplaceWeapon = this.getItemFromButton(Button);
            if (ReplaceIndex < 0 || ReplaceIndex > 1 || !ReplaceWeapon || ReplaceWeapon.toLowerCase() == "none")
                return;
            switchSkill.commit(this, ReplaceWeapon, ReplaceIndex, backPackSubsystem);
            if (backPackSubsystem.MainWeapons.IsValidIndex(ReplaceIndex)) {
                const equippedWeapon = backPackSubsystem.MainWeapons.Get(ReplaceIndex);
                if (UE.KismetMathLibrary.EqualEqual_NameName(equippedWeapon, ReplaceWeapon))
                    this.playWeaponActionClickSound();
            }
            // Preserve the previous return flow even when the backpack rejects the operation.
            this.navigateBack();
        }
    },
initMainWeaponByTabID(tabID, backpackSubsystem, selectedID) {
        let Weapons = UIHelper_1.default.getSortedMainWeaponArray(backpackSubsystem);
        switch (tabID.toLowerCase()) {
            case "all":
                break;
            case "singleweapon":
                UIHelper_1.default.getAllowedWeapon(backpackSubsystem, UE.EWeaponType.Blade, (0, puerts_1.$ref)(Weapons));
                break;
            case "doubleweapon":
                UIHelper_1.default.getAllowedWeapon(backpackSubsystem, UE.EWeaponType.DoubleBlade, (0, puerts_1.$ref)(Weapons));
                break;
            case "longweapon":
                UIHelper_1.default.getAllowedWeapon(backpackSubsystem, UE.EWeaponType.GreatBlade, (0, puerts_1.$ref)(Weapons));
                break;
            default:
                break;
        }
        let Ids = ordering.arrange(this, "main", Array.from(Weapons), tabID);
        this.ChangeInputBar.Broadcast(Ids.length != 0, "WeaponConfirm");
        let mainWeaponClass = this.PanelSlot_MainWeapon;
        let panelInterface = this.W_SystemPanel_V1;
        panelInterface.createSlotsByClass(Ids, mainWeaponClass, ordering.selectedIndex(Ids, selectedID), this.PanelSlotSelectedLambda, this.PanelSlotClickLambda, this.PanelSlotInitLambda);
        this.playSystemPanelSlotFadeInIfVisible();
        this.updateRatioBoxBackground(Ids.length);
        //this.W_Character_Switcher['Init Switcher']($ref(Weapons), selectedID, mainWeaponClass);
        if (Ids.length == 0) {
            this.resetWeaponDescriptionSwitchContext();
            this.checkItemValid("", undefined);
            this.WidgetSwitcher_98.SetActiveWidgetIndex(1);
            this.RenderIcon.SetVisibility(UE.ESlateVisibility.Collapsed);
            this.W_UnifiedTextDescription_Weapon.SetVisibility(UE.ESlateVisibility.Collapsed);
            this.W_UnifiedTextDescription.SetVisibility(UE.ESlateVisibility.Collapsed);
            this.NavigationInputWidget.SetVisibility(UE.ESlateVisibility.Collapsed);
        }
        else {
            this.WidgetSwitcher_98.SetActiveWidgetIndex(0);
            this.RenderIcon.SetVisibility(UE.ESlateVisibility.SelfHitTestInvisible);
            this.NavigationInputWidget.SetVisibility(UE.ESlateVisibility.SelfHitTestInvisible);
        }
    },
initShaChiWeaponByTabID(tabID, backpackSubsystem, selectedID) {
        let Weapons = UIHelper_1.default.getSortedShaChiWeaponArray(backpackSubsystem);
        switch (tabID.toLowerCase()) {
            case "all":
                break;
            case "damage":
                UIHelper_1.default.getAllowedShaChiWeapon(backpackSubsystem, UE.EShaChiWeaponType.Damage, (0, puerts_1.$ref)(Weapons));
                break;
            case "stunt":
                UIHelper_1.default.getAllowedShaChiWeapon(backpackSubsystem, UE.EShaChiWeaponType.Stunt, (0, puerts_1.$ref)(Weapons));
                break;
            case "combatskills":
                UIHelper_1.default.getAllowedShaChiWeapon(backpackSubsystem, UE.EShaChiWeaponType.CombatSkills, (0, puerts_1.$ref)(Weapons));
                break;
            case "magictricks":
                UIHelper_1.default.getAllowedShaChiWeapon(backpackSubsystem, UE.EShaChiWeaponType.MagicTricks, (0, puerts_1.$ref)(Weapons));
                break;
            case "summon":
                UIHelper_1.default.getAllowedShaChiWeapon(backpackSubsystem, UE.EShaChiWeaponType.Summon, (0, puerts_1.$ref)(Weapons));
                break;
            default:
                break;
        }
        let Ids = ordering.arrange(this, "shadow", Array.from(Weapons), tabID);
        this.ChangeInputBar.Broadcast(Ids.length != 0, "WeaponConfirm");
        let shachiWeaponClass = this.PanelSlot_ShaChiWeapon;
        let panelInterface = this.W_SystemPanel_V1;
        panelInterface.createSlotsByClass(Ids, shachiWeaponClass, ordering.selectedIndex(Ids, selectedID), this.PanelSlotSelectedLambda, this.PanelSlotClickLambda, this.PanelSlotInitLambda);
        this.playSystemPanelSlotFadeInIfVisible();
        this.updateRatioBoxBackground(Ids.length);
        if (Ids.length == 0) {
            this.resetWeaponDescriptionSwitchContext();
            this.checkItemValid("", undefined);
            this.WidgetSwitcher_98.SetActiveWidgetIndex(1);
            this.RenderIcon.SetVisibility(UE.ESlateVisibility.Collapsed);
            this.W_UnifiedTextDescription_Weapon.SetVisibility(UE.ESlateVisibility.Collapsed);
            this.W_UnifiedTextDescription.SetVisibility(UE.ESlateVisibility.Collapsed);
            this.NavigationInputWidget.SetVisibility(UE.ESlateVisibility.Collapsed);
        }
        else {
            this.WidgetSwitcher_98.SetActiveWidgetIndex(0);
            this.RenderIcon.SetVisibility(UE.ESlateVisibility.SelfHitTestInvisible);
            this.NavigationInputWidget.SetVisibility(UE.ESlateVisibility.SelfHitTestInvisible);
        }
    }
});
