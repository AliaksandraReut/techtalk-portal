'use strict';
angular.module('tp.services')
    .factory('TT', function($resource){
        return $resource('/portal/api/techtalk');
    })
    .factory('User', function($resource){
        return $resource('/portal/api/user');
    })
    .factory('Idea', function($resource){
        return $resource('/portal/api/ideas/:ideaId', {ideaId: '@id'}, {update: {method: "PUT"}});
    })
    .factory('Comment', function($resource){
        return $resource('/portal/api/comment/:commentId');
    })
    .factory('Like', function($resource){
        return $resource('/portal/api/like');
    })
    .service('ideaFactory', function($rootScope, Idea, TT){
        return {
            getAll: function(){
                return Idea.query();
            },
            get: function(ideaId){
                var idea = Idea.get({ideaId: ideaId});
                return idea;
            },
            post: function(ideaText){
                var idea = new Idea;
                idea.ideaText = ideaText;
                idea.author = $rootScope.global.currentUser._id;
                idea.$save();
                return idea;
            },
            update: function(ideaId, type, ideaWithComment){
                console.log('createTechTalk');

                var idea = Idea.update({
                    id: ideaId,
                    type: type,
                    ttDate: new Date(ideaWithComment.ttDate),
                    ttTime: ideaWithComment.ttTime,
                    ttLocation: ideaWithComment.ttLocation,
                    ttLector: ideaWithComment.ttLector._id
                });
                return idea;
            },
            getTechTalk: function(){
                return TT.get();
            }
        };
    })
    .service('commentFactory', function($rootScope, Comment){
        return {
            getAll: function(ideaId){
                return Comment.query({ideaId: ideaId});
            },
            post: function(ideaId, commentText){
                var comment = new Comment();
                comment.commentText = commentText;
                comment.idea = ideaId;
                comment.author = $rootScope.global.currentUser._id;
                comment.$save();
                return comment;
            },
            remove: function(comment){
                if(comment.author._id === $rootScope.global.currentUser._id){
                    Comment.remove({commentId: comment._id});
                }
            }
        };
    })
    .service('likeFactory', function(Like, $rootScope){
        return {
            post: function(ideaId){
                var like = new Like();
                like.ideaId = ideaId;
                like.userId = $rootScope.global.currentUser._id;
                like.$save();
                return like;
            },
            delete: function(ideaId){
                Like.remove({ideaId: ideaId, userId: $rootScope.global.currentUser._id});
            }
        };
    })
    .service('userFactory', function(User, $rootScope){
        return {
            getAll: function(){
                return User.query();
            }
        };
    });