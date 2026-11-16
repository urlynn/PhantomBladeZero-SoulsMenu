"use strict";
const UE=require("ue"),puerts=require("puerts"),TsHelper=require("Library/TsHelper").default;
const feedback=require("./feedback"),config=require("./config");
let loaded=false,path="",writable=true,l3=false,warned=false,rebuilding=false;
const orders={main:[],shadow:[]};
function canon(id){return String(id).toLowerCase();}
function clean(ids){return Array.isArray(ids)?[...new Set(ids.filter(v=>typeof v==="string"&&v.length>0&&v.length<256&&canon(v)!=="none").map(canon))].slice(0,4096):[];}
function load(){
    if(loaded)return;loaded=true;
    try{
        let dir=String(UE.KismetSystemLibrary.GetProjectSavedDirectory()||"");
        if(UE.BlueprintPathsLibrary&&typeof UE.BlueprintPathsLibrary.ConvertRelativePathToFull==="function")dir=String(UE.BlueprintPathsLibrary.ConvertRelativePathToFull(dir,""));
        if(!dir||/\/SaveGames(?:\/|$)/i.test(dir.replace(/\\/g,"/")))throw Error("invalid Saved directory");
        path=dir.replace(/\\/g,"/").replace(/\/+$/,"")+"/PBZSoulsMenu-weapon-order-v1.json";
        const text=puerts.$ref("");
        if(UE.EasyCsv.LoadStringFromLocalFile(path,text)){
            const data=JSON.parse(puerts.$unref(text));
            if(data.version!==1||!data.orders||!Array.isArray(data.orders.main)||!Array.isArray(data.orders.shadow))throw Error("unsupported order file");
            orders.main=clean(data.orders.main);orders.shadow=clean(data.orders.shadow);
        }
        console.log("[PBZSoulsMenu] order profile="+path);
    }catch(error){writable=false;console.log("[PBZSoulsMenu] order profile read failed; existing file preserved: "+String(error));}
}
function save(){
    if(!writable)return false;
    try{if(UE.EasyCsv.SaveStringToFileWithFullPath(JSON.stringify({version:1,orders},null,2),path)===true)return true;}
    catch(error){console.log("[PBZSoulsMenu] order write failed: "+String(error));}
    return false;
}
exports.arrange=function(panel,kind,ids,tab){
    if(config.fixedWeaponOrder===false)return ids;
    load();const rank=orders[kind];let changed=false;
    for(const id of ids){const key=canon(id);if(!rank.includes(key)){rank.push(key);changed=true;}}
    if(changed&&!save()&&!warned){warned=true;feedback.show("排序暂未写入磁盘，本次游戏内仍保持固定");}
    const positions=new Map(rank.map((id,i)=>[id,i]));
    const result=ids.slice().sort((a,b)=>positions.get(canon(a))-positions.get(canon(b)));
    panel.pbzSMOrder={kind,ids:result.slice(),tab};
    if(!panel.pbzSMOrderHint){panel.pbzSMOrderHint=true;feedback.show("固定排序："+config.sortKeyboardModifier+"+方向键，或按住"+config.sortGamepadModifier+"+十字键");}
    return result;
};
exports.selectedIndex=function(ids,id){const i=ids.findIndex(v=>canon(v)===canon(id));return i<0?0:i;};
exports.clearHeld=function(force){if(force||!rebuilding)l3=false;};
exports.release=function(event){
    if(UE.KismetInputLibrary.GetKey(event).KeyName.toString()!==config.sortGamepadModifier)return false;
    const held=l3;l3=false;return held;
};
exports.key=function(panel,event){
    if(config.fixedWeaponOrder===false||!panel.pbzSMOrder||!panel.IsSecondStep||!panel.IsSecondStep())return false;
    const data=panel.pbzSMOrder,type=panel.CurrentItemType;
    if((data.kind==="main"&&type!==UE.EDisplayItemType.Weapon)||(data.kind==="shadow"&&type!==UE.EDisplayItemType.ShaChiWeapon))return false;
    const layout=UE.PBZBlueprintFunctionLibrary.GetUILayOut(panel);if(layout&&layout.HasModal())return false;
    const key=UE.KismetInputLibrary.GetKey(event).KeyName.toString();
    if(key===config.sortGamepadModifier){l3=true;return true;}
    const arrows={Left:-1,Right:1,Up:-3,Down:3,Gamepad_DPad_Left:-1,Gamepad_DPad_Right:1,Gamepad_DPad_Up:-3,Gamepad_DPad_Down:3};
    if(arrows[key]===undefined)return false;
    const pad=key.startsWith("Gamepad_");
    const modifier={Control:"InputEvent_IsControlDown",Shift:"InputEvent_IsShiftDown",Alt:"InputEvent_IsAltDown"}[config.sortKeyboardModifier];
    if(pad?!l3:!(modifier&&typeof UE.KismetInputLibrary[modifier]==="function"&&UE.KismetInputLibrary[modifier](event)))return false;
    if(UE.KismetInputLibrary.InputEvent_IsRepeat(event))return true;
    const group=panel.W_SystemPanel_V1&&panel.W_SystemPanel_V1.ButtonGroup;
    const button=group&&group.GetSelectedButtonBase();if(!button)return true;
    const id=String(panel.getItemFromButton(button)),i=data.ids.findIndex(v=>canon(v)===canon(id)),j=i+arrows[key];
    if(i<0||j<0||j>=data.ids.length||(Math.abs(arrows[key])===1&&Math.floor(i/3)!==Math.floor(j/3)))return true;
    const rank=orders[data.kind],a=rank.indexOf(canon(data.ids[i])),b=rank.indexOf(canon(data.ids[j]));
    if(a<0||b<0)return true;
    [rank[a],rank[b]]=[rank[b],rank[a]];
    const persisted=save();
    const backpack=TsHelper.getWorldSubsystem(panel,UE.PBZBackPackSubsystem.StaticClass());
    rebuilding=true;
    try{
        if(data.kind==="main")panel.initMainWeaponByTabID(data.tab,backpack,id);
        else panel.initShaChiWeaponByTabID(data.tab,backpack,id);
    }finally{rebuilding=false;}
    feedback.show(persisted?"武器位置已保存":"武器位置已调整，但磁盘保存失败，仅本次生效");
    return true;
};
