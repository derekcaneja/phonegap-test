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
var app = {
    // Application Constructor
    initialize: function() {
        this.currentUser = null;

        this.bindEvents();

        this.sidebarIcon = new Hammer($('#openSidebar')[0]);
        this.searchIcon  = new Hammer($('#openSearch')[0]);

        this.sidebarIcon.on('tap', this.toggleSidebar);
        this.searchIcon.on('tap', this.toggleSearch);

        $('.profile-select').on('click', this.setProfilePicture);

        $('header i').css('width', $('header').height());
        //$('.results').css('height', $(window).height() - $('header').height() - $('footer').height())
        $('.driver-image').css('height', $('.driver-image').width());

        $('.post').mouseup(function(ev){
            $('.app').velocity({translateX: $(window).width() *-1, scale3d: [1,1,1], rotateZ: 0,translateZ: 0}, { duration: 250 }, {easing: 'easeOut'});
             // setTimeout(function(){
             //        $('.app').attr('style', '');
             //    },250)
        }); 

        $('#backToMain').mouseup(function(ev){
            $('.app').velocity({translateX: 0, scale3d: [1,1,1], rotateZ: 0,translateZ: 0}, { duration: 300 }, {easing: 'easeOut'});
            setTimeout(function(){
                    $('.app').attr('style', '');
                },300)
        });

        Server.get('ride', function(err, rides) {
            Server.get('user', function(err, users) {
                var userData = {};

                for(var i = 0; i < users.length; i++) userData[users[i].id] = users[i];

                var posts = [];

                for(var i = 0; i < rides.length; i++) {
                    posts.push({ user: userData[rides[i].userID], ride: rides[i] })
                }

                var source   = $('#post-results').html();
                var template = Handlebars.compile(source);
                var html     = template({ posts: posts });

                console.log(posts)

                $('.results').html(html);
            });
        });
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
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
        
        if(!isOpen){
            $('#main').velocity({ translateX: sidebarWidth, scale3d: [1,1,1], rotateZ: 0, translateZ: 0}, { duration: 350 }, { easing: 'easeOut'});
        } else {
            $('#main').velocity({ translateX: 0, scale3d: [1, 1, 1], rotateZ: 0,translateZ: 0}, { duration: 350 }, { easing: 'easeOut' })
            
            setTimeout(function(){
                $('#main').attr('style', '');
            }, 400)
        }
        
        $('sidebar').prop('open', !isOpen);
    },

    toggleSearch: function(ev) {
        console.log('search')
    }
};

app.initialize();