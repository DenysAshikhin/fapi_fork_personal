!function(){"use strict";function t(r){return t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},t(r)}function r(r){var o=function(r,o){if("object"!==t(r)||null===r)return r;var e=r[Symbol.toPrimitive];if(void 0!==e){var n=e.call(r,o||"default");if("object"!==t(n))return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===o?String:Number)(r)}(r,"string");return"symbol"===t(o)?o:String(o)}function o(t,o,e){return(o=r(o))in t?Object.defineProperty(t,o,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[o]=e,t}function e(t,r){var o=Object.keys(t);if(Object.getOwnPropertySymbols){var e=Object.getOwnPropertySymbols(t);r&&(e=e.filter((function(r){return Object.getOwnPropertyDescriptor(t,r).enumerable}))),o.push.apply(o,e)}return o}function n(t){for(var r=1;r<arguments.length;r++){var n=null!=arguments[r]?arguments[r]:{};r%2?e(Object(n),!0).forEach((function(r){o(t,r,n[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):e(Object(n)).forEach((function(r){Object.defineProperty(t,r,Object.getOwnPropertyDescriptor(n,r))}))}return t}var a={roundTwoDecimal:function(t){return Math.round(100*(t+Number.EPSILON))/100},roundThreeDecimal:function(t){return Math.round(1e3*(t+Number.EPSILON))/1e3},roundInt:function(t){return Math.round(1*(t+Number.EPSILON))/1},calculateLogarithm:function(t,r){return Math.log(r)/Math.log(t)},calcPOW:function(t){return t.mantissa*Math.pow(10,t.exponent)},calcProdOutput:function(t,r){var o=t.totalMade,e=t.created,n=r.manualHarvestFormula,a=r.shopProdBonus,i=t.prestige,u=1*a*1*r.contagionPlantProd;return o*Math.pow(1+.05*(1+.02*n),this.calculateLogarithm(1.25,e))*u*Math.pow(1.02,i)},calcFutureMult:function(t,r){for(var o=JSON.parse(JSON.stringify(t)),e=JSON.parse(JSON.stringify(r)),n=e.time,a=e.numAuto||0===(null===e||void 0===e?void 0:e.numAuto)?e.numAuto:1;n>0;){o.growthTime=Math.floor(o.TimeNeeded/o.prestigeBonus/(1+.05*e.shopGrowingSpeed)/e.petPlantCombo/e.contagionPlantGrowth),o.growthTime<10&&(o.growthTime=10),o.reqExp=10+5*o.Rank*Math.pow(1.05,o.Rank),o.timeToLevel=(o.reqExp-o.curExp)/(o.prestigeBonus*e.expBonus*a)*o.growthTime;var i=0,u=!1;o.timeToLevel>=n?i=n:(i=o.timeToLevel,u=!0),n-=i,o.perHarvest=this.roundInt((1+o.Rank)*Math.pow(1.05,o.Rank))*Math.pow(1.02,o.prestige);var c=o.perHarvest*(i/o.growthTime)*a;if(o.futureMult=Math.pow(1+.05*(1+.02*e.manualHarvestFormula),this.calculateLogarithm(1.25,o.created+c)),o.created+=c,o.totalMade+=c,u)o.Rank++,o.curExp=0;else{var l=i/o.growthTime*(o.prestigeBonus*e.expBonus*a);o.curExp+=l}var s=this.calcProdOutput(o,e);o.production=s}return o},calcTimeTillLevel:function(t,r){var o=JSON.parse(JSON.stringify(t)),e=JSON.parse(JSON.stringify(r)),n=e.numAuto||0===(null===e||void 0===e?void 0:e.numAuto)?e.numAuto:1;if(5===o.ID);o.growthTime=Math.floor(o.TimeNeeded/o.prestigeBonus/(1+.05*e.shopGrowingSpeed)/e.petPlantCombo/e.contagionPlantGrowth),o.growthTime<10&&(o.growthTime=10),o.reqExp=10+5*o.Rank*Math.pow(1.05,o.Rank);var a=o.reqExp-o.curExp,i=o.prestigeBonus*e.expBonus*n;return o.timeToLevel=a/i*o.growthTime,o},calcPerHarvest:function(t){return this.roundInt((1+t.Rank)*Math.pow(1.05,t.Rank))*Math.pow(1.02,t.prestige)},calcTimeTillPrestige:function(t,r){for(var o=JSON.parse(JSON.stringify(t)),e=JSON.parse(JSON.stringify(r)),n=e.numAuto||0===(null===e||void 0===e?void 0:e.numAuto)?e.numAuto:1,a=!1,i=0;!a;){var u=this.calcTimeTillLevel(o,e).timeToLevel,c=(10*Math.pow(2,o.prestige)-o.created)/(o.perHarvest*n)*o.growthTime;c<0?a=!0:c>u?(o.created+=u/o.growthTime*o.perHarvest*n,o.Rank++,o.curExp=0,o.perHarvest=this.calcPerHarvest(o),i+=u):(a=!0,o.created+=c/o.growthTime*o.perHarvest*n,i+=c)}return i},calcHPProd:function(t,r){for(var o=JSON.parse(JSON.stringify(t)),e=JSON.parse(JSON.stringify(r)),i=e.numAutos,u=e.time,c=0,l=0;l<u;l++){for(var s=o.length-1;s>=0;s--){var p=o[s],m=s===o.length-1?0:1*o[s+1].production;p.totalMade+=m;var f=a.calcFutureMult(p,n(n({},e),{},{time:1,numAuto:i[s]}));o[s]=f}c+=o[0].production}return{totalPotatoes:c,potatoeProduction:o[0].production,plants:o}},secondsToStringWithS:function(t){var r,o,e,n="";return r=Math.floor(t/3600),o=Math.floor(t%3600/60),e=t%3600%60,r>0&&(n+="".concat(r<10?"0"+r:r,"h:")),o>0&&(n+="".concat(o<10?"0"+o:o,"m:")),n+=e>0?"".concat(e<10?"0"+e:e,"s"):"0s"},secondsToString:function(t){var r,o,e="";return r=Math.floor(t/3600),o=this.roundInt(t%3600/60),r>0&&(e+="".concat(r<10?"0"+r:r,"h:")),e+=o>0?"".concat(o<10?"0"+o:o,"m"):"0s"},bonusColorMap:{1001:{color:"maroon"},1002:{color:"orange"},1003:{color:"purple"},1009:{color:"cyan"},1012:{color:"yellow"},1013:{color:"red"},1014:{color:"blue"},1015:{color:"gray"},1016:{color:"green"}}},i=a;self.onmessage=function(t){for(var r=t.data,o=r.data,e=(r.id,r.data1,o.finalPlants),a=o.modifiers,u=o.time,c=o.combinations,l=0,s={},p=0,m={},f=o.start;f<o.end;f++){var g=c[f],h=i.calcHPProd(e,n(n({},a),{},{numAutos:g,time:3600*u}));h.totalPotatoes>l&&(l=h.totalPotatoes,s={combo:g,result:h,plants:h.plants}),h.potatoeProduction>p&&(p=h.potatoeProduction,m={combo:g,result:h,plants:h.plants}),self.postMessage({update:!0})}self.postMessage({success:!0,totalPotCombo:s,bestProdCombo:m})}}();
//# sourceMappingURL=960.4d38b46b.chunk.js.map