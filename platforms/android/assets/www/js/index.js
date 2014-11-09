/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// var test_key = 'sk_test_l3E5wNlS79TbLhsYbgwsq5uS';
// var test_pub = 'pk_test_Ep8sKQVZStEonPwes0Ven65h';

// Stripe.setPublishableKey(test_pub);

// Stripe.card.createToken({
//   number    : $('.card-number').val(),
//   cvc       : $('.card-cvc').val(),
//   exp_month : $('.card-expiry-month').val(),
//   exp_year  : $('.card-expiry-year').val()
// }, stripeResponseHandler);

function stripeResponseHandler(status, response) {
  var $form = $('#payment-form');

  if (response.error) {
    // Show the errors on the form
    $form.find('.payment-errors').text(response.error.message);
    $form.find('button').prop('disabled', false);
  } else {
    // response contains id and card, which contains additional card details
    var token = response.id;
    // Insert the token into the form so it gets submitted to the server
    $form.append($('<input type="hidden" name="stripeToken" />').val(token));
    // and submit
    $form.get(0).submit();
  }
}

var app = {
    // Application Constructor
    initialize: function() {
        var _this = this;

        this.bindEvents();
        this.currentUser = null;

        this.pages = {
            explore          : $('.explore'),
            my_rides         : $('.my-rides'),
            add_ride         : $('.add-ride'),
            account_settings : $('.account-settings')
        }

        this.setPage('explore');

        this.sidebarIcon = new Hammer($('#openSidebar')[0]);
        this.searchIcon  = new Hammer($('#openSearch')[0]);
        this.backIcon    = new Hammer($('#backToMain')[0]);

        $('header i').css('width', $('header').height());
        $('.results,.search').css('height', $(window).height() - $('.header').outerHeight() - $('.footer').outerHeight())
        $('.driver-image').css('height', $('.driver-image').width());

        Server.get('ride', function(err, rides) {
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

                $('.results').html(html);

                _this.bindEvents(); 
            });
        });
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        var _this = this;

        document.addEventListener('deviceready', this.onDeviceReady, false);

        this.sidebarIcon.on('tap', this.toggleSidebar);
        this.searchIcon.on('tap', this.toggleSearch);
        this.backIcon.on('tap', this.backToMain);

        $('.nav li').mouseup(function() {
            if($(this).data('page')) _this.setPage($(this).data('page'));
        });

        $('.profile-select').on('click', this.setProfilePicture);

        $('.post').mouseup(function(ev){
            if($('sidebar').prop('open')) _this.toggleSidebar();
            else $('body').velocity({translateX: $(window).width() *-1, scale3d: [1,1,1], rotateZ: 0,translateZ: 0}, { duration: 250 }, {easing: 'easeOut'});
        });

        $('#backToMain').mouseup(function(ev){
            $('.app').velocity({translateX: 0, scale3d: [1,1,1], rotateZ: 0,translateZ: 0}, { duration: 300 }, {easing: 'easeOut'});
            
            setTimeout(function(){
                $('.app').attr('style', '');
            },300)
        });
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');

        window.plugins.GCM.register(274273707076, 'GCM_Event', GCM_Success, GCM_Fail);
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        // var parentElement = document.getElementById(id);
        // var listeningElement = parentElement.querySelector('.listening');
        // var receivedElement = parentElement.querySelector('.received');

        // listeningElement.setAttribute('style', 'display:none;');
        // receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

    setPage: function(page) {
        $('.app-page').html(this.pages[page].html());
    },

    createUser: function() {
        FB.api('/me?fields=first_name,last_name,education{type,school{name}},work{employer{name}},birthday,gender', function(response) {
            var user = response;
        
            for(var i = 0; i < user.education.length; i++) {
                if(user.education[i].type == 'College')user.education = user.education[i]['school']['name'];
            }

            user.work = (user.work && user.work[0]) ? response.work[0]['employer']['name'] : null;
          
            Server.post('user', user, function(err) {
                if(err) console.log(err);
                else    {
                    app.setUser(user.id);
                    
                    console.log('User created!');
                }
            });
        });  
    },

    setUser: function(id) {
        var _this = this;

        Server.get('user', { id: id }, function(err, user) {
            if(err || !user) console.log('Could not log in!');

            _this.currentUser = user;

            $('.app').velocity({ opacity: 1 }, { 
                duration : 500,
                begin    : function() { $('.app').show()   },
                complete : function() { $('.login').hide() }
            });

            console.log('User logged in: ' + user.id)
        });
    },

    selectProfilePicture: function() {
        FB.api('/me/albums?fields=name', function(response){
            for (var i = 0; i < response.data.length; i++){
                if (response.data[i]['name'] == 'Profile Pictures'){
                    profilePics = res.data[i]['id'];
                    
                    FB.api('/'+ profilePics + '/photos?fields=images{source}', function(res){
                        var ul = document.getElementById('albums');

                        for( var i = 0; i < 5; i++ ) {
                            var li   = document.createElement('li')
                            var img = document.createElement('img')
                            
                            img.src = res.data[i]['images'][3]['source'];
                            img.setAttribute('class','profile-select');
                            
                            li.appendChild(img);
                            ul.appendChild(li);
                        }
                    
                    });

                    break;
                }
            }
        });
    },

    setProfilePicture: function(object) {
        Server.put('user', { id: app.currentUser.id, profile_picture: object.src }, function(err,res){
            console.log('err',err)
            console.log('res',res)
        });
    },

    toggleSidebar: function(ev){
        var isOpen       = $('sidebar').prop('open');
        var sidebarWidth = $('sidebar').width();
        
        $('.app').attr('style', '');

        if(!isOpen){
            $('#main').velocity({ translateX: sidebarWidth, scale3d: [1,1,1], rotateZ: 0, translateZ: 0}, { duration: 350 }, { easing: 'easeOut'});
            $('sidebar').prop('open', true);
        } else {
            $('#main').velocity({ translateX: 0, scale3d: [1, 1, 1], rotateZ: 0,translateZ: 0}, { duration: 350 }, { easing: 'easeOut' })
            console.log("CLOSE")
            setTimeout(function(){
                $('#main').attr('style', '');
            }, 350)
            $('sidebar').prop('open', false);
        }
    },

    toggleSearch: function(e) {
        $('body').toggleClass('search-active');
        $('.search').toggleClass('search-active');
        $('#openSearch').toggleClass('fa-search').toggleClass('fa-times');

    },
    backToMain: function(ev){
        $('body').velocity({translateX: 0, scale3d: [1,1,1], rotateZ: 0,translateZ: 0}, { duration: 300 }, {easing: 'easeOut'});
        setTimeout(function(){
                $('.app').attr('style', '');

            },300)
    }
};

function GCM_Event(e) {
    console.log(e)
        switch( e.event )
        {
            case 'registered':
                if ( e.regid.length > 0 )
                {
                    console.log("Regid " + e.regid);
                    alert('registration id = '+e.regid);
                }
            break;
 
            case 'message':
              // this is the actual push notification. its format depends on the data model from the push server
              alert('message = '+e.message+' msgcnt = '+e.msgcnt);
            break;
 
            case 'error':
              alert('GCM error = '+e.msg);
            break;
 
            default:
              alert('An unknown GCM event has occurred');
              break;
        }
    }

function GCM_Success(e) {
    console.log(e)
}

function GCM_Fail(e) {
    console.log('error ' + e)
}


app.initialize();