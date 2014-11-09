var Server = {};

Server.API = 'http://ride-supply-server.herokuapp.com/api';

Server.get = function(table, data, callback) {
	if(arguments.length == 3) {
		$.ajax({
			url  : Server.API + '/' + table,
			type : 'GET',
			data : data,
			success: function(response) {
				callback(null, response);
			},
			error: function(err) {
				callback(err);
			}
		});
	} else {
		callback = data;
		
		$.ajax({
			url  : Server.API + '/' + table,
			type : 'GET',
			success: function(response) {
				callback(null, response);
			},
			error: function(err) {
				callback(err);
			}
		});
	}
}

Server.post = function(table, data, callback) {
	$.ajax({
		url  : Server.API + '/' + table,
		type : 'POST',
		data : data,
		success: function(response) {
			callback(null, response);
		},
		error: function(err) {
			callback(err);
		}
	});
}

Server.put = function(table, data, callback) {
	$.ajax({
		url  : Server.API + '/' + table,
		type : 'PUT',
		data : data,
		success: function(response) {
			callback(null, response);
		},
		error: function(err) {
			callback(err);
		}
	});
}

Server.delete = function(table, data, callback) {
	$.ajax({
		url  : Server.API + '/' + table,
		type : 'DELETE',
		data : data,
		success: function(response) {
			callback(null, response);
		},
		error: function(err) {
			callback(err);
		}
	});
}