var rideFn = {

	calculateDistance: function(ride){
		$.ajax({
			url: "https://maps.googleapis.com/maps/api/directions/json?key=AIzaSyAlqhvAcLGSUiGi0XMvNI36DdZzpfN78Xs",
			data: { origin: ride.origin, destination: ride.destination}
		})
		.success( function(res){

			miles = res["routes"]["legs"]["distance"]["text"]
			time = res["routes"]["legs"]["duration"]
			origin_lat = res["routes"]["legs"]["start_location"]["lat"]
			origin_lng = res["routes"]["legs"]["start_location"]["lng"]

			ride.car = {id: 26}

			cost = calculateGasCost(miles, ride.car.id)

			rideParams = {
				id: ride.id,
				cost: cost,
				time: time,
				origin_lat: origin_lat,
				origin_lng: origin_lng
			}

			updateRide(rideParams)
		})
		.error( function(){
			console.log('calc distance did not work')
		})
	},

	updateRide: function(rideParams){
		Server.set('ride', rideParams, function(err, res){
      console.log('res', res)
      console.log('err', err)
    })
	},

	calculateMPG: function(carId){
    $.ajax({ url: 'http://www.fueleconomy.gov/ws/rest/ympg/shared/ympgVehicle/' + carId })
    .success( function(res){
    	mpg = xmlToJson(res)["yourMpgVehicle"]["avgMpg"]["#text"]
    	return mpg
    })
    .error( function(){
    	console.log(' yu no work mpg?')
    })
	},

	calculateGasCost: function(miles, carId){
		mpg = calculateMPG(carId)
  	gallons = parseFloat(miles) / mpg 
  	price = parseInt(gallons * currentGasPrice())
  	return price
	},

	currentGasPrice: function(){
		$.ajax({url: 'http://www.fueleconomy.gov/ws/rest/fuelprices'})
		.success( function(res){
			return xmlToJson(res)["fuelPrices"]["regular"]
		})
		.error( function(){ console.log('gas price y u no work?')})
	},

	calculateSavings: function(ride){
		var d = new Date(ride.begin_date)
		d = d.setDate(d.getDate() + 2 )
	  var end_date = new Date(d)

		$.ajax({
			url: "http://api.sandbox.amadeus.com/v1.2/cars/search-circle?apikey=biyR76JCtDlFZsQ8hSFLnx4Ea4dEAYOt&radius=42&lang=EN&currency=USD&rate_class=ALL&rate_plan=DAILY",
			data: {
				pick_up: ride.begin_date,
				drop_off: end_date ,
				latitude: ride.origin_lat,
				longitude: ride.origin_lng
			}
		})
		.success( function(res){
			savings = res["results"]["cars"]["estimated_total"]["amount"]
			console.log(savings)
			return savings
		})
		.error( function() { console.log('calculate savings y u no work')})
	}

	// http://davidwalsh.name/convert-xml-json
  xmlToJson: function(xml) {
	
		// Create the return object
		var obj = {};

		if (xml.nodeType == 1) { // element
			// do attributes
			if (xml.attributes.length > 0) {
			obj["@attributes"] = {};
				for (var j = 0; j < xml.attributes.length; j++) {
					var attribute = xml.attributes.item(j);
					obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
				}
			}
		} else if (xml.nodeType == 3) { // text
			obj = xml.nodeValue;
		}

		// do children
		if (xml.hasChildNodes()) {
			for(var i = 0; i < xml.childNodes.length; i++) {
				var item = xml.childNodes.item(i);
				var nodeName = item.nodeName;
				if (typeof(obj[nodeName]) == "undefined") {
					obj[nodeName] = xmlToJson(item);
				} else {
					if (typeof(obj[nodeName].push) == "undefined") {
						var old = obj[nodeName];
						obj[nodeName] = [];
						obj[nodeName].push(old);
					}
					obj[nodeName].push(xmlToJson(item));
				}
			}
		}
		return obj;
	};

}


