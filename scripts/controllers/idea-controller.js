'use strict';
angular.module('tp')
    .controller('mainController', function($scope, $rootScope, TT, ideaFactory, likeFactory) {
            $scope.tt = ideaFactory.getTechTalk();
        console.log($scope.tt);
            $scope.ideasList = ideaFactory.getAll();
            $scope.openAddIdea=false;

            $scope.$on('createdTechTalk', function(e, data){
                $scope.tt = ideaFactory.getTechTalk();
                console.log($scope.tt);
                $scope.ideasList = ideaFactory.getAll();
            });
            $scope.addIdea = function(){
                console.log("A");
                console.log($scope.ideaText);
                console.log($rootScope.global.isAuthN);
                if ($scope.ideaText && $rootScope.global.isAuthN) {
                    console.log("B");
                    var idea = ideaFactory.post($scope.ideaText);
                    $scope.ideasList.push(idea);
                    $scope.ideaText='';
                    $scope.openAddIdea=false;
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
                $scope.openAddIdea=false;
            };
        })
    .controller('commentsController', function($scope, $rootScope, $filter, commentFactory, likeFactory, $routeParams, ideaFactory, userFactory) {
            var ideaId = $routeParams.ideaId,
                ideas = $filter('filter')($scope.$parent.ideasList, {_id: ideaId}),
                idea;

            if (ideas.length) {
                idea = ideas[0];
                idea.comments = commentFactory.getAll(ideaId);
                $scope.ideaWithComment = idea;
            }else{
                console.log($scope.$parent.tt);
                $scope.ideaWithComment = $scope.$parent.tt;
                /* var date=new Date($scope.$parent.tt.ttDate).toLocaleDateString();
                $scope.date = date;
                $scope.date=date.getDate()+"-"+date.getMonth()+"-"+date.getYear();
                $scope.time=date.getHours()+"."+date.getMinutes();
                console.log($scope.date+" - "+$scope.time+ date);*/
            }
            $scope.allUsers=userFactory.getAll();

            $scope.removeComment = function(index){
                var comment = $scope.ideaWithComment.comments[index];
                if ($rootScope.global.isAuthN && (comment.author._id === $rootScope.global.currentUser._id)) {
                    commentFactory.remove(comment);
                    $scope.ideaWithComment.comments.splice(index, 1);
                }
            };
            $scope.createTechTalk = false;
            $scope.submitTechTalk = function(){
                if( $rootScope.global.isAuthN && $rootScope.global.currentUser.role === 'admin' && $scope.ideaWithComment.ttDate){
                    console.log($scope.ideaWithComment);
                    ideaFactory.update(ideaId, 'techtalk', $scope.ideaWithComment);
                    $scope.$emit('createdTechTalk');
                    window.location.href = '#/';
                }

            };
            $scope.addComment = function(){
                if ($scope.commentText && $rootScope.global.isAuthN) {
                    var comment = commentFactory.post($scope.ideaWithComment._id, $scope.commentText);
                    $scope.ideaWithComment.comments.push(comment);
                    $scope.commentText = '';
                }
            };

            $scope.toggleLike = function(e){
                var ind = $scope.ideaWithComment.likes.indexOf($rootScope.global.currentUser._id);
                if ($rootScope.global.isuthN){
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
        })
    .filter('count', function(){
        return  function(array){
            if(typeof array === 'object'){
                return array.length;
            }
        }
    })
    .filter('countComments', function(){
        return  function(array){
            if(typeof array === 'object'){
                var length=array.length;
                if(length==1){
                    return length+"  Комментарий";
                }else if(length>1&&length<5){
                    return length+"  Комментария";
                }else{
                    return length+"  Комментариев";
                }
            }
        }
    });