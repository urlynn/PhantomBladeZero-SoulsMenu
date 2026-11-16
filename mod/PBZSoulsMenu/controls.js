"use strict";
const UE=require("ue");
const TsHelper=require("Library/TsHelper").default;
const config=require("./config");
const enabled=!!config.noPause&&config.allowMovement!==false;
const keys=new Set(),axes={};
const moveKeys=new Set(["W","A","S","D"]);
const stickKeys=/^Gamepad_(Left|Right)Stick_(Up|Down|Left|Right)$/;
let panel,host;
function valid(o){if(!o)return false;try{return UE.KismetSystemLibrary.IsValid(o);}catch(e){if(e.message==="passing a invalid object")return false;throw e;}}
function inMenu(){return enabled&&valid(panel)&&valid(host)&&panel.ButtonGroup&&!host.HasTutorialOption&&!(host.tutorialStep>=0);}
function blocked(){
    if(!inMenu()||UE.GameplayStatics.IsGamePaused(host))return true;
    if(typeof host.IsActivated==="function"&&!host.IsActivated())return true;
    const layout=UE.PBZBlueprintFunctionLibrary.GetUILayOut(panel);
    return !!layout&&layout.HasModal();
}
function clear(){keys.clear();for(const key of Object.keys(axes))delete axes[key];}
exports.clear=clear;
exports.enabled=enabled;
exports.desiredConfig=function(owner){
    const c=new UE.UIInputConfig();
    // Keep menu mouse/focus/action routing. Only movement is released; look stays locked.
    c.InputMode=UE.ECommonInputMode.Menu;
    c.MouseCaptureMode=UE.EMouseCaptureMode.NoCapture;
    c.MouseLockMode=UE.EMouseLockMode.DoNotLock;
    c.bHideCursorDuringViewportCapture=false;
    const allow=enabled&&!owner.HasTutorialOption&&!(owner.tutorialStep>=0);
    c.bIgnoreMoveInput=!allow;c.bIgnoreLookInput=true;
    console.log("[PBZSoulsMenu] desired-config menu=true ignoreMove="+c.bIgnoreMoveInput+" ignoreLook="+c.bIgnoreLookInput);
    return c;
};
exports.begin=function(p,h){clear();panel=p;host=h;p.pbzSMMovementLogged=false;p.pbzSMInputBlockedLogged=false;p.pbzSMMoveSample=undefined;
    if(!enabled)return;
    // Right-stick scrolling must not run in parallel with movement / camera control.
    if(typeof p.UnregisterScrollRecipientExternal==="function")
        for(const id of ["W_UnifiedTextDescription","W_UnifiedTextDescription_Weapon"])
            if(p[id]&&p[id].PBZScrollBox)p.UnregisterScrollRecipientExternal(p[id].PBZScrollBox);
    console.log("[PBZSoulsMenu] menu movement enabled; stick=left; camera=locked");
};
exports.setHost=function(h){host=h;};
exports.end=function(p){if(!p||panel===p){clear();panel=undefined;host=undefined;}};
exports.key=function(owner,event,pressed){
    const key=UE.KismetInputLibrary.GetKey(event).KeyName.toString();
    if(!pressed)keys.delete(key);
    if(!inMenu()||!exports.owns(owner))return false;
    if(moveKeys.has(key)){if(pressed)keys.add(key);return true;}
    // D-pad keys are deliberately NOT swallowed.
    return stickKeys.test(key);
};
exports.owns=function(owner){return owner===panel||owner===host||(host&&owner===host.WB_CharacterV5);};
exports.analog=function(owner,event){
    if(!inMenu()||!exports.owns(owner))return false;
    const key=UE.KismetInputLibrary.GetKey(event).KeyName.toString();
    if(!/^Gamepad_(Left|Right)[XY]$/.test(key))return false;
    axes[key]=Math.max(-1,Math.min(1,UE.KismetInputLibrary.GetAnalogValue(event)));
    return true;
};
function vector(x,y,z){const v=new UE.Vector();v.X=x;v.Y=y;v.Z=z;return v;}
function radial(x,y){const m=Math.hypot(x,y),d=config.stickDeadZone;if(m<=d)return[0,0];const scale=(Math.min(1,m)-d)/(1-d)/m;return[x*scale,y*scale];}
exports.tick=function(p,dt){
    if(panel!==p||!enabled)return;
    if(blocked()){clear();return;}
    const pawn=UE.GameplayStatics.GetPlayerCharacter(p,0),pc=UE.GameplayStatics.GetPlayerController(p,0);
    if(!valid(pawn)||!valid(pc))return;
    const asc=UE.AbilitySystemBlueprintLibrary.GetAbilitySystemComponent(pawn);
    const blockedTag=asc&&["CharacterState.Dead","CharacterState.StatusInfliction","CharacterState.Action"].find(t=>asc.HasMatchingGameplayTag(TsHelper.constructGameplayTag(t)));
    if(blockedTag){
        if(!p.pbzSMMoveTagLogged){p.pbzSMMoveTagLogged=true;console.log("[PBZSoulsMenu] movement gated by "+blockedTag);}
        clear();return;
    }
    const [sx,sy]=radial(axes.Gamepad_LeftX||0,axes.Gamepad_LeftY||0);
    let x=(keys.has("D")?1:0)-(keys.has("A")?1:0)+sx;
    let y=(keys.has("W")?1:0)-(keys.has("S")?1:0)+sy;
    const length=Math.hypot(x,y);if(length>1){x/=length;y/=length;}
    if((x||y)&&!pc.IsMoveInputIgnored()){
        const yaw=pc.GetControlRotation().Yaw*Math.PI/180;
        pawn.AddMovementInput(vector(Math.cos(yaw),Math.sin(yaw),0),y,false);
        pawn.AddMovementInput(vector(-Math.sin(yaw),Math.cos(yaw),0),x,false);
        if(!p.pbzSMMovementLogged){p.pbzSMMovementLogged=true;console.log("[PBZSoulsMenu] movement injected; force=false; x="+x+" y="+y);}
        if(typeof pawn.K2_GetActorLocation==="function"){
            const point=pawn.K2_GetActorLocation();
            if(!p.pbzSMMoveSample)p.pbzSMMoveSample={x:point.X,y:point.Y,time:Date.now()};
            else if(!p.pbzSMMoveSample.done&&Date.now()-p.pbzSMMoveSample.time>500){
                p.pbzSMMoveSample.done=true;
                console.log("[PBZSoulsMenu] movement sample displacement="+Math.hypot(point.X-p.pbzSMMoveSample.x,point.Y-p.pbzSMMoveSample.y).toFixed(1));
            }
        }
    }else if((x||y)&&!p.pbzSMInputBlockedLogged){p.pbzSMInputBlockedLogged=true;console.log("[PBZSoulsMenu] movement still blocked by player controller");}
};
