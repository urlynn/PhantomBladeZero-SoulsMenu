"use strict";
const UE=require("ue"),puerts_1=require("puerts"),TsHelper_1=require("Library/TsHelper"),UIHelper_1=require("Library/UIHelper");
const config=require("./config");
const CategoryEnum=UE.Game.PBZContent.UI.UINew.System.Character.E_CharacterUI_Category.E_CharacterUI_Category;
function isSelectedAccessory(panel){const selected=panel.ButtonGroup&&panel.ButtonGroup.GetSelectedButtonBase();return !!selected&&panel.getAccessoryIndexFromButton(selected)>=0;}
exports.expected={"ClickAccessory":"ClickAccessory(Button) {\n        let accessoryButton = Button;\n        let isLockedRef = (0, puerts_1.$ref)();\n        accessoryButton.isLocked(isLockedRef);\n        // let AccessoryIDRef = $ref<string>(\"\");\n        // accessoryButton['Get Item ID'](AccessoryIDRef);\n        // let AccessoryID = $unref(AccessoryIDRef);\n        if ((0, puerts_1.$unref)(isLockedRef)) {\n            this.pushTips(\"UI_Character_51\");\n            return;\n        }\n        if (UIHelper_1.default.isInCombat(this)) {\n            this.pushTips(\"UI_Character_66\");\n            return;\n        }\n        this.unbindSecondTabHandlers();\n        this.SecondTab.RemoveAllTabs();\n        this.SecondTab.RegisterTabs(this['AccessoryTab']);\n        ;\n        this.SecondTab.SetVisibleTabWindow(304);\n        this.enterSecond();\n        this.forceNextWeaponDescriptionSwitchAnimation();\n        if (this.W_SecondTabLine) {\n            this.W_SecondTabLine.SetVisibility(UE.ESlateVisibility.SelfHitTestInvisible);\n            this.W_SecondTabLine.InitAccessoryImg();\n            this.W_SecondTabLine.InitPaddingByStyle(0);\n        }\n        this.PanelSlotSelectedLambda = ((AssociatedButton, ButtonIndex) => {\n            this.OnSelectedAccessory(AssociatedButton, true);\n        });\n        this.PanelSlotClickLambda = ((AssociatedButton, ButtonIndex) => {\n            if (AssociatedButton.GetSelected()) {\n                this.ReplaceAccessory();\n            }\n        });\n        this.PanelSlotInitLambda = ((slotButton, itemID) => {\n            let accessory = slotButton;\n            let backPackSubsystem = TsHelper_1.default.getWorldSubsystem(this, UE.PBZBackPackSubsystem.StaticClass());\n            let accessoryLevel = 0;\n            let accessoryInfo = backPackSubsystem.Accessories.Get(itemID);\n            if (accessoryInfo != undefined) {\n                accessoryLevel = accessoryInfo.CurrentLevel;\n            }\n            accessory.InitAccessory(itemID, accessoryLevel, true, false, this.UIGameplayLogicComponent, false);\n        });\n        this.CurrentItemType = UE.EDisplayItemType.Accessory;\n        this.playEnterSecondSound();\n        let currentAccessory = this.getItemFromButton(Button);\n        this.bindSecondTabHandlers(currentAccessory);\n        this.SecondTab.SelectTabByID(\"All\");\n    }","RemoveItem":"RemoveItem() {\n        if (UIHelper_1.default.isInCombat(this)) {\n            this.pushTips(\"UI_Character_67\");\n            return;\n        }\n        let backPackSubsytem = TsHelper_1.default.getWorldSubsystem(this, UE.PBZBackPackSubsystem.StaticClass());\n        let FirstSelectedButton = this.ButtonGroup.GetSelectedButtonBase();\n        let buttonInterface = FirstSelectedButton;\n        let categoryRef = (0, puerts_1.$ref)();\n        buttonInterface.GetCharacterButtonCategory(categoryRef);\n        let category = (0, puerts_1.$unref)(categoryRef);\n        let switchSlotInterface = FirstSelectedButton;\n        let itemidRef = (0, puerts_1.$ref)();\n        switchSlotInterface.GetItem(itemidRef);\n        let Item = (0, puerts_1.$unref)(itemidRef);\n        if (this.IsSecondStep()) {\n            return;\n        }\n        else {\n        }\n        //ItemID \n        if (Item == \"\" || Item.toLocaleLowerCase() == \"none\") {\n            return;\n        }\n        switch (category) {\n            case CategoryEnum.Weapon:\n                if (this.isLoadoutLockedByStory()) {\n                    this.pushTips(\"UI_Character_72\");\n                    break;\n                }\n                let IndexRef = (0, puerts_1.$ref)(0);\n                if (backPackSubsytem.IsFullEquipNormalWeapons(IndexRef)) {\n                    backPackSubsytem.RemoveWeaponByID(Item, true);\n                    if (!backPackSubsytem.MainWeapons.Contains(Item))\n                        this.playWeaponActionClickSound();\n                }\n                else {\n                    this.pushTips(\"UI_Character_14\");\n                }\n                break;\n            case CategoryEnum.ShaChiWeapon:\n                if (this.isLoadoutLockedByStory()) {\n                    this.pushTips(\"UI_Character_72\");\n                    break;\n                }\n                if (Item.toLocaleLowerCase() != \"none\" && Item != \"\") {\n                    backPackSubsytem.RemoveWeaponByID(Item, false);\n                    this.playRemoveItemSound();\n                }\n                break;\n            case CategoryEnum.Medicine:\n                let backpackSubsystem = TsHelper_1.default.getWorldSubsystem(this, UE.PBZBackPackSubsystem.StaticClass());\n                let takeoffMedicineID = FirstSelectedButton == this.BottomMedicine ? backpackSubsystem.BottomMedicineID : backpackSubsystem.TopMedicineID;\n                let index = FirstSelectedButton == this.TopMedicine ? 1 : 0;\n                let oldMedicineInfo = backPackSubsytem.MedicineInfos.Get(takeoffMedicineID);\n                if (oldMedicineInfo != undefined && oldMedicineInfo.CurrentTime > 0) {\n                    let Action = UE.AsyncAction_ShowConfirmation.ShowConfirmationYesNo(this, undefined, UE.PBZBlueprintFunctionLibrary.MakeTextByKey(\"UI_Character_46\"));\n                    Action.OnResult.Add((Result) => {\n                        if (Result == UE.ECommonMessagingResult.Confirmed) {\n                            backPackSubsytem.TakeOffMedicineByIndex(index);\n                            this.playRemoveItemSound();\n                        }\n                    });\n                    Action.Activate();\n                    return;\n                }\n                backPackSubsytem.TakeOffMedicineByIndex(index);\n                this.playRemoveItemSound();\n                break;\n            case CategoryEnum.Accessory:\n                if (this.isLoadoutLockedByStory()) {\n                    this.pushTips(\"UI_Character_72\");\n                    break;\n                }\n                if (Item.toLocaleLowerCase() != \"none\" && Item != \"\") {\n                    let equipIndex = backPackSubsytem.AssemblyAccessory.FindIndex(Item);\n                    backPackSubsytem.TakeOffAccessory(equipIndex);\n                    this.playRemoveItemSound();\n                }\n                break;\n            default:\n                break;\n        }\n    }"};
exports.replacement=({
ClickAccessory(Button) {
        let accessoryButton = Button;
        let isLockedRef = (0, puerts_1.$ref)();
        accessoryButton.isLocked(isLockedRef);
        // let AccessoryIDRef = $ref<string>("");
        // accessoryButton['Get Item ID'](AccessoryIDRef);
        // let AccessoryID = $unref(AccessoryIDRef);
        if ((0, puerts_1.$unref)(isLockedRef)) {
            this.pushTips("UI_Character_51");
            return;
        }
        if (UIHelper_1.default.isInCombat(this) && !(config.allowInCombat !== false && config.allowAccessoryInCombat !== false)) {
            this.pushTips("UI_Character_66");
            return;
        }
        this.unbindSecondTabHandlers();
        this.SecondTab.RemoveAllTabs();
        this.SecondTab.RegisterTabs(this['AccessoryTab']);
        ;
        this.SecondTab.SetVisibleTabWindow(304);
        this.enterSecond();
        this.forceNextWeaponDescriptionSwitchAnimation();
        if (this.W_SecondTabLine) {
            this.W_SecondTabLine.SetVisibility(UE.ESlateVisibility.SelfHitTestInvisible);
            this.W_SecondTabLine.InitAccessoryImg();
            this.W_SecondTabLine.InitPaddingByStyle(0);
        }
        this.PanelSlotSelectedLambda = ((AssociatedButton, ButtonIndex) => {
            this.OnSelectedAccessory(AssociatedButton, true);
        });
        this.PanelSlotClickLambda = ((AssociatedButton, ButtonIndex) => {
            if (AssociatedButton.GetSelected()) {
                this.ReplaceAccessory();
            }
        });
        this.PanelSlotInitLambda = ((slotButton, itemID) => {
            let accessory = slotButton;
            let backPackSubsystem = TsHelper_1.default.getWorldSubsystem(this, UE.PBZBackPackSubsystem.StaticClass());
            let accessoryLevel = 0;
            let accessoryInfo = backPackSubsystem.Accessories.Get(itemID);
            if (accessoryInfo != undefined) {
                accessoryLevel = accessoryInfo.CurrentLevel;
            }
            accessory.InitAccessory(itemID, accessoryLevel, true, false, this.UIGameplayLogicComponent, false);
        });
        this.CurrentItemType = UE.EDisplayItemType.Accessory;
        this.playEnterSecondSound();
        let currentAccessory = this.getItemFromButton(Button);
        this.bindSecondTabHandlers(currentAccessory);
        this.SecondTab.SelectTabByID("All");
    },
RemoveItem() {
        if (UIHelper_1.default.isInCombat(this) && !(config.allowInCombat !== false && config.allowAccessoryInCombat !== false && isSelectedAccessory(this))) {
            this.pushTips("UI_Character_67");
            return;
        }
        let backPackSubsytem = TsHelper_1.default.getWorldSubsystem(this, UE.PBZBackPackSubsystem.StaticClass());
        let FirstSelectedButton = this.ButtonGroup.GetSelectedButtonBase();
        let buttonInterface = FirstSelectedButton;
        let categoryRef = (0, puerts_1.$ref)();
        buttonInterface.GetCharacterButtonCategory(categoryRef);
        let category = (0, puerts_1.$unref)(categoryRef);
        let switchSlotInterface = FirstSelectedButton;
        let itemidRef = (0, puerts_1.$ref)();
        switchSlotInterface.GetItem(itemidRef);
        let Item = (0, puerts_1.$unref)(itemidRef);
        if (this.IsSecondStep()) {
            return;
        }
        else {
        }
        //ItemID 
        if (Item == "" || Item.toLocaleLowerCase() == "none") {
            return;
        }
        switch (category) {
            case CategoryEnum.Weapon:
                if (this.isLoadoutLockedByStory()) {
                    this.pushTips("UI_Character_72");
                    break;
                }
                let IndexRef = (0, puerts_1.$ref)(0);
                if (backPackSubsytem.IsFullEquipNormalWeapons(IndexRef)) {
                    backPackSubsytem.RemoveWeaponByID(Item, true);
                    if (!backPackSubsytem.MainWeapons.Contains(Item))
                        this.playWeaponActionClickSound();
                }
                else {
                    this.pushTips("UI_Character_14");
                }
                break;
            case CategoryEnum.ShaChiWeapon:
                if (this.isLoadoutLockedByStory()) {
                    this.pushTips("UI_Character_72");
                    break;
                }
                if (Item.toLocaleLowerCase() != "none" && Item != "") {
                    backPackSubsytem.RemoveWeaponByID(Item, false);
                    this.playRemoveItemSound();
                }
                break;
            case CategoryEnum.Medicine:
                let backpackSubsystem = TsHelper_1.default.getWorldSubsystem(this, UE.PBZBackPackSubsystem.StaticClass());
                let takeoffMedicineID = FirstSelectedButton == this.BottomMedicine ? backpackSubsystem.BottomMedicineID : backpackSubsystem.TopMedicineID;
                let index = FirstSelectedButton == this.TopMedicine ? 1 : 0;
                let oldMedicineInfo = backPackSubsytem.MedicineInfos.Get(takeoffMedicineID);
                if (oldMedicineInfo != undefined && oldMedicineInfo.CurrentTime > 0) {
                    let Action = UE.AsyncAction_ShowConfirmation.ShowConfirmationYesNo(this, undefined, UE.PBZBlueprintFunctionLibrary.MakeTextByKey("UI_Character_46"));
                    Action.OnResult.Add((Result) => {
                        if (Result == UE.ECommonMessagingResult.Confirmed) {
                            backPackSubsytem.TakeOffMedicineByIndex(index);
                            this.playRemoveItemSound();
                        }
                    });
                    Action.Activate();
                    return;
                }
                backPackSubsytem.TakeOffMedicineByIndex(index);
                this.playRemoveItemSound();
                break;
            case CategoryEnum.Accessory:
                if (this.isLoadoutLockedByStory()) {
                    this.pushTips("UI_Character_72");
                    break;
                }
                if (Item.toLocaleLowerCase() != "none" && Item != "") {
                    let equipIndex = backPackSubsytem.AssemblyAccessory.FindIndex(Item);
                    backPackSubsytem.TakeOffAccessory(equipIndex);
                    this.playRemoveItemSound();
                }
                break;
            default:
                break;
        }
    }
});
