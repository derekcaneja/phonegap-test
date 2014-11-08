// $(document).ready( function(){


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
    FB.getLoginStatus(function(res) {
      statusChangeCallback(res);
    });
  }

  FB.getLoginStatus(function(res) {
    if (res.status === 'connected') {
      console.log("yr token", res.authResponse.accessToken);
    }
  });

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
    FB.api("/me?fields=first_name,last_name,education{type,school{name}},work{employer{name}},birthday, gender", 
    function(res) {
      user = {
        id: res.id,
        birthday: res.birthday || null,
        first_name: res.first_name || null,
        last_name: res.last_name || null,
        gender: res.gender || null,
        work: res.work[0]["employer"]["name"] || null,
        education: res.education[0]["school"]["name"] || null
      }
      console.log(user)
      Server.create('user', user, function(err, res){
        console.log('res', res)
        console.log('err', err)
      })
      selectPhoto(user.id);
    });
  };

  function selectPhoto(userID){
    var profilePics;
    FB.api("/me/albums?fields=name", function(res){
        for (var i = 0; i < res.data.length; i++){
          if (res.data[i]["name"] == "Profile Pictures"){
            profilePics = res.data[i]["id"]
            FB.api("/"+ profilePics + "/photos?fields=images{source}", function(res){
              var ul = document.getElementById('albums');
              for( var i = 0; i < 5; i++ ) {
                var li = document.createElement('li')
                var img = document.createElement('img')
                img.src = res.data[i]["images"][3]["source"];
                img.setAttribute('class','profile-select');
                li.appendChild(img);
                ul.appendChild(li);
              }
                $('.profile-select').on('click', function(){
                  photo = this.src
                  Server.set('user', {id: userID, profile_picture: photo}, function(err,res){
                    console.log('err',err)
                    console.log('res',res)
                  })
                })
            })
          return
        }
      }
    })
  };

  function login(id){
    currentUser = id 
    window.location.href = "/home";
  }

  function userExists(userID){
    return false
    // Server.get('user', {id: userID} , function( err,res ){

    // })
  }

  FB.logout(function(res) {
    currentUser = nil
    window.location.href = "/login";
  });

// })
