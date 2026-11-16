"use strict";
const UE=require("ue");
const config=require("./config");
function valid(o){if(!o)return false;try{return UE.KismetSystemLibrary.IsValid(o);}catch(e){if(e.message==="passing a invalid object")return false;throw e;}}
function name(o){return valid(o)&&typeof o.GetName==="function"?String(o.GetName()):"";}
function isA(o,cls){return !!cls&&typeof o.GetClass==="function"&&UE.KismetMathLibrary.ClassIsChildOf(o.GetClass(),cls.StaticClass());}
function size(geometry){return UE.SlateBlueprintLibrary.GetLocalSize(geometry);}
function bounds(widget,root){
    const g=widget.GetCachedGeometry(),s=size(g);
    const p=UE.SlateBlueprintLibrary.AbsoluteToLocal(root.GetCachedGeometry(),UE.SlateBlueprintLibrary.LocalToAbsolute(g,new UE.Vector2D()));
    const corner=new UE.Vector2D();corner.X=s.X;corner.Y=s.Y;
    const q=UE.SlateBlueprintLibrary.AbsoluteToLocal(root.GetCachedGeometry(),UE.SlateBlueprintLibrary.LocalToAbsolute(g,corner));
    return{x:Math.min(p.X,q.X),y:Math.min(p.Y,q.Y),w:Math.abs(q.X-p.X),h:Math.abs(q.Y-p.Y)};
}
function rootOf(o){return valid(o)&&o.WidgetTree?o.WidgetTree.RootWidget:undefined;}
function discover(host,panel){
    const root=rootOf(host);if(!valid(root))return undefined;
    const screen=size(root.GetCachedGeometry());if(screen.X<10||screen.Y<10)return undefined;
    const pending=[root,rootOf(panel),rootOf(host.WB_CharacterV5)],seen=new Set(),targets=[];
    for(let n=0;n<pending.length&&n<2048;n++){
        const widget=pending[n];if(!valid(widget)||seen.has(widget))continue;seen.add(widget);
        const nested=rootOf(widget);if(valid(nested)&&nested!==widget)pending.push(nested);
        const count=typeof widget.GetChildrenCount==="function"?widget.GetChildrenCount():0;
        for(let i=0;i<count;i++)pending.push(widget.GetChildAt(i));
        const isBlur=isA(widget,UE.BackgroundBlur);
        const isImage=isA(widget,UE.Image);
        const isBorder=isA(widget,UE.Border);
        if(!isBlur&&!isImage&&!isBorder)continue;
        const b=bounds(widget,root);
        if(b.w<1||b.h<1)continue;
        const brush=isBorder?widget.Background:widget.Brush;
        const resource=brush?name(brush.ResourceObject):"";
        const isBgResource=/(?:^T_BG_|Background|_BG_Common|_BackGround)/i.test(resource);
        const reachesRight=b.x+b.w>screen.X*0.48;
        const sharedBackdrop=b.w>=screen.X*0.60&&b.h>=screen.Y*0.45;
        const rightBackdrop=b.x>=screen.X*0.28&&b.w>=screen.X*0.15&&b.h>=screen.Y*0.40;
        if(!reachesRight||(!sharedBackdrop&&!rightBackdrop&&!isBgResource))continue;
        targets.push({widget,blur:isBlur,border:isBorder,opacity:count===0||(!isBlur&&!isBorder),resource,bounds:b});
    }
    if(!targets.length&&host.pbzSMVisualAttempts<6)return undefined;
    console.log("[PBZSoulsMenu] backdrop targets="+targets.map(t=>name(t.widget)+":"+t.resource+":"+Math.round(t.bounds.x)+","+Math.round(t.bounds.w)+","+Math.round(t.bounds.h)).join(" | "));
    return targets;
}
exports.apply=function(host,panel,hidden){
    if(!valid(host))return;
    if(!hidden){exports.restore(host);return;}
    if(!host.pbzSMVisualSaved)host.pbzSMVisualSaved=new Map();
    if(!host.pbzSMVisualTargets){host.pbzSMVisualAttempts=(host.pbzSMVisualAttempts||0)+1;host.pbzSMVisualTargets=discover(host,panel);}
    const alpha=Math.max(0,Math.min(1,Number(config.rightBackdropOpacity)||0));
    for(const target of host.pbzSMVisualTargets||[]){
        const w=target.widget;if(!valid(w))continue;
        let saved=host.pbzSMVisualSaved.get(w);
        if(!saved){
            saved={opacity:w.GetRenderOpacity()};if(target.blur)saved.blur=w.BlurStrength;
            if(target.border&&w.BrushColor){const c=w.BrushColor;saved.color={R:c.R,G:c.G,B:c.B,A:c.A};}
            host.pbzSMVisualSaved.set(w,saved);
        }
        if(target.opacity){
            w.SetRenderOpacity(alpha);
            // Zero opacity must also remove material-backed image draws and their hit boxes.
            // Don't claim ownership of visibility already hidden by the detail-content toggle.
            if(alpha===0&&w.GetVisibility()!==UE.ESlateVisibility.Hidden){
                if(saved.visibility===undefined)saved.visibility=w.GetVisibility();
                w.SetVisibility(UE.ESlateVisibility.Hidden);
            }
        }
        // RenderOpacity alone can leave the post-process blur active.
        if(target.blur)w.SetBlurStrength(0);
        if(target.border&&saved.color){const c=new UE.LinearColor();Object.assign(c,saved.color);c.A=alpha;w.SetBrushColor(c);}
    }
};
exports.restore=function(host){
    if(!valid(host)||!host.pbzSMVisualSaved)return;
    for(const [w,s] of host.pbzSMVisualSaved){
        if(!valid(w))continue;
        w.SetRenderOpacity(s.opacity);
        if(s.visibility!==undefined)w.SetVisibility(s.visibility);
        if(s.blur!==undefined)w.SetBlurStrength(s.blur);
        if(s.color){const c=new UE.LinearColor();Object.assign(c,s.color);w.SetBrushColor(c);}
    }
    host.pbzSMVisualSaved.clear();
};
exports.reset=function(host){exports.restore(host);if(host){host.pbzSMVisualTargets=undefined;host.pbzSMVisualAttempts=0;}};
