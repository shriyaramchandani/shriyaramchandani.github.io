// Fixed reference states are opt-in and never overwrite the user's saved trip.
const empty = {cities:[],start:'',end:'',pace:'Balanced',activities:{},saved:false};
const route = {...empty,cities:['Paris','Interlaken','Amsterdam']};
const dated = {...route,start:'2026-11-26',end:'2026-12-04',title:'Europe 2026',planningIndex:0};
window.awayReferenceFixtures = {
  home: empty,
  cities: empty,
  route,
  dates: {...route,start:'2026-12-01',end:'2026-12-18'},
  planning: dated,
  trip: {...dated,saved:true,activities:{Paris:['Explore the Louvre','Visit the Musée d’Orsay','See the Eiffel Tower']}}
};

const bookingReference={...dated,saved:true,visa:'Yes',bookingReference:true,referenceHeight:800,expandedCity:'Paris',activities:{Paris:['Explore the Louvre','Visit the Musée d’Orsay','See the Eiffel Tower']},cityDates:{Paris:{start:'2026-11-26',end:'2026-11-29'},Interlaken:{start:'2026-11-29',end:'2026-12-01'}}};
Object.assign(window.awayReferenceFixtures,{
 'booking-start':bookingReference,
 'booking-add':bookingReference,
 'booking-confirmation':{...bookingReference,demoTicket:true},
 'booking-complete':{...bookingReference,referenceHeight:988,demoTicket:true,bookedActivities:['Explore the Louvre','Visit the Musée d’Orsay','See the Eiffel Tower']}
});
