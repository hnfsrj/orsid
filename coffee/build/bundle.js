var app=function(){"use strict";function t(){}function e(t,e){for(const n in e)t[n]=e[n];return t}function n(t){return t()}function r(){return Object.create(null)}function o(t){t.forEach(n)}function s(t){return"function"==typeof t}function i(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function c(t,e){t.appendChild(e)}function u(t,e,n){t.insertBefore(e,n||null)}function l(t){t.parentNode&&t.parentNode.removeChild(t)}function a(t){return document.createElement(t)}function f(t){return document.createTextNode(t)}function p(){return f(" ")}function d(){return f("")}function h(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function m(t,e){e=""+e,t.data!==e&&(t.data=e)}function $(t,e,n,r){null==n?t.style.removeProperty(e):t.style.setProperty(e,n,r?"important":"")}function g(t,e){return new t(e)}let b;function v(t){b=t}function y(){if(!b)throw new Error("Function called outside component initialization");return b}function _(){const t=y();return(e,n,{cancelable:r=!1}={})=>{const o=t.$$.callbacks[e];if(o){const s=function(t,e,{bubbles:n=!1,cancelable:r=!1}={}){const o=document.createEvent("CustomEvent");return o.initCustomEvent(t,n,r,e),o}(e,n,{cancelable:r});return o.slice().forEach((e=>{e.call(t,s)})),!s.defaultPrevented}return!0}}function w(t,e){const n=t.$$.callbacks[e.type];n&&n.slice().forEach((t=>t.call(this,e)))}const x=[],E=[];let k=[];const j=[],O=Promise.resolve();let S=!1;function C(){S||(S=!0,O.then(N))}function q(t){k.push(t)}const A=new Set;let L=0;function N(){if(0!==L)return;const t=b;do{try{for(;L<x.length;){const t=x[L];L++,v(t),P(t.$$)}}catch(t){throw x.length=0,L=0,t}for(v(null),x.length=0,L=0;E.length;)E.pop()();for(let t=0;t<k.length;t+=1){const e=k[t];A.has(e)||(A.add(e),e())}k.length=0}while(x.length);for(;j.length;)j.pop()();S=!1,A.clear(),v(t)}function P(t){if(null!==t.fragment){t.update(),o(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(q)}}const R=new Set;let z;function T(){z={r:0,c:[],p:z}}function B(){z.r||o(z.c),z=z.p}function D(t,e){t&&t.i&&(R.delete(t),t.i(e))}function F(t,e,n,r){if(t&&t.o){if(R.has(t))return;R.add(t),z.c.push((()=>{R.delete(t),r&&(n&&t.d(1),r())})),t.o(e)}else r&&r()}function M(t,e){const n={},r={},o={$$scope:1};let s=t.length;for(;s--;){const i=t[s],c=e[s];if(c){for(const t in i)t in c||(r[t]=1);for(const t in c)o[t]||(n[t]=c[t],o[t]=1);t[s]=c}else for(const t in i)o[t]=1}for(const t in r)t in n||(n[t]=void 0);return n}function H(t){return"object"==typeof t&&null!==t?t:{}}function I(t){t&&t.c()}function W(t,e,r,i){const{fragment:c,after_update:u}=t.$$;c&&c.m(e,r),i||q((()=>{const e=t.$$.on_mount.map(n).filter(s);t.$$.on_destroy?t.$$.on_destroy.push(...e):o(e),t.$$.on_mount=[]})),u.forEach(q)}function X(t,e){const n=t.$$;null!==n.fragment&&(!function(t){const e=[],n=[];k.forEach((r=>-1===t.indexOf(r)?e.push(r):n.push(r))),n.forEach((t=>t())),k=e}(n.after_update),o(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function Y(e,n,s,i,c,u,a,f=[-1]){const p=b;v(e);const d=e.$$={fragment:null,ctx:[],props:u,update:t,not_equal:c,bound:r(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(n.context||(p?p.$$.context:[])),callbacks:r(),dirty:f,skip_bound:!1,root:n.target||p.$$.root};a&&a(d.root);let h=!1;if(d.ctx=s?s(e,n.props||{},((t,n,...r)=>{const o=r.length?r[0]:n;return d.ctx&&c(d.ctx[t],d.ctx[t]=o)&&(!d.skip_bound&&d.bound[t]&&d.bound[t](o),h&&function(t,e){-1===t.$$.dirty[0]&&(x.push(t),C(),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}(e,t)),n})):[],d.update(),h=!0,o(d.before_update),d.fragment=!!i&&i(d.ctx),n.target){if(n.hydrate){const t=function(t){return Array.from(t.childNodes)}(n.target);d.fragment&&d.fragment.l(t),t.forEach(l)}else d.fragment&&d.fragment.c();n.intro&&D(e.$$.fragment),W(e,n.target,n.anchor,n.customElement),N()}v(p)}class J{$destroy(){X(this,1),this.$destroy=t}$on(e,n){if(!s(n))return t;const r=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return r.push(n),()=>{const t=r.indexOf(n);-1!==t&&r.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}const U=[];function G(t,e){return{subscribe:K(t,e).subscribe}}function K(e,n=t){let r;const o=new Set;function s(t){if(i(e,t)&&(e=t,r)){const t=!U.length;for(const t of o)t[1](),U.push(t,e);if(t){for(let t=0;t<U.length;t+=2)U[t][0](U[t+1]);U.length=0}}}return{set:s,update:function(t){s(t(e))},subscribe:function(i,c=t){const u=[i,c];return o.add(u),1===o.size&&(r=n(s)||t),i(e),()=>{o.delete(u),0===o.size&&r&&(r(),r=null)}}}}function Q(e,n,r){const i=!Array.isArray(e),c=i?[e]:e,u=n.length<2;return G(r,(e=>{let r=!1;const l=[];let a=0,f=t;const p=()=>{if(a)return;f();const r=n(i?l[0]:l,e);u?e(r):f=s(r)?r:t},d=c.map(((e,n)=>function(e,...n){if(null==e)return t;const r=e.subscribe(...n);return r.unsubscribe?()=>r.unsubscribe():r}(e,(t=>{l[n]=t,a&=~(1<<n),r&&p()}),(()=>{a|=1<<n}))));return r=!0,p(),function(){o(d),f(),r=!1}}))}function V(t){let n,r,o;const s=[t[2]];var i=t[0];function c(t){let n={};for(let t=0;t<s.length;t+=1)n=e(n,s[t]);return{props:n}}return i&&(n=g(i,c()),n.$on("routeEvent",t[7])),{c(){n&&I(n.$$.fragment),r=d()},m(t,e){n&&W(n,t,e),u(t,r,e),o=!0},p(t,e){const o=4&e?M(s,[H(t[2])]):{};if(1&e&&i!==(i=t[0])){if(n){T();const t=n;F(t.$$.fragment,1,0,(()=>{X(t,1)})),B()}i?(n=g(i,c()),n.$on("routeEvent",t[7]),I(n.$$.fragment),D(n.$$.fragment,1),W(n,r.parentNode,r)):n=null}else i&&n.$set(o)},i(t){o||(n&&D(n.$$.fragment,t),o=!0)},o(t){n&&F(n.$$.fragment,t),o=!1},d(t){t&&l(r),n&&X(n,t)}}}function Z(t){let n,r,o;const s=[{params:t[1]},t[2]];var i=t[0];function c(t){let n={};for(let t=0;t<s.length;t+=1)n=e(n,s[t]);return{props:n}}return i&&(n=g(i,c()),n.$on("routeEvent",t[6])),{c(){n&&I(n.$$.fragment),r=d()},m(t,e){n&&W(n,t,e),u(t,r,e),o=!0},p(t,e){const o=6&e?M(s,[2&e&&{params:t[1]},4&e&&H(t[2])]):{};if(1&e&&i!==(i=t[0])){if(n){T();const t=n;F(t.$$.fragment,1,0,(()=>{X(t,1)})),B()}i?(n=g(i,c()),n.$on("routeEvent",t[6]),I(n.$$.fragment),D(n.$$.fragment,1),W(n,r.parentNode,r)):n=null}else i&&n.$set(o)},i(t){o||(n&&D(n.$$.fragment,t),o=!0)},o(t){n&&F(n.$$.fragment,t),o=!1},d(t){t&&l(r),n&&X(n,t)}}}function tt(t){let e,n,r,o;const s=[Z,V],i=[];function c(t,e){return t[1]?0:1}return e=c(t),n=i[e]=s[e](t),{c(){n.c(),r=d()},m(t,n){i[e].m(t,n),u(t,r,n),o=!0},p(t,[o]){let u=e;e=c(t),e===u?i[e].p(t,o):(T(),F(i[u],1,1,(()=>{i[u]=null})),B(),n=i[e],n?n.p(t,o):(n=i[e]=s[e](t),n.c()),D(n,1),n.m(r.parentNode,r))},i(t){o||(D(n),o=!0)},o(t){F(n),o=!1},d(t){i[e].d(t),t&&l(r)}}}function et(){const t=window.location.href.indexOf("#/");let e=t>-1?window.location.href.substr(t+1):"/";const n=e.indexOf("?");let r="";return n>-1&&(r=e.substr(n+1),e=e.substr(0,n)),{location:e,querystring:r}}const nt=G(null,(function(t){t(et());const e=()=>{t(et())};return window.addEventListener("hashchange",e,!1),function(){window.removeEventListener("hashchange",e,!1)}}));Q(nt,(t=>t.location)),Q(nt,(t=>t.querystring));const rt=K(void 0);function ot(t,e,n){let{routes:r={}}=e,{prefix:o=""}=e,{restoreScrollState:s=!1}=e;class i{constructor(t,e){if(!e||"function"!=typeof e&&("object"!=typeof e||!0!==e._sveltesparouter))throw Error("Invalid component object");if(!t||"string"==typeof t&&(t.length<1||"/"!=t.charAt(0)&&"*"!=t.charAt(0))||"object"==typeof t&&!(t instanceof RegExp))throw Error('Invalid value for "path" argument - strings must start with / or *');const{pattern:n,keys:r}=function(t,e){if(t instanceof RegExp)return{keys:!1,pattern:t};var n,r,o,s,i=[],c="",u=t.split("/");for(u[0]||u.shift();o=u.shift();)"*"===(n=o[0])?(i.push("wild"),c+="/(.*)"):":"===n?(r=o.indexOf("?",1),s=o.indexOf(".",1),i.push(o.substring(1,~r?r:~s?s:o.length)),c+=~r&&!~s?"(?:/([^/]+?))?":"/([^/]+?)",~s&&(c+=(~r?"?":"")+"\\"+o.substring(s))):c+="/"+o;return{keys:i,pattern:new RegExp("^"+c+(e?"(?=$|/)":"/?$"),"i")}}(t);this.path=t,"object"==typeof e&&!0===e._sveltesparouter?(this.component=e.component,this.conditions=e.conditions||[],this.userData=e.userData,this.props=e.props||{}):(this.component=()=>Promise.resolve(e),this.conditions=[],this.props={}),this._pattern=n,this._keys=r}match(t){if(o)if("string"==typeof o){if(!t.startsWith(o))return null;t=t.substr(o.length)||"/"}else if(o instanceof RegExp){const e=t.match(o);if(!e||!e[0])return null;t=t.substr(e[0].length)||"/"}const e=this._pattern.exec(t);if(null===e)return null;if(!1===this._keys)return e;const n={};let r=0;for(;r<this._keys.length;){try{n[this._keys[r]]=decodeURIComponent(e[r+1]||"")||null}catch(t){n[this._keys[r]]=null}r++}return n}async checkConditions(t){for(let e=0;e<this.conditions.length;e++)if(!await this.conditions[e](t))return!1;return!0}}const c=[];r instanceof Map?r.forEach(((t,e)=>{c.push(new i(e,t))})):Object.keys(r).forEach((t=>{c.push(new i(t,r[t]))}));let u=null,l=null,a={};const f=_();async function p(t,e){await(C(),O),f(t,e)}let d=null,h=null;var m;s&&(h=t=>{d=t.state&&(t.state.__svelte_spa_router_scrollY||t.state.__svelte_spa_router_scrollX)?t.state:null},window.addEventListener("popstate",h),m=()=>{var t;(t=d)?window.scrollTo(t.__svelte_spa_router_scrollX,t.__svelte_spa_router_scrollY):window.scrollTo(0,0)},y().$$.after_update.push(m));let $=null,g=null;const b=nt.subscribe((async t=>{$=t;let e=0;for(;e<c.length;){const r=c[e].match(t.location);if(!r){e++;continue}const o={route:c[e].path,location:t.location,querystring:t.querystring,userData:c[e].userData,params:r&&"object"==typeof r&&Object.keys(r).length?r:null};if(!await c[e].checkConditions(o))return n(0,u=null),g=null,void p("conditionsFailed",o);p("routeLoading",Object.assign({},o));const s=c[e].component;if(g!=s){s.loading?(n(0,u=s.loading),g=s,n(1,l=s.loadingParams),n(2,a={}),p("routeLoaded",Object.assign({},o,{component:u,name:u.name,params:l}))):(n(0,u=null),g=null);const e=await s();if(t!=$)return;n(0,u=e&&e.default||e),g=s}return r&&"object"==typeof r&&Object.keys(r).length?n(1,l=r):n(1,l=null),n(2,a=c[e].props),void p("routeLoaded",Object.assign({},o,{component:u,name:u.name,params:l})).then((()=>{rt.set(l)}))}n(0,u=null),g=null,rt.set(void 0)}));return function(t){y().$$.on_destroy.push(t)}((()=>{b(),h&&window.removeEventListener("popstate",h)})),t.$$set=t=>{"routes"in t&&n(3,r=t.routes),"prefix"in t&&n(4,o=t.prefix),"restoreScrollState"in t&&n(5,s=t.restoreScrollState)},t.$$.update=()=>{32&t.$$.dirty&&(history.scrollRestoration=s?"manual":"auto")},[u,l,a,r,o,s,function(e){w.call(this,t,e)},function(e){w.call(this,t,e)}]}class st extends J{constructor(t){super(),Y(this,t,ot,tt,i,{routes:3,prefix:4,restoreScrollState:5})}}function it(e){let n;return{c(){n=a("nav"),n.innerHTML='<a href="/" class="svelte-64i9gr"><p class="name svelte-64i9gr">Orsid Juhak</p></a>',h(n,"class","svelte-64i9gr")},m(t,e){u(t,n,e)},p:t,i:t,o:t,d(t){t&&l(n)}}}class ct extends J{constructor(t){super(),Y(this,t,null,it,i,{})}}function ut(e){let n;return{c(){n=a("div"),n.innerHTML='<a href="/" class="svelte-9ufqsl"><p class="svelte-9ufqsl">Back Home</p></a>',h(n,"class","svelte-9ufqsl")},m(t,e){u(t,n,e)},p:t,i:t,o:t,d(t){t&&l(n)}}}class lt extends J{constructor(t){super(),Y(this,t,null,ut,i,{})}}function at(e){let n,r;return{c(){n=a("p"),r=f(e[0]),h(n,"class","svelte-6yez5t")},m(t,e){u(t,n,e),c(n,r)},p(t,[e]){1&e&&m(r,t[0])},i:t,o:t,d(t){t&&l(n)}}}function ft(t,e,n){let{name:r}=e;return t.$$set=t=>{"name"in t&&n(0,r=t.name)},[r]}class pt extends J{constructor(t){super(),Y(this,t,ft,at,i,{name:0})}}function dt(e){let n,r;return{c(){n=a("p"),r=f(e[0]),h(n,"class","svelte-16fyp0a")},m(t,e){u(t,n,e),c(n,r)},p(t,[e]){1&e&&m(r,t[0])},i:t,o:t,d(t){t&&l(n)}}}function ht(t,e,n){let{descript:r}=e;return t.$$set=t=>{"descript"in t&&n(0,r=t.descript)},[r]}class mt extends J{constructor(t){super(),Y(this,t,ht,dt,i,{descript:0})}}function $t(t,e,n){const r=t.slice();return r[1]=e[n],r}function gt(t){let e,n,r,o,s,i,d=t[1].title+"";return{c(){e=a("div"),n=a("div"),r=p(),o=a("p"),s=f(d),i=p(),$(n,"background-image","url("+t[1].address+")"),h(n,"class","image svelte-u5wdin"),h(o,"class","img_title svelte-u5wdin"),h(e,"class","pic svelte-u5wdin")},m(t,l){u(t,e,l),c(e,n),c(e,r),c(e,o),c(o,s),c(e,i)},p(t,e){1&e&&$(n,"background-image","url("+t[1].address+")"),1&e&&d!==(d=t[1].title+"")&&m(s,d)},d(t){t&&l(e)}}}function bt(e){let n,r=e[0],o=[];for(let t=0;t<r.length;t+=1)o[t]=gt($t(e,r,t));return{c(){n=a("div");for(let t=0;t<o.length;t+=1)o[t].c();h(n,"class","pics_container svelte-u5wdin")},m(t,e){u(t,n,e);for(let t=0;t<o.length;t+=1)o[t]&&o[t].m(n,null)},p(t,[e]){if(1&e){let s;for(r=t[0],s=0;s<r.length;s+=1){const i=$t(t,r,s);o[s]?o[s].p(i,e):(o[s]=gt(i),o[s].c(),o[s].m(n,null))}for(;s<o.length;s+=1)o[s].d(1);o.length=r.length}},i:t,o:t,d(t){t&&l(n),function(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}(o,t)}}}function vt(t,e,n){let{images:r=[]}=e;return t.$$set=t=>{"images"in t&&n(0,r=t.images)},[r]}class yt extends J{constructor(t){super(),Y(this,t,vt,bt,i,{images:0})}}function _t(e){let n,r,o,s,i,f,d,m,$,g,b;return r=new ct({}),s=new lt({}),f=new pt({props:{name:"Coffee Exporting"}}),m=new mt({props:{descript:"Share the rich flavors of Ethiopian coffee with the world. We export premium-grade coffee beans, celebrated for their unique aroma, bold taste, and exceptional quality. Sourced from the finest Ethiopian farms, our coffee ensures an authentic experience for global coffee enthusiasts and businesses alike."}}),g=new yt({props:{images:e[0]}}),{c(){n=a("div"),I(r.$$.fragment),o=p(),I(s.$$.fragment),i=p(),I(f.$$.fragment),d=p(),I(m.$$.fragment),$=p(),I(g.$$.fragment),h(n,"id","container"),h(n,"class","svelte-1lxivbz")},m(t,e){u(t,n,e),W(r,n,null),c(n,o),W(s,n,null),c(n,i),W(f,n,null),c(n,d),W(m,n,null),c(n,$),W(g,n,null),b=!0},p:t,i(t){b||(D(r.$$.fragment,t),D(s.$$.fragment,t),D(f.$$.fragment,t),D(m.$$.fragment,t),D(g.$$.fragment,t),b=!0)},o(t){F(r.$$.fragment,t),F(s.$$.fragment,t),F(f.$$.fragment,t),F(m.$$.fragment,t),F(g.$$.fragment,t),b=!1},d(t){t&&l(n),X(r),X(s),X(f),X(m),X(g)}}}function wt(t){return[[{title:"Authentic Ethiopian Coffee",address:"../images/coffee/coffee1.webp"},{title:"Fresh Ethiopian Coffee",address:"../images/coffee/coffee2.webp"},{title:"Premium Coffee Beans",address:"../images/coffee/coffee3.webp"},{title:"Bold, Flavorful Coffee",address:"../images/coffee/coffee4.webp"}]]}class xt extends J{constructor(t){super(),Y(this,t,wt,_t,i,{})}}function Et(e){let n,r;return n=new st({props:{routes:{"/":xt}}}),{c(){I(n.$$.fragment)},m(t,e){W(n,t,e),r=!0},p:t,i(t){r||(D(n.$$.fragment,t),r=!0)},o(t){F(n.$$.fragment,t),r=!1},d(t){X(n,t)}}}return new class extends J{constructor(t){super(),Y(this,t,null,Et,i,{})}}({target:document.body})}();
//# sourceMappingURL=bundle.js.map
