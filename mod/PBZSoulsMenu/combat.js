"use strict";
const UE=require("ue");
const TsHelper_1=require("Library/TsHelper");
exports.expected="ClickWeapon(weaponID) {\n        if (UIHelper_1.default.isInCombat(this)) {\n            this.pushTips(\"UI_Character_66\");\n            return;\n        }\n        this.unbindSecondTabHandlers();\n        this.SecondTab.RemoveAllTabs();\n        this.SecondTab.RegisterTabs(this['Weapon Tabs']);\n        this.SecondTab.SetVisibleTabWindow(304);\n        this.enterSecond();\n        this.forceNextWeaponDescriptionSwitchAnimation();\n        if (this.PanelSlotSelectedLambda) {\n            this.W_SystemPanel_V1.ButtonGroup.OnSelectedButtonBaseChanged.Remove(this.PanelSlotSelectedLambda);\n        }\n        if (this.PanelSlotClickLambda) {\n            this.W_SystemPanel_V1.ButtonGroup.OnButtonBaseClicked.Remove(this.PanelSlotClickLambda);\n        }\n        this.PanelSlotSelectedLambda = ((AssociatedButton, ButtonIndex) => {\n            this.OnSelectedMainWeapon(AssociatedButton, true);\n        });\n        this.PanelSlotClickLambda = ((AssociatedButton, ButtonIndex) => {\n            if (AssociatedButton.GetSelected()) {\n                this.ReplaceMainWeapon();\n            }\n        });\n        this.PanelSlotInitLambda = ((slotButton, itemID) => {\n            let mainWeapon = slotButton;\n            let backPackSubsystem = TsHelper_1.default.getWorldSubsystem(this, UE.PBZBackPackSubsystem.StaticClass());\n            let weaponLevel = 1;\n            let weaponInfo = backPackSubsystem.MainWeaponInfos.Get(itemID);\n            if (weaponInfo != undefined) {\n                weaponLevel = weaponInfo.WeaponLevel;\n            }\n            mainWeapon.InitMainWeapon(itemID, weaponLevel, true, false, this.UIGameplayLogicComponent);\n        });\n        this.playWeaponActionClickSound();\n        this.CurrentItemType = UE.EDisplayItemType.Weapon;\n        this.bindOpenPanelKey();\n        this.bindSecondTabHandlers(weaponID);\n        this.SecondTab.SelectTabByID(\"All\");\n    }";
exports.replacement=({
ClickWeapon(weaponID) {
        this.unbindSecondTabHandlers();
        this.SecondTab.RemoveAllTabs();
        this.SecondTab.RegisterTabs(this['Weapon Tabs']);
        this.SecondTab.SetVisibleTabWindow(304);
        this.enterSecond();
        this.forceNextWeaponDescriptionSwitchAnimation();
        if (this.PanelSlotSelectedLambda) {
            this.W_SystemPanel_V1.ButtonGroup.OnSelectedButtonBaseChanged.Remove(this.PanelSlotSelectedLambda);
        }
        if (this.PanelSlotClickLambda) {
            this.W_SystemPanel_V1.ButtonGroup.OnButtonBaseClicked.Remove(this.PanelSlotClickLambda);
        }
        this.PanelSlotSelectedLambda = ((AssociatedButton, ButtonIndex) => {
            this.OnSelectedMainWeapon(AssociatedButton, true);
        });
        this.PanelSlotClickLambda = ((AssociatedButton, ButtonIndex) => {
            if (AssociatedButton.GetSelected()) {
                this.ReplaceMainWeapon();
            }
        });
        this.PanelSlotInitLambda = ((slotButton, itemID) => {
            let mainWeapon = slotButton;
            let backPackSubsystem = TsHelper_1.default.getWorldSubsystem(this, UE.PBZBackPackSubsystem.StaticClass());
            let weaponLevel = 1;
            let weaponInfo = backPackSubsystem.MainWeaponInfos.Get(itemID);
            if (weaponInfo != undefined) {
                weaponLevel = weaponInfo.WeaponLevel;
            }
            mainWeapon.InitMainWeapon(itemID, weaponLevel, true, false, this.UIGameplayLogicComponent);
        });
        this.playWeaponActionClickSound();
        this.CurrentItemType = UE.EDisplayItemType.Weapon;
        this.bindOpenPanelKey();
        this.bindSecondTabHandlers(weaponID);
        this.SecondTab.SelectTabByID("All");
    }
}).ClickWeapon;
