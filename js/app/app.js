window.app = angular.module("Todo",['ngCookies','ngResource']);
window.app.config(['$routeProvider','$locationProvider','$httpProvider', function($routeProvider,$locationProvider,$httpProvider) {
  						$routeProvider.when('/',{templateUrl:'js/app/views/index.html'})
  						$routeProvider.when('/posts',{templateUrl:'js/app/views/posts.html',controller:'PostsCtrl'})
  						$routeProvider.when('/posts/new',{templateUrl:'/js/app/views/formPost.html',controller:'NewPostCtrl'})
  						              .otherwise({redirectTo:'/'})
  					    $locationProvider.html5Mode(false).hashPrefix('!')
  					    $httpProvider.defaults.useXDomain = true;
  					    $httpProvider.defaults.headers.common["X-BAASBOX-APPCODE"] = '1234567890'

  						          }]);
						
window.app.constant("baseUrl","http://omg.mfiandesio.com:9000\:9000");





window.app.run(function ($rootScope,baseUrl) {
    window.fbAsyncInit = function () {
        FB.init({
           appId: '169698819712195',
           channelUrl: 'http://omg.mfiandesio.com:8000/channel.html',
           status     : false, // check login status
           cookie     : true, // enable cookies to allow the server to access the session
           redirectUri: baseUrl+'/social/facebook/callback?appcode=1234567890',
           xfbml:true
        });
        $rootScope.$broadcast("facebook_init");
        FB.Event.subscribe('auth.statusChange', function(response) {
            $rootScope.$broadcast("fb_statusChange", {'response': response});
        });
    };

        (function (d) {
        var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement('script');
        js.id = id;
        js.async = true;
        js.src = "//connect.facebook.net/en_US/all.js";
        ref.parentNode.insertBefore(js, ref);

        id = 'google-jssdk'
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement('script');

        js.onload = function(){
        	$rootScope.$broadcast("google_init");
        }
    	js.type = 'text/javascript'; js.async = true;
    	js.src = 'https://plus.google.com/js/client:plusone.js';
    
    	ref.parentNode.insertBefore(js, ref);
    }(document));
});

window.app.factory('posts',['$resource','auth','baseUrl', function($resource,auth,baseUrl){

        var Posts =  $resource(baseUrl+'/document/posts', {}, {
                query: {
                        method:'GET',
                        isArray:true,
                        headers:{'Content-Type':'application/json; charset=UTF-8','X-BB-SESSION':auth.getUser().token},
                        transformResponse: function (data, headersGetter) {
                        	var data =  JSON.parse(data)["data"];
                        	$(data).each(function(it){
                        		it.id = it["@rid"]
                        			
                        		
                        	});
                        	return data
                		}
                },
                save: {
                	method:'POST',
                	headers:{'Content-Type':'application/json; charset=UTF-8','X-BB-SESSION':auth.getUser().token},
                	
            	}
            });
                	
             
        return Posts;
}]);

window.app.factory('auth',['$cookieStore',function($cookieStore){
        var authObject = {};
        authObject.user = null;
        authObject.sso = null;
        authObject.baasboxToken = null;

        authObject.isAuth = function (){

        	    if (authObject.user == null) {
                        authObject.user = $cookieStore.get('user');
                }
                return (authObject.user != null);
        };
        authObject.setUser = function(newUser,social,baasboxToken) {
                authObject.user = newUser;
                if (authObject.user == null){ 
                	$cookieStore.remove('user');
                	
                }
                else {
                	
                	authObject.user.social = social;
                	authObject.user.token = baasboxToken;
                	console.log("setting user",authObject.user)
                	$cookieStore.put('user', authObject.user)
                	
                };
        };
        authObject.getUser = function() {
        	if(authObject.isAuth()){
                return authObject.user;
            }
        };
        authObject.getSso = function() {
                return authObject.user.social;
        };
        authObject.getBaasboxToken = function() {
                return authObject.user.baasboxToken;
        };
        return authObject;
}]);

window.app.controller("MainCtrl",['$scope',function($scope,$location){

}]);
window.app.controller("PostsCtrl",['$scope','$http','auth','$location','posts',function($scope,$http,auth,$location,posts){
	if(!auth.isAuth()){
		$location.path("/")
	}
	
	$scope.posts = 
		posts.query({})

	$scope.$watch($scope.posts,function(){
		console.log("hello",$scope.posts);
	})
	

	$scope.newPost = function(){
		$location.path("/posts/new")

	}
}]);

window.app.controller("NewPostCtrl",['$scope','$http','auth','$location','posts',function($scope,$http,auth,$location,posts){
	if(!auth.isAuth()){
		$location.path("/")
	}
	$scope.post = 
		 {
			'title':'',
			'content':''
		}
	$scope.errors = [];

	$scope.save = function(){
		$scope.errors = [];
		
		if($scope.post.title==''){
			$scope.errors.push('title can\'t be empty')
		}
		if($scope.post.content==''){
			$scope.errors.push('content can\'t be empty')
		}
		console.log($scope.errors)
		if($scope.errors.length>0){
			return;
		}
		posts.save($scope.post,function(d){
			$location.path("/posts");
		});
	}
}]);

window.app.controller("HeaderCtrl",['$scope','auth','$location','$http',function($scope,auth,$location,$http){
	$scope.$on("google_init",function(){
		$scope.gapi = gapi;


	})

	$scope.$on("facebook_init",function(){
		$scope.fb = FB;
		$scope.$on("fb_statusChange",function(e,r) {
			if (r.response.status === 'connected') {
      			var token = r.response.authResponse.accessToken;
      			$.ajax("http://omg.mfiandesio.com:9000/social/loginWith/facebook?oauth_token="+token+"&oauth_secret="+token,{
        			method:'POST',
        			dataType:'json',
        			success:function(data){
        				auth.setUser(data["data"].user,{"sso":"facebook","auth_token":token,"auth_secret":token},data["data"]["X-BB-SESSION"]);
          				$location.path('/posts')
          				$scope.$apply()
        			}
        	});
      
    		} else if (r.response.status === 'not_authorized') {
      			console.log(r.response)
    		} else if(r.reponse === null) {
      			console.log("logged out")
    		}
  		});
	});
	
	$scope.loggedIn = function(){
		return auth.isAuth();
	}

	$scope.username = function(){
		if($scope.loggedIn()){
			return auth.getUser()["name"]
		}
	}

	$scope.twitterlogin = function(){

		$http.post("http://omg.mfiandesio.com:9000/social/login/twitter").
			success(function(data){
				var url = data["data"].url;
				window.open(url)
			});
	}

	$scope.googlelogin = function(){
		$scope.gapi.auth.authorize({"client_id":"700672591072.apps.googleusercontent.com","scope":["https://www.googleapis.com/auth/plus.login","https://www.googleapis.com/auth/plus.me","https://www.googleapis.com/auth/userinfo.email","https://www.googleapis.com/auth/userinfo.profile"]}, function(t){
			var token = t["access_token"];
			$.ajax("http://omg.mfiandesio.com:9000/social/loginWith/google?oauth_token="+token+"&oauth_secret="+token,{
        			method:'POST',
        			dataType:'json',
        			success:function(data){
        				auth.setUser(data["data"].user,{"sso":"google","auth_token":token,"auth_secret":token},data["data"]["X-BB-SESSION"]);
          				$location.path('/posts')
          				$scope.$apply()
        			},
        			error:function(data){
        				console.log(data)
        			}
		})
	})
	}

	$scope.facebooklogin = function(){

		$scope.fb.login();
	}

	$scope.goTo = function(path){
		$location.path(path)
		
	}
	$scope.logout = function(){
		try{
			console.log(auth.getUser().social)
			if(auth.getUser().social.sso=='facebook'){
				$scope.fb.logout(function(response){
					console.log("logout succesful")
				});
			}
		}catch(e){
			alert(e)
		}
		auth.setUser(null);
		$location.path("/")

	}
	
}]);