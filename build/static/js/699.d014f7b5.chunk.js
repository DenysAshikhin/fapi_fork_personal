"use strict";(self.webpackChunkfapi=self.webpackChunkfapi||[]).push([[699],{3699:function(){function t(e){return t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},t(e)}function e(e){var o=function(e,o){if("object"!==t(e)||null===e)return e;var r=e[Symbol.toPrimitive];if(void 0!==r){var a=r.call(e,o||"default");if("object"!==t(a))return a;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===o?String:Number)(e)}(e,"string");return"symbol"===t(o)?o:String(o)}function o(t,o,r){return(o=e(o))in t?Object.defineProperty(t,o,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[o]=r,t}function r(t,e){var o=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),o.push.apply(o,r)}return o}function a(t){for(var e=1;e<arguments.length;e++){var a=null!=arguments[e]?arguments[e]:{};e%2?r(Object(a),!0).forEach((function(e){o(t,e,a[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(a)):r(Object(a)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(a,e))}))}return t}var n={roundTwoDecimal:function(t){return Math.round(100*(t+Number.EPSILON))/100},roundThreeDecimal:function(t){return Math.round(1e3*(t+Number.EPSILON))/1e3},roundInt:function(t){return Math.round(1*(t+Number.EPSILON))/1},calculateLogarithm:function(t,e){return Math.log(e)/Math.log(t)},calcPOW:function(t){return t.mantissa*Math.pow(10,t.exponent)},secondsToStringWithS:function(t){var e,o,r,a="";return e=Math.floor(t/3600),o=Math.floor(t%3600/60),r=this.roundInt(t%3600%60),e>0&&(a+="".concat(e<10?"0"+e:e,"h:")),o>0&&(a+="".concat(o<10?"0"+o:o,"m:")),a+=r>0?"".concat(r<10?"0"+r:r,"s"):"0s"},secondsToString:function(t){var e,o,r="";return e=Math.floor(t/3600),o=this.roundInt(t%3600/60),e>0&&(r+="".concat(e<10?"0"+e:e,"h:")),r+=o>0?"".concat(o<10?"0"+o:o,"m"):"0s"},bonusColorMap:{1001:{color:"maroon"},1002:{color:"orange"},1003:{color:"purple"},1009:{color:"cyan"},1012:{color:"yellow"},1013:{color:"red"},1014:{color:"blue"},1015:{color:"gray"},1016:{color:"green"}}},i={calcPlantHarvest:function(t,e){return n.roundInt((1+t.Rank)*Math.pow(1.05,t.Rank))*Math.pow(1.02,t.prestige)*e.contagionHarvest},calcProdOutput:function(t,e){var o=t.totalMade,r=t.created,a=e.manualHarvestFormula,i=e.shopProdBonus,l=t.prestige,s=1*i*1*e.contagionPlantProd,c=o*Math.pow(1+.05*(1+.02*a),n.calculateLogarithm(1.25,r))*s*Math.pow(1.02,l);return 1===t.ID&&(c*=e.hpBonus),c},calcFryOutput:function(t){return(n.calculateLogarithm(10,t)-15.75)*(20-Math.min(n.calculateLogarithm(10,t),31)+16)*Math.pow(1.15,n.calculateLogarithm(10,t)-16)},calcCarryOverEXP:function(t){var e=t.plant,o=t.numAutos,r=t.expTick,a=0,n=1;if(o>1){var i=r/o,l=Math.ceil((e.reqExp-e.curExp)/i);if(o>l){a=(o-l)*i;for(var s=10+5*(e.Rank+n)*Math.pow(1.05,e.Rank+n);a>s;)a-=s,n++,s=10+5*(e.Rank+n)*Math.pow(1.05,e.Rank+n)}else a=0}else a=0;return{leftOver:a,numLevels:n}},calcFutureMult:function(t,e){var o=!1===e.string?t:JSON.parse(JSON.stringify(t)),r=!1===e.string?e:JSON.parse(JSON.stringify(e)),a=r.time,i=r.numAuto||0===(null===r||void 0===r?void 0:r.numAuto)?r.numAuto:1,l=o.prestigeBonus*r.expBonus*i;for(o.growthTime=Math.floor(o.TimeNeeded/o.prestigeBonus/(1+.05*r.shopGrowingSpeed)/r.petPlantCombo/r.contagionPlantGrowth),o.growthTime<10&&(o.growthTime=10);a>0;){if(o.timeToLevel=Math.ceil((o.reqExp-o.curExp)/l)*o.growthTime,1===o.ID);var s=0,c=!1;o.timeToLevel>=a?s=a:(s=o.timeToLevel,c=!0),a-=s,o.elapsedTime+=s;var u=0;if(o.elapsedTime>=o.growthTime){u=Math.floor(o.elapsedTime/o.growthTime);var p=o.perHarvest*u*i;if(o.created+=p,o.totalMade+=p,o.futureMult=Math.pow(1+.05*(1+.02*r.manualHarvestFormula),n.calculateLogarithm(1.25,o.created)),c){var h=this.calcCarryOverEXP({plant:o,expTick:l,numAutos:i});o.curExp=h.leftOver,o.Rank+=h.numLevels,o.perHarvest=this.calcPlantHarvest(o,r),o.reqExp=10+5*o.Rank*Math.pow(1.05,o.Rank)}else{var m=u*l,v=o.curExp+m;if(v>o.reqExp){var d=this.calcCarryOverEXP({plant:o,expTick:l,numAutos:i});o.curExp=d.leftOver,o.Rank+=d.numLevels,o.perHarvest=this.calcPlantHarvest(o,r),o.reqExp=10+5*o.Rank*Math.pow(1.05,o.Rank)}else o.curExp=v}o.elapsedTime=o.elapsedTime%o.growthTime}var f=this.calcProdOutput(o,r);o.production=f}return o},calcTimeTillLevel:function(t,e){var o=JSON.parse(JSON.stringify(t)),r=JSON.parse(JSON.stringify(e)),a=r.numAuto||0===(null===r||void 0===r?void 0:r.numAuto)?r.numAuto:1;o.growthTime=Math.floor(o.TimeNeeded/o.prestigeBonus/(1+.05*r.shopGrowingSpeed)/r.petPlantCombo/r.contagionPlantGrowth),o.growthTime<10&&(o.growthTime=10),o.reqExp=10+5*o.Rank*Math.pow(1.05,o.Rank);var n=o.reqExp-o.curExp,i=o.prestigeBonus*r.expBonus*a,l=Math.ceil(n/i);return o.timeToLevel=l*o.growthTime,o},getNextShopCosts:function(t){var e=t.FarmingShopPlantTotalProduction?t.FarmingShopPlantTotalProduction:t.shopProdLevel,o=t.FarmingShopPlantGrowingSpeed?t.FarmingShopPlantGrowingSpeed:t.shopGrowingSpeed,r=t.FarmingShopPlantRankExpEarned?t.FarmingShopPlantRankExpEarned:t.shopRankLevel;return{prodCost:e>50?1e8*Math.pow(100*Math.pow(1.05,e-50),e):1e8*Math.pow(100,e),growthCost:1e10*Math.pow(500,o),expCost:1e15*Math.pow(250,r)}},calcMaxPrestige:function(t){for(var e=t.prestige,o=0,r=!0;r;){var a=o+10*Math.pow(2,e);t.created>=a?(e++,o+=a):r=!1}return e-t.prestige},calcTimeTillPrestige:function(t,e){for(var o=JSON.parse(JSON.stringify(t)),r=JSON.parse(JSON.stringify(e)),a=r.numAuto||0===(null===r||void 0===r?void 0:r.numAuto)?r.numAuto:1,n=!1,i=0,l=0;!n;){var s=this.calcTimeTillLevel(o,r).timeToLevel,c=l+10*Math.pow(2,o.prestige),u=c-o.created,p=Math.ceil(u/(o.perHarvest*a))*o.growthTime;if(p<=0)n=!0,i<=0&&(o.prestige++,n=!1,l+=c);else if(p>s){o.elapsedTime+=s;var h=Math.floor(o.elapsedTime/o.growthTime);o.created+=h*o.perHarvest*a,o.totalMade+=h*o.perHarvest*a,o.Rank++,o.curExp=0,o.perHarvest=this.calcPlantHarvest(o,r),i+=s,o.elapsedTime=o.elapsedTime%o.growthTime}else{n=!0,o.elapsedTime+=p;var m=Math.floor(o.elapsedTime/o.growthTime);o.created+=m*o.perHarvest*a,o.totalMade+=m*o.perHarvest*a,i+=p,o.elapsedTime=o.elapsedTime%o.growthTime}}return{remainingTime:i,prestige:o.prestige,prestiged:n}},calcHPProd:function(t,e){for(var o=JSON.parse(JSON.stringify(t)),r=JSON.parse(JSON.stringify(e)),n=r.numAutos,i=r.time,l=r.totalPotatoes,s=r.curPotatoes,c=0;c<i;c++){for(var u=o.length-1;u>=0;u--){var p=o[u],h=u===o.length-1?0:1*o[u+1].production;p.totalMade+=h;var m=this.calcFutureMult(p,a(a({},r),{},{time:1,numAuto:n[u],string:!1}));o[u]=m}if(l+=o[0].production,s+=o[0].production,r.autoBuyPBC){var v=!1;if(s>=r.nextCosts.prodCost&&(s-=r.nextCosts.prodCost,r.shopProdLevel++,r.shopProdBonus=Math.pow(1.25,r.shopProdLevel),v=!0),s>=r.nextCosts.growthCost&&(s-=r.nextCosts.growthCost,r.shopGrowingSpeed++,v=!0),s>=r.nextCosts.expCost&&(s-=r.nextCosts.expCost,r.shopRankLevel++,r.shopRankEXP=1+.1*r.shopRankLevel,v=!0),v){var d=this.getNextShopCosts(r);r.nextCosts=d}}}return{totalPotatoes:l,potatoeProduction:o[0].production,plants:o,nextCosts:r.nextCosts}},calcAssemblyHP:function(t){var e=1;if((null===t||void 0===t?void 0:t.AssemblerCollection[0].BonusList[0].StartingLevel)<=(null===t||void 0===t?void 0:t.AssemblerCollection[0].Level)){var o=null===t||void 0===t?void 0:t.AssemblerCollection[0].BonusList[0].Gain,r=(null===t||void 0===t?void 0:t.AssemblerCollection[0].Level)-(null===t||void 0===t?void 0:t.AssemblerCollection[0].BonusList[0].StartingLevel);e=Math.pow(1+o,r)}return e},calcContagionBonus:function(t,e){var o=1;if(t.GrasshopperCollection[e].Locked>0){var r=n.calcPOW(t.GrasshopperCollection[e].BaseBonus),a=n.calcPOW(t.GrasshopperCollection[e].Level);o*=Math.pow(1+.01*r,a)}return o},calcExpeditionHP:function(t){var e=1;if(t.ExpeditionsCollection[16].Locked>0){var o=t.ExpeditionsCollection[16];e=Math.pow(1+o.BonusPower,o.Room-1)}return e},calcUniqueHPBonus:function(t){for(var e=1,o=0;o<t.FarmingShopUniqueHealthy.length;o++)e*=t.FarmingShopUniqueHealthy[o]+1;return e},calcFriesHPBonus:function(t){var e=1;return e*=1+n.calcPOW(t.FrenchFriesTotal)*((.01*t.FarmingShopFriesHealthyBonus+.1)*this.calcContagionBonus(t,5))},calcPetHPBonus:function(t){for(var e=1,o=t.EquipedPetID,r=t.PetsCollection,a={},i=0;i<o.length;i++)o[i]>0&&(a[o[i]]=!0);for(var l=0;l<r.length;l++){var s=r[l];if(s.ID in a){s.Rank;for(var c=0;c<s.BonusList.length;c++){var u=s.BonusList[c];if(23===u.ID){var p=Math.pow(1+u.Gain,s.Level)-1,h=n.calculateLogarithm(1.0125,s.Level+1);e+=.5*((p+Math.max(0,.5*(.005*h-1)))*(1+.005*n.calculateLogarithm(1.075,s.Rank+1)))}}}}return e},calcHPBonus:function(t){return n.calcPOW(t.HealthyPotatoBonus)}};self.onmessage=function(t){var e=t.data,o=e.data;e.id,e.data1;try{for(var r=o.finalPlants,n=o.modifiers,l=o.time,s=o.combinations,c=0,u={},p=0,h={},m=0,v={potatoeProduction:0},d=0,f={potatoeProduction:0},g=a(a({},n),{},{time:3600*l}),P=o.start;P<=o.end;P++){var w=s[P];g.numAutos=w;for(var b=i.calcHPProd(r,g),M=0,S=0,T=0;T<b.plants.length;T++){var O=i.calcMaxPrestige(b.plants[T]);M+=O,S+=Math.pow(1.02,b.plants[T].prestige+O)-Math.pow(1.02,b.plants[T].prestige),b.plants[T].picIncrease=O}if(b.totalPotatoes>c&&(c=b.totalPotatoes,u={combo:w,result:b,plants:b.plants}),b.potatoeProduction>p&&(p=b.potatoeProduction,h={combo:w,result:b,plants:b.plants}),M>m){var y={combo:w,result:b,plants:b.plants,potatoeProduction:b.potatoeProduction,picGain:M,picStats:{picLevel:M,picPercent:S}};m=M,v=y}else if(M===m&&b.potatoeProduction>v.potatoeProduction){var C={combo:w,result:b,plants:b.plants,potatoeProduction:b.potatoeProduction,picGain:M,picStats:{picLevel:M,picPercent:S}};m=M,v=C}if(S>d){var L={combo:w,result:b,plants:b.plants,potatoeProduction:b.potatoeProduction,picGain:S,picStats:{picLevel:M,picPercent:S}};d=S,f=L}else if(S===d&&b.potatoeProduction>f.potatoeProduction){var x={combo:w,result:b,plants:b.plants,potatoeProduction:b.potatoeProduction,picGain:S,picStats:{picLevel:M,picPercent:S}};d=S,f=x}self.postMessage({update:!0})}self.postMessage({success:!0,totalPotCombo:u,bestProdCombo:h,bestPicCombo:v,bestPICPercCombo:f})}catch(k){console.log(k)}}}}]);
//# sourceMappingURL=699.d014f7b5.chunk.js.map