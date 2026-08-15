/* WebGL2 fluid background — migrated from Astro src/scripts/landing.js.
   Same behavior, typed. Shaders byte-identical. */

interface FluidParams {
  mouseRadius: number;
  mouseStrength: number;
  mouseSmoothing: number;
  mouseVelocity: number;
  decay: number;
  distortBoost: number;
  noiseBoost: number;
  swirlBoost: number;
  glowIntensity: number;
  glowColors: string[];
  glowColorsB: string[];
  speed: number;
  distortion: number;
  swirl: number;
  swirlIterations: number;
  scale: number;
  rotation: number;
  proportion: number;
  softness: number;
  shapeScale: number;
  offsetX: number;
  offsetY: number;
  grain: number;
  colors: string[];
  colorsB: string[];
  lightX: number;
  lightY: number;
  lightCore: number;
  lightHalo: number;
  vignette: number;
  lightFollow: number;
  bloomThreshold: number;
  bloomRange: number;
  bloomStrength: number;
}

export const FLUID_PARAMS: FluidParams = {
  mouseRadius: 0.09,
  mouseStrength: 1.8,
  mouseSmoothing: 0.1,
  mouseVelocity: 0.2,
  decay: 0.925,
  distortBoost: 2.2,
  noiseBoost: 0.3,
  swirlBoost: 0.8,
  glowIntensity: 0.06,
  glowColors: ["#c9f6ff", "#10AEC2", "#0a6a75"],
  glowColorsB: ["#e0b070", "#b06a12", "#4a2b00"],
  speed: 28,
  distortion: 18,
  swirl: 20,
  swirlIterations: 12,
  scale: 1.77,
  rotation: 15,
  proportion: 60,
  softness: 80,
  shapeScale: 0,
  offsetX: -124,
  offsetY: -48,
  grain: 0.005,
  colors: ["#000000", "#0b3a45", "#10AEC2", "#7adfe8", "#000000"],
  colorsB: ["#000000", "#331d00", "#c97f1e", "#d69a55", "#000000"],
  lightX: 0.89,
  lightY: 0.46,
  lightCore: 0.04,
  lightHalo: 0.08,
  vignette: 0.38,
  lightFollow: 0.63,
  bloomThreshold: 0.61,
  bloomRange: 0.18,
  bloomStrength: 0.18
};

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255
  ];
}

/* direct RGB lerp: cyan -> orange, no hue detour through green */
function mixRgb(
  c1: [number, number, number],
  c2: [number, number, number],
  t: number
): [number, number, number] {
  return [
    c1[0] + (c2[0] - c1[0]) * t,
    c1[1] + (c2[1] - c1[1]) * t,
    c1[2] + (c2[2] - c1[2]) * t
  ];
}

const FLUID_VS =
  "#version 300 es\nin vec4 a_position;\nout vec2 vUv;\nvoid main() {\n  vUv = a_position.xy * 0.5 + 0.5;\n  gl_Position = a_position;\n}\n";

const DECAY_FS =
  "#version 300 es\nprecision mediump float;\nin vec2 vUv;\nuniform sampler2D u_prev;\nuniform vec2 u_mouse;\nuniform vec2 u_velocity;\nuniform float u_brushRadius;\nuniform float u_brushStrength;\nuniform float u_decay;\nout vec4 fragColor;\n\nvoid main() {\n  vec4 prev = texture(u_prev, vUv);\n\n  prev.r *= u_decay;\n  prev.gb = mix(vec2(0.5), prev.gb, u_decay);\n\n  float dist = distance(vUv, u_mouse);\n\n  float influence = exp(-dist * dist / (u_brushRadius * u_brushRadius * 0.5));\n  influence = max(0.0, influence - 0.01);\n\n  float speed = length(u_velocity);\n  float presenceStrength = u_brushStrength * 0.3;\n  float velBonus = min(speed * 3.0, 0.7) * u_brushStrength;\n  float totalStrength = presenceStrength + velBonus;\n\n  prev.r = max(prev.r, influence * totalStrength);\n  float blendAmt = influence * min(totalStrength, 0.4) * 0.3;\n  prev.g = mix(prev.g, clamp(u_velocity.x * 2.0 + 0.5, 0.0, 1.0), blendAmt);\n  prev.b = mix(prev.b, clamp(u_velocity.y * 2.0 + 0.5, 0.0, 1.0), blendAmt);\n\n  fragColor = prev;\n}\n";

const FLUID_FS =
  "#version 300 es\nprecision mediump float;\nin vec2 vUv;\nuniform float u_time;\nuniform vec2 u_resolution;\nuniform float u_scale;\nuniform vec2 u_offset;\nuniform float u_grain;\nuniform sampler2D u_flowmap;\nuniform float u_distortBoost;\nuniform float u_swirlBoost;\nuniform float u_glowIntensity;\nuniform vec3 u_glowColor1;\nuniform vec3 u_glowColor2;\nuniform vec3 u_glowColor3;\nuniform vec2 u_lightPos;\nuniform float u_lightCore;\nuniform float u_lightHalo;\nuniform float u_vignette;\nuniform float u_bloomThreshold;\nuniform float u_bloomRange;\nuniform float u_bloomStrength;\nuniform vec3 u_c1, u_c2, u_c3, u_c4, u_c5;\nout vec4 fragColor;\n\nvec3 mod289v3(vec3 x){return x-floor(x*(1./289.))*289.;}\nvec4 mod289v4(vec4 x){return x-floor(x*(1./289.))*289.;}\nvec4 permute(vec4 x){return mod289v4(((x*34.)+1.)*x);}\nvec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}\n\nfloat snoise(vec3 v){\n  const vec2 C=vec2(1./6.,1./3.);\n  const vec4 D=vec4(0.,.5,1.,2.);\n  vec3 i=floor(v+dot(v,C.yyy));\n  vec3 x0=v-i+dot(i,C.xxx);\n  vec3 g=step(x0.yzx,x0.xyz);\n  vec3 l=1.-g;\n  vec3 i1=min(g.xyz,l.zxy);\n  vec3 i2=max(g.xyz,l.zxy);\n  vec3 x1=x0-i1+C.xxx;\n  vec3 x2=x0-i2+C.yyy;\n  vec3 x3=x0-D.yyy;\n  i=mod289v3(i);\n  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));\n  float n_=.142857142857;\n  vec3 ns=n_*D.wyz-D.xzx;\n  vec4 j=p-49.*floor(p*ns.z*ns.z);\n  vec4 x_=floor(j*ns.z);\n  vec4 y_=floor(j-7.*x_);\n  vec4 x=x_*ns.x+ns.yyyy;\n  vec4 y=y_*ns.x+ns.yyyy;\n  vec4 h=1.-abs(x)-abs(y);\n  vec4 b0=vec4(x.xy,y.xy);\n  vec4 b1=vec4(x.zw,y.zw);\n  vec4 s0=floor(b0)*2.+1.;\n  vec4 s1=floor(b1)*2.+1.;\n  vec4 sh=-step(h,vec4(0.));\n  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;\n  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;\n  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);\n  vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);\n  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));\n  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;\n  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);\n  m=m*m;\n  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));\n}\n\nfloat hash(vec2 p){\n  vec3 p3=fract(vec3(p.xyx)*.1031);\n  p3+=dot(p3,p3.yzx+33.33);\n  return fract((p3.x+p3.y)*p3.z);\n}\n\nfloat fbm(vec3 p){\n  float v=0.,amp=.6;vec3 shift=vec3(100.);\n  for(int i=0;i<1;i++){v+=amp*snoise(p);p=p*2.+shift;amp*=.4;}\n  return v;\n}\n\nfloat fluidNoise(vec2 uv,float t){\n  float n1=fbm(vec3(uv*.6,t*.06));\n  float n2=fbm(vec3(uv*.6+5.2,t*.06+1.3));\n  vec2 w1=vec2(n1,n2)*.6;\n  float n3=fbm(vec3((uv+w1)*.7+1.7,t*.05+3.1));\n  float n4=fbm(vec3((uv+w1)*.7+9.2,t*.05+5.7));\n  vec2 w2=vec2(n3,n4)*.5;\n  return fbm(vec3((uv+w1+w2)*.5,t*.04));\n}\n\nvec2 curlish(vec2 uv,float t){\n  float eps=.02;\n  float n=snoise(vec3(uv*.8,t));\n  float nx=snoise(vec3((uv+vec2(eps,0.))*.8,t));\n  float ny=snoise(vec3((uv+vec2(0.,eps))*.8,t));\n  return vec2(-(ny-n)/eps,(nx-n)/eps)*.003;\n}\n\nvoid main(){\n  float aspect=u_resolution.x/u_resolution.y;\n  vec2 uv=gl_FragCoord.xy/u_resolution;\n  vec2 suv=vec2(uv.x*aspect, uv.y) * u_scale + u_offset;\n  float t=u_time;\n\n  vec4 flow = texture(u_flowmap, uv);\n  float influence = flow.r;\n  vec2 flowDir = (flow.gb - 0.5) * 2.0;\n\n  suv += flowDir * influence * u_distortBoost * 0.8;\n  float swirlAngle = influence * u_swirlBoost * 2.5;\n  float cs = cos(swirlAngle), sn = sin(swirlAngle);\n  vec2 delta = suv - vec2(uv.x * aspect, uv.y) * u_scale;\n  suv += (mat2(cs, sn, -sn, cs) * delta - delta) * influence;\n\n  vec2 curl=curlish(suv,t*.04);\n  vec2 uvD=suv+curl*12.;\n  float f=fluidNoise(uvD,t);\n  float swirl=snoise(vec3(uvD*.8+f*1.5,t*.035))*.5+.5;\n  float n=f*.5+.5;\n  vec3 col=mix(u_c1,u_c2,smoothstep(.2,.5,n));\n  col=mix(col,u_c3,smoothstep(.35,.65,n+swirl*.25));\n  col=mix(col,u_c4,smoothstep(.6,.85,swirl)*.55);\n  col=mix(col,u_c5,smoothstep(.5,.8,n*swirl)*.35);\n\n  float glow = smoothstep(0.0, 0.8, influence);\n  float glowNoise = snoise(vec3(uvD * 1.5, t * 0.08)) * 0.5 + 0.5;\n  float glowDist = smoothstep(0.0, 1.0, influence);\n  vec3 glowMix = mix(u_glowColor3, u_glowColor2, glowDist);\n  glowMix = mix(glowMix, u_glowColor1, glowDist * glowNoise);\n  col = mix(col, glowMix, glow * u_glowIntensity);\n\n  if(u_grain>0.0){\n    vec2 flowOffset = (uvD - suv) * u_resolution.y;\n    vec2 gp = floor((gl_FragCoord.xy + flowOffset) / 5.0);\n    float gr=hash(gp)*2.-1.;\n    col+=gr*u_grain;\n  }\n\n  float luma=dot(col,vec3(.299,.587,.114));\n  float bloom=smoothstep(u_bloomThreshold-u_bloomRange,u_bloomThreshold+u_bloomRange,luma);\n  col+=(col*.85+vec3(.15,.145,.13))*bloom*u_bloomStrength;\n\n  float ld=length((uv-u_lightPos)*vec2(aspect,1.));\n  float core=exp(-ld*ld*4.5);\n  float halo=exp(-ld*1.8);\n  col+=vec3(0.,1.,.9)*core*u_lightCore+vec3(0.,.7,.65)*halo*u_lightHalo;\n\n  float vig=1.-smoothstep(.35,.75,length(uv-.5));\n  col=mix(col*(1.-u_vignette),col,vig);\n  fragColor=vec4(col,1.);\n}\n";

export function initFluid(
  canvas: HTMLCanvasElement,
  params: FluidParams,
  prefersReduced: boolean
): (() => void) | null {
  if (!canvas) return null;
  let gl: WebGL2RenderingContext;
  try {
    gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: false,
      powerPreference: "low-power"
    })!;
  } catch (e) {
    return null;
  }
  if (!gl) return null;

  function compile(type: number, src: string): WebGLShader {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error("Shader:", gl.getShaderInfoLog(sh));
      return null as unknown as WebGLShader;
    }
    return sh;
  }

  function link(vsSrc: string, fsSrc: string): WebGLProgram {
    const v = compile(gl.VERTEX_SHADER, vsSrc);
    const f = compile(gl.FRAGMENT_SHADER, fsSrc);
    if (!v || !f) return null as unknown as WebGLProgram;
    const p = gl.createProgram();
    gl.attachShader(p, v);
    gl.attachShader(p, f);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error("Link:", gl.getProgramInfoLog(p));
      return null as unknown as WebGLProgram;
    }
    return p;
  }

  const decayProg = link(FLUID_VS, DECAY_FS);
  const fluidProg = link(FLUID_VS, FLUID_FS);
  if (!decayProg || !fluidProg) return null;

  const dec = {
    prev: gl.getUniformLocation(decayProg, "u_prev"),
    mouse: gl.getUniformLocation(decayProg, "u_mouse"),
    velocity: gl.getUniformLocation(decayProg, "u_velocity"),
    brushRadius: gl.getUniformLocation(decayProg, "u_brushRadius"),
    brushStrength: gl.getUniformLocation(decayProg, "u_brushStrength"),
    decay: gl.getUniformLocation(decayProg, "u_decay")
  };
  const flu = {
    time: gl.getUniformLocation(fluidProg, "u_time"),
    resolution: gl.getUniformLocation(fluidProg, "u_resolution"),
    scale: gl.getUniformLocation(fluidProg, "u_scale"),
    offset: gl.getUniformLocation(fluidProg, "u_offset"),
    grain: gl.getUniformLocation(fluidProg, "u_grain"),
    flowmap: gl.getUniformLocation(fluidProg, "u_flowmap"),
    distortBoost: gl.getUniformLocation(fluidProg, "u_distortBoost"),
    swirlBoost: gl.getUniformLocation(fluidProg, "u_swirlBoost"),
    glowIntensity: gl.getUniformLocation(fluidProg, "u_glowIntensity"),
    glowColor1: gl.getUniformLocation(fluidProg, "u_glowColor1"),
    glowColor2: gl.getUniformLocation(fluidProg, "u_glowColor2"),
    glowColor3: gl.getUniformLocation(fluidProg, "u_glowColor3"),
    lightPos: gl.getUniformLocation(fluidProg, "u_lightPos"),
    lightCore: gl.getUniformLocation(fluidProg, "u_lightCore"),
    lightHalo: gl.getUniformLocation(fluidProg, "u_lightHalo"),
    vignette: gl.getUniformLocation(fluidProg, "u_vignette"),
    bloomThreshold: gl.getUniformLocation(fluidProg, "u_bloomThreshold"),
    bloomRange: gl.getUniformLocation(fluidProg, "u_bloomRange"),
    bloomStrength: gl.getUniformLocation(fluidProg, "u_bloomStrength"),
    c1: gl.getUniformLocation(fluidProg, "u_c1"),
    c2: gl.getUniformLocation(fluidProg, "u_c2"),
    c3: gl.getUniformLocation(fluidProg, "u_c3"),
    c4: gl.getUniformLocation(fluidProg, "u_c4"),
    c5: gl.getUniformLocation(fluidProg, "u_c5")
  };

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  function bindAttr(prog: WebGLProgram) {
    const loc = gl!.getAttribLocation(prog, "a_position");
    gl!.bindBuffer(gl!.ARRAY_BUFFER, buf);
    gl!.enableVertexAttribArray(loc);
    gl!.vertexAttribPointer(loc, 2, gl!.FLOAT, false, 0, 0);
  }

  function makeTarget(w: number, h: number, data: Uint8Array | null) {
    const tex = gl!.createTexture();
    gl!.bindTexture(gl!.TEXTURE_2D, tex);
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, w, h, 0, gl!.RGBA, gl!.UNSIGNED_BYTE, data);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
    const fbo = gl!.createFramebuffer();
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
    gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, tex, 0);
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
    return { fbo, tex };
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  let cw = Math.round(canvas.clientWidth * dpr);
  let ch = Math.round(canvas.clientHeight * dpr);
  canvas.width = cw;
  canvas.height = ch;
  const bw = Math.round(cw / 4);
  const bh = Math.round(ch / 4);
  const flowInit = new Uint8Array(bw * bh * 4);
  for (let i = 0; i < bw * bh; i++) {
    flowInit[4 * i] = 0;
    flowInit[4 * i + 1] = 128;
    flowInit[4 * i + 2] = 128;
    flowInit[4 * i + 3] = 255;
  }
  const targetA = makeTarget(bw, bh, flowInit);
  const targetB = makeTarget(bw, bh, flowInit);

  const touch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const uad = (navigator as { userAgentData?: { platform: string } }).userAgentData;
  const isWindows = uad
    ? uad.platform === "Windows"
    : navigator.userAgent.indexOf("Windows") !== -1;
  const useMouse = !touch && !isWindows;

  const mouse = { x: 0.5, y: 0.5, sx: 0.5, sy: 0.5, vx: 0, vy: 0, svx: 0, svy: 0 };
  function onMouse(e: MouseEvent) {
    const r = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) / r.width;
    mouse.y = 1 - (e.clientY - r.top) / r.height;
  }
  if (useMouse) window.addEventListener("mousemove", onMouse);

  let visible = true;
  const start = performance.now();
  let last = 0;
  const THROTTLE = 1000 / 30;
  let rafId = 0;
  let ping = false;

  /* Color transition endpoint — pinned to the RESUME masthead, not the page
     bottom: cyan -> orange finishes as the masthead's big letters reach
     center, then holds orange through the works finale. Falling back to the
     page bottom if the masthead is missing keeps resume-only/deep-link loads
     working. Re-measured on fonts.ready (big-type shifts layout) and resize. */
  let colorEnd = -1;
  function measureColorEnd() {
    const mast = document.querySelector<HTMLElement>("[data-masthead]");
    if (mast) {
      const rect = mast.getBoundingClientRect();
      colorEnd = rect.top + window.scrollY + rect.height / 2;
    } else {
      colorEnd = -1;
    }
  }
  measureColorEnd();
  if (document.fonts?.ready) document.fonts.ready.then(measureColorEnd);
  window.addEventListener("resize", measureColorEnd);

  function frame(now: number) {
    if (now - last < THROTTLE) return;
    last = now - ((now - last) % THROTTLE);

    const r = Math.min(window.devicePixelRatio || 1, 1.5);
    const w2 = Math.round(canvas.clientWidth * r);
    const h2 = Math.round(canvas.clientHeight * r);
    if (w2 !== cw || h2 !== ch) {
      cw = w2;
      ch = h2;
      canvas.width = cw;
      canvas.height = ch;
    }

    mouse.sx += (mouse.x - mouse.sx) * params.mouseSmoothing;
    mouse.sy += (mouse.y - mouse.sy) * params.mouseSmoothing;
    mouse.svx += ((mouse.x - mouse.sx) * 0.5 - mouse.svx) * params.mouseVelocity;
    mouse.svy += ((mouse.y - mouse.sy) * 0.5 - mouse.svy) * params.mouseVelocity;

    const src = ping ? targetA : targetB;
    const dst = ping ? targetB : targetA;
    ping = !ping;

    gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fbo);
    gl.viewport(0, 0, bw, bh);
    gl.useProgram(decayProg);
    bindAttr(decayProg);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, src.tex);
    gl.uniform1i(dec.prev, 0);
    gl.uniform2f(dec.mouse, mouse.sx, mouse.sy);
    gl.uniform2f(dec.velocity, mouse.svx, mouse.svy);
    gl.uniform1f(dec.brushRadius, params.mouseRadius);
    gl.uniform1f(dec.brushStrength, useMouse ? params.mouseStrength : 0);
    gl.uniform1f(dec.decay, params.decay);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, cw, ch);
    gl.useProgram(fluidProg);
    bindAttr(fluidProg);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, dst.tex);
    gl.uniform1i(flu.flowmap, 0);
    gl.uniform1f(flu.time, (performance.now() - start) * 0.001 * (params.speed / 100));
    gl.uniform2f(flu.resolution, cw, ch);
    gl.uniform1f(flu.scale, params.scale);
    gl.uniform2f(flu.offset, params.offsetX / 100, params.offsetY / 100);
    gl.uniform1f(flu.grain, params.grain);
    gl.uniform1f(flu.distortBoost, params.distortBoost);
    gl.uniform1f(flu.swirlBoost, params.swirlBoost);
    const transitionEnd =
      colorEnd > 0 ? colorEnd : Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const mix = Math.max(0, Math.min(1, window.scrollY / transitionEnd));
    const dim = 1 - mix * 0.5; /* tone down light/bloom toward the orange end */

    const lx =
      (params.lightX != null ? params.lightX : 0.89) +
      (mouse.sx - (params.lightX != null ? params.lightX : 0.89)) *
        (useMouse && params.lightFollow ? params.lightFollow : 0);
    const ly = params.lightY != null ? params.lightY : 0.46;
    gl.uniform2f(flu.lightPos, lx, ly);
    gl.uniform1f(flu.lightCore, touch ? 0 : (params.lightCore != null ? params.lightCore : 0.14) * dim);
    gl.uniform1f(flu.lightHalo, touch ? 0 : (params.lightHalo != null ? params.lightHalo : 0.2) * dim);
    gl.uniform1f(flu.vignette, params.vignette != null ? params.vignette : 0.38);
    gl.uniform1f(flu.bloomThreshold, params.bloomThreshold != null ? params.bloomThreshold : 0.61);
    gl.uniform1f(flu.bloomRange, params.bloomRange != null ? params.bloomRange : 0.18);
    gl.uniform1f(flu.bloomStrength, (params.bloomStrength != null ? params.bloomStrength : 0.4) * dim);
    gl.uniform1f(flu.glowIntensity, params.glowIntensity);

    const gA = params.glowColors || ["#ffffff"];
    const gB = params.glowColorsB || gA;
    const g1 = mixRgb(hexToRgb(gA[0] || "#ffffff"), hexToRgb(gB[0] || gB[gB.length - 1] || "#ffffff"), mix);
    const g2 = mixRgb(hexToRgb(gA[1] || gA[0] || "#ffffff"), hexToRgb(gB[1] || gB[0] || gB[gB.length - 1] || "#ffffff"), mix);
    const g3 = mixRgb(hexToRgb(gA[2] || gA[0] || "#ffffff"), hexToRgb(gB[2] || gB[0] || gB[gB.length - 1] || "#ffffff"), mix);
    gl.uniform3f(flu.glowColor1, g1[0], g1[1], g1[2]);
    gl.uniform3f(flu.glowColor2, g2[0], g2[1], g2[2]);
    gl.uniform3f(flu.glowColor3, g3[0], g3[1], g3[2]);

    const cols = params.colors || ["#000000", "#1A3870", "#204a7e", "#eed8aa", "#000000"];
    const colsB = params.colorsB || cols;
    const clocs = [flu.c1, flu.c2, flu.c3, flu.c4, flu.c5];
    for (let ci = 0; ci < 5; ci++) {
      const cA = hexToRgb(cols[ci] || cols[cols.length - 1] || "#000000");
      const cB = hexToRgb(colsB[ci] || colsB[cols.length - 1] || "#000000");
      const rgb = mixRgb(cA, cB, mix);
      gl.uniform3f(clocs[ci], rgb[0], rgb[1], rgb[2]);
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function loop(now: number) {
    rafId = requestAnimationFrame(loop);
    if (!visible) return;
    frame(now);
  }

  const io = new IntersectionObserver(
    function (entries) {
      visible = entries[0].isIntersecting;
    },
    { threshold: 0 }
  );
  io.observe(canvas);

  if (prefersReduced) {
    frame(performance.now() + 1);
  } else {
    rafId = requestAnimationFrame(loop);
  }

  return function destroy() {
    if (rafId) cancelAnimationFrame(rafId);
    if (useMouse) window.removeEventListener("mousemove", onMouse);
    window.removeEventListener("resize", measureColorEnd);
    if (io) io.disconnect();
    const lose = gl.getExtension("WEBGL_lose_context");
    if (lose) lose.loseContext();
  };
}
