var initializeAutocomplete = function() {
	var autocomplete;
  autocomplete0 = new google.maps.places.Autocomplete(
      (document.getElementsByName('origin')[0]),
      { types: ['(cities)'] });
  autocomplete1 = new google.maps.places.Autocomplete(
      (document.getElementsByName('destination')[0]),
      { types: ['(cities)'] });
  autocomplete2 = new google.maps.places.Autocomplete(
      (document.getElementsByName('pickup_location')[0]),
      { types: ['geocode'] });
}