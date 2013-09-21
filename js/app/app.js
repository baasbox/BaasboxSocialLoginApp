window.app = angular.module("Todo",['ngCookies','ngResource']);
window.app.config(['$routeProvider','$locationProvider','$httpProvider', function($routeProvider,$locationProvider,$httpProvider) {
  						$routeProvider.when('/',{templateUrl:'js/app/views/index.html',controller:'MainCtrl'})
  						$routeProvider.when('/posts',{templateUrl:'js/app/views/posts.html',controller:'PostsCtrl'})
  						$routeProvider.when('/posts/new',{templateUrl:'/js/app/views/formPost.html',controller:'NewPostCtrl'})
  						              .otherwise({redirectTo:'/'})
  					    $locationProvider.html5Mode(false).hashPrefix('!')
  					    $httpProvider.defaults.useXDomain = true;
  					    $httpProvider.defaults.headers.common["X-BAASBOX-APPCODE"] = '1234567890'
  					    
  						          }]);

window.app.constant("serverUrl","http://omg.mfiandesio.com:9000");						
window.app.constant("baseServerUrl","http://omg.mfiandesio.com:9000\:9000");
window.app.constant("baseClientUrl","http://omg.mfiandesio.com:8000\:8000");
window.app.constant("facebookAppId","169698819712195");
window.app.constant("googleAppId","700672591072.apps.googleusercontent.com");





window.app.run(function ($rootScope,baseServerUrl,baseClientUrl,facebookAppId) {
    window.fbAsyncInit = function () {
        FB.init({
           appId: facebookAppId,
           channelUrl: baseClientUrl+'/channel.html',
           status     : false, // check login status
           cookie     : true, // enable cookies to allow the server to access the session
           redirectUri: baseServerUrl+'/social/facebook/callback?appcode=1234567890',
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



window.app.factory('posts',['$resource','baseServerUrl', function($resource,baseUrl){
		
		return {getClient:function(auth){
			var resource =  $resource(baseUrl+'/document/posts', {}, {
                
                query: {
                        method:'GET',
                        isArray:true,
                        headers:{'X-BB-SESSION':auth.getToken()},
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
                	headers:{'X-BB-SESSION':auth.getToken()}
                	
            	}
            });
         
 			return resource;
		}}

		
             
        
}]);

window.app.factory('auth',['$cookieStore',function($cookieStore){
        var authObject = {};
        
        


        authObject.isAuth = function (){

        	return $cookieStore.get('user')!=null;
                
                
        };

        authObject.clear = function(){
        	
        	$cookieStore.remove('user');
        	
        	
        }
        authObject.setUser = function(newUser,social,baasboxToken) {
                if(newUser==null){
                	console.log("use clear method");
                	return;
                }
                var user = newUser;
                console.log("setting user",user,"with social",social,"and token",baasboxToken)
                user.social = social;
                user.token = baasboxToken;
                $cookieStore.put('user', user)
               
        };
        authObject.getUser = function() {
        	if(authObject.isAuth()){
                return $cookieStore.get('user')
            }
        };
        authObject.getSocial = function() {
        	
            return authObject.getUser().social;
            
                
        };
        authObject.getToken = function() {
        	
                return authObject.getUser().token;
            
        };

        return authObject;
}]);

window.app.controller("MainCtrl",['$scope','$location','auth',function($scope,$location,auth){
	if(auth.isAuth()){
		$location.path("/posts");
	}
}]);
window.app.controller("PostsCtrl",['$scope','$http','auth','$location','posts',function($scope,$http,auth,$location,posts){
	if(!auth.isAuth()){
		$location.path("/")
	}
	
	$scope.posts = posts.getClient(auth).query({})

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
		if($scope.errors.length>0){
			return;
		}
		posts.getClient(auth).save($scope.post,function(d){
			$location.path("/posts");
		});
	}
}]);

window.app.controller("HeaderCtrl",['$scope','auth','$location','$http','baseServerUrl','serverUrl','googleAppId',function($scope,auth,$location,$http,baseServerUrl,serverUrl,googleAppId){
	$scope.$on("google_init",function(){
		$scope.gapi = gapi;
	})

	$scope.$on("user_login",function(){
		$location.path("/posts");
	})

	$scope.$on("facebook_init",function(){
		$scope.fb = FB;
		$scope.$on("fb_statusChange",function(e,r) {
			if (r.response.status === 'connected') {
      			var token = r.response.authResponse.accessToken;
      			$scope.logincb(token,'facebook');	
        	} else if (r.response.status === 'not_authorized') {
      			
    		} else if(r.reponse === null) {
      			
    		}
  		});
	});
	
	$scope.loggedIn = function(){
		return auth.isAuth();
	}

	$scope.username = function(){
			if(auth.isAuth()){
			 return auth.getUser()["name"]
			}else{
				return "";
			}
		}
	

	$scope.twitterlogin = function(){

		$http.post("http://omg.mfiandesio.com:9000/social/login/twitter").
			success(function(data){
				var url = data["data"].url;
				window.open(url)
			});
	}

	$scope.logincb = function(t,social){
		var token = t;
			$scope.$apply(function(){
			$http({
				method:'POST',
                url: serverUrl+"/social/loginWith/"+social+"?oauth_token="+token+"&oauth_secret="+token,
                data:{},
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(data){
            	auth.setUser(data["data"].user,{"sso":social,"auth_token":token,"auth_secret":token},data["data"]["X-BB-SESSION"]);
          		
          		$location.path("/posts")
          				
            }).error(function(data){
            	console.log(data);
            })
		});
	}

	$scope.googlelogin = function(){
		$scope.gapi.auth.authorize({"client_id":googleAppId,
								    "scope":["https://www.googleapis.com/auth/plus.login",
								    		 "https://www.googleapis.com/auth/plus.me","https://www.googleapis.com/auth/userinfo.email",
								    		 "https://www.googleapis.com/auth/userinfo.profile"]}, 
			function(t){
				$scope.logincb(t["access_token"],'google');
		})	
		
	}
	

	$scope.facebooklogin = function(){

		$scope.fb.login();
	}

	$scope.goTo = function(path){
		$location.path(path)
		
	}
	$scope.logout = function(){
		
		var token = auth.getToken();
		if(token){
		$http({
                url: serverUrl+'/logout',
                method: 'POST',
                data:{},
                headers: {
                    'Content-Type': 'application/json',
                    'X-BB-SESSION':token}
            }).success(function(){
            	auth.clear();
            	$location.path("/")
            }).error(function(data){
            	console.log(data);
            });
		}	
		
		try{
			var social = auth.getSocial(); 
			if(social.sso=='facebook'){
				$scope.fb.logout(function(response){
					console.log("facebook logged out")
				});
			}
		}catch(e){
			console.log(e)
		}
		
		
		
	}
	
}]);