/* vi:set sw=2 ai sm: */
function discoverMicroformats() {
  var hcards      = [];
  var hcalendars  = [];
  var hreviews    = [];
  var hrecipes    = [];
  var geos        = [];
  console.log(microformats.getItems());
  microformats.getItems().items.forEach(function(a) {
    if (a.type == 'h-card') {
      hcards.push(a.properties);
    } else if (a.type == 'h-event') {
      hcalendars.push(a.properties);
    } else if (a.type == 'h-review') {
      hreviews.push(a.properties);
    } else if (a.type == 'h-recipe') {
      hrecipes.push(a.properties);
    } else if (a.type == 'h-geo') {
      hgeos.push(a.properties);
    }
  });
  var hreviewaggs = HReviewAggregate.discover();
  //var hrecipes    = HRecipe.discover();

  // convert objects into JSON so we can
  // pass the arrays to the background page
  for(i = 0; i < hcards.length; i++) {
    hcards[i] = JSON.stringify(hcards[i]);
  }
  for(i = 0; i < hcalendars.length; i++) {
    hcalendars[i] = JSON.stringify(hcalendars[i]);
  }
  for(i = 0; i < hreviews.length; i++) {
    var zz = JSON.stringify(hreviews[i]);
    hreviews[i] = zz;
  }
  for(i = 0; i < hreviewaggs.length; i++) {
    var yy = JSON.stringify(hreviewaggs[i]);
    hreviewaggs[i] = yy;
  }
  for(i = 0; i < hrecipes.length; i++) {
    hrecipes[i] = JSON.stringify(hrecipes[i]);
  }
  for(i = 0; i < geos.length; i++) {
    geos[i] = JSON.stringify(geos[i]);
  }

  chrome.extension.sendMessage({hcards: hcards, hcalendars: hcalendars, hreviews: hreviews, hreviewaggs: hreviewaggs, hrecipes: hrecipes, geos: geos});
}

discoverMicroformats();

