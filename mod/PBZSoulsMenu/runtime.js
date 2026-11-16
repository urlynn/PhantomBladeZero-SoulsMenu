"use strict";
const UE=require("ue");
const TsHelper=require("Library/TsHelper").default;
const config=require("./config");
const visual=require("./visual");
const controls=require("./controls");
const ordering=require("./order"),switchSkill=require("./switchskill"),feedback=require("./feedback");
const noPause=!!config.noPause;
exports.noPause=noPause;
const state={hidden:!!config.hideDetailsByDefault,panel:undefined,host:undefined,wasPaused:undefined,announced:false};
const details=["RenderIcon","W_UnifiedTextDescription_Weapon","W_UnifiedTextDescription","NavigationInputWidget"];
function log(message){console.log("[PBZSoulsMenu] "+message);}
function valid(obj){
    if(!obj)return false;
    try{return UE.KismetSystemLibrary.IsValid(obj);}
    catch(error){if(error && error.message==="passing a invalid object")return false;throw error;}
}
function hide(widget,saved){
    if(!valid(widget))return;
    const v=widget.GetVisibility();
    if(!saved.has(widget) || v!==UE.ESlateVisibility.Hidden)saved.set(widget,v);
    widget.SetVisibility(UE.ESlateVisibility.Hidden);
}
function restore(saved){
    if(!saved)return;
    for(const [widget,v] of saved)if(valid(widget))widget.SetVisibility(v);
    saved.clear();
}
function name(obj){return valid(obj) && typeof obj.GetName==="function" ? String(obj.GetName()):"missing";}
exports.swapSlots=function(panel){
    if(config.swapMainWeaponSlots===false)return false;
    if(panel.pbzSMSlotsSwapped)return;
    const current=panel.MainWeapon_Current,other=panel.MainWeapon_Other;
    if(!valid(current)||!valid(other)){log("slots-swap FAILED: main-weapon widgets missing");return false;}
    // Swap the reflected widget references once; all native and JS callbacks use
    // the same references. Never exchange backpack contents or active indices.
    try{
        panel.MainWeapon_Current=other;
        panel.MainWeapon_Other=current;
        if(panel.MainWeapon_Current!==other || panel.MainWeapon_Other!==current)
            throw Error("widget-reference assignment did not take effect");
    }catch(error){
        try{panel.MainWeapon_Current=current;panel.MainWeapon_Other=other;}
        catch(restoreError){log("slots-swap rollback FAILED: "+String(restoreError));}
        log("slots-swap FAILED: "+String(error));
        return false;
    }
    panel.pbzSMSlotsSwapped=true;
    log("slots-swapped current="+name(panel.MainWeapon_Current)+" other="+name(panel.MainWeapon_Other));
    return true;
};
function background(host,hidden){
    visual.apply(host,state.panel,hidden);
}
exports.swapShaChiSlots=function(panel){
    if(config.swapShadowWeaponSlots===false)return false;
    if(panel.pbzSMShaChiSlotsSwapped)return;
    const current=panel.ShaChiWeapon_Current,other=panel.ShaChiWeapon_Other;
    if(!valid(current)||!valid(other)){log("shachi-slots-swap FAILED: widgets missing");return false;}
    try{
        panel.ShaChiWeapon_Current=other;
        panel.ShaChiWeapon_Other=current;
        if(panel.ShaChiWeapon_Current!==other || panel.ShaChiWeapon_Other!==current)
            throw Error("widget-reference assignment did not take effect");
    }catch(error){
        try{panel.ShaChiWeapon_Current=current;panel.ShaChiWeapon_Other=other;}
        catch(restoreError){log("shachi-slots-swap rollback FAILED: "+String(restoreError));}
        log("shachi-slots-swap FAILED: "+String(error));
        return false;
    }
    panel.pbzSMShaChiSlotsSwapped=true;
    log("shachi-slots-swapped current="+name(panel.ShaChiWeapon_Current)+" other="+name(panel.ShaChiWeapon_Other));
    return true;
};
function ownsInput(owner){
    const panel=state.panel,host=state.host;
    if(!valid(panel)||!valid(host)||!panel.ButtonGroup)return false;
    if(host.HasTutorialOption || host.tutorialStep>=0)return false;
    const page=host.WB_CharacterV5;
    return owner===panel || owner===host || owner===page;
}
function toggle(owner,source){
    if(!ownsInput(owner))return false;
    state.hidden=!state.hidden;
    exports.tickCharacter(state.panel);
    log("toggle source="+source+" hidden="+state.hidden);
    return true;
}
function hasModal(panel){
    const layout=UE.PBZBlueprintFunctionLibrary.GetUILayOut(panel);
    return !!layout&&layout.HasModal();
}
function finishDirectExit(request,resume){
    if(state.directExit!==request)return;
    if(request.timer!==undefined)clearTimeout(request.timer);
    request.timer=undefined;
    state.directExit=undefined;
    if(resume&&state.host===request.host&&state.panel===request.panel&&valid(request.host)&&valid(request.panel))
        controls.begin(request.panel,request.host);
}
function directExitStep(request){
    request.timer=undefined;
    if(state.directExit!==request)return;
    const host=request.host,panel=request.panel;
    if(!valid(host)||!valid(panel)||state.host!==host||state.panel!==panel){finishDirectExit(request,false);return;}
    if(hasModal(panel)){log("direct-exit cancelled: modal active");finishDirectExit(request,true);return;}
    if(typeof host.IsActivated==="function"&&!host.IsActivated()){finishDirectExit(request,false);return;}
    // The native close can reject the request during an opening transition.
    // Keep the single Esc request until that transition completes, with a bounded retry.
    if(typeof host.IsAnyAnimationPlaying==="function"&&host.IsAnyAnimationPlaying()){
        if(++request.waits>=80){log("direct-exit cancelled: transition did not finish");finishDirectExit(request,true);return;}
        request.timer=setTimeout(()=>directExitStep(request),25);
        return;
    }
    if(++request.dispatches>3){log("direct-exit cancelled: native close not acknowledged");finishDirectExit(request,true);return;}
    log("direct-exit dispatch: PopWidget; itemType="+panel.CurrentItemType);
    try{
        // This is the stock system-screen exit. It owns FinishCurrentWidget,
        // input restoration, pause cleanup and removal from the CommonUI layer.
        host.PopWidget();
    }catch(error){finishDirectExit(request,true);throw error;}
    if(state.directExit===request){
        // A stack transition may reject a native pop without returning a result.
        // Re-check the same owner; never pop a replacement menu or another layer.
        request.timer=setTimeout(()=>directExitStep(request),100);
    }
}
function escapeWeaponList(owner,event){
    if(config.escapeClosesAll===false)return false;
    const pending=state.directExit;
    if(pending&&(owner===pending.host||owner===pending.panel||owner===pending.host.WB_CharacterV5))return true;
    if(!ownsInput(owner))return false;
    const panel=state.panel,host=state.host;
    if(typeof panel.IsSecondStep!=="function"||!panel.IsSecondStep())return false;
    const type=panel.CurrentItemType;
    const isMain=type!==undefined&&type===UE.EDisplayItemType.Weapon;
    const isShadow=type!==undefined&&type===UE.EDisplayItemType.ShaChiWeapon;
    if(!isMain&&!isShadow)return false;
    if(hasModal(panel)||typeof host.PopWidget!=="function")return false;
    if(UE.KismetInputLibrary.InputEvent_IsRepeat(event))return true;
    const request={host,panel,waits:0,timer:undefined,dispatches:0};
    state.directExit=request;
    controls.end(panel);
    log("direct-exit requested from secondary weapon list");
    // Leave the current Slate input dispatch before the native exit tears down widgets.
    request.timer=setTimeout(()=>directExitStep(request),0);
    return true;
}
exports.key=function(owner,event){
    const key=UE.KismetInputLibrary.GetKey(event).KeyName.toString();
    if(key==="Escape")return escapeWeaponList(owner,event);
    if(key===config.detailsGamepadKey){
        if(!ownsInput(owner))return false;
        if(hasModal(state.panel)||state.directExit){exports.clearHeld(true);return false;}
        if(!UE.KismetInputLibrary.InputEvent_IsRepeat(event)&&!state.detailPress)
            state.detailPress={panel:state.panel,host:state.host,used:false};
        // Keep L3 available as the existing weapon-order modifier. A plain click
        // is resolved on release, so L3+D-pad never also toggles the details.
        ordering.key(state.panel,event);
        return true;
    }
    if(ownsInput(owner)){
        if(state.detailPress&&/^Gamepad_DPad_/.test(key))state.detailPress.used=true;
        if(ordering.key(state.panel,event)){
            if(state.detailPress)state.detailPress.used=true;
            return true;
        }
    }
    if(key!==config.detailsKeyboardKey)return false;
    if(!ownsInput(owner))return false;
    if(state.detailPress)state.detailPress.used=true;
    if(!UE.KismetInputLibrary.InputEvent_IsRepeat(event))toggle(owner,key);
    return true;
};
exports.keyUp=function(owner,event){
    const released=ordering.release(event);
    if(UE.KismetInputLibrary.GetKey(event).KeyName.toString()!==config.detailsGamepadKey)return released;
    const press=state.detailPress;state.detailPress=undefined;
    const owned=ownsInput(owner);
    if(press&&owned&&press.panel===state.panel&&press.host===state.host&&!press.used&&!state.directExit&&!hasModal(state.panel))
        toggle(owner,config.detailsGamepadKey);
    return owned||released;
};
exports.clearHeld=function(force){state.detailPress=undefined;ordering.clearHeld(force);};
exports.mouse=function(owner,event){
    if(!config.detailsMouseButton||!ownsInput(owner))return false;
    const key=UE.KismetInputLibrary.PointerEvent_GetEffectingButton(event).KeyName.toString();
    return key===config.detailsMouseButton&&!hasModal(state.panel)&&toggle(owner,key);
};
exports.beginCharacter=function(panel){
    exports.clearHeld(true);
    restore(panel.pbzSMVisibility);
    panel.pbzSMVisibility=new Map();
    panel.pbzSMWeaponSignature=undefined;
    state.panel=panel;
    controls.begin(panel,state.host);
    exports.tickCharacter(panel);
    log("character-active currentWidget="+name(panel.MainWeapon_Current)+" currentWeapon="+String(panel.MainWeapon_Current.WeaponID));
};
exports.tickCharacter=function(panel,deltaTime){
    if(state.panel!==panel || !panel.ButtonGroup)return;
    const backpack=TsHelper.getWorldSubsystem(panel,UE.PBZBackPackSubsystem.StaticClass());
    if(backpack){
        const items=[0,1].map(i=>backpack.MainWeapons.IsValidIndex(i)?String(backpack.MainWeapons.Get(i)):"None");
        const signature=String(backpack.GetCurrentMainWeaponIndex())+":"+items.join(":");
        if(signature!==panel.pbzSMWeaponSignature){panel.pbzSMWeaponSignature=signature;panel.InitWeapon(backpack);}
    }
    if(!panel.pbzSMVisibility)panel.pbzSMVisibility=new Map();
    if(state.hidden)for(const id of details)hide(panel[id],panel.pbzSMVisibility);
    else restore(panel.pbzSMVisibility);
    background(state.host,state.hidden);
    controls.tick(panel,deltaTime);
};
exports.endCharacter=function(panel){
    exports.clearHeld(true);
    controls.end(panel);
    restore(panel.pbzSMVisibility);
    if(state.panel===panel){state.panel=undefined;background(state.host,false);}
};
exports.beforeOpen=function(context){
    state.wasPaused=UE.GameplayStatics.IsGamePaused(context);
    log("open-request previouslyPaused="+state.wasPaused);
};
function scheduleUnpause(host){
    if(!noPause || state.wasPaused!==false)return;
    if(host.pbzSMUnpauseTimer!==undefined)clearTimeout(host.pbzSMUnpauseTimer);
    host.pbzSMUnpauseTimer=setTimeout(()=>{
        host.pbzSMUnpauseTimer=undefined;
        if(!valid(host) || state.host!==host)return;
        if(typeof host.IsActivated==="function" && !host.IsActivated())return;
        const before=UE.GameplayStatics.IsGamePaused(host);
        if(before)UE.GameplayStatics.SetGamePaused(host,false);
        log("pause-check before="+before+" after="+UE.GameplayStatics.IsGamePaused(host));
    },0);
}
exports.beforePush=function(host){
    const original=host.bPauseGameWhenOpen;
    if(noPause && typeof original==="boolean")host.bPauseGameWhenOpen=false;
    log("before-push pausePropertyType="+typeof original+" value="+String(host.bPauseGameWhenOpen));
    if(noPause && !host.pbzSMActivated && host.BP_OnWidgetActivated){
        host.pbzSMActivated=()=>scheduleUnpause(host);
        host.BP_OnWidgetActivated.Add(host.pbzSMActivated);
    }
    // Construction can precede BeforePush; either order is handled.
    state.host=host;
    controls.setHost(host);
    scheduleUnpause(host);
};
exports.beginSystem=function(host){
    if(state.directExit)finishDirectExit(state.directExit,false);
    state.host=host;
    switchSkill.beginMenu(host);
    controls.setHost(host);
    visual.reset(host);
    log("menu-constructed mode="+(noPause?"NoPause":"Paused")+" paused="+UE.GameplayStatics.IsGamePaused(host));
    scheduleUnpause(host);
    if(!state.announced){
        state.announced=true;
        try{
            feedback.show("SoulsMenu 0.5.1 | "+(noPause?"NoPause":"Paused")+" | Switch skill="+(config.autoSwitchSkill?"ON":"OFF"));
        }catch(error){log("notification unavailable: "+String(error));}
    }
};
exports.endSystem=function(host){
    switchSkill.menuClosed(host);
    exports.clearHeld(true);
    if(state.directExit&&state.directExit.host===host)finishDirectExit(state.directExit,false);
    controls.end();
    if(host.pbzSMUnpauseTimer!==undefined){clearTimeout(host.pbzSMUnpauseTimer);host.pbzSMUnpauseTimer=undefined;}
    if(host.pbzSMActivated && host.BP_OnWidgetActivated){host.BP_OnWidgetActivated.Remove(host.pbzSMActivated);host.pbzSMActivated=undefined;}
    if(valid(state.panel))restore(state.panel.pbzSMVisibility);
    background(host,false);
    visual.reset(host);
    if(state.host===host){state.host=undefined;state.panel=undefined;state.wasPaused=undefined;}
};
exports.canOpen=function(context){
    const pawn=UE.GameplayStatics.GetPlayerCharacter(context,0);if(!valid(pawn))return false;
    const asc=UE.AbilitySystemBlueprintLibrary.GetAbilitySystemComponent(pawn);if(!valid(asc))return false;
    if(config.allowInCombat===false&&asc.HasMatchingGameplayTag(TsHelper.constructGameplayTag("CharacterState.InCombat")))return false;
    const sequence=TsHelper.getWorldSubsystem(context,UE.PBZLevelSequenceManager.StaticClass());
    if(sequence && sequence.IsInSequence())return false;
    const interact=UE.PBZInteractComponent.GetInteractComponent(pawn);
    if(interact && valid(interact.GetInteractingActor()))return false;
    return !["CharacterState.Dead","CharacterState.ShipNavigation","CharacterState.Space.Air",
        "CharacterState.StatusInfliction","CharacterState.Action","CharacterState.Crouching"]
        .some(tag=>asc.HasMatchingGameplayTag(TsHelper.constructGameplayTag(tag)));
};

