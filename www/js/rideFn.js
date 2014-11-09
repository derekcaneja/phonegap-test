var rideFn = {

	init: function(){
		$(document).ready( function(){

			$('#addRideForm').on('submit', function(e){
				e.preventDefault();
				rideFn.addRide({
					// userId: app.currentUser.id,
					user_id: '10152985804163054',
					origin: $('input[name="origin"]').val(),
					destination: $('input[name="destination"]').val(),
					seats_available: parseInt($('input[name="seats_available"]').val()),
					pickup_location: $('input[name="pickup_location"]').val()
				});
  		});

  		$(".chosen-select[name='car_year']").chosen({
				width: "300px",
				no_results_text: "Oops, nothing found!"
			}); 

			$(".chosen-select[name='car_year']").on('chosen:hiding_dropdown', function(){
				rideFn.loadCarMakes($(this).val());
			})

			$('input#searchbox').on('keypress', function(e){
				if( e.which == 13 ){ rideFn.findRide(this.value); }
			})
		});
	},

	findRide: function(origin){
    Server.get('ride', {origin: origin}, function(err, rides) {
      Server.get('user', function(err, users) {
        var userData = {};

        for(var i = 0; i < users.length; i++) userData[users[i].id] = users[i];

        var posts = [];

        for(var i = 0; i < rides.length; i++) {
            posts.push({ user: userData[rides[i].user_id], ride: rides[i] })
        }

        var source   = $('#post-results').html();
        var template = Handlebars.compile(source);
        var html     = template({ posts: posts });

        $('.search-results').html(html);

				$('.post').mouseup(function(ev){
				    if($('sidebar').prop('open')){  _this.toggleSidebar();}
				    else{ $('body').velocity({translateX: $(window).width() *-1, scale3d: [1,1,1], rotateZ: 0,translateZ: 0}, { duration: 250 }, {easing: 'easeOut'});}
				}); 
			});
		});
	},

	addRide: function(ride){
		console.log(ride)
		Server.post('ride', ride, function(err,res){
			console.log('err',err)
			console.log('res',res)
			if (err){}
			else { rideFn.calculateDistance(res) }
		})
	},

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

			var car_id 
			Server.get('user', app.currentUser.id, function(err,res){
				console.log('res', res)
      	console.log('err', err)
      	if(err){}
      	else{
      		car_id = res.car_id
      	}
			}) 

			cost = calculateGasCost(miles, car_id)
			console.log('cost', cost)
			rideParams = {
				id: ride.id,
				cost: cost,
				time: time,
				origin_lat: origin_lat,
				origin_lng: origin_lng
			}
			console.log(rideParams)
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
			if( res["results"]["cars"]["estimated_total"]["amount"]){
				savings = res["results"]["cars"]["estimated_total"]["amount"]
			}
			else {
				savings = "There were no available cars for you anyway!"
			}
			console.log(savings)
			return savings
		})
		.error( function() { console.log('calculate savings y u no work')})
	},

	loadCarMakes: function(year){
		var carMakes = []
		var carMakeSelect = $('select[name="car_make"')
		$.ajax({ 
			url: 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D%22http%3A%2F%2Fwww.fueleconomy.gov%2Fws%2Frest%2Fvehicle%2Fmenu%2Fmake%3Fyear%3D'+ year +'%22&format=json&diagnostics=true&callback='
		})
		.success(function(res){
			results = res["query"]["results"]["menuItems"]["menuItem"]
			for(var i = 0; i < results.length; i++){
				carMakes.push(results[i]["text"])
			}
			$.each(carMakes, function(i) {   
				opt = carMakes[i]
	     	carMakeSelect
		    .append($("<option></option>")
		    .attr("value",opt)
		    .text(opt)); 
				});
			carMakeSelect.chosen({
				width: "300px",
				no_results_text: "Oops, nothing found!"
			});

			carMakeSelect.on('chosen:hiding_dropdown', function(){
				rideFn.loadCarModels(year, encodeURIComponent($(this).val()));
			}) 
		})
		.error(function(res){console.log('loadCarMakes u no workx')})
	},

	loadCarModels: function(year, make){
		var carModels = []
		var carModelSelect = $('select[name="car_models"')
		console.log(year)
		console.log(make)
		$.ajax({ 
			url: 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D%27http%3A%2F%2Fwww.fueleconomy.gov%2Fws%2Frest%2Fvehicle%2Fmenu%2Fmodel%3Fyear%3D'+year+'%27&make%3D'+make+'&format=json&diagnostics=true'
		})
		.success(function(res){
			results = res["query"]["results"]["menuItems"]
			console.log(results)
		// 	// ["results"]["menuItems"]["menuItem"]
		// 	// for(var i = 0; i < results.length; i++){
		// 	// 	carModels.push(results[i]["text"])
		// 	// }
		// 	// $.each(carModels, function(i) {   
		// 	// 	opt = carModels[i]
	 //  //    	carModelSelect
		//  //    .append($("<option></option>")
		//  //    .attr("value",opt)
		//  //    .text(opt)); 
		// 	// 	});
		// 	// carModelSelect.chosen({
		// 	// 	width: "300px",
		// 	// 	no_results_text: "Oops, nothing found!"
		// 	// });
		})
		.error(function(res){console.log('loadCarModelss u no work')})
	},

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
	}

}

rideFn.init();

