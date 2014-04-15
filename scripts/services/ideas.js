;(function(ng) {
    'use strict';

    ng.module('tp.services')
        .factory('TT', ['$resource', function($resource){
            return $resource('/portal/api/tt');
        }])
        .factory('Idea', ['$resource', function($resource){
            return $resource('/portal/api/ideas/:ideaId', {ideaId: '@id'});
        }])
        .factory('Comment', ['$resource', function($resource){
            return $resource('/portal/api/comment/:commentId');
        }])
        .factory('Like', ['$resource', function($resource){
            return $resource('/portal/api/like');
        }])
        .service('ideaFactory', ['$rootScope', 'Idea', function($rootScope, Idea){
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
                }
            };
        }])
        .service('commentFactory', ['$rootScope', 'Comment', function($rootScope, Comment){
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
                    Comment.remove({commentId: comment._id});
                }
            };
        }])
        .service('likeFactory', ['Like', function(Like){
            return {
                post: function(ideaId){
                    var like = new Like();
                    like.ideaId = ideaId;
                    like.$save();
                    return like;
                },
                delete: function(ideaId){
                    Like.remove({ideaId: ideaId});
                }
            };
        }]);

})(angular);