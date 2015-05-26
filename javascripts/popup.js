/* vi: set sw=2 ai sm: */
var bgPage = chrome.extension.getBackgroundPage();

// Set the body class to the user status (loggedin or loggedout)
function updateStatus(){
  if( bgPage.oauth.hasToken() ){
    $(document.body).removeClass('loggedout').addClass('loggedin');
  } else {
    $(document.body).removeClass('loggedin').addClass('loggedout');
  }
}

$(document).ready(function(){
  // Check the user status when the popup loads
  updateStatus();

  $('#logoutbutton').click(function(){
    bgPage.logout();
    updateStatus();
  });

  $('#loginbutton').click(function(){

    // Autherize via oauth
    bgPage.oauth.authorize(function(){
      updateStatus();
    });
  });
});

chrome.tabs.getSelected(null, function(tab) {
  // get the microformats from the current tab
  var hcards      = bgPage.hcards[tab.id];
  var hcalendars  = bgPage.hcalendars[tab.id];
  var hreviews    = bgPage.hreviews[tab.id];
  var hreviewaggs = bgPage.hreviewaggs[tab.id];
  var hrecipes    = bgPage.hrecipes[tab.id];
  var geos        = bgPage.geos[tab.id];

  // let's put these suckers on the page!
  $.each(hcards, function(i, hcard) {
    // What other data should we display?
    var html = $('<li class="hcard" id="hcard-'+i+'">'
                 + '<div class="details">'
                   + '<h1>'
                     + hcard.fn
                   + '</h1>'
                   + '<ul></ul>'
                   + '<div class="download">'
                     + '<a href="#" class="submithcard" title="Add to Google Contacts">'
                       + '<span class="webfont">c</span>'
                     + '</a>'
                     + '<a href="http://microformat-conversion.herokuapp.com/vcard?query='+ encodeURIComponent(JSON.stringify(hcard)) + '" title="Download" target="_blank" class="vcard">'
                       + '<span class="webfont">~</span>'
                     + '</a>'
                   + '</div>'
                 + '</div>'
               + '</li>');

    // fn is required so only output the vcard if it's "valid"
    if (hcard.fn) {

      // When the Google icon is clicked, the hcard will be added to Google Contacts
      $('.submithcard', html).click(function(){
        bgPage.Export.HCard.google(hcard, function(txt, response){
          if (response.status == 201) {
            $('.submithcard span', html).first().replaceWith('<span class="webfont">3</span>');
          } else {
            console.log('FAILED');
          }
        });
        return false;
      });

      $("#hcards").append(html);

      if (hcard.org) {
        $.each(hcard.org, function(index, org) {
          $('#hcard-'+i+' ul').append('<li>'+ org['organization-name'] +'</li>');
        });
      }

      if (hcard.role) {
        $.each(hcard.role, function(index, role) {
          $('#hcard-'+i+' ul').append('<li>'+ role +'</li>');
        });
      }

      if (hcard.nickname) {
        $('#hcard-'+i+' ul').append('<li>Nickname: '+ hcard.nickname[0] +'</li>');
      }

      if (hcard.email) {
        $.each(hcard.email, function(index, email) {
          $('#hcard-'+i+' ul').append('<li><a href="mailto:'+ email['value'] +'">'+ email['value'] +'</li>');
        });
      }

      if (hcard.url) {
        $.each(hcard.url, function(index, url) {
          $('#hcard-'+i+' ul').append('<li><a href="'+ url +'" target="_blank">'+ url + '</a></li>');
        });
      }

      if (hcard.tel) {
        $.each(hcard.tel, function(index, tel) {
          var type = tel.type ? tel.type.toString() + ': ' : '';
          $('#hcard-'+i+' ul').append('<li>'+ type + tel['value'] +'</li>');
        });
      }

      if (hcard.adr) {
        var street = hcard.adr[0]["street-address"] ? hcard.adr[0]["street-address"] : '';
        var locality = hcard.adr[0].locality ? hcard.adr[0].locality : '';
        var region = hcard.adr[0].region ? hcard.adr[0].region : '';
        var country = hcard.adr[0]["country-name"] ? hcard.adr[0]["country-name"] : '';
        var postalCode = hcard.adr[0]["postal-code"] ? hcard.adr[0]["postal-code"] : '';
        var mapString = [street, locality, region, country, postalCode];

        $('#hcard-'+i+' ul').append('<li>'+ street +'<br>'+ locality +', '+ region +' '+ country +' '+ postalCode +'<br><a href="http://maps.google.com/maps?q='+encodeURIComponent(mapString.join(" "))+'" target="_blank" title="View on Google Maps"><img src="http://maps.google.com/maps/api/staticmap?center='+encodeURIComponent(mapString.join(" "))+'&zoom=14&size=100x100&markers=color:green|label:A|'+mapString+'&sensor=false" class="static-map"></a></li>');
      }
          
      if (hcard.photo) {
        $.each(hcard.photo, function(index, url) {
          $('#hcard-'+i+' ul').append('<li><img src="'+hcard.photo[0]+'" class="photo"></li>');
        });
      }
    }
  });

  $.each(hcalendars, function(j, hcalendar) {
    var hcalHtml = $('<li class="hcalendar" id="hcal-'+j+'">'
                     + '<div class="details">'
                       + '<h1>'
                         + hcalendar.name
                       + '</h1>'
                       + '<ul>'
                         + '<li class="start">'+ $.fn.strftime($.fn.parseISO(hcalendar.start[0]), '%b %d, %Y at %i:%M%P') +'</li>'
                       + '</ul>'
                       + '<div class="download">'
                         + '<a href="#" class="submitvevent" title="Add to Google Contacts">'
                           + '<span class="webfont">c</span>'
                         + '</a>'
                         + '<a href="http://microformat-conversion.herokuapp.com/vevent?query='+ encodeURIComponent(JSON.stringify(hcalendar)) + '" title="Download to your computer" target="_blank" class="vevent">'
                           + '<span class="webfont">~</span>'
                         + '</a>'
                       + '</div>'
                     + '</div>'
                   + '</li>');

    $("#hcalendars").append(hcalHtml);

    // Handle submit to Google link
    $('.submitvevent', hcalHtml).click(function(){
      bgPage.Export.HCalendar.google(hcalendar, function(txt, response){
        if (response.status == 201) {
          $('.submitvevent span', hcalHtml).first().replaceWith('<span class="webfont">3</span>');
        } else {
          console.log('FAILED');
        }
      });
      return false;
    });

    if (hcalendar.end)
      $('#hcal-'+j+' ul .start').append(' — '+ $.fn.strftime($.fn.parseISO(hcalendar.end[0]), '%b %d, %Y at %i:%M%P'));

    if (hcalendar.location) {
      var location = hcalendar.location[0];
      //var street = location["street-address"][0] ? location["street-address"][0] : '';
      //var locality = location.locality ? location.locality : '';
      //var region = location.region ? location.region : '';
      //var country = location["country-name"] ? location["country-name"] : '';
      //var postalCode = location["postal-code"] ? location["postal-code"] : '';
      //var mapString = [street, locality, region, country, postalCode];
      var mapString;

      var venue = location;
      if (mapString) {
	venue = '<a href="http://maps.google.com/maps?q='+encodeURIComponent(mapString)+'" target="_blank" title="View on Google Maps">'+venue+'</a>';
      }
      $('#hcal-'+j+' ul').append('<li>' + venue + '</li>');
    }
  });

  $.each(hreviews, function(k, hreview) {
    var hreviewHTML = $('<li class="hreview" id="hreview-'+k+'"><div class="details"><h1>' + (hreview.item.fn || hreview.item.url || hreview.item.photo_url) + '</h1><ul></ul></div></li>');

    $("#hreviews").append(hreviewHTML);

    if (hreview.summary)
      $('#hreview-'+k+' ul').append('<li>' + hreview.summary + '</li>');

    if (hreview.description)
      $('#hreview-'+k+' ul').append('<li>'+ hreview.description +'</li>');

    if (hreview.dtreviewed)
      $('#hreview-'+k+' ul').append('<li><strong>Reviewed: </strong>'+ hreview.dtreviewed +'</li>');

    if (hreview.rating)
      $('#hreview-'+k+' ul').append('<li><strong>Rating: </strong>'+ hreview.rating +'</li>');
  });

  $.each(hreviewaggs, function(m, hreviewagg) {
    var hreviewaggHTML = $('<li class="hreviewagg" id="hreviewagg-'+m+'"><div class="details"><h1>' + (hreviewagg.count || hreviewagg.item.fn || hreviewagg.item.url || hreviewagg.item.photo_url) + '</h1><ul></ul></div></li>');

    $("#hreviewaggs").append(hreviewaggHTML);

    if (hreviewagg.summary)
      $('#hreviewagg-'+m+' ul').append('<li>'+ hreviewagg.summary +'</li>');

    if (hreviewagg.rating)
      $('#hreviewagg-'+m+' ul').append('<li><strong>Rating: </strong>'+ hreviewagg.rating +'</li>');

    if (hreviewagg.count)
      $('#hreviewagg-'+m+' ul').append('<li><strong>Count: </strong>' + hreviewagg.count + '</li>');

    if (hreviewagg.votes)
      $('#hreviewagg-'+m+' ul').append('<li><strong>Votes: </strong>'+ hreviewagg.votes +'</li>');
  });

  $.each(hrecipes, function(l, hrecipe) {
    var hrecipeHTML = $('<li class="hrecipe" id="hrecipe-'+l+'"><div class="details"><h1>'+ hrecipe.fn +'</h1><ul class="ingredients"><li><strong>Ingredients</strong></li></ul><ul class="other"></ul></div></li>');

    $("#hrecipes").append(hrecipeHTML);

    $.each(hrecipe.ingredient, function(m, ingredient) {
      $('#hrecipe-'+l+' .ingredients').append('<li>'+ ingredient +'</li>');
    });

    if (hrecipe.instructions)
      $('#hrecipe-'+l+' .other').append('<li><strong>Directions</strong></li><li>'+ hrecipe.instructions +'</li>');

    if (hrecipe.duration)
      $('#hrecipe-'+l+' .other').append('<li><strong>Total time: </strong>'+ hrecipe.duration[0] +'</li>');

    if (hrecipe.yield)
      $('#hrecipe-'+l+' .other').append('<li><strong>Yield: </strong>'+ hrecipe.yield +'</li>');

    if (hrecipe.author)
      $('#hrecipe-'+l+' .other').append('<li><strong>From: </strong>'+ hrecipe.author +'</li>');

  });

  $.each(unique_geos(geos), function(l, geo) {
    var geoHTML = $('<li class="geo" id="geo-'+l+'"><div class="details"><h1>'+ geo.latitude +', '+ geo.longitude +'</h1><ul></ul></div></li>');

    $("#geos").append(geoHTML);

    var mapString = [geo.latitude, geo.longitude];
    $('#geo-'+l+' ul').append('<li><a href="http://maps.google.com/maps?q='+encodeURIComponent(mapString)+'" target="_blank" title="View on Google Maps"><img src="http://maps.google.com/maps/api/staticmap?center='+encodeURIComponent(mapString.join(" "))+'&zoom=14&size=100x100&markers=color:green|label:A|'+mapString+'&sensor=false" class="static-map"></a></li>');
  });
});
