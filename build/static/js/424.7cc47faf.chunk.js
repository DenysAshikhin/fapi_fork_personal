!function(){"use strict";function t(e){return t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},t(e)}function e(e){var o=function(e,o){if("object"!==t(e)||null===e)return e;var r=e[Symbol.toPrimitive];if(void 0!==r){var n=r.call(e,o||"default");if("object"!==t(n))return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===o?String:Number)(e)}(e,"string");return"symbol"===t(o)?o:String(o)}function o(t,o,r){return(o=e(o))in t?Object.defineProperty(t,o,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[o]=r,t}function r(t,e){var o=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),o.push.apply(o,r)}return o}function n(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?r(Object(n),!0).forEach((function(e){o(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}var a={roundTwoDecimal:function(t){return Math.round(100*(t+Number.EPSILON))/100},roundThreeDecimal:function(t){return Math.round(1e3*(t+Number.EPSILON))/1e3},roundInt:function(t){return Math.round(1*(t+Number.EPSILON))/1},calculateLogarithm:function(t,e){return Math.log(e)/Math.log(t)},calcPOW:function(t){return t.mantissa*Math.pow(10,t.exponent)},secondsToStringWithS:function(t){var e,o,r,n="";return e=Math.floor(t/3600),o=Math.floor(t%3600/60),r=this.roundInt(t%3600%60),e>0&&(n+="".concat(e<10?"0"+e:e,"h:")),o>0&&(n+="".concat(o<10?"0"+o:o,"m:")),n+=r>0?"".concat(r<10?"0"+r:r,"s"):"0s"},secondsToString:function(t){var e,o,r="";return e=Math.floor(t/3600),o=this.roundInt(t%3600/60),e>0&&(r+="".concat(e<10?"0"+e:e,"h:")),r+=o>0?"".concat(o<10?"0"+o:o,"m"):"0s"},bonusColorMap:{1001:{color:"maroon"},1002:{color:"orange"},1003:{color:"purple"},1009:{color:"cyan"},1012:{color:"yellow"},1013:{color:"red"},1014:{color:"blue"},1015:{color:"gray"},1016:{color:"green"}}},i={calcPlantHarvest:function(t,e){return a.roundInt((1+t.Rank)*Math.pow(1.05,t.Rank))*Math.pow(1.02,t.prestige)*e.contagionHarvest},calcProdOutput:function(t,e){var o=t.totalMade,r=t.created,n=e.manualHarvestFormula,i=e.shopProdBonus,l=t.prestige,s=1*i*1*e.contagionPlantProd,c=o*Math.pow(1+.05*(1+.02*n),a.calculateLogarithm(1.25,r))*s*Math.pow(1.02,l);return 1===t.ID&&(c*=e.hpBonus),c},calcFutureMult:function(t,e){for(var o=!1===e.string?t:JSON.parse(JSON.stringify(t)),r=!1===e.string?e:JSON.parse(JSON.stringify(e)),n=r.time,i=r.numAuto||0===(null===r||void 0===r?void 0:r.numAuto)?r.numAuto:1,l=o.prestigeBonus*r.expBonus*i;n>0;){o.timeToLevel=Math.ceil((o.reqExp-o.curExp)/l)*o.growthTime;var s=0,c=!1;o.timeToLevel>=n?s=n:(s=o.timeToLevel,c=!0),n-=s,o.elapsedTime+=s;var u=0;if(o.elapsedTime>=o.growthTime){u=Math.floor(o.elapsedTime/o.growthTime);var p=o.perHarvest*u*i;if(o.created+=p,o.totalMade+=p,o.futureMult=Math.pow(1+.05*(1+.02*r.manualHarvestFormula),a.calculateLogarithm(1.25,o.created)),c)o.Rank++,o.curExp=0,o.perHarvest=this.calcPlantHarvest(o,r),o.reqExp=10+5*o.Rank*Math.pow(1.05,o.Rank);else{var h=u*l;o.curExp+=h,o.curExp>o.reqExp&&(o.Rank++,o.curExp=0,o.perHarvest=this.calcPlantHarvest(o,r),o.reqExp=10+5*o.Rank*Math.pow(1.05,o.Rank))}o.elapsedTime=o.elapsedTime%o.growthTime}var m=this.calcProdOutput(o,r);o.production=m}return o},calcTimeTillLevel:function(t,e){var o=JSON.parse(JSON.stringify(t)),r=JSON.parse(JSON.stringify(e)),n=r.numAuto||0===(null===r||void 0===r?void 0:r.numAuto)?r.numAuto:1;o.growthTime=Math.floor(o.TimeNeeded/o.prestigeBonus/(1+.05*r.shopGrowingSpeed)/r.petPlantCombo/r.contagionPlantGrowth),o.growthTime<10&&(o.growthTime=10),o.reqExp=10+5*o.Rank*Math.pow(1.05,o.Rank);var a=o.reqExp-o.curExp,i=o.prestigeBonus*r.expBonus*n,l=Math.ceil(a/i);return o.timeToLevel=l*o.growthTime,o},getNextShopCosts:function(t){var e=t.FarmingShopPlantTotalProduction?t.FarmingShopPlantTotalProduction:t.shopProdLevel,o=t.FarmingShopPlantGrowingSpeed?t.FarmingShopPlantGrowingSpeed:t.shopGrowingSpeed,r=t.FarmingShopPlantRankExpEarned?t.FarmingShopPlantRankExpEarned:t.shopRankLevel;return{prodCost:1e8*Math.pow(100,e),growthCost:1e10*Math.pow(500,o),expCost:1e15*Math.pow(250,r)}},calcTimeTillPrestige:function(t,e){for(var o=JSON.parse(JSON.stringify(t)),r=JSON.parse(JSON.stringify(e)),n=r.numAuto||0===(null===r||void 0===r?void 0:r.numAuto)?r.numAuto:1,a=!1,i=0;!a;){var l=this.calcTimeTillLevel(o,r).timeToLevel,s=10*Math.pow(2,o.prestige)-o.created,c=Math.ceil(s/(o.perHarvest*n))*o.growthTime;if(c<=0)a=!0,i<=0&&(o.prestige++,a=!1);else if(c>l){o.elapsedTime+=l;var u=Math.floor(o.elapsedTime/o.growthTime);o.created+=u*o.perHarvest*n,o.totalMade+=u*o.perHarvest*n,o.Rank++,o.curExp=0,o.perHarvest=this.calcPlantHarvest(o,r),i+=l,o.elapsedTime=o.elapsedTime%o.growthTime}else{a=!0,o.elapsedTime+=c;var p=Math.floor(o.elapsedTime/o.growthTime);o.created+=p*o.perHarvest*n,o.totalMade+=p*o.perHarvest*n,i+=c,o.elapsedTime=o.elapsedTime%o.growthTime}}return{remainingTime:i,prestige:o.prestige,prestiged:a}},calcHPProd:function(t,e){for(var o=JSON.parse(JSON.stringify(t)),r=JSON.parse(JSON.stringify(e)),a=r.numAutos,i=r.time,l=r.totalPotatoes,s=r.curPotatoes,c=0;c<i;c++){for(var u=o.length-1;u>=0;u--){var p=o[u],h=u===o.length-1?0:1*o[u+1].production;p.totalMade+=h;var m=this.calcFutureMult(p,n(n({},r),{},{time:1,numAuto:a[u],string:!1}));o[u]=m}if(l+=o[0].production,s+=o[0].production,r.autoBuyPBC){var v=!1;if(s>=r.nextCosts.prodCost&&(s-=r.nextCosts.prodCost,r.shopProdLevel++,r.shopProdBonus=Math.pow(1.25,r.shopProdLevel),v=!0),s>=r.nextCosts.growthCost&&(s-=r.nextCosts.growthCost,r.shopGrowingSpeed++,v=!0),s>=r.nextCosts.expCost&&(s-=r.nextCosts.expCost,r.shopRankLevel++,r.shopRankEXP=1+.1*r.shopRankLevel,v=!0),v){var d=this.getNextShopCosts(r);r.nextCosts=d}}}return{totalPotatoes:l,potatoeProduction:o[0].production,plants:o,nextCosts:r.nextCosts}},calcAssemblyHP:function(t){var e=1;if((null===t||void 0===t?void 0:t.AssemblerCollection[0].BonusList[0].StartingLevel)<=(null===t||void 0===t?void 0:t.AssemblerCollection[0].Level)){var o=null===t||void 0===t?void 0:t.AssemblerCollection[0].BonusList[0].Gain,r=(null===t||void 0===t?void 0:t.AssemblerCollection[0].Level)-(null===t||void 0===t?void 0:t.AssemblerCollection[0].BonusList[0].StartingLevel);e=Math.pow(1+o,r)}return e},calcContagionBonus:function(t,e){var o=1;if(t.GrasshopperCollection[e].Locked>0){var r=a.calcPOW(t.GrasshopperCollection[e].BaseBonus),n=a.calcPOW(t.GrasshopperCollection[e].Level);o*=Math.pow(1+.01*r,n)}return o},calcExpeditionHP:function(t){var e=1;if(t.ExpeditionsCollection[16].Locked>0){var o=t.ExpeditionsCollection[16];e=Math.pow(1+o.BonusPower,o.Room-1)}return e},calcUniqueHPBonus:function(t){for(var e=1,o=0;o<t.FarmingShopUniqueHealthy.length;o++)e*=t.FarmingShopUniqueHealthy[o]+1;return e},calcFriesHPBonus:function(t){var e=1;return e*=1+a.calcPOW(t.FrenchFriesTotal)*((.01*t.FarmingShopFriesHealthyBonus+.1)*this.calcContagionBonus(t,5))},calcPetHPBonus:function(t){for(var e=1,o=t.EquipedPetID,r=t.PetsCollection,n={},i=0;i<o.length;i++)o[i]>0&&(n[o[i]]=!0);for(var l=0;l<r.length;l++){var s=r[l];if(s.ID in n){s.Rank;for(var c=0;c<s.BonusList.length;c++){var u=s.BonusList[c];if(23===u.ID){var p=Math.pow(1+u.Gain,s.Level)-1,h=a.calculateLogarithm(1.0125,s.Level+1);e+=.5*((p+Math.max(0,.5*(.005*h-1)))*(1+.005*a.calculateLogarithm(1.075,s.Rank+1)))}}}}return e},calcHPBonus:function(t){var e=1;e*=this.calcAssemblyHP(t),e*=this.calcContagionBonus(t,0),e*=Math.pow(1.25,t.SoulFertilizer),e*=this.calcExpeditionHP(t),e*=Math.pow(1.1,t.FarmingShopPlantHealthyPotatoEarning),e*=this.calcUniqueHPBonus(t),e*=this.calcFriesHPBonus(t),e*=this.calcPetHPBonus(t),e*=Math.pow(1.05,t.CowShopHealthyPotato);a.calcPOW(t.HealthyPotatoBonus);return e}};self.onmessage=function(t){var e=t.data,o=e.data;e.id,e.data1;try{for(var r=o.finalPlants,a=o.modifiers,l=o.time,s=o.combinations,c=0,u={},p=0,h={},m=n(n({},a),{},{time:3600*l}),v=o.start;v<=o.end;v++){var d=s[v];m.numAutos=d;var g=i.calcHPProd(r,m);g.totalPotatoes>c&&(c=g.totalPotatoes,u={combo:d,result:g,plants:g.plants}),g.potatoeProduction>p&&(p=g.potatoeProduction,h={combo:d,result:g,plants:g.plants}),self.postMessage({update:!0})}self.postMessage({success:!0,totalPotCombo:u,bestProdCombo:h})}catch(f){console.log(f)}}}();
//# sourceMappingURL=424.7cc47faf.chunk.js.map