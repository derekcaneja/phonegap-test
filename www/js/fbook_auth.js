
  function checkLoginState() {
    FB.getLoginStatus(function(res) {
      statusChangeCallback(res);
    });
  }

  // FB.getLoginStatus(function(res) {
  //   if (res.status === 'connected') {
  //     console.log("yr token", res.authResponse.accessToken);
  //   }
  // });

  // This is called with the results from from FB.getLoginStatus().
  function statusChangeCallback(res) {
    if (res.status === 'connected') {
      findOrCreateUser(res.authResponse.userID);
    } 
    else if (res.status === 'not_authorized') {
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
    
  };

  function selectPhoto(userID){
    var profilePics;
    
  };


  // FB.logout(function(res) {
  //   currentUser = nil
  //   window.location.href = "/login";
  // });
