var Server = {};

Server.API = 'http://ride-supply-server.herokuapp.com/api';

Server.get = function(table, data, callback) {
	if(arguments.length == 3) {
		$.ajax({
			url  : Server.API + '/' + table,
			type : 'GET',
			data : data,
			success: function(data) {
				callback(null, data);
			},
			error: function(err) {
				calback(err);
			}
		});
	} else {
		$.ajax({
			url  : Server.API + '/' + table,
			type : 'GET',
			success: function(data) {
				callback(null, data);
			},
			error: function(err) {
				calback(err);
			}
		});
	}
}

Server.set = function(table, data, callback) {
	var method = (!data.id) ? 'POST' : 'PUT';

	$.ajax({
		url  : Server.API + '/' + table,
		type : method,
		data : data,
		success: function(data) {
			callback(null, data);
		},
		error: function(err) {
			calback(err);
		}
	});
}

Server.delete = function(table, data, callback) {
	$.ajax({
		url  : Server.API + '/' + table,
		type : 'DELETE',
		data : data,
		success: function(data) {
			callback(null, data);
		},
		error: function(err) {
			calback(err);
		}
	});
}