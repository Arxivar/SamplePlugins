!function(e){var r={};function t(n){if(r[n])return r[n].exports;var o=r[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,t),o.l=!0,o.exports}t.m=e,t.c=r,t.d=function(e,r,n){t.o(e,r)||Object.defineProperty(e,r,{enumerable:!0,get:n})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,r){if(1&r&&(e=t(e)),8&r)return e;if(4&r&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(t.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&r&&"string"!=typeof e)for(var o in e)t.d(n,o,function(r){return e[r]}.bind(null,o));return n},t.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(r,"a",r),r},t.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},t.p="",t(t.s=1)}([,function(e,r,t){"use strict";angular.module("arxivar.plugins.controller").controller("UploadPluginRouteTSCtrl",["$scope","$http","$timeout","_","arxivarResourceService","arxivarUserServiceCreator","arxivarRouteService","arxivarDocumentsService","arxivarNotifierService","UploadPluginRouteTS",function(e,r,t,n,o,a,i,u,f,l){e.arrayBufferComplete=[],e.disabled=!1,e.isThemeLight=document.body.classList.contains("theme-light");var c=angular.element("#upload"),d=function(){e.disabled=!0;var n=o.webApiUrl+"buffer/insert",a=c[0].files[0];(function(e,t){var n=new FormData,o=new FileReader;return new Promise((function(a,i){o.onload=function(){var i=o.result,u=new Uint8Array(i),f=new Blob([u]);n.append("file",f,t.name),r({url:e,headers:{"Content-Type":void 0},data:n,method:"POST"}).then((function(e){var r=e.data;a(r[0])}))},o.readAsArrayBuffer(t)}))})(n,a).then((function(r){t((function(){var t=i.getURLProfilation({bufferId:r,fileName:a.name}),n=i.getMaskProfilation("eb69d6c75f56460b8756cef279c86551",{bufferId:r,fileName:a.name});e.arrayBufferComplete.push({bufferId:r,bufferName:a.name,url:t,maskUrl:n}),e.disabled=!1,c.val("")}))}))};c.on({change:d}),e.download=function(e){o.getByteArray("Buffer/file/"+e,{openload:!1,hideUserMessageError:!1}).then((function(e){var r=e.data,t=e.status,n=e.headers;return u.downloadStream(r,t,n)}))},e.$on("$destroy",(function(){c.off("change",d)}))}])}]);
//# sourceMappingURL=UploadPluginRouteTSCtrl.js.map