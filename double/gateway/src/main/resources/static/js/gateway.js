var app=angular.module('gateway', [])

app.config(function($httpProvider) {

	$httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

})

app.controller('navigation',

function($http) {

	var self = this;
	self.test = function() {
		console.log ("working working !");
		self.template = "changes.html";
		$http.get('/resource/changes').then(function(response) {
			self.changes = response.data;
		});
	}

	var authenticate = function(credentials, callback) {

		var headers = credentials ? {
			authorization : "Basic "
					+ btoa(credentials.username + ":"
							+ credentials.password)
		} : {};

		self.user = ''
		$http.get('user', {
			headers : headers
		}).then(function(response) {
			var data = response.data;
			if (data.name) {
				self.authenticated = true;
				self.user = data;
				self.assignedRole = data.name.toUpperCase();
				console.log(data);
				computeDefaultTemplate(data);
				$http.get('/resource/').then(function(response) {
					self.greeting = response.data;
				})
			} else {
				self.authenticated = false;
			}
			self.error = null;
		}, function(response) {
			if (response.status === 0) {
				self.error = 'No connection. Verify application is running.';
			} else if (response.status == 401) {
				self.error = 'Unauthorized.';
			} else if (response.status == 403) {
				self.error = 'Forbidden.';
			} else {
				self.error = 'Unknown.';
			}
			self.authenticated = false;
		});

	}

	authenticate();

	self.credentials = {};
	self.login = function() {
		authenticate(self.credentials, function(authenticated) {
			self.authenticated = authenticated;
			self.error = !authenticated;
		})
	};

	self.logout = function() {
		$http.post('logout', {}).finally(function() {
			self.authenticated = false;
			self.admin = false;
		});
	}


/* admin app */

	var computeDefaultTemplate = function(user) {
		if(user && user.roles && (user.roles.indexOf("ROLE_READER")>-1))
			{
			console.log("admin");
			self.userRole = false;
			self.template = user && user.roles && user.roles.indexOf("ROLE_WRITER")>0 ? "write.html" : "read.html";
			}
		else
			{
			console.log("user");
			self.userRole = true;
			self.template = "read.html";
			}

	}

//	$http.get('user').then(function(response) {
//		var data = response.data;
//		if (data.name) {
//			self.authenticated = true;
//			self.user = data;
//			console.log(data);
//			computeDefaultTemplate(data);
//			$http.get('/resource/').then(function(response) {
//				self.greeting = response.data;
//			})
//		} else {
//			self.authenticated = false;
//		}
//		self.error = null;
//	}, function(response) {
//		if (response.status === 0) {
//			self.error = 'No connection. Verify application is running.';
//		} else if (response.status == 401) {
//			self.error = 'Unauthorized.';
//		} else if (response.status == 403) {
//			self.error = 'Forbidden.';
//		} else {
//			self.error = 'Unknown.';
//		}
//		self.authenticated = false;
//	});

	self.update = function() {
		$http.post('/resource/', {content: self.greeting.content}).then(function(response) {
			self.greeting = response.data;
		})
	}

	self.home = function() {
		computeDefaultTemplate(self.user);
	}



});
