let calendarMonth=null;
function localDate(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function parseDay(s){return new Date(s+'T12:00:00')}
function dateLabel(s){return s?parseDay(s).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):''}
function chevron(right=false){return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${right?'m9 18 6-6-6-6':'m15 18-6-6 6-6'}"/></svg>`}
function calendarPicker(){
 if(!calendarMonth){const d=state.start?parseDay(state.start):new Date();calendarMonth=new Date(d.getFullYear(),d.getMonth(),1)}
 const draftStart=state.start,draftEnd=state.end;
 const month=calendarMonth;const today=localDate(new Date());const first=(month.getDay()+6)%7;const last=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();const count=Math.ceil((first+last)/7)*7;
 const prevDisabled=month.getFullYear()===new Date().getFullYear()&&month.getMonth()===new Date().getMonth();
 let days='';for(let i=0;i<count;i++){
 const d=new Date(month.getFullYear(),month.getMonth(),i-first+1);const iso=localDate(d),outside=d.getMonth()!==month.getMonth(),past=iso<today,start=iso===draftStart,end=iso===draftEnd,inside=!!(draftStart&&draftEnd&&iso>draftStart&&iso<draftEnd);
 const range=(start||end||inside)&&!!draftEnd;
 days+=`<div class="calendar-cell ${range?'in-range':''} ${start?'range-start':''} ${end?'range-end':''}"><button class="calendar-day ${outside?'outside':''} ${start||end?'endpoint':''} ${iso===today?'today':''}" data-day="${iso}" ${past?'disabled':''} aria-label="${d.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}${start?', departure':''}${end?', return':''}" aria-pressed="${start||end}">${d.getDate()}</button></div>`;
 }
 return `<section class="calendar" aria-label="Choose travel dates"><div class="calendar-heading"><button data-month="-1" aria-label="Previous month" ${prevDisabled?'disabled':''}>${chevron()}</button><b aria-live="polite">${month.toLocaleDateString('en-GB',{month:'long',year:'numeric'})}</b><button data-month="1" aria-label="Next month">${chevron(true)}</button></div><div class="calendar-weekdays" aria-hidden="true">${['M','T','W','T','F','S','S'].map(d=>`<span>${d}</span>`).join('')}</div><div class="calendar-days">${days}</div></section>`;
}
function refreshCalendar(focusSelector){const scroll=document.querySelector('#app').scrollTop;render();document.querySelector('#app').scrollTop=scroll;document.querySelector(focusSelector)?.focus({preventScroll:true})}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.month){calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+Number(d.month),1);refreshCalendar(`[data-month="${d.month}"]`)}
 if(d.day){if(!state.start||state.end||d.day<state.start){state.start=d.day;state.end=''}else state.end=d.day;persist();refreshCalendar(`[data-day="${d.day}"]`)}
});
