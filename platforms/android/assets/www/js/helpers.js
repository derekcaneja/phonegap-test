Handlebars.registerHelper('post', function(user, ride) {
    var context  = { 
        user: user, 
        ride: ride 
    };

    var source   = $("#post-template").html();
    var template = Handlebars.compile(source);

    return new Handlebars.SafeString(template(context));
});

Handlebars.registerHelper('substring', function(string, start, length) {
    return new Handlebars.SafeString(string.substring(start, length));
});

Handlebars.registerHelper('capitalize', function(string, start, length) {
    return new Handlebars.SafeString(string.substring(start, length).toUpperCase() + string.substring(start + length));
});

Handlebars.registerHelper('age', function(birthday) {
    birthday = new Date(birthday);

    var ageDifMs = Date.now() - birthday.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    
    return new Handlebars.SafeString(Math.abs(ageDate.getUTCFullYear() - 1970));
});