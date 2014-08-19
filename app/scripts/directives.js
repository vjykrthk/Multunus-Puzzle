var app = angular.module('multunusPuzzleApp');

app.directive('tweetersList', function($log) {
    return {
        restrict: 'E',
        controller: function($scope, MPSrvc) {
           MPSrvc.getTweeters().then(function(tweeters) {
               $scope.tweeters = tweeters;
           });
           $log.log("tweetersList - directive");

        },
        templateUrl: "tweeters-template.html"
    }
});

app.directive('retweetersList', function($log) {
    return {
        restrict: 'E',
        controller: function($scope, $routeParams, MPSrvc) {
            MPSrvc.getRetweeters($routeParams.id).then(function(data) {
                $scope.tweeter = data.tweeter;
                $scope.retweeters = data.retweeters;
            });
        },
        link: function(scope, element, attrs) {
            scope.$watch(function() {
                if(scope.retweeters === undefined) {
                    return false;
                } else {
                    var telem = angular.element('.retweeters .tweeter');
                    var relems = angular.element('div.retweeter');
                    var increase = Math.PI * 2 / relems.length;
                    var x = 0, y = 0, angle = 3 * Math.PI / 2;
                    var radius = 250, coc = 100;
                    for (var i = 0; i < relems.length; i++) {
                        relem = relems[i];
                        x = radius * Math.cos(angle) + coc;
                        y = radius * Math.sin(angle) + coc;
                        angular.element(relem).css({'position' : 'absolute', 'left' : x+'px', 'top' : y+'px'});
                        $log.log("relem ", angular.element(relem).data('title'));
                        angular.element(relem).tooltip();
                        angle += increase;
                    }
                    telem.css({'position' : 'absolute', 'left': '33px', 'top' : '18px' });
                    return true;
                }
            });
        },
        templateUrl: "retweeters-template.html"
    }
});