"use strict";
const UE=require("ue"),TsHelper=require("Library/TsHelper").default;
const config=require("./config"),feedback=require("./feedback");
let openHost,pending;
function valid(o){if(!o)return false;try{return UE.KismetSystemLibrary.IsValid(o);}catch(e){if(e.message==="passing a invalid object")return false;throw e;}}
function log(s){console.log("[PBZSoulsMenu] switch-skill "+s);}
function owns(r){return valid(r.comp)&&r.comp.pendingWeaponID===r.id&&r.comp.pendingSlotIndex===r.slot;}
function cancel(reason){
    const r=pending;if(!r)return;pending=undefined;
    if(r.timer!==undefined)clearTimeout(r.timer);if(r.loadTimer!==undefined)clearTimeout(r.loadTimer);
    if(owns(r)){
        r.comp.cancelPredictiveWeaponSwitchLoad();r.comp.pendingWeaponID=undefined;r.comp.pendingSwitchTagName=undefined;
    }
    log("cancelled: "+reason);
}
exports.beginMenu=function(host){if(pending)cancel("another menu opened");openHost=host;};
function check(r){
    r.timer=undefined;if(pending!==r)return;
    if(!valid(r.comp)||!valid(r.pawn)||UE.GameplayStatics.GetPlayerCharacter(r.comp,0)!==r.pawn){cancel("player changed");return;}
    const sub=TsHelper.getWorldSubsystem(r.comp,UE.PBZBackPackSubsystem.StaticClass());
    if(!sub||sub.GetCurrentMainWeaponIndex()!==r.slot||!sub.MainWeapons.IsValidIndex(r.slot)||sub.MainWeapons.Get(r.slot)!==r.id){cancel("equipped target changed");return;}
    const asc=UE.AbilitySystemBlueprintLibrary.GetAbilitySystemComponent(r.pawn);
    if(!asc||asc.HasMatchingGameplayTag(TsHelper.constructGameplayTag("CharacterState.Dead"))){cancel("player dead");return;}
    const router=TsHelper.getlocalPlayerSubsystem(r.comp,UE.PBZUIActionRouterBase.StaticClass());
    const layout=UE.PBZBlueprintFunctionLibrary.GetUILayOut(r.comp);
    const uiBlocked=openHost||UE.GameplayStatics.IsGamePaused(r.comp)||(router&&router.GetActiveInputMode()===UE.ECommonInputMode.Menu)||(layout&&layout.HasModal());
    if(!r.ready||uiBlocked){
        if(++r.waits>=80){cancel("UI/config not ready after close");return;}
        r.timer=setTimeout(()=>check(r),25);return;
    }
    if(!owns(r)){cancel("component request changed");return;}
    pending=undefined;if(r.loadTimer!==undefined)clearTimeout(r.loadTimer);
    // The stock pickup uses .UI when replacing the CURRENT slot. .Normal would
    // swap to the other slot, so keep the native current-slot equip/draw ability.
    log("native UI switch ability requested after menu close; weapon="+r.id);
    r.activate.call(r.comp);
    if(r.comp.pendingWeaponID===undefined&&r.comp.predictiveLoadingWeaponID===r.id)r.comp.predictiveLoadingWeaponID=undefined;
}
function schedule(r){if(pending===r&&r.closed&&r.timer===undefined)r.timer=setTimeout(()=>check(r),0);}
exports.menuClosed=function(host){
    if(openHost===host)openHost=undefined;
    if(pending&&pending.host===host){pending.closed=true;schedule(pending);}
};
exports.gate=function(comp,original){
    const r=pending;if(!r||r.comp!==comp||!owns(r))return false;
    r.ready=true;r.activate=original;if(r.loadTimer!==undefined)clearTimeout(r.loadTimer);r.loadTimer=undefined;
    log("weapon config ready; waiting for menu close="+!r.closed);schedule(r);return true;
};
exports.endPlay=function(comp){if(pending&&pending.comp===comp)cancel("component EndPlay");};
exports.commit=function(panel,id,slot,sub){
    if(config.autoSwitchSkill!==true||!openHost||slot!==sub.GetCurrentMainWeaponIndex())return sub.ReplaceWeaponByIndex(id,slot);
    const comp=panel.UIGameplayLogicComponent,pawn=UE.GameplayStatics.GetPlayerCharacter(panel,0);
    if(!valid(comp)||!valid(pawn)||typeof comp.beginPredictiveWeaponSwitchLoad!=="function"||typeof comp.commitWeaponSwitchOnFadeOut!=="function"){
        feedback.show("武器正常更换，原生切换能力接口未就绪");return sub.ReplaceWeaponByIndex(id,slot);
    }
    if(pending)cancel("new replacement");
    if(comp.bCommitFiredAwaitingConfigReady||comp.predictiveLoadingWeaponID){log("another native pickup switch is pending; normal equip only");return sub.ReplaceWeaponByIndex(id,slot);}
    comp.beginPredictiveWeaponSwitchLoad(id,true);
    const r={comp,pawn,host:openHost,id,slot,ready:false,closed:false,waits:0,timer:undefined,loadTimer:undefined};pending=r;
    r.loadTimer=setTimeout(()=>{if(pending===r)cancel("config load timed out");},10000);
    try{
        comp.commitWeaponSwitchOnFadeOut(id,slot,true,"Ability.Action.Hun.Weapon.Switch.UI",undefined);
        if(!sub.MainWeapons.IsValidIndex(slot)||sub.MainWeapons.Get(slot)!==id)cancel("backpack rejected equip");
        else log("queued current-slot switch; weapon="+id);
    }catch(error){cancel("native commit error");throw error;}
};
