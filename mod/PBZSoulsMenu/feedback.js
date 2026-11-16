"use strict";
const config=require("./config");
let notifier;
exports.show=function(message){
    console.log("[PBZSoulsMenu] "+message);
    if(config.showNotifications){
        try{
            if(!notifier)notifier=require("PBZModLoader/manager").createNotifier(require,m=>console.log("[PBZSoulsMenu] "+m));
            notifier(message,false);
        }catch(error){console.log("[PBZSoulsMenu] notification unavailable: "+String(error));}
    }
};
