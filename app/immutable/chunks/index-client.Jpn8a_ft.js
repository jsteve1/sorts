import{S as h,x as M,y as F,z as v,A as K,q as y,U as u,B as E,g as x,C as q,D as B,E as C,F as H,G as U,v as P,w as Y,H as z,I as G,J,K as Q,L as A,M as D,N as S,O as j,P as Z,c as R,Q as V,a as W,b as X}from"./runtime.B3L5aQa2.js";function b(r,l=null,T){if(typeof r!="object"||r===null||h in r)return r;const d=C(r);if(d!==M&&d!==F)return r;var f=new Map,c=H(r),_=v(0);c&&f.set("length",v(r.length));var g;return new Proxy(r,{defineProperty(i,e,t){(!("value"in t)||t.configurable===!1||t.enumerable===!1||t.writable===!1)&&K();var a=f.get(e);return a===void 0?(a=v(t.value),f.set(e,a)):y(a,b(t.value,g)),!0},deleteProperty(i,e){var t=f.get(e);if(t===void 0)e in i&&f.set(e,v(u));else{if(c&&typeof e=="string"){var a=f.get("length"),n=Number(e);Number.isInteger(n)&&n<a.v&&y(a,n)}y(t,u),k(_)}return!0},get(i,e,t){var o;if(e===h)return r;var a=f.get(e),n=e in i;if(a===void 0&&(!n||(o=E(i,e))!=null&&o.writable)&&(a=v(b(n?i[e]:u,g)),f.set(e,a)),a!==void 0){var s=x(a);return s===u?void 0:s}return Reflect.get(i,e,t)},getOwnPropertyDescriptor(i,e){var t=Reflect.getOwnPropertyDescriptor(i,e);if(t&&"value"in t){var a=f.get(e);a&&(t.value=x(a))}else if(t===void 0){var n=f.get(e),s=n==null?void 0:n.v;if(n!==void 0&&s!==u)return{enumerable:!0,configurable:!0,value:s,writable:!0}}return t},has(i,e){var s;if(e===h)return!0;var t=f.get(e),a=t!==void 0&&t.v!==u||Reflect.has(i,e);if(t!==void 0||q!==null&&(!a||(s=E(i,e))!=null&&s.writable)){t===void 0&&(t=v(a?b(i[e],g):u),f.set(e,t));var n=x(t);if(n===u)return!1}return a},set(i,e,t,a){var O;var n=f.get(e),s=e in i;if(c&&e==="length")for(var o=t;o<n.v;o+=1){var m=f.get(o+"");m!==void 0?y(m,u):o in i&&(m=v(u),f.set(o+"",m))}n===void 0?(!s||(O=E(i,e))!=null&&O.writable)&&(n=v(void 0),y(n,b(t,g)),f.set(e,n)):(s=n.v!==u,y(n,b(t,g)));var w=Reflect.getOwnPropertyDescriptor(i,e);if(w!=null&&w.set&&w.set.call(a,t),!s){if(c&&typeof e=="string"){var I=f.get("length"),N=Number(e);Number.isInteger(N)&&N>=I.v&&y(I,N+1)}k(_)}return!0},ownKeys(i){x(_);var e=Reflect.ownKeys(i).filter(n=>{var s=f.get(n);return s===void 0||s.v!==u});for(var[t,a]of f)a.v!==u&&!(t in i)&&e.push(t);return e},setPrototypeOf(){B()}})}function k(r,l=1){y(r,r.v+l)}function L(r){return r!==null&&typeof r=="object"&&h in r?r[h]:r}function te(r,l){return Object.is(L(r),L(l))}function $(r){throw new Error("https://svelte.dev/e/lifecycle_outside_component")}function ne(r,l,T=!1){P&&Y();var d=r,f=null,c=null,_=u,g=T?z:0,i=!1;const e=(a,n=!0)=>{i=!0,t(n,a)},t=(a,n)=>{if(_===(_=a))return;let s=!1;if(P){const o=d.data===G;!!_===o&&(d=J(),Q(d),A(!1),s=!0)}_?(f?D(f):n&&(f=S(()=>n(d))),c&&j(c,()=>{c=null})):(c?D(c):n&&(c=S(()=>n(d))),f&&j(f,()=>{f=null})),s&&A(!0)};U(()=>{i=!1,l(e),i||t(null,null)},g),P&&(d=Z)}function re(r){R===null&&$(),V&&R.l!==null?p(R).m.push(r):W(()=>{const l=X(r);if(typeof l=="function")return l})}function p(r){var l=r.l;return l.u??(l.u={a:[],b:[],m:[]})}export{te as a,ne as i,re as o,b as p};
