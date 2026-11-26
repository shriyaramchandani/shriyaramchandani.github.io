const cityCoords={Paris:[2.3522,48.8566],Interlaken:[7.8632,46.6863],Rome:[12.4964,41.9028],Amsterdam:[4.9041,52.3676],Venice:[12.3155,45.4408],Barcelona:[2.1734,41.3851],Tokyo:[139.6917,35.6895],Bali:[115.1889,-8.4095],London:[-.1276,51.5072],Lisbon:[-9.1393,38.7223]};
function routeMap(){
 const selected=state.cities.filter(c=>cityCoords[c]);
 const merc=([lon,lat])=>[lon,-180/Math.PI*Math.log(Math.tan(Math.PI/4+Math.max(-80,Math.min(80,lat))*Math.PI/360))];
 const points=selected.map(c=>merc(cityCoords[c]));
 let bounds=points.length?points:[merc([-12,57]),merc([23,36])];
 let xs=bounds.map(p=>p[0]),ys=bounds.map(p=>p[1]);
 let cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2;
 let w=Math.max(12,Math.max(...xs)-Math.min(...xs)),h=Math.max(10,Math.max(...ys)-Math.min(...ys));
 const W=390,H=270,scale=Math.min(282/w,142/h,9);
 const project=p=>[W/2+(p[0]-cx)*scale,158+(p[1]-cy)*scale];
 const path=ring=>ring.map((p,i)=>{const [x,y]=project(merc(p));return `${i?'L':'M'}${x.toFixed(1)},${y.toFixed(1)}`}).join('')+'Z';
 const land=worldRings.map(r=>`<path d="${path(r)}"/>`).join('');
 const positions=points.map(project);
 const routes=positions.slice(1).map(([x,y],i)=>{const [a,b]=positions[i];const bend=Math.min(23,Math.hypot(x-a,y-b)*.12);return `<path class="route-line" d="M${a},${b} Q${(a+x)/2},${(b+y)/2-bend} ${x},${y}"/>`}).join('');
 const labels=selected.map((c,i)=>{let [x,y]=positions[i];let dy=-15;for(let j=0;j<i;j++){if(Math.abs(x-positions[j][0])<85&&Math.abs(y-positions[j][1])<38)dy=26;}const width=c.length*6.7+18;const lx=Math.max(width/2+6,Math.min(W-width/2-6,x));return `<g class="map-stop"><circle class="marker-halo" cx="${x}" cy="${y}" r="10"/><circle class="marker" cx="${x}" cy="${y}" r="5"/><rect x="${lx-width/2}" y="${y+dy-14}" width="${width}" height="22" rx="11"/><text x="${lx}" y="${y+dy+1}" text-anchor="middle">${c}</text></g>`}).join('');
 return `<div class="route-map" role="img" aria-label="${selected.length?'Selected route: '+selected.join(' to '):'Destination map. Select cities to build your route.'}"><svg viewBox="0 0 390 270" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="390" height="270" fill="#dce6e8"/><g class="map-land">${land}</g><g>${routes}</g>${labels}</svg><a class="map-credit" href="https://www.naturalearthdata.com/" target="_blank" rel="noopener">Natural Earth</a></div>`;
}
