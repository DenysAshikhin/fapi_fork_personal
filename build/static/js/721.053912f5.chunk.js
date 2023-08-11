!function(){"use strict";function t(e){return t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},t(e)}function e(e){var r=function(e,r){if("object"!==t(e)||null===e)return e;var o=e[Symbol.toPrimitive];if(void 0!==o){var n=o.call(e,r||"default");if("object"!==t(n))return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===r?String:Number)(e)}(e,"string");return"symbol"===t(r)?r:String(r)}function r(t,r,o){return(r=e(r))in t?Object.defineProperty(t,r,{value:o,enumerable:!0,configurable:!0,writable:!0}):t[r]=o,t}function o(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(t);e&&(o=o.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,o)}return r}function n(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?o(Object(n),!0).forEach((function(e){r(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}var a={roundTwoDecimal:function(t){return Math.round(100*(t+Number.EPSILON))/100},roundThreeDecimal:function(t){return Math.round(1e3*(t+Number.EPSILON))/1e3},roundInt:function(t){return Math.round(1*(t+Number.EPSILON))/1},calculateLogarithm:function(t,e){return Math.log(e)/Math.log(t)},calcPOW:function(t){return t.mantissa*Math.pow(10,t.exponent)},calcProdOutput:function(t,e){var r=t.totalMade,o=t.created,n=e.manualHarvestFormula,a=e.shopProdBonus,i=t.prestige,u=1*a*1*e.contagionPlantProd;return r*Math.pow(1+.05*(1+.02*n),this.calculateLogarithm(1.25,o))*u*Math.pow(1.02,i)},calcFutureMult:function(t,e){for(var r=!1===e.string?t:JSON.parse(JSON.stringify(t)),o=!1===e.string?e:JSON.parse(JSON.stringify(e)),n=o.time,a=o.numAuto||0===(null===o||void 0===o?void 0:o.numAuto)?o.numAuto:1,i=0;n>0;){if(++i%10===0){console.log("hit breakpoint")}r.growthTime=Math.floor(r.TimeNeeded/r.prestigeBonus/(1+.05*o.shopGrowingSpeed)/o.petPlantCombo/o.contagionPlantGrowth),r.growthTime<10&&(r.growthTime=10);var u=r.prestigeBonus*o.expBonus*a;r.timeToLevel=Math.ceil((r.reqExp-r.curExp)/u)*r.growthTime;var l=0,c=!1;r.timeToLevel>=n?l=n:(l=r.timeToLevel,c=!0),l<=0&&(l=1),n-=l,r.elapsedTime+=l;var s=0;if(r.elapsedTime>=r.growthTime){s=Math.floor(r.elapsedTime/r.growthTime);var p=r.perHarvest*s*a;if(r.created+=p,r.totalMade+=p,r.futureMult=Math.pow(1+.05*(1+.02*o.manualHarvestFormula),this.calculateLogarithm(1.25,r.created)),c)r.Rank++,r.curExp=0,r.perHarvest=this.roundInt((1+r.Rank)*Math.pow(1.05,r.Rank))*Math.pow(1.02,r.prestige),r.reqExp=10+5*r.Rank*Math.pow(1.05,r.Rank);else{var m=s*u;r.curExp+=m,r.curExp>r.reqExp&&(r.Rank++,r.curExp=0,r.perHarvest=this.roundInt((1+r.Rank)*Math.pow(1.05,r.Rank))*Math.pow(1.02,r.prestige),r.reqExp=10+5*r.Rank*Math.pow(1.05,r.Rank))}r.elapsedTime=r.elapsedTime%r.growthTime}var f=this.calcProdOutput(r,o);r.production=f}return r},calcTimeTillLevel:function(t,e){var r=JSON.parse(JSON.stringify(t)),o=JSON.parse(JSON.stringify(e)),n=o.numAuto||0===(null===o||void 0===o?void 0:o.numAuto)?o.numAuto:1;r.growthTime=Math.floor(r.TimeNeeded/r.prestigeBonus/(1+.05*o.shopGrowingSpeed)/o.petPlantCombo/o.contagionPlantGrowth),r.growthTime<10&&(r.growthTime=10),r.reqExp=10+5*r.Rank*Math.pow(1.05,r.Rank);var a=r.reqExp-r.curExp,i=r.prestigeBonus*o.expBonus*n;return r.timeToLevel=Math.ceil(a/i)*r.growthTime,r},calcPerHarvest:function(t){return this.roundInt((1+t.Rank)*Math.pow(1.05,t.Rank))*Math.pow(1.02,t.prestige)},calcTimeTillPrestige:function(t,e){for(var r=JSON.parse(JSON.stringify(t)),o=JSON.parse(JSON.stringify(e)),n=o.numAuto||0===(null===o||void 0===o?void 0:o.numAuto)?o.numAuto:1,a=!1,i=0;!a;){var u=this.calcTimeTillLevel(r,o).timeToLevel,l=(10*Math.pow(2,r.prestige)-r.created)/(r.perHarvest*n)*r.growthTime;if(l<0)a=!0;else if(l>u){r.elapsedTime+=u;var c=Math.floor(r.elapsedTime/r.growthTime);r.created+=c*r.perHarvest*n,r.totalMade+=c*r.perHarvest*n,r.Rank++,r.curExp=0,r.perHarvest=this.calcPerHarvest(r),i+=u,r.elapsedTime=r.elapsedTime%r.growthTime}else a=!0,r.elapsedTime+=l,r.created+=l/r.growthTime*r.perHarvest*n,i+=l,r.elapsedTime=r.elapsedTime%r.growthTime}return i},calcHPProd:function(t,e){for(var r=JSON.parse(JSON.stringify(t)),o=JSON.parse(JSON.stringify(e)),i=o.numAutos,u=o.time,l=0,c=0;c<u;c++){for(var s=r.length-1;s>=0;s--){var p=r[s],m=s===r.length-1?0:1*r[s+1].production;p.totalMade+=m;var f=a.calcFutureMult(p,n(n({},o),{},{time:1,numAuto:i[s],string:!1}));r[s]=f}l+=r[0].production}return{totalPotatoes:l,potatoeProduction:r[0].production,plants:r}},secondsToStringWithS:function(t){var e,r,o,n="";return e=Math.floor(t/3600),r=Math.floor(t%3600/60),o=t%3600%60,e>0&&(n+="".concat(e<10?"0"+e:e,"h:")),r>0&&(n+="".concat(r<10?"0"+r:r,"m:")),n+=o>0?"".concat(o<10?"0"+o:o,"s"):"0s"},secondsToString:function(t){var e,r,o="";return e=Math.floor(t/3600),r=this.roundInt(t%3600/60),e>0&&(o+="".concat(e<10?"0"+e:e,"h:")),o+=r>0?"".concat(r<10?"0"+r:r,"m"):"0s"},bonusColorMap:{1001:{color:"maroon"},1002:{color:"orange"},1003:{color:"purple"},1009:{color:"cyan"},1012:{color:"yellow"},1013:{color:"red"},1014:{color:"blue"},1015:{color:"gray"},1016:{color:"green"}}},i=a;self.onmessage=function(t){var e=t.data,r=e.data;e.id,e.data1;try{for(var o=r.finalPlants,a=r.modifiers,u=r.time,l=r.combinations,c=0,s={},p=0,m={},f=r.start;f<r.end;f++){var h=l[f],d=i.calcHPProd(o,n(n({},a),{},{numAutos:h,time:3600*u}));d.totalPotatoes>c&&(c=d.totalPotatoes,s={combo:h,result:d,plants:d.plants}),d.potatoeProduction>p&&(p=d.potatoeProduction,m={combo:h,result:d,plants:d.plants}),self.postMessage({update:!0})}self.postMessage({success:!0,totalPotCombo:s,bestProdCombo:m})}catch(g){console.log(g)}}}();
//# sourceMappingURL=721.053912f5.chunk.js.map