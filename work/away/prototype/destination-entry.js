// Entrance runs once per screen visit; city selection keeps its existing motion.
function animateDestinationEntry(){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const root=document.querySelector('.destination-content');if(!root)return;
 destinationAnimations=destinationAnimations.filter(motion=>motion.playState!=='finished'&&motion.playState!=='idle');
 const groups=[{node:root.querySelector('h2'),delay:0},{node:root.querySelector('.destination-section-label'),delay:35},{node:root.querySelector('.search'),delay:65},...[...root.querySelectorAll('.selected-city-stop,.cities .city')].map((node,i)=>({node,delay:95+Math.min(i,5)*35}))];
 for(const {node,delay} of groups){if(!node)continue;const motion=node.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:320,delay,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'});destinationAnimations.push(motion);}
}
function revealDestinationPhotos(){
 for(const image of document.querySelectorAll('.destination-content .city-photo')){
  if(image.complete&&image.naturalWidth)continue;
  image.classList.add('city-photo-loading');
  image.decode().catch(()=>{}).finally(()=>image.classList.remove('city-photo-loading'));
 }
}
let tripEntranceAnimations=[];
function animateTripEntry(){
 tripEntranceAnimations.forEach(motion=>motion.cancel());tripEntranceAnimations=[];
 if(matchMedia('(prefers-reduced-motion: reduce)').matches||bookingView)return;
 const root=document.querySelector('.trip-city-list');if(!root)return;
 const items=[root.querySelector('.figma-trip-heading'),root.querySelector('.trip-visa'),...root.querySelectorAll('.trip-stop')].filter(Boolean);
 items.forEach((node,index)=>{
  const motion=node.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:380,delay:Math.min(index,5)*65,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'});
  tripEntranceAnimations.push(motion);
 });
}
