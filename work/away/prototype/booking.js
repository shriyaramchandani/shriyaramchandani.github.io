// Add-to-plan flow. Uploaded files stay in this browser's IndexedDB.
const bookingParams = new URLSearchParams(location.search);
let bookingView = bookingParams.get('reference') === 'booking-add' ? 'add' : bookingParams.get('reference') === 'booking-confirmation' ? 'saved' : null;
let bookingQuery = '', bookingError = '', bookingBusy = false, bookingReturnFocus = null;
let bookingActiveTicketId=null;
const bookingPreviews = new Map();
let bookingVisualRevision=0;
async function markVisualReady(){
 if(!referenceFixture)return;
 const revision=++bookingVisualRevision;document.documentElement.dataset.visualReady='false';
 await document.fonts.ready;
 const phone=document.querySelector('.phone'),box=phone.getBoundingClientRect();
 const images=[...phone.querySelectorAll('img')].filter(i=>{const r=i.getBoundingClientRect();return r.width&&r.height&&r.top<box.bottom&&r.bottom>box.top&&r.left<box.right&&r.right>box.left});
 await Promise.all(images.map(i=>i.decode().catch(()=>{})));
 await Promise.all(phone.getAnimations({subtree:true}).filter(motion=>motion.effect?.getTiming().iterations!==Infinity).map(motion=>motion.finished.catch(()=>{})));
 requestAnimationFrame(()=>requestAnimationFrame(()=>{if(revision===bookingVisualRevision)document.documentElement.dataset.visualReady=images.every(i=>i.complete&&i.naturalWidth>0)?'true':'asset-error'}));
}
const bookingPlaces = [
  {label:'Visit Notre Dam Museum Tour',photo:'add-imgImage9.png',crop:'notre'},
  {label:'Visit Catacombs museums',photo:'add-imgImage10.png',crop:'catacombs'},
  {label:'Visit Arc the triomphe',photo:'add-imgImage11.png',crop:'arc'}
];
const bookingAsset = name => 'assets/booking/' + name;
function bookingCity(){return expandedTripCity || state.cities[0] || 'Paris'}
function bookingSuggestions(){const city=bookingCity();return city==='Paris'?bookingPlaces:(cityIdeas[city]||[]).map(label=>({label,photo:null,crop:'city'}))}
function bookingFixtureTicket(){return referenceFixture?.demoTicket ? {id:'reference-ticket',name:'Paris–Interlaken',demo:true,type:'image/png',city:'Paris',destination:'Interlaken'} : null}
function currentTicket(city){const tickets=[...(state.tickets||[]),...(bookingFixtureTicket()?[bookingFixtureTicket()]:[])];return city?tickets.filter(t=>t.city===city).at(-1):tickets.find(t=>t.id===bookingActiveTicketId)||tickets.at(-1)}
function tripSavedTicketRow(city,next){const ticket=currentTicket(city);return `<section class="trip-saved-ticket" aria-label="Saved transport ticket"><img src="${bookingAsset('saved-imgSwissMountainExpressIcon1.png')}" alt=""><div><h3>${city}${ticket?.destination?' <img src="assets/figma/transfer-arrow.svg" width="16" height="16" alt="to"> '+ticket.destination:''}</h3><button data-booking="view" data-ticket-id="${ticket.id}">View ticket</button></div></section>`}
function bookingFloatingButton(){const hint=!bookingView&&!state.addPlanNudgeSeen;return `${hint?'<button class="booking-nudge" data-booking="open" id="booking-nudge">Tap + to add tickets<br>or things to do</button>':''}<button class="booking-fab" data-booking="open" aria-label="Add to your plan" ${hint?'aria-describedby="booking-nudge"':''} aria-haspopup="dialog"><img src="${bookingAsset('add-imgFrame8.svg')}" alt=""></button>`}
function bookingPlaceCards(){
 const places=bookingSuggestions(),matching=places.filter(p=>p.label.toLowerCase().includes(bookingQuery.toLowerCase()));
 if(!matching.length)return '<p class="booking-empty" role="status">No places match your search.</p>';
 const city=bookingCity();
 return [0,1,2].map((_,row)=>`<section class="booking-place-section"><h3>Things to do in ${city.toLowerCase()}</h3><div class="booking-place-rail">${matching.map((p,i)=>{const selected=(state.activities?.[city]||[]).includes(p.label);return `<button class="booking-place" data-booking-place="${places.indexOf(p)}" aria-pressed="${selected}" aria-label="${selected?'Remove':'Add'} ${p.label} ${selected?'from':'to'} itinerary"><span class="booking-place-photo ${p.crop}"><img class="booking-place-image" src="${p.photo?bookingAsset(p.photo):cityCoverPhoto(city)}" alt=""><span class="booking-place-plus">${selected?'✓':`<img src="${bookingAsset('add-imgPlus.svg')}" alt="">`}</span></span><span>${p.label}</span></button>`}).join('')}</div></section>`).join('');
}
function ticketContents(ticket){
 if(ticket?.demo)return `<div class="booking-ticket-demo"><img class="booking-ticket-art" src="${bookingAsset('ticket-imgSwissMountainObservatoryTicket1.png')}" alt="Illustrated sample train ticket"><span class="ticket-origin">Paris-PXB</span><img class="ticket-arrow" src="${bookingAsset('ticket-imgVector25.svg')}" alt="to"><span class="ticket-destination">Interlaken-ISW</span><span class="ticket-time">7:30 PM</span></div>`;
 const url=ticket && bookingPreviews.get(ticket.id);
 if(!url)return '<p class="booking-file-loading" role="status">Loading your saved ticket…</p>';
 return ticket.type==='application/pdf'?`<iframe class="booking-pdf" title="Saved ticket PDF" src="${url}"></iframe>`:`<img class="booking-upload-preview" src="${url}" alt="Your saved ticket">`;
}
function renderBookingLayer(){
 const previousView=document.querySelector('#booking-layer')?.dataset.view;
 document.querySelector('#booking-layer')?.remove();
 const phone=document.querySelector('.phone');
 phone.classList.toggle('booking-ready-phone',screen==='trip'&&state.visa==='Yes');
 if(referenceFixture?.referenceHeight)phone.style.height=referenceFixture.referenceHeight+'px';
 if(screen!=='trip'){bookingView=null;return;}
 {
  const photo=document.querySelector('.trip-stop.is-open .trip-cover-photo');if(photo&&expandedTripCity==='Paris')photo.src=bookingAsset('base-imgImage1.png');
  for(const [label,asset] of [['Explore the Louvre','base-imgImage6.png'],['Visit the Musée d’Orsay','base-imgImage7.png'],['See the Eiffel Tower','base-imgImage8.png']]){
   for(const card of document.querySelectorAll('.itinerary-activity-card'))if(card.querySelector('span')?.textContent===label){card.querySelector('img').src=bookingAsset(asset);if(state.bookedActivities?.includes(label)){const link=card.querySelector('a');link.textContent='Booked';link.removeAttribute('href');link.classList.add('is-booked');}}
  }
 }
 const host=document.createElement('div');host.id='booking-layer';host.dataset.view=bookingView||'';
 const modal=Boolean(bookingView);
 if(modal&&previousView!==bookingView)host.classList.add('booking-entering');
 host.innerHTML=bookingFloatingButton()+(modal?`<div class="booking-backdrop" data-booking-backdrop><section class="booking-sheet ${bookingView==='saved'?'ticket-sheet':''}" role="dialog" aria-modal="true" aria-labelledby="booking-title"><h2 id="booking-title">${bookingView==='saved'?'Your ticket is saved!':'Add to your plan'}</h2><button class="booking-close" data-booking="close" aria-label="Close ${bookingView==='saved'?'ticket':'add to your plan'}"><img src="${bookingAsset('add-imgFrame.svg')}" alt=""></button>${bookingView==='saved'?`<div class="booking-ticket-container">${ticketContents(currentTicket())}</div><button class="booking-okay" data-booking="close">Okay</button>`:`<div class="booking-upload-card"><p>Made a<br>booking?</p><button class="booking-upload-button" data-booking="demo-upload"><img src="${bookingAsset('add-imgAwayAddWhite.svg')}" alt=""><span>Upload tickets</span></button></div><label class="booking-search"><img src="${bookingAsset('add-imgFrame9.svg')}" alt=""><input id="booking-search" placeholder="Search for places to visit" aria-label="Search for places to visit" value=""></label><div class="booking-place-sections">${bookingPlaceCards()}</div>`}<p class="booking-error" role="alert">${bookingError}</p><p class="sr-only" id="booking-announcement" aria-live="polite"></p></section></div>`:'');
 phone.append(host);
 document.querySelector('#app').inert=modal;
 if(modal){const input=host.querySelector('#booking-search');if(input)input.value=bookingQuery;if(previousView!==bookingView)queueMicrotask(()=>{const title=host.querySelector('#booking-title');title.tabIndex=-1;title.focus({preventScroll:true});});}
 const ticket=currentTicket();if(bookingView==='saved'&&ticket&&!ticket.demo&&!bookingPreviews.has(ticket.id))loadBookingFile(ticket);
 markVisualReady();
}
async function bookingDatabase(){return new Promise((resolve,reject)=>{const req=indexedDB.open('away-booking-files',1);req.onupgradeneeded=()=>req.result.createObjectStore('tickets');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function storeBookingFile(id,file){const db=await bookingDatabase();try{await new Promise((resolve,reject)=>{const tx=db.transaction('tickets','readwrite');tx.objectStore('tickets').put(file,id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}finally{db.close();}}
async function loadBookingFile(ticket){try{const db=await bookingDatabase();let file;try{file=await new Promise((resolve,reject)=>{const req=db.transaction('tickets').objectStore('tickets').get(ticket.id);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}finally{db.close();}if(!file)throw Error('Missing file');bookingPreviews.set(ticket.id,URL.createObjectURL(file));if(bookingView==='saved')renderBookingLayer();}catch{bookingError='This ticket file is unavailable in this browser. Please upload it again.';const node=document.querySelector('.booking-error');if(node)node.textContent=bookingError;}}
function closeBooking(){
 const saved=bookingView==='saved',ticket=saved?currentTicket():null;
 bookingView=null;bookingError='';bookingActiveTicketId=null;
 if(saved&&ticket){expandedTripCity=ticket.city;if(screen!=='trip')go('trip');else render();}else renderBookingLayer();
 document.querySelector('#app').inert=false;
 if(saved&&ticket){requestAnimationFrame(()=>{const view=[...document.querySelectorAll('[data-ticket-id]')].find(n=>n.dataset.ticketId===ticket.id);const section=view?.closest('.trip-saved-ticket');if(section){const app=document.querySelector('#app');app.scrollTo({top:app.scrollTop+section.getBoundingClientRect().top-app.getBoundingClientRect().top-32,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});view.focus({preventScroll:true});}})}else if(bookingReturnFocus?.isConnected)bookingReturnFocus.focus({preventScroll:true});else document.querySelector('.booking-fab')?.focus({preventScroll:true});
}

document.addEventListener('click',e=>{
 const action=e.target.closest('[data-booking]')?.dataset.booking;
 if(action==='demo-upload'){const city=bookingCity();state.tickets??=[];let ticket=state.tickets.find(t=>t.demo&&t.city===city);if(!ticket){ticket={id:crypto.randomUUID(),name:'Sample train ticket',type:'image/png',city,destination:state.cities[state.cities.indexOf(city)+1]||'Interlaken',demo:true,savedAt:new Date().toISOString()};state.tickets.push(ticket)}bookingActiveTicketId=ticket.id;bookingView='saved';bookingError='';persist();render();return;}
 if(action==='open'){state.addPlanNudgeSeen=true;persist();bookingReturnFocus=e.target.closest('button');bookingView='add';bookingQuery='';bookingError='';renderBookingLayer();}
 if(action==='close'||e.target.hasAttribute('data-booking-backdrop'))closeBooking();
 if(action==='view'){bookingReturnFocus=e.target.closest('button');bookingActiveTicketId=bookingReturnFocus.dataset.ticketId;bookingView='saved';bookingError='';renderBookingLayer();}
 const place=e.target.closest('[data-booking-place]');if(place){const city=bookingCity(),label=bookingSuggestions()[Number(place.dataset.bookingPlace)].label;state.activities??={};state.activities[city]??=[];const wasSelected=state.activities[city].includes(label);state.activities[city]=wasSelected?state.activities[city].filter(a=>a!==label):[...state.activities[city],label];persist();const scroll=document.querySelector('.booking-sheet').scrollTop;render();document.querySelector('.booking-sheet').scrollTop=scroll;document.querySelector(`[data-booking-place="${place.dataset.bookingPlace}"]`)?.focus({preventScroll:true});document.querySelector('#booking-announcement').textContent=label+(wasSelected?' removed from':' added to')+' your itinerary.';}
});
document.addEventListener('input',e=>{if(e.target.id==='booking-search'){bookingQuery=e.target.value;document.querySelector('.booking-place-sections').innerHTML=bookingPlaceCards();}});
document.addEventListener('keydown',e=>{
 if(!bookingView)return;
 if(e.key==='Escape'){e.preventDefault();closeBooking();return;}
 const upload=e.target.closest('.booking-upload-button');if(upload&&['Enter',' '].includes(e.key)){e.preventDefault();upload.click();return;}
 if(e.key==='Tab'){const nodes=[...document.querySelector('.booking-sheet').querySelectorAll('button,input:not([type=file]),[tabindex="0"],iframe')].filter(n=>!n.disabled&&n.getClientRects().length);const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}
});
document.addEventListener('change',async e=>{
 if(e.target.id!=='booking-file')return;const file=e.target.files?.[0];if(!file)return;
 if(!['image/png','image/jpeg','image/webp','application/pdf'].includes(file.type)||file.size>20*1024*1024){bookingError='Choose a PNG, JPEG, WebP or PDF ticket up to 20 MB.';document.querySelector('.booking-error').textContent=bookingError;return;}
 bookingBusy=true;bookingError='';renderBookingLayer();
 try{const id=crypto.randomUUID();await storeBookingFile(id,file);state.tickets??=[];const city=bookingCity();state.tickets.push({id,name:file.name,type:file.type,city,destination:state.cities[state.cities.indexOf(city)+1]||'',savedAt:new Date().toISOString()});bookingActiveTicketId=id;bookingPreviews.set(id,URL.createObjectURL(file));persist();bookingView='saved';bookingBusy=false;render();}
 catch{bookingBusy=false;bookingError='Could not save this ticket. Please try again.';renderBookingLayer();}
});
