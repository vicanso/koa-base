!function(){"use strict";var e=angular.module("jt.service.httpLog",["LocalStorageModule"]),t=Date.now||function(){return(new Date).getTime()};e.factory("httpLog",["$q","$injector","localStorageService",function(e,r,n){var u=n.get("httpLog")||{success:[],error:[]},o=u.success,s=u.error,c=12e4,a="/httplog",i=function(){var e=r.get("$http");(o.length||s.length)&&e.post(a,u).success(function(){o.length=0,s.length=0,l(),setTimeout(i,c)}).error(function(){setTimeout(i,c)})},l=function(){n.set("httpLog",u)},g=function(e){var t=e("JT-Deprecate");t&&"development"===CONFIG.env&&alert("url:"+url+"is deprecate, "+t)};o.length+s.length>10?setTimeout(i,1):setTimeout(i,c);var h=function(e){return e===a||-1!=e.indexOf("httplog=false")?!0:!1},f={request:function(e){return e._createdAt=t(),e},response:function(e){var r=e.config,n=r.url;if(g(e.headers),h(n))return e;var u=t()-r._createdAt;return o.push({url:n,method:r.method,use:u}),l(),e},requestError:function(t){return e.reject(t)},responseError:function(r){g(r.headers);var n=r.config,u=n.url;return h(u)?e.reject(r):(s.push({url:u,status:r.status,use:t()-n._createdAt}),l(),e.reject(r))}};return f}])}(this);