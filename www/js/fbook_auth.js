var RSApi = "http://ride-supply-server.herokuapp.com/api"

window.fbAsyncInit = function() {
  FB.init({
    appId      : '320604994809057',
    cookie     : true,
    xfbml      : true,
    version    : 'v2.2'
  });
};

// Load the SDK asynchronously
(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function checkLoginState() {
  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });
}

FB.getLoginStatus(function(response) {
  if (response.status === 'connected') {
    console.log("yr token", response.authResponse.accessToken);
  }
});

// This is called with the results from from FB.getLoginStatus().
function statusChangeCallback(response) {
  if (response.status === 'connected') {
    findOrCreateUser(response.authResponse.userID);
  } 
  else if (response.status === 'not_authorized') {
   $('#status').innerHTML = 'Please log into this app.';
  } 
  else {
   $('#status').innerHTML = 'Please log into Facebook.';
  }
}

function findOrCreateUser(userID) {
  if (userExists(userID)) { login(); }
  else { createUser() }
};

function createUser(){
  FB.api("/me?fields=first_name,last_name,education{type,school{name}},work{employer{name}},birthday", 
  function(response) {
    Server.set('user', JSON.stringify(response), function(err, res){
      
    })
  });
};

function userExists(userID){
  Server.get('user', userID, function( err,res ){

  })
}

FB.logout(function(response) {
  // LOGGED OUT
});