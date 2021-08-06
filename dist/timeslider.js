/*! For license information please see timeslider.js.LICENSE.txt */
!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.AdskDataViz=t():e.AdskDataViz=t()}(self,(function(){return(()=>{var e,t={1477:(e,t,n)=>{"use strict";var s=n(28663),r=n(26353),i=n(39182);function o(e){return(o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function a(e,t){for(var n=0;n<t.length;n++){var s=t[n];s.enumerable=s.enumerable||!1,s.configurable=!0,"value"in s&&(s.writable=!0),Object.defineProperty(e,s.key,s)}}function u(e,t){return(u=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function j(e,t){return!t||"object"!==o(t)&&"function"!=typeof t?l(e):t}function l(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function c(e){return(c=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function m(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var d="timeSliderControlInitializedEvent",f="timeSliderControlTimeRangeUpdatedEvent",p="timeSliderControlCurrentTimeUpdatedEvent",h=function(e){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&u(e,t)}(y,THREE.EventDispatcher);var t,n,o,h,T=(o=y,h=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}(),function(){var e,t=c(o);if(h){var n=c(this).constructor;e=Reflect.construct(t,arguments,n)}else e=t.apply(this,arguments);return j(this,e)});function y(e,t){var n;return m(this,y),(n=T.call(this)).container=e,n.options=t,n.onTimeRangeUpdated=n.onTimeRangeUpdated.bind(l(n)),n.onCurrentTimeUpdated=n.onCurrentTimeUpdated.bind(l(n)),n}return t=y,(n=[{key:"onTimeRangeUpdated",value:function(e,t,n){var s=this.options.handleTimeRangeUpdated;s&&s(e,t,n),this.dispatchEvent({type:f,startTime:e,endTime:t,currentTime:n})}},{key:"onCurrentTimeUpdated",value:function(e){var t=this.options.handleCurrentTimeUpdated;t&&t(e),this.dispatchEvent({type:p,currentTime:e})}},{key:"initialize",value:function(){var e=this,t=this.options.timeOptions;if(!t.startTime||!t.endTime)throw new Error("Invalid input `options.timeOptions.startTime` or `options.timeOptions.endTime`. They should be a type of `Date`.");if(!(this.container&&this.container instanceof HTMLDivElement))throw new Error("Invalid input `container`. They should be a type of `HTMLDivElement`.");var n=new Date((new Date).getTime()+6048e5),o=new Date("2020-01-01T00:00:00Z"),a=new Date;a.setUTCHours(0,0,0,0);var u=new Date(a.getTime()+864e5);u.setUTCHours(0,0,0,0);var j=new Date(a.getTime()-12096e5);if(j.setUTCHours(0,0,0,0),this.options.dataStart&&this.options.dataEnd){var l=new Date(this.options.dataStart.getTime()),c=new Date(this.options.dataEnd.getTime());o.setTime(l.getTime()),n.setTime(c.getTime()),(j.getTime()<o.getTime()||j.getTime()>=n.getTime())&&j.setTime(o.getTime()),(u.getTime()<=o.getTime()||u.getTime()>=n.getTime())&&u.setTime(n.getTime()),(a.getTime()<=o.getTime()||a.getTime()>=n.getTime())&&a.setTime(n.getTime()),o.setTime(l.getTime()-1728e5),n.setTime(c.getTime()+1728e5)}r.render(s.createElement(i.KI,{rangeStart:o.toISOString(),rangeEnd:n.toISOString(),startTime:new Date(t.startTime.getTime()),endTime:new Date(t.endTime.getTime()),currentTime:t.currentTime?new Date(t.currentTime.getTime()):null,resolution:t.resolution||"PT1H",onTimeRangeUpdated:this.onTimeRangeUpdated,onCurrTimeUpdated:this.onCurrentTimeUpdated}),this.container,(function(){e.dispatchEvent({type:d,instance:e})}))}},{key:"uninitialize",value:function(){r.unmountComponentAtNode(r.findDOMNode(this.container))}}])&&a(t.prototype,n),y}(),T=AutodeskNamespace("Autodesk.DataVisualization.UI");T.ChronosTimeSliderControl=h,T.TimeOptions=function e(t,n,s){var r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:"PT1H";m(this,e),this.endTime=n,this.startTime=t,this.resolution=r,this.currentTime=s},T.TIME_SLIDER_CONTROL_INITIALIZED_EVENT=d,T.TIME_SLIDER_CONTROL_TIME_RANGE_UPDATED_EVENT=f,T.TIME_SLIDER_CONTROL_CURRENT_TIME_UPDATED_EVENT=p},32474:(e,t,n)=>{"use strict";n.r(t)},46700:(e,t,n)=>{var s={"./af":18533,"./af.js":18533,"./ar":17731,"./ar-dz":58711,"./ar-dz.js":58711,"./ar-kw":66235,"./ar-kw.js":66235,"./ar-ly":75022,"./ar-ly.js":75022,"./ar-ma":35625,"./ar-ma.js":35625,"./ar-sa":54563,"./ar-sa.js":54563,"./ar-tn":73269,"./ar-tn.js":73269,"./ar.js":17731,"./az":69191,"./az.js":69191,"./be":41348,"./be.js":41348,"./bg":15208,"./bg.js":15208,"./bm":89102,"./bm.js":89102,"./bn":29170,"./bn-bd":2921,"./bn-bd.js":2921,"./bn.js":29170,"./bo":26411,"./bo.js":26411,"./br":57027,"./br.js":57027,"./bs":71850,"./bs.js":71850,"./ca":7913,"./ca.js":7913,"./cs":41872,"./cs.js":41872,"./cv":36944,"./cv.js":36944,"./cy":80530,"./cy.js":80530,"./da":46790,"./da.js":46790,"./de":79154,"./de-at":97077,"./de-at.js":97077,"./de-ch":61802,"./de-ch.js":61802,"./de.js":79154,"./dv":34941,"./dv.js":34941,"./el":93333,"./el.js":93333,"./en-au":61015,"./en-au.js":61015,"./en-ca":84286,"./en-ca.js":84286,"./en-gb":91486,"./en-gb.js":91486,"./en-ie":66689,"./en-ie.js":66689,"./en-il":51716,"./en-il.js":51716,"./en-in":77785,"./en-in.js":77785,"./en-nz":178,"./en-nz.js":178,"./en-sg":83841,"./en-sg.js":83841,"./eo":82780,"./eo.js":82780,"./es":53363,"./es-do":53380,"./es-do.js":53380,"./es-mx":8830,"./es-mx.js":8830,"./es-us":73649,"./es-us.js":73649,"./es.js":53363,"./et":38640,"./et.js":38640,"./eu":54416,"./eu.js":54416,"./fa":33764,"./fa.js":33764,"./fi":72335,"./fi.js":72335,"./fil":83751,"./fil.js":83751,"./fo":55445,"./fo.js":55445,"./fr":74527,"./fr-ca":95598,"./fr-ca.js":95598,"./fr-ch":5158,"./fr-ch.js":5158,"./fr.js":74527,"./fy":51749,"./fy.js":51749,"./ga":97666,"./ga.js":97666,"./gd":31485,"./gd.js":31485,"./gl":76070,"./gl.js":76070,"./gom-deva":8554,"./gom-deva.js":8554,"./gom-latn":18610,"./gom-latn.js":18610,"./gu":47861,"./gu.js":47861,"./he":12816,"./he.js":12816,"./hi":80801,"./hi.js":80801,"./hr":28622,"./hr.js":28622,"./hu":80846,"./hu.js":80846,"./hy-am":33663,"./hy-am.js":33663,"./id":56886,"./id.js":56886,"./is":5322,"./is.js":5322,"./it":49777,"./it-ch":24219,"./it-ch.js":24219,"./it.js":49777,"./ja":67753,"./ja.js":67753,"./jv":13489,"./jv.js":13489,"./ka":52923,"./ka.js":52923,"./kk":75769,"./kk.js":75769,"./km":34335,"./km.js":34335,"./kn":29973,"./kn.js":29973,"./ko":22639,"./ko.js":22639,"./ku":73474,"./ku.js":73474,"./ky":89869,"./ky.js":89869,"./lb":3315,"./lb.js":3315,"./lo":28009,"./lo.js":28009,"./lt":47260,"./lt.js":47260,"./lv":64440,"./lv.js":64440,"./me":54124,"./me.js":54124,"./mi":21887,"./mi.js":21887,"./mk":3992,"./mk.js":3992,"./ml":62806,"./ml.js":62806,"./mn":42814,"./mn.js":42814,"./mr":61780,"./mr.js":61780,"./ms":1158,"./ms-my":61236,"./ms-my.js":61236,"./ms.js":1158,"./mt":28225,"./mt.js":28225,"./my":22224,"./my.js":22224,"./nb":97175,"./nb.js":97175,"./ne":94032,"./ne.js":94032,"./nl":81801,"./nl-be":12225,"./nl-be.js":12225,"./nl.js":81801,"./nn":12128,"./nn.js":12128,"./oc-lnc":28269,"./oc-lnc.js":28269,"./pa-in":97265,"./pa-in.js":97265,"./pl":62480,"./pl.js":62480,"./pt":50331,"./pt-br":6545,"./pt-br.js":6545,"./pt.js":50331,"./ro":6543,"./ro.js":6543,"./ru":91517,"./ru.js":91517,"./sd":19407,"./sd.js":19407,"./se":79451,"./se.js":79451,"./si":10957,"./si.js":10957,"./sk":78111,"./sk.js":78111,"./sl":29958,"./sl.js":29958,"./sq":51184,"./sq.js":51184,"./sr":9225,"./sr-cyrl":67141,"./sr-cyrl.js":67141,"./sr.js":9225,"./ss":77235,"./ss.js":77235,"./sv":1794,"./sv.js":1794,"./sw":75019,"./sw.js":75019,"./ta":2482,"./ta.js":2482,"./te":30091,"./te.js":30091,"./tet":83382,"./tet.js":83382,"./tg":92706,"./tg.js":92706,"./th":75058,"./th.js":75058,"./tk":74452,"./tk.js":74452,"./tl-ph":77186,"./tl-ph.js":77186,"./tlh":45420,"./tlh.js":45420,"./tr":81337,"./tr.js":81337,"./tzl":25233,"./tzl.js":25233,"./tzm":13024,"./tzm-latn":32140,"./tzm-latn.js":32140,"./tzm.js":13024,"./ug-cn":59834,"./ug-cn.js":59834,"./uk":8641,"./uk.js":8641,"./ur":4083,"./ur.js":4083,"./uz":39338,"./uz-latn":28398,"./uz-latn.js":28398,"./uz.js":39338,"./vi":32064,"./vi.js":32064,"./x-pseudo":96153,"./x-pseudo.js":96153,"./yo":92398,"./yo.js":92398,"./zh-cn":2393,"./zh-cn.js":2393,"./zh-hk":34897,"./zh-hk.js":34897,"./zh-mo":97762,"./zh-mo.js":97762,"./zh-tw":82487,"./zh-tw.js":82487};function r(e){var t=i(e);return n(t)}function i(e){if(!n.o(s,e)){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}return s[e]}r.keys=function(){return Object.keys(s)},r.resolve=i,e.exports=r,r.id=46700},24654:()=>{}},n={};function s(e){var r=n[e];if(void 0!==r)return r.exports;var i=n[e]={id:e,loaded:!1,exports:{}};return t[e].call(i.exports,i,i.exports,s),i.loaded=!0,i.exports}s.m=t,s.amdO={},e=[],s.O=(t,n,r,i)=>{if(!n){var o=1/0;for(l=0;l<e.length;l++){for(var[n,r,i]=e[l],a=!0,u=0;u<n.length;u++)(!1&i||o>=i)&&Object.keys(s.O).every((e=>s.O[e](n[u])))?n.splice(u--,1):(a=!1,i<o&&(o=i));if(a){e.splice(l--,1);var j=r();void 0!==j&&(t=j)}}return t}i=i||0;for(var l=e.length;l>0&&e[l-1][2]>i;l--)e[l]=e[l-1];e[l]=[n,r,i]},s.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return s.d(t,{a:t}),t},s.d=(e,t)=>{for(var n in t)s.o(t,n)&&!s.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},s.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),s.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),s.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},s.nmd=e=>(e.paths=[],e.children||(e.children=[]),e),(()=>{var e={timeslider:0};s.O.j=t=>0===e[t];var t=(t,n)=>{var r,i,[o,a,u]=n,j=0;for(r in a)s.o(a,r)&&(s.m[r]=a[r]);if(u)var l=u(s);for(t&&t(n);j<o.length;j++)i=o[j],s.o(e,i)&&e[i]&&e[i][0](),e[o[j]]=0;return s.O(l)},n=self.webpackChunkAdskDataViz=self.webpackChunkAdskDataViz||[];n.forEach(t.bind(null,0)),n.push=t.bind(null,n.push.bind(n))})(),s.O(void 0,["vendor"],(()=>s(1477)));var r=s.O(void 0,["vendor"],(()=>s(32474)));return s.O(r)})()}));
//# sourceMappingURL=timeslider.js.map