/**
 * Created by aliaksandra_reut on 3/21/14.
 */
var authorNew = "4060741400005862684";

angular.module('serviceModule',['ngResource']).
    factory('serviceFactory', ['$resource', function($resource){
        return {
            get: function(){
                var toDB=$resource('/portal/api/ideas/', {
                    charge: {method: 'GET'}
                });
                return toDB.query();
            },
            post: function(ideaText){
                var toDB=$resource('/portal/api/ideas/');
                var idea = new toDB();
                idea.ideaText = ideaText;
                idea.author=authorNew;
                idea.$save();
                return idea;
            }
        };
    }])
    .factory('commentFactory', ['$resource', function($resource){
        return {
             get: function(ideaId){
                 var toDB = $resource('/portal/api/ideas/:ideaId',{ideaId:'@id'});
                 var idea = toDB.get({ideaId:ideaId});
                 return idea;
             },
             addComment: function(ideaId, commentText){
                 var toDB=$resource('/portal/api/comment/');
                 var idea = new toDB();
                 idea.commentText = commentText;
                 idea.idea=ideaId;
                 idea.author=authorNew;
                 idea.$save();
                 return idea;
             }
         };
    }]);


/*var User = $resource('/user/:userId', {userId:'@id'});
User.get({userId:123})
    .$promise.then(function(user) {
        $scope.user = user;
    });*/


appModule=angular.module('appModule',['serviceModule']);


appModule.config(['$routeProvider',function($routeProvider) {
    $routeProvider
        .when('/portal',{
            controller:'mainController'
        })
        .when('/portal/api/ideas/:ideaId',{
            controller: 'commentsController',
            templateUrl:'/portal/views/ideaPage.html'
        });
}]);

appModule.controller('mainController',['$scope', 'serviceFactory', function($scope, serviceFactory) {
    var scope=$scope;

    scope.ideasList = serviceFactory.get();
    console.log(scope.ideasList);

    scope.addIdea=function(){
        if(scope.ideaText){
            console.log('add Idea');
            var idea=serviceFactory.post(scope.ideaText);
            scope.ideasList.push(idea);
            scope.ideaText='';
        }
    };
    scope.clearIdea=function(){
        scope.ideaText='';
    };
 }]);


appModule.controller('commentsController',['$scope', 'commentFactory', '$routeParams', function($scope, commentFactory, $routeParams) {
    var scope=$scope;

    scope.ideaWithComment=commentFactory.get($routeParams.ideaId);

    scope.removeComment=function(commentToRemove){
        var comments=scope.ideaWithComment.comments;
        var index=comments.indexOf(commentToRemove);
        if (index > -1) {
            comments.splice(index, 1);
        }
    };

    scope.addComment=function(){
        if(scope.commentText){
            console.log($scope.ideaWithComment);
            var comment=commentFactory.addComment($scope.ideaWithComment._id, $scope.commentText);
            scope.ideaWithComment.comments.push(comment);
            scope.commentText='';
        }
    };

    scope.closeComment=function(popupId){
        scope.commentText='';
        var popup_id = $('#' + popupId);
        popup_id.hide("fast");
    }
}]);

