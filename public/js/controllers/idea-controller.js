;
(function(ng) {
    'use strict';

    ng.module('tp')
        .controller('mainController', ['$scope', '$rootScope', 'TT', 'ideaFactory', 'likeFactory',
            function($scope, $rootScope, TT, ideaFactory, likeFactory) {
                $scope.tt = TT.get();
                $scope.ideasList = ideaFactory.getAll();

                $scope.addIdea = function(){
                    if ($scope.ideaText && $rootScope.global.isAuthN) {
                        console.log('add Idea');
                        var idea = ideaFactory.post($scope.ideaText);
                        $scope.ideasList.push(idea);
                        $scope.ideaText='';
                    }
                };

                $scope.toggleLike = function(e, index){
                    var idea = $scope.ideasList[index],
                        ind;
                    if ($rootScope.global.isAuthN) {
                        ind = idea.likes.indexOf($rootScope.global.currentUser._id);
                        if (!~ind) {
                            likeFactory.post(idea._id);
                            idea.likes.push($rootScope.global.currentUser._id);
                        } else {
                            likeFactory.delete(idea._id);
                            idea.likes.splice(ind, 1);
                        }
                    }
                    e.stopPropagation();
                    e.preventDefault();
                };

                $scope.clearIdea = function(){
                    $scope.ideaText='';
                };
            }])
        .controller('commentsController',['$scope', '$rootScope', '$filter', 'commentFactory', 'likeFactory', '$routeParams',
            function($scope, $rootScope, $filter, commentFactory, likeFactory, $routeParams) {
                var ideaId = $routeParams.ideaId,
                    ideas = $filter('filter')($scope.$parent.ideasList, {_id: ideaId}),
                    idea;

                if (ideas.length) {
                    idea = ideas[0];
                    idea.comments = commentFactory.getAll(ideaId);
                    $scope.ideaWithComment = idea;
                }

                /* TODO delete comment*/
                $scope.removeComment = function(index){
                    var comment = $scope.ideaWithComment.comments[index];
                    if ($rootScope.global.isAuthN && (comment.author._id === $rootScope.global.currentUser._id)) {
                        commentFactory.remove(comment);
                        $scope.ideaWithComment.comments.splice(index, 1);
                    }
                };

                $scope.addComment = function(){
                    if ($scope.commentText && $rootScope.global.isAuthN) {
                        var comment = commentFactory.post($scope.ideaWithComment._id, $scope.commentText);
                        console.log(comment);
                        $scope.ideaWithComment.comments.push(comment);
                        $scope.commentText = '';
                    }
                };

                $scope.toggleLike = function(e){
                    var ind = $scope.ideaWithComment.likes.indexOf($rootScope.global.currentUser._id);
                    if ($rootScope.global.isAuthN){
                        if (!~ind) {
                            likeFactory.post($scope.ideaWithComment._id);
                            $scope.ideaWithComment.likes.push($rootScope.global.currentUser._id);
                        } else {
                            likeFactory.delete($scope.ideaWithComment._id);
                            $scope.ideaWithComment.likes.splice(ind, 1);
                        }
                    }
                    e.stopPropagation();
                    e.preventDefault();
                };

                $scope.closeComment = function(popupId){
                    $scope.commentText = '';
                    var popup_id = $('#' + popupId);
                    popup_id.hide("fast");
                }
            }]);
})(angular);