const r=document.querySelector("canvas"),e=r.getContext("webgl",{alpha:!1,antialias:!0}),N=`
precision highp float;
attribute vec2 point;
uniform vec3 grab;
uniform float strength;
uniform float aspect;
varying mediump vec2 uv;
varying mediump vec3 normal;
varying mediump float elevation;
float surface(vec2 p){
 vec2 q=(p-grab.xy)*vec2(aspect,1.);
 float r=length(q);
 float fold=exp(-pow(r/.47,4.))*strength;
 float tension=sin(q.x*8.+q.y*2.)*exp(-r*r/ .28)*strength*.045;
 float natural=sin(p.x*8.+p.y*2.)*.009+sin(p.y*11.-p.x*4.)*.005;
 return fold+tension+natural;
}
void main(){
 uv=point*.5+.5;
 float e=.002;
 float z=surface(point);
 float dx=(surface(point+vec2(e,0.))-surface(point-vec2(e,0.)))/(2.*e);
 float dy=(surface(point+vec2(0.,e))-surface(point-vec2(0.,e)))/(2.*e);
 normal=normalize(vec3(-dx,-dy,1.));
 elevation=z;
 vec2 p=point;
 vec2 delta=(point-grab.xy);
 p-=delta*exp(-dot(delta,delta)*9.)*strength*.10;
 float perspective=1./(1.-z*.38);
 gl_Position=vec4(vec2(p.x*.88,p.y*.82)*perspective,0.,1.);
}`,k=`
precision mediump float;
uniform sampler2D textile;
varying mediump vec2 uv;
varying mediump vec3 normal;
varying mediump float elevation;
void main(){
 vec3 n=normalize(normal);
 vec3 light=normalize(vec3(-.55,.65,1.));
 float diffuse=max(0.,dot(n,light));
 vec3 base=texture2D(textile,vec2(uv.x,1.-uv.y)*vec2(2.6,2.)).rgb;
 // Tiny alternating yarn ridges share the same surface lighting as the folds.
 float warp=sin(uv.x*1800.);
 float weft=sin(uv.y*1400.);
 float fibers=(warp+weft)*.008;
 vec3 color=base*(.52+.48*diffuse)+fibers;
 float sheen=pow(max(0.,dot(reflect(-light,n),vec3(0.,0.,1.))),24.)*.055;
 color+=sheen;
 float hem=smoothstep(0.,.006,min(min(uv.x,1.-uv.x),min(uv.y,1.-uv.y)));
 color*=mix(.88,1.,hem);
 gl_FragColor=vec4(color,1.);
}`;if(e){let d=0,x=!1;const _=(i,c)=>{const o=e.createShader(i);if(e.shaderSource(o,c),e.compileShader(o),!e.getShaderParameter(o,e.COMPILE_STATUS))throw new Error(e.getShaderInfoLog(o)||"Shader failed");return o};try{let i=function(){d=0,!(x||!I)&&(p+=(b-p)*.16,E+=(y-E)*.16,z.matches?(u=v,g=0):(g+=(v-u)*.045,g*=.79,u+=g),e.clearColor(.89,.88,.85,1),e.clear(e.COLOR_BUFFER_BIT),e.uniform3f(B,p,E,0),e.uniform1f(C,u),e.uniform1f(q,r.clientWidth/r.clientHeight),e.drawArrays(e.TRIANGLES,0,T.length/2),Math.abs(v-u)+Math.abs(g)+Math.abs(b-p)+Math.abs(y-E)>2e-4&&(d=requestAnimationFrame(i)))},c=function(){d||(d=requestAnimationFrame(i))};var G=i,O=c;const o=_(e.VERTEX_SHADER,N),S=_(e.FRAGMENT_SHADER,k),n=e.createProgram();if(e.attachShader(n,o),e.attachShader(n,S),e.linkProgram(n),!e.getProgramParameter(n,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(n)||"Link failed");e.useProgram(n);const T=[],m=110;for(let t=0;t<m;t++)for(let a=0;a<m;a++){const l=a/m*2-1,s=t/m*2-1,f=2/m;T.push(l,s,l+f,s,l,s+f,l,s+f,l+f,s,l+f,s+f)}const L=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,L),e.bufferData(e.ARRAY_BUFFER,new Float32Array(T),e.STATIC_DRAW);const P=e.getAttribLocation(n,"point");e.enableVertexAttribArray(P),e.vertexAttribPointer(P,2,e.FLOAT,!1,0,0);const B=e.getUniformLocation(n,"grab"),C=e.getUniformLocation(n,"strength"),q=e.getUniformLocation(n,"aspect"),U=e.createTexture();e.bindTexture(e.TEXTURE_2D,U),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.REPEAT);let I=!1,R=!1,p=0,E=0,b=0,y=0,u=0,g=0,v=0;const z=matchMedia("(prefers-reduced-motion: reduce)"),M=()=>{const t=Math.min(devicePixelRatio,1.5);r.width=Math.round(r.clientWidth*t),r.height=Math.round(r.clientHeight*t),e.viewport(0,0,r.width,r.height),c()},F=new ResizeObserver(M);F.observe(r);const A=new Image;A.onload=()=>{if(x)return;const t=document.createElement("canvas");t.width=t.height=512;const a=t.getContext("2d");a.fillStyle="#faf9f5",a.fillRect(0,0,512,512),a.drawImage(A,0,0,512,512),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,t),I=!0,r.dataset.renderer="webgl",M()},A.src="/images/cotton-weave.svg";const D=new AbortController,h={signal:D.signal},X=t=>{const a=r.getBoundingClientRect();b=Math.max(-.85,Math.min(.85,((t.clientX-a.left)/a.width*2-1)/.88)),y=Math.max(-.85,Math.min(.85,(1-(t.clientY-a.top)/a.height*2)/.82))};r.addEventListener("pointerdown",t=>{R=!0,r.setPointerCapture(t.pointerId),X(t),v=.17,c()},h),r.addEventListener("pointermove",t=>{R&&(X(t),c())},h);const w=()=>{R=!1,v=0,c()};r.addEventListener("pointerup",w,h),r.addEventListener("pointercancel",w,h),document.querySelector("#reset").addEventListener("click",w,h),document.addEventListener("astro:before-swap",()=>{x=!0,cancelAnimationFrame(d),F.disconnect(),D.abort(),e.deleteBuffer(L),e.deleteTexture(U),e.deleteProgram(n),e.deleteShader(o),e.deleteShader(S)},{once:!0})}catch(i){console.warn(i),document.querySelector(".fallback").hidden=!1}}else document.querySelector(".fallback").hidden=!1;
