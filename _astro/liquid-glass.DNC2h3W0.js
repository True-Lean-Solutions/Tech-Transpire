var Ye=(N,I)=>()=>(I||N((I={exports:{}}).exports,I),I.exports);var Ke=Ye((et,Q)=>{/*! liquid-glass.js v1.1.0 | Apple-style Liquid Glass for the web (WebGL2)
 *  Rendering model adapted from Liquid Glass Studio, Copyright (c) 2024 Charles Yin, MIT License.
 *  Rounded-box SDF and polynomial smooth minimum after Inigo Quilez. */(function(N,I){typeof Q=="object"&&Q.exports?Q.exports=I():N.LiquidGlass=I()})(typeof globalThis<"u"?globalThis:void 0,function(){const N="1.1.0",ee=Object.freeze({thickness:20,ior:1.4,refraction:.05,dispersion:7,fresnelRange:30,fresnelHardness:20,fresnelStrength:20,glareRange:30,glareHardness:20,glareStrength:90,glareConvergence:50,glareOpposite:80,glareAngle:-45,blur:1,blurEdge:!0,tint:Object.freeze([255,255,255,0]),shadowSpread:25,shadowStrength:15,shadowOffset:Object.freeze([0,10]),merge:0,roundness:5,debug:0}),Me={thickness:[1,80],ior:[1,4],refraction:[0,.2],dispersion:[0,50],fresnelRange:[1,100],fresnelHardness:[0,100],fresnelStrength:[0,100],glareRange:[1,100],glareHardness:[0,100],glareStrength:[0,120],glareConvergence:[0,100],glareOpposite:[0,100],glareAngle:[-180,180],blur:[0,100],shadowSpread:[2,100],shadowStrength:[0,100],merge:[0,200],roundness:[2,7],debug:[0,4]},H=Object.freeze({standard:Object.freeze({}),clear:Object.freeze({blur:0,refraction:.06,dispersion:9,tint:[255,255,255,0],shadowStrength:10}),frosted:Object.freeze({blur:12,refraction:.04,dispersion:4,tint:[255,255,255,.18],fresnelStrength:30}),dark:Object.freeze({blur:10,refraction:.045,dispersion:5,tint:[18,18,22,.42],fresnelStrength:14,glareStrength:70,shadowStrength:25})}),se=["cover","contain","fill"],Se=/\.(mp4|webm|ogv|mov|m4v)(?:[?#].*)?$/i,te=new WeakMap,Le=`#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`,ue=`
uniform vec2 u_res;
uniform float u_dpr;
uniform vec4 u_shapes[16];
uniform vec4 u_shapeMeta[16];
uniform int u_count;
uniform float u_merge;

float sdShape(vec2 p, vec4 s, vec2 m) {
  vec2 hs = s.zw;
  float r = clamp(m.x, 0.0, min(hs.x, hs.y));
  vec2 q = abs(p - s.xy);
  vec2 d = q - hs;
  if (r > 0.0 && d.x > -r && d.y > -r) {
    vec2 c = max(q - (hs - vec2(r)), 0.0);
    return pow(pow(c.x, m.y) + pow(c.y, m.y), 1.0 / m.y) - r;
  }
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

float smin(float a, float b, float k) {
  if (k <= 0.0) return min(a, b);
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

// Shapes arrive sorted by group: smooth-merge within a group, hard union across groups.
float scene(vec2 p) {
  float best = 1e6;
  float cur = 1e6;
  float group = -1.0;
  for (int i = 0; i < 16; i++) {
    if (i >= u_count) break;
    vec4 m = u_shapeMeta[i];
    float di = sdShape(p, u_shapes[i], m.xy);
    if (m.z != group) {
      best = min(best, cur);
      cur = di;
      group = m.z;
    } else {
      cur = smin(cur, di, u_merge);
    }
  }
  return min(best, cur);
}
`,Fe=`#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 o;
uniform sampler2D u_tex;
uniform int u_hasTex;
uniform vec3 u_bgColor;
uniform vec4 u_uvMap;
uniform float u_shadowSpread;
uniform float u_shadowStrength;
uniform vec2 u_shadowOffset;
${ue}
void main() {
  vec3 col = u_bgColor;
  if (u_hasTex == 1) {
    vec2 t = v_uv * u_uvMap.xy + u_uvMap.zw;
    if (t.x >= 0.0 && t.x <= 1.0 && t.y >= 0.0 && t.y <= 1.0) {
      vec4 s = texture(u_tex, t);
      col = mix(u_bgColor, s.rgb, s.a);
    }
  }
  if (u_count > 0 && u_shadowStrength > 0.0) {
    float d = scene(gl_FragCoord.xy - u_shadowOffset) / u_dpr;
    col -= vec3(exp(-abs(d) / u_shadowSpread) * 0.6 * u_shadowStrength);
  }
  o = vec4(clamp(col, 0.0, 1.0), 1.0);
}`,Pe=`#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 o;
uniform sampler2D u_tex;
uniform vec2 u_texel;
uniform int u_radius;
void main() {
  float sigma = max(float(u_radius) / 3.0, 0.5);
  vec4 sum = texture(u_tex, v_uv);
  float ws = 1.0;
  for (int i = 1; i <= 128; i++) {
    if (i > u_radius) break;
    float fi = float(i);
    float w = exp(-0.5 * fi * fi / (sigma * sigma));
    sum += (texture(u_tex, v_uv + u_texel * fi) + texture(u_tex, v_uv - u_texel * fi)) * w;
    ws += 2.0 * w;
  }
  o = sum / ws;
}`,Ie=`#version 300 es
precision highp float;
#define PI 3.14159265359
in vec2 v_uv;
out vec4 o;
uniform sampler2D u_bg;
uniform sampler2D u_blurred;
uniform float u_thickness;
uniform float u_ior;
uniform float u_refraction;
uniform float u_dispersion;
uniform float u_fresnelRange;
uniform float u_fresnelHardness;
uniform float u_fresnelStrength;
uniform float u_glareRange;
uniform float u_glareHardness;
uniform float u_glareStrength;
uniform float u_glareConvergence;
uniform float u_glareOpposite;
uniform float u_glareAngle;
uniform vec4 u_tint;
uniform int u_blurEdge;
uniform int u_debug;
${ue}

float toLin(float c) { return c <= 0.04045 ? c / 12.92 : pow((c + 0.055) / 1.055, 2.4); }
float toGamma(float c) { return c <= 0.0031308 ? 12.92 * c : 1.055 * pow(c, 1.0 / 2.4) - 0.055; }
const vec3 WHITE = vec3(0.95047, 1.0, 1.08883);
float labF(float t) { return t > 0.008856 ? pow(t, 1.0 / 3.0) : 7.787 * t + 16.0 / 116.0; }
float labFi(float t) { return t > 0.206893 ? t * t * t : (t - 16.0 / 116.0) / 7.787; }

vec3 srgbToLch(vec3 c) {
  vec3 l = vec3(toLin(c.r), toLin(c.g), toLin(c.b));
  vec3 xyz = vec3(
    dot(l, vec3(0.4124, 0.3576, 0.1805)),
    dot(l, vec3(0.2126, 0.7152, 0.0722)),
    dot(l, vec3(0.0193, 0.1192, 0.9505))) / WHITE;
  vec3 f = vec3(labF(xyz.x), labF(xyz.y), labF(xyz.z));
  float a = 500.0 * (f.x - f.y);
  float b = 200.0 * (f.y - f.z);
  float chroma = length(vec2(a, b));
  return vec3(116.0 * f.y - 16.0, chroma, chroma < 1e-4 ? 0.0 : atan(b, a));
}

vec3 lchToSrgb(vec3 lch) {
  float a = lch.y * cos(lch.z);
  float b = lch.y * sin(lch.z);
  float fy = (lch.x + 16.0) / 116.0;
  vec3 xyz = vec3(labFi(fy + a / 500.0), labFi(fy), labFi(fy - b / 200.0)) * WHITE;
  vec3 l = max(vec3(
    dot(xyz, vec3(3.2406, -1.5372, -0.4986)),
    dot(xyz, vec3(-0.9689, 1.8758, 0.0415)),
    dot(xyz, vec3(0.0557, -0.2040, 1.0570))), 0.0);
  return vec3(toGamma(l.r), toGamma(l.g), toGamma(l.b));
}

vec2 sceneGrad(vec2 p) {
  return vec2(scene(p + vec2(1.0, 0.0)) - scene(p - vec2(1.0, 0.0)),
              scene(p + vec2(0.0, 1.0)) - scene(p - vec2(0.0, 1.0))) * 0.5;
}

float rimMask(float depth, float range, float hardness) {
  float x = 1.0 - depth / 1500.0 * pow(500.0 / max(range, 1.0), 2.0) + hardness;
  return clamp(pow(max(x, 0.0), 5.0), 0.0, 1.0);
}

vec3 hue(float a) {
  vec3 k = abs(fract(vec3(a / (2.0 * PI)) + vec3(1.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0);
  return clamp(k - 1.0, 0.0, 1.0);
}

vec3 sampleDispersed(vec2 off, float blurMix) {
  float kR = 1.0 + 0.02 * u_dispersion;
  float kB = 1.0 - 0.02 * u_dispersion;
  vec2 uvR = v_uv + off * kR;
  vec2 uvG = v_uv + off;
  vec2 uvB = v_uv + off * kB;
  vec3 sharp = vec3(texture(u_bg, uvR).r, texture(u_bg, uvG).g, texture(u_bg, uvB).b);
  vec3 soft = vec3(texture(u_blurred, uvR).r, texture(u_blurred, uvG).g, texture(u_blurred, uvB).b);
  return mix(sharp, soft, blurMix);
}

void main() {
  vec2 p = gl_FragCoord.xy;
  float d = scene(p);
  vec3 bg = texture(u_bg, v_uv).rgb;

  if (u_debug == 1) {
    float dc = d / u_dpr;
    vec3 c = dc > 0.0 ? vec3(0.9, 0.6, 0.3) : vec3(0.65, 0.85, 1.0);
    c *= 1.0 - exp(-0.03 * abs(dc));
    c *= 0.6 + 0.4 * smoothstep(-0.5, 0.5, cos(0.5 * abs(dc)));
    c = mix(c, vec3(1.0), 1.0 - smoothstep(0.5, 1.5, abs(dc)));
    o = vec4(c, 1.0);
    return;
  }

  if (d > 1.0) {
    o = vec4(bg, 1.0);
    return;
  }

  float depth = -d / u_dpr;
  vec2 g = sceneGrad(p);
  float gl = length(g);
  bool hasNormal = gl > 1e-5;
  vec2 n = hasNormal ? g / gl : vec2(0.0);
  float gw = clamp(gl, 0.0, 1.0);
  float nAng = hasNormal ? atan(n.y, n.x) : 0.0;

  float edge = 0.0;
  if (depth < u_thickness) {
    float x = clamp(1.0 - max(depth, 0.0) / u_thickness, 0.0, 1.0);
    float ti = asin(x * x);
    float tt = asin(clamp(sin(ti) / u_ior, -1.0, 1.0));
    edge = max(tan(ti - tt), 0.0);
  }

  float fr = rimMask(depth, u_fresnelRange, u_fresnelHardness);
  float gg = rimMask(depth, u_glareRange, u_glareHardness);
  float ang = (mod(nAng + 2.0 * PI, 2.0 * PI) - PI / 4.0 + u_glareAngle) * 2.0;
  bool farSide = (ang > PI * 1.5 && ang < PI * 3.5) || ang < -PI * 0.5;
  float ga = (0.5 + 0.5 * sin(ang)) * (farSide ? 1.2 * u_glareOpposite : 1.2) * u_glareStrength;
  ga = clamp(pow(max(ga, 0.0), 0.1 + u_glareConvergence * 2.0), 0.0, 1.0);

  if (u_debug == 2) { o = vec4(mix(bg, hue(nAng) * gw, step(d, 0.0)), 1.0); return; }
  if (u_debug == 3) { o = vec4(mix(bg, vec3(edge), step(d, 0.0)), 1.0); return; }
  if (u_debug == 4) { o = vec4(mix(bg, vec3(fr * u_fresnelStrength * 3.0, ga * gg, 0.0), step(d, 0.0)), 1.0); return; }

  vec3 col;
  if (edge <= 0.0) {
    col = texture(u_blurred, v_uv).rgb;
  } else {
    vec2 off = -n * gw * edge * u_refraction * 1414.2136 * u_dpr / u_res;
    col = sampleDispersed(off, u_blurEdge == 1 ? 1.0 : clamp(depth / u_thickness, 0.0, 1.0));
  }
  vec3 base = col;
  col = mix(col, u_tint.rgb, u_tint.a * 0.8);

  if (edge > 0.0) {
    vec3 fl = srgbToLch(mix(vec3(1.0), u_tint.rgb, u_tint.a * 0.5));
    fl.x = clamp(fl.x + 20.0 * fr * u_fresnelStrength, 0.0, 100.0);
    col = mix(col, lchToSrgb(fl), clamp(fr * u_fresnelStrength * 0.7 * gw, 0.0, 1.0));

    vec3 gc = srgbToLch(mix(base, u_tint.rgb, u_tint.a * 0.5));
    gc.x = clamp(gc.x + 150.0 * ga * gg, 0.0, 120.0);
    gc.y += 30.0 * ga * gg;
    col = mix(col, lchToSrgb(gc), clamp(ga * gg * gw, 0.0, 1.0));
  }

  col = mix(col, bg, smoothstep(-0.75, 0.75, d));
  o = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;function ke(){try{return!!document.createElement("canvas").getContext("webgl2")}catch{return!1}}function X(a,h){const u=Number(h);if(!Number.isFinite(u))throw new TypeError(`LiquidGlass: "${a}" must be a finite number`);const f=Me[a];return f?Math.min(f[1],Math.max(f[0],u)):u}function Be(a){if(!Array.isArray(a)||a.length!==4||a.some(h=>!Number.isFinite(Number(h))))throw new TypeError('LiquidGlass: "tint" must be [r, g, b, a] with r,g,b 0-255 and a 0-1');return[0,1,2].map(h=>Math.min(255,Math.max(0,Number(a[h])))).concat(Math.min(1,Math.max(0,Number(a[3]))))}function z(a,h){const u=Object.assign({},a);for(const[f,L]of Object.entries(h||{})){if(!(f in ee))throw new TypeError(`LiquidGlass: unknown parameter "${f}"`);if(f==="tint")u.tint=Be(L);else if(f==="shadowOffset"){if(!Array.isArray(L)||L.length!==2)throw new TypeError('LiquidGlass: "shadowOffset" must be [x, y] in CSS px');u.shadowOffset=[X("shadowOffset[0]",L[0]),X("shadowOffset[1]",L[1])]}else f==="blurEdge"?u.blurEdge=!!L:u[f]=X(f,L)}return u}function le(a){if(!se.includes(a))throw new TypeError(`LiquidGlass: "fit" must be one of ${se.join(", ")}`);return a}function fe(a){if(!Array.isArray(a)||a.length!==2||!a.every(h=>Number.isFinite(Number(h))))throw new TypeError('LiquidGlass: "position" must be [x, y] fractions, e.g. [0.5, 0.5]');return[Number(a[0]),Number(a[1])]}function ce(a){const h=document.createElement("canvas");h.width=h.height=1;const u=h.getContext("2d");u.fillStyle="#000",u.fillStyle=String(a),u.fillRect(0,0,1,1);const f=u.getImageData(0,0,1,1).data;return[f[0]/255,f[1]/255,f[2]/255]}function Ge(a){const h=(getComputedStyle(a).borderTopLeftRadius||"0").split(" ")[0],u=parseFloat(h);return Number.isFinite(u)?{value:u,pct:h.endsWith("%")}:{value:0,pct:!1}}function Ue(a,h){if(a===void 0||a==="auto")return"auto";const u=typeof a=="string"?parseFloat(a):Number(a);if(!Number.isFinite(u)||u<0)throw new TypeError(`LiquidGlass: shape ${h}.radius must be "auto" or a non-negative number of CSS px`);return u}function Oe(a,h){if(typeof HTMLCanvasElement>"u"||!(a instanceof HTMLCanvasElement))throw new TypeError("LiquidGlass.create: first argument must be an HTMLCanvasElement");const u=Object.assign({maxDpr:2,fit:"cover",position:[.5,.5],backgroundColor:"#808080"},h||{}),f=typeof u.onError=="function"?u.onError:t=>console.warn("[LiquidGlass]",t),L=t=>typeof matchMedia=="function"&&matchMedia(t).matches,Ne=L("(prefers-reduced-motion: reduce)"),De=L("(prefers-reduced-transparency: reduce)");if(u.preset!==void 0&&!H[u.preset])throw new TypeError(`LiquidGlass: unknown preset "${u.preset}"`);function de(t,r){let o=z(z(ee,H[t||"standard"]),r);return De&&(o=z(o,{blur:Math.max(o.blur,16),tint:[o.tint[0],o.tint[1],o.tint[2],Math.max(o.tint[3],.6)]})),o}let y=de(u.preset,u.params),re=le(u.fit),ne=fe(u.position);const me=()=>{Array.isArray(u.shapes)&&u.shapes.forEach(t=>{t&&t.element instanceof Element&&(t.element.dataset.lg="fallback")})},e=a.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1,premultipliedAlpha:!1,preserveDrawingBuffer:!1});if(!e)return a.dataset.lg="unsupported",a.style.display="none",me(),f(new Error('WebGL2 is not available; glass elements were marked data-lg="fallback"')),null;let q=!1,$=4096,G=[],U=null,V=null,v=null,D=null,p={source:null,ready:!1,dynamic:!1,flipY:!0,width:1,height:1,ownedVideo:null,token:null},ge=ce(u.backgroundColor),w=0,W=!1,j=!1,k=!1,x=!0,oe=null,Y=0,B=1,M=1,T=1;const O={cx:null,cy:null};let P=null;function he(t,r){const o=e.createShader(t);if(e.shaderSource(o,r),e.compileShader(o),!e.getShaderParameter(o,e.COMPILE_STATUS)){const s=e.getShaderInfoLog(o);throw e.deleteShader(o),new Error(`LiquidGlass shader compile failed: ${s}`)}return o}function ie(t){const r=he(e.VERTEX_SHADER,Le),o=he(e.FRAGMENT_SHADER,t),s=e.createProgram();if(e.attachShader(s,r),e.attachShader(s,o),e.bindAttribLocation(s,0,"a_pos"),e.linkProgram(s),e.deleteShader(r),e.deleteShader(o),!e.getProgramParameter(s,e.LINK_STATUS)){const l=e.getProgramInfoLog(s);throw e.deleteProgram(s),new Error(`LiquidGlass program link failed: ${l}`)}const n={},b=e.getProgramParameter(s,e.ACTIVE_UNIFORMS);for(let l=0;l<b;l++){const d=e.getActiveUniform(s,l);n[d.name.replace(/\[0\]$/,"")]=e.getUniformLocation(s,d.name)}return{p:s,loc:n}}function ae(t,r){const o=e.createTexture();e.bindTexture(e.TEXTURE_2D,o),e.texImage2D(e.TEXTURE_2D,0,q?e.RGBA16F:e.RGBA8,t,r,0,e.RGBA,q?e.HALF_FLOAT:e.UNSIGNED_BYTE,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);const s=e.createFramebuffer();e.bindFramebuffer(e.FRAMEBUFFER,s),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,o,0),e.checkFramebufferStatus(e.FRAMEBUFFER)!==e.FRAMEBUFFER_COMPLETE&&q&&e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,t,r,0,e.RGBA,e.UNSIGNED_BYTE,null);const n=e.checkFramebufferStatus(e.FRAMEBUFFER)===e.FRAMEBUFFER_COMPLETE;if(e.bindFramebuffer(e.FRAMEBUFFER,null),!n)throw e.deleteTexture(o),e.deleteFramebuffer(s),new Error(`LiquidGlass: framebuffer incomplete at ${t}x${r}`);return{tex:o,fbo:s,w:t,h:r}}function pe(){if(v){for(const t of Object.values(v))e.deleteTexture(t.tex),e.deleteFramebuffer(t.fbo);v=null}}function _e(){q=!!e.getExtension("EXT_color_buffer_float"),$=Math.min(e.getParameter(e.MAX_TEXTURE_SIZE),...e.getParameter(e.MAX_VIEWPORT_DIMS)),U={bg:ie(Fe),blur:ie(Pe),main:ie(Ie)},V=e.createBuffer(),e.bindBuffer(e.ARRAY_BUFFER,V),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),D=e.createTexture(),e.bindTexture(e.TEXTURE_2D,D),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array([128,128,128,255])),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),v=null,oe=null,x=!0,p.ready&&K()}function K(){const t=p.source;if(!t||k)return!1;try{return e.bindTexture(e.TEXTURE_2D,D),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,t),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),p.dynamic?e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR):(e.generateMipmap(e.TEXTURE_2D),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR)),x=!0,!0}catch(r){return e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),p.ready=!1,x=!0,f(new Error(`Background upload failed (cross-origin media needs CORS headers): ${r.message}`)),!1}}function Ce(t){return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?[t.videoWidth,t.videoHeight]:typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement?[t.naturalWidth,t.naturalHeight]:[t.width,t.height]}function be(){const t=p.ownedVideo;t&&(t.pause(),t.removeAttribute("src"),t.load(),t.remove())}function Ee(t,r){const o=r||{};if(o.fit!==void 0&&(re=le(o.fit)),o.position!==void 0&&(ne=fe(o.position)),o.color!==void 0&&(ge=ce(o.color)),o.type!==void 0&&o.type!=="image"&&o.type!=="video")throw new TypeError('LiquidGlass: background "type" must be "image" or "video"');be();const s={};if(p={source:null,ready:!1,dynamic:!1,flipY:!0,width:1,height:1,ownedVideo:null,token:s},x=!0,F(),t==null)return Promise.resolve();let n=t;typeof t=="string"&&((o.type?o.type==="video":Se.test(t))?(n=document.createElement("video"),n.crossOrigin="anonymous",n.muted=!0,n.defaultMuted=!0,n.loop=!0,n.playsInline=!0,n.preload="auto",n.setAttribute("muted",""),n.setAttribute("playsinline",""),n.setAttribute("aria-hidden","true"),n.style.cssText="position:fixed;left:0;top:0;width:2px;height:2px;opacity:0.01;pointer-events:none;z-index:-1",n.src=t,document.body.appendChild(n),p.ownedVideo=n):(n=new Image,n.crossOrigin="anonymous",n.decoding="async",n.src=t));const b=typeof HTMLVideoElement<"u"&&n instanceof HTMLVideoElement,l=typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement,d=typeof ImageBitmap<"u"&&n instanceof ImageBitmap,i=()=>{const c=n.play();c&&typeof c.catch=="function"&&c.catch(_=>{f(new Error(`Background video could not autoplay (${_.name}); retrying on the next tap`)),window.addEventListener("pointerdown",()=>{n.play().catch(g=>f(g))},{once:!0})})},m=new Promise((c,_)=>{let g=0;const E=S=>{clearTimeout(g),p.token===s&&(x=!0),_(S)},A=()=>{if(clearTimeout(g),p.token!==s)return c();const[S,R]=Ce(n);if(!S||!R)return E(new Error("Background has zero size"));if(Object.assign(p,{source:n,ready:!0,dynamic:b||!!o.live,flipY:!d,width:S,height:R}),!k&&!K())return p.source=null,_(new Error("Background could not be uploaded to WebGL (see onError)"));F(),c()};l?n.complete?n.naturalWidth?A():E(new Error(`Background image failed to load: ${n.currentSrc||n.src}`)):(n.addEventListener("load",A,{once:!0}),n.addEventListener("error",()=>E(new Error(`Background image failed to load: ${n.currentSrc||n.src}`)),{once:!0})):b?(n.preload==="none"&&(n.preload="auto"),n.readyState>=2?A():(n.addEventListener("loadeddata",A,{once:!0}),n.addEventListener("error",()=>E(new Error(`Background video failed to load: ${n.currentSrc||n.src}`)),{once:!0}),g=setTimeout(()=>E(new Error(`Background video did not load within ${2e4/1e3} s (autoplay blocked, Low Power Mode, or unsupported codec)`)),2e4),p.ownedVideo===n&&n.load()),i()):n&&typeof n.width=="number"&&typeof n.height=="number"?A():E(new TypeError("Background must be a URL, <img>, <video>, <canvas>, ImageBitmap or OffscreenCanvas"))});return m.catch(c=>f(c)),m}function He(){const t=M/Math.max(1,T),r=p.width/Math.max(1,p.height);let o=1,s=1;re==="cover"?t>r?s=r/t:o=t/r:re==="contain"&&(t>r?o=t/r:s=r/t);const n=Math.min(1,Math.max(0,ne[0])),b=1-Math.min(1,Math.max(0,ne[1])),l=(1-o)*n,d=(1-s)*b;return p.flipY?[o,s,l,d]:[o,-s,l,1-d]}function Xe(t,r){if(!t||typeof t!="object")throw new TypeError(`LiquidGlass: shape ${r} must be an object`);const o=t.element||null;if(o&&!(o instanceof Element))throw new TypeError(`LiquidGlass: shape ${r}.element must be a DOM Element`);const s=t.follow==="pointer";if(t.follow!==void 0&&!s)throw new TypeError(`LiquidGlass: shape ${r}.follow only supports "pointer"`);if(!o&&!s&&!(Number(t.width)>0&&Number(t.height)>0))throw new TypeError(`LiquidGlass: shape ${r} needs an element, follow: "pointer", or positive width/height`);const n=Number(t.width)||0,b=Number(t.height)||0,l={element:o,follow:s,group:t.group===void 0?"":String(t.group),x:Number(t.x)||0,y:Number(t.y)||0,width:s?n||160:n,height:s?b||160:b,radius:Ue(t.radius,r),roundness:t.roundness===void 0?null:X("roundness",t.roundness),inset:Number(t.inset)||0,stretch:t.stretch===void 0?10:Math.max(0,Number(t.stretch)||0),cssRadius:null,spring:null};if(s){const d=t.x!==void 0?l.x+l.width/2:null,i=t.y!==void 0?l.y+l.height/2:null;l.spring={x:d,y:i,vx:0,vy:0}}return l}function ve(t){if(!Array.isArray(t))throw new TypeError("LiquidGlass.setShapes: expected an array");if(t.length>16)throw new RangeError("LiquidGlass: at most 16 shapes");const r=t.map(Xe);G.forEach(o=>{o.element&&!r.some(s=>s.element===o.element)&&(delete o.element.dataset.lg,P&&P.unobserve(o.element))}),r.forEach(o=>{o.element&&(o.element.dataset.lg="glass",P&&P.observe(o.element))}),G=r,x=!0}function ze(t,r){let o=!1;const s=r.width,n=r.height,b=O.cx===null?null:O.cx-r.left,l=O.cy===null?null:O.cy-r.top;for(const d of G){if(!d.follow)continue;const i=d.spring;i.x===null&&(i.x=s/2,i.y=n/2);const m=b===null?i.x:b,c=l===null?i.y:l;if(Ne){o=o||i.x!==m||i.y!==c,i.x=m,i.y=c,i.vx=0,i.vy=0;continue}const _=170,g=26,E=Math.max(1,Math.ceil(t/(1/240))),A=t/E;for(let S=0;S<E;S++)i.vx+=(_*(m-i.x)-g*i.vx)*A,i.vy+=(_*(c-i.y)-g*i.vy)*A,i.x+=i.vx*A,i.y+=i.vy*A;Math.abs(m-i.x)<.05&&Math.abs(c-i.y)<.05&&Math.hypot(i.vx,i.vy)<.5?(i.x=m,i.y=c,i.vx=0,i.vy=0):o=!0}return o}function qe(t,r,o,s){const n=[],b=new Map;for(const i of G){let m,c,_,g;if(i.element){if(!i.element.isConnected||typeof i.element.checkVisibility=="function"&&!i.element.checkVisibility({visibilityProperty:!0}))continue;const R=i.element.getBoundingClientRect();m=R.left-t.left,c=R.top-t.top,_=R.width,g=R.height,i.radius==="auto"&&i.cssRadius===null&&(i.cssRadius=Ge(i.element))}else if(i.follow){const R=i.spring,We=1+Math.abs(R.vx)/1e3*i.stretch/100,je=1+Math.abs(R.vy)/1e3*i.stretch/100;_=i.width*Math.min(We,1.6),g=i.height*Math.min(je,1.6),m=R.x-_/2,c=R.y-g/2}else m=i.x,c=i.y,_=i.width,g=i.height;if(m+=i.inset,c+=i.inset,_-=2*i.inset,g-=2*i.inset,!(_>.5&&g>.5))continue;let E;i.radius!=="auto"?E=i.radius:i.element?E=i.cssRadius.pct?Math.min(_,g)*i.cssRadius.value/100:i.cssRadius.value:E=Math.min(_,g)*.4,E=Math.min(Math.max(0,E),Math.min(_,g)/2);const A=E>=Math.min(_,g)/2-.5;let S=i.roundness;S===null&&(S=A||i.element?2:y.roundness),b.has(i.group)||b.set(i.group,b.size),n.push({g:b.get(i.group),cx:(m+_/2)*r,cy:s-(c+g/2)*o,hw:_/2*r,hh:g/2*o,r:E*r,n:S})}n.sort((i,m)=>i.g-m.g);const l=new Float32Array(64),d=new Float32Array(64);return n.forEach((i,m)=>{l.set([i.cx,i.cy,i.hw,i.hh],m*4),d.set([i.r,i.n,i.g,0],m*4)}),{geo:l,meta:d,count:n.length}}function $e(){const t=a.clientWidth,r=a.clientHeight;if(!(t>0&&r>0))return!1;const o=Math.min(window.devicePixelRatio||1,Math.max(.25,Number(u.maxDpr)||2));B=Math.min(o,$/Math.max(t,r));const s=Math.max(1,Math.min($,Math.round(t*B))),n=Math.max(1,Math.min($,Math.round(r*B)));return(a.width!==s||a.height!==n)&&(a.width=s,a.height=n),(!e.drawingBufferWidth||!e.drawingBufferHeight)&&(a.width=s,a.height=n,!e.drawingBufferWidth||!e.drawingBufferHeight)?!1:(M=e.drawingBufferWidth,T=e.drawingBufferHeight,(!v||v.bg.w!==M||v.bg.h!==T)&&(pe(),v={bg:ae(M,T),a:ae(M,T),b:ae(M,T)},x=!0),!0)}function J(t,r){return e.bindFramebuffer(e.FRAMEBUFFER,r),e.viewport(0,0,M,T),e.useProgram(t.p),t.loc}function xe(t,r){e.uniform2f(t.u_res,M,T),e.uniform1f(t.u_dpr,B),e.uniform4fv(t.u_shapes,r.geo),e.uniform4fv(t.u_shapeMeta,r.meta),e.uniform1i(t.u_count,r.count),e.uniform1f(t.u_merge,y.merge*B)}function C(t,r,o){e.activeTexture(e.TEXTURE0+t),e.bindTexture(e.TEXTURE_2D,r),e.uniform1i(o,t)}function Ve(t){e.bindBuffer(e.ARRAY_BUFFER,V),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);let r=J(U.bg,v.bg.fbo);xe(r,t),C(0,D,r.u_tex),e.uniform1i(r.u_hasTex,p.ready?1:0),e.uniform3fv(r.u_bgColor,ge),e.uniform4fv(r.u_uvMap,He()),e.uniform1f(r.u_shadowSpread,y.shadowSpread),e.uniform1f(r.u_shadowStrength,y.shadowStrength/100),e.uniform2f(r.u_shadowOffset,y.shadowOffset[0]*B,-y.shadowOffset[1]*B),e.drawArrays(e.TRIANGLES,0,3);let o=v.bg.tex;const s=Math.min(128,Math.round(y.blur*B));s>1&&(r=J(U.blur,v.a.fbo),C(0,v.bg.tex,r.u_tex),e.uniform2f(r.u_texel,0,1/T),e.uniform1i(r.u_radius,s),e.drawArrays(e.TRIANGLES,0,3),r=J(U.blur,v.b.fbo),C(0,v.a.tex,r.u_tex),e.uniform2f(r.u_texel,1/M,0),e.uniform1i(r.u_radius,s),e.drawArrays(e.TRIANGLES,0,3),o=v.b.tex),r=J(U.main,null),xe(r,t),C(0,v.bg.tex,r.u_bg),C(1,o,r.u_blurred);const n=y;e.uniform1f(r.u_thickness,n.thickness),e.uniform1f(r.u_ior,n.ior),e.uniform1f(r.u_refraction,n.refraction),e.uniform1f(r.u_dispersion,n.dispersion),e.uniform1f(r.u_fresnelRange,n.fresnelRange),e.uniform1f(r.u_fresnelHardness,n.fresnelHardness/100),e.uniform1f(r.u_fresnelStrength,n.fresnelStrength/100),e.uniform1f(r.u_glareRange,n.glareRange),e.uniform1f(r.u_glareHardness,n.glareHardness/100),e.uniform1f(r.u_glareStrength,n.glareStrength/100),e.uniform1f(r.u_glareConvergence,n.glareConvergence/100),e.uniform1f(r.u_glareOpposite,n.glareOpposite/100),e.uniform1f(r.u_glareAngle,n.glareAngle*Math.PI/180),e.uniform4f(r.u_tint,n.tint[0]/255,n.tint[1]/255,n.tint[2]/255,n.tint[3]),e.uniform1i(r.u_blurEdge,n.blurEdge?1:0),e.uniform1i(r.u_debug,Math.round(n.debug)),e.drawArrays(e.TRIANGLES,0,3)}function ye(t){if(w=0,j||W||k)return;w=requestAnimationFrame(ye);const r=Y?Math.min(.05,(t-Y)/1e3):1/60;Y=t;try{if(!$e())return;const o=a.getBoundingClientRect(),s=ze(r,o),n=M/Math.max(1,o.width),b=T/Math.max(1,o.height),l=qe(o,n,b,T),d=p.ready&&p.dynamic?p.source:null,i=d&&typeof HTMLVideoElement<"u"&&d instanceof HTMLVideoElement,m=!!d&&(!i||!d.paused&&!d.ended&&d.readyState>=2);if(m&&!K())return;const c=l.count+"|"+Array.prototype.join.call(l.geo.subarray(0,l.count*4),",")+"|"+Array.prototype.join.call(l.meta.subarray(0,l.count*4),",")+"|"+M+"x"+T;if(!x&&!m&&!s&&c===oe)return;oe=c,x=!1,Ve(l)}catch(o){cancelAnimationFrame(w),w=0,f(o)}}function F(){!w&&!j&&!W&&!k&&(Y=0,w=requestAnimationFrame(ye))}const Z=t=>{O.cx=t.clientX,O.cy=t.clientY},we=t=>{t.preventDefault(),k=!0,cancelAnimationFrame(w),w=0},Te=()=>{k=!1;try{_e(),F()}catch(t){f(t)}};P=typeof ResizeObserver=="function"?new ResizeObserver(t=>{x=!0;for(const r of t)for(const o of G)o.element===r.target&&(o.cssRadius=null)}):null;function Ae(){window.removeEventListener("pointermove",Z),window.removeEventListener("pointerdown",Z),a.removeEventListener("webglcontextlost",we),a.removeEventListener("webglcontextrestored",Te),P&&P.disconnect()}P&&P.observe(a),window.addEventListener("pointermove",Z,{passive:!0}),window.addEventListener("pointerdown",Z,{passive:!0}),a.addEventListener("webglcontextlost",we),a.addEventListener("webglcontextrestored",Te);try{if(e.isContextLost()){k=!0;const t=te.get(a);te.delete(a),t&&(t.dispatched?t.lose.restoreContext():t.pending=!0)}else _e();ve(Array.isArray(u.shapes)?u.shapes:[])}catch(t){return Ae(),a.dataset.lg="unsupported",a.style.display="none",me(),f(t),null}a.dataset.lg="active",a.setAttribute("aria-hidden","true");const Re=u.background!=null?Ee(u.background,{type:u.backgroundType,live:u.live}):Promise.resolve();return Re.catch(()=>{}),F(),{canvas:a,ready:Re,setParams(t){return y=z(y,t),x=!0,F(),this},getParams(){return JSON.parse(JSON.stringify(y))},usePreset(t){if(!H[t])throw new TypeError(`LiquidGlass: unknown preset "${t}"`);return y=de(t,{}),x=!0,F(),this},setShapes(t){return ve(t),F(),this},setBackground(t,r){return Ee(t,r)},updateBackground(){p.ready&&K(),F()},refresh(){G.forEach(t=>{t.cssRadius=null}),x=!0,F()},pause(){W=!0,cancelAnimationFrame(w),w=0},resume(){W=!1,x=!0,F()},destroy(){if(!j){if(j=!0,cancelAnimationFrame(w),w=0,Ae(),G.forEach(t=>{t.element&&delete t.element.dataset.lg}),be(),!k){pe(),Object.values(U||{}).forEach(r=>e.deleteProgram(r.p)),e.deleteBuffer(V),e.deleteTexture(D);const t=e.getExtension("WEBGL_lose_context");if(t){const r={lose:t,dispatched:!1,pending:!1};te.set(a,r),a.addEventListener("webglcontextlost",o=>{o.preventDefault(),r.dispatched=!0,r.pending&&setTimeout(()=>t.restoreContext(),0)},{once:!0}),t.loseContext()}}delete a.dataset.lg}}}}return Object.freeze({VERSION:N,MAX_SHAPES:16,DEFAULTS:ee,PRESETS:H,isSupported:ke,create:Oe})})});export default Ke();
