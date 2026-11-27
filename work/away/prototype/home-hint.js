// Guide clicks on the static homepage toward the prototype's starting action.
function positionHomeTapHint(){
 const hint=document.querySelector('.home-tap-hint'),button=document.querySelector('.home-create'),phone=document.querySelector('.phone');
 if(!hint||!button||!phone)return;
 const target=button.getBoundingClientRect(),frame=phone.getBoundingClientRect();
 if(target.bottom<frame.top||target.top>frame.bottom){hint.hidden=true;return;}
 hint.hidden=false;
 hint.style.left=(target.left-frame.left+target.width/2-132)+'px';
 hint.style.top=(target.bottom-frame.top+8)+'px';
}
document.addEventListener('click',event=>{
 const home=document.querySelector('.figma-home');
 if(!home||!home.contains(event.target)||event.target.closest('button,a,input,select,textarea,[role="button"]'))return;
 let hint=document.querySelector('.home-tap-hint');
 if(!hint){hint=document.createElement('div');hint.className='home-tap-hint';hint.setAttribute('role','status');hint.innerHTML='<svg viewBox="0 0 156 64" width="156" height="64" fill="none" aria-hidden="true"><path d="M12 27C58 46 119 40 132 3M121 11L132 3L138 17"/><path class="sketch-echo" d="M15 30C63 47 121 37 133 4"/></svg><span>Tap here</span>';document.querySelector('.phone').append(hint);}
 positionHomeTapHint();
});
document.addEventListener('scroll',positionHomeTapHint,true);
window.addEventListener('resize',positionHomeTapHint);
