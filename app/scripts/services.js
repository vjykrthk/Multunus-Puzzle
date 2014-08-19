var app = angular.module('multunusPuzzleApp');

app.factory('MPSrvc', function($http, $q) {
        return {
            getTweeters: getTweeters,
            getRetweeters: getRetweeters
        }

        function getTweeters() {
            var defferred = $q.defer();
            $http.get('/api/tweeters').success(function(tweeters) {
                defferred.resolve(tweeters)
            }).error(function(err) {
                defferred.reject(err);
            });

            return defferred.promise
        }

        function getRetweeters(id) {
            var defferred = $q.defer();
            $http.get('/api/retweeters/'+ id).success(function(tweeters) {
                defferred.resolve(tweeters)
            }).error(function(err){
                defferred.reject(err);
            });
            return defferred.promise
        }
});