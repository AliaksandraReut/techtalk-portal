/**
 * Created by Aliaksandra_Reut on 4/1/14.
 */
'use strict';

require('colors');

var express = require('express'),
    fs = require('fs'),
    app = express(),
    pmcApi = require('./pmc-api.js'),
    mg = require('mongoose'),
    async = require('async');

mg.connect('mongodb://localhost:27017/tt-portal-dev');

var User = require('./models/User.js').User;
var Idea= require('./models/Idea.js').Idea;
var Comment= require('./models/Comment.js').Comment;

var admins = ["4060741400005862684"]; // Nadzeya Shedava

//config
app
    .disable('x-powered-by')
    .engine('html', require('ejs').renderFile)

    .set('view engine', 'html')
    .set('port', process.env.PORT || 3000)
    .set('views', 'views')

    .use(express.favicon())
    .use(express.logger('tiny'))
    .use(express.static('public'))
    .use(express.query())
    .use(express.bodyParser())
    .use(express.methodOverride())
    .use(express.cookieParser())
    .use(express.session({secret: 'secret_realno'}))
    .use('/portal', app.router);

//stub routes
app.get('/views/:templateName', function(req, res) {
    console.log('view changed to: ' + req.params.templateName.green);
    res.render(req.params.templateName);
});

function checkAuth(req, res, next) {
    if (req.session && req.session.user) {
        next();
    }
    else {
        //TODO: 401 or 403 ??
        res
            .status(401)
            .send({code: "NOPERMISSION", error: "Session expired"});
    }
}

//Authentication
app.get('/auth', checkAuth, function(req, res){
    res.send('ok');
});

app.post('/auth', function(req, res) {
    var login = req.body.login,
        password = req.body.password;

    pmcApi.authentication(login, password, function(err, user) {
        if (err) {
            console.log(err);
            res.send({
                status: 'error',
                message: err.message || 'Not valid login or password',
                errorCode: err.code
            })
        }
        else {
            req.session.user = user;
            findUser(user.email, req.session, function(err, users){
                res.send({
                    status: 'success',
                    user: err ? null : users[0]
                });
            });
        }
    });
});

app.post('/logout', function(req, res) {
    console.log('logout');
    req.session.user = null;
    res.send({
        status: 'success'
    })
});

//User API
function findUser(name, session, callback) {
    if (!name || !session || !session.user) return;

    var regExp = { $regex: new RegExp(name, "i") },
        findCondition = (/[\@\_]/g.test(name)) ? { email: regExp } : { name: regExp };

    User.find(findCondition, function(err, users) {
        if (err || !users.length) {
            try {
                pmcApi.findUser(name, session.user.token, function(err, data) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        async.map(data, function(user, next) {
                            console.log(user.name);
                            async.parallel({
                                    image: function(callback) {
                                        fs.writeFile('./files/user-photo/' + user._id + '.gif', user.photo, 'base64', function() {
                                            //callback(null);
                                        });
                                        fs.writeFile('./public/img/user/' + user._id + '.gif', user.photo, 'base64', function() {
                                            callback(null);
                                        });
                                    },
                                    user: function(callback) {
                                        user.photo = 'img/user/' + user._id + '.gif';
                                        User.create(user, function(err, user) {
                                            callback(err, user);
                                        })
                                    }
                                },
                                function(err, results) {
                                    next(err, results.user);
                                });
                        }, callback)
                    }
                });
            }
            catch(e) {
                console.log('pmcApi exception', e);
                callback(e, null);
            }
        }
        else {
            callback(null, users);
        }
    });
}

/*app.get('/api/user/reset', checkAuth, function(req, res) {
 var dataUsers = JSON.parse(fs.readFileSync('./user.json', 'utf8'));
 try {
 User.remove({}, function() {
 var userArr = [];
 for (var ind in dataUsers.users){
 userArr.push(dataUsers.users[ind]);
 }
 async.map(userArr, function(user, callback){
 findUser(user.email[0], req.session, function(err, users) {
 callback(err, users[0]);
 });
 }, function(err, users){
 if (err) return res.send({ error: err });
 res.json(users);
 });
 });
 } catch (e) {
 res.send({ error: e })
 }
 });*/

app.get('/api/user/:name?', function(req, res) {
    var name = req.params.name;

    if (name) {
        checkAuth(req, res, function() {
            findUser(name, req.session, function(err, users) {
                res.json(err ? [] : users);
            });
        });
    }
    else {
        User.find(function(err, users) {
            if (err) res.json({status: 'error', error: err});
            else res.json(users);
        });
    }
});

/**
 * Techtalks
 */

/*app.get('/api/techtalk/reset', function(req, res) {
 var dataTalks = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
 TechTalk.remove(function() {
 async.map(dataTalks.talks, function(talk, callback){
 var testTalk = {
 title: talk.title,
 date: talk.date,
 location: talk.location,
 description: talk.description,
 level: talk.level,
 notes: talk.notes,
 tags: talk.tags
 };

 async.parallel({
 lectors: function(callback){
 async.map(talk.lector, function(lector, callback){
 User.find({email: { $regex: new RegExp(lector, "i") }}, function(err, users){
 if (users && users.length) {
 callback(err, users[0]._id);
 } else {
 console.log(testTalk);
 callback(err);
 }
 });
 }, function(err, lectors){
 callback(err, lectors);
 })
 },
 attendees: function(callback){
 async.map(talk.attendees, function(attendee, callback){
 User.find({email: { $regex: new RegExp(attendee, "i") }}, function(err, users){
 if (users && users.length) {
 callback(err, users[0]._id);
 } else {
 console.log(testTalk);
 callback(err);
 }
 });
 }, function(err, attendees){
 callback(err, attendees);
 })
 }
 }, function(err, result){
 testTalk.lectors = result.lectors;
 testTalk.attendees = result.attendees;
 callback(err, testTalk);
 })
 }, function(err, talks){
 TechTalk.create(talks, function(err, result) {
 if (err) return res.send({ error: err });
 res.json(result);
 });
 });
 });
 });*/

app.get('/api/techtalk', function(req, res) {
    console.log('get tt ===>'.blue);
    Idea
        .findOne({type: 'techtalk', ttDate: {$gte: new Date()}})
        .populate('author comments')
        .sort({ttDate: 1})
        .exec(function(err, results) {
            if (err) return res.send(err);
            Idea.populate(results, {path: 'comments.author', model: 'User'}, function(err, result){
                console.log('\t>> result ===>'.green, results);
                res.json(results);
            });
        });
});

//app.get('/api/techtalk/:id', function(req, res) {
//    var id = req.params.id;
//
//    TechTalk
//        .findOne(id)
//        .exec(function(err, result) {
//            if (err) return res.send(err);
//            console.log('\t>> result'.grey, result);
//            res.json(result);
//        });
//});

//app.post('/api/techtalk', checkAuth, function(req, res) {
//    console.log('/api/techtalk'.cyan, req.body);
//    TechTalk.create(req.body, function(err, result) {
//        if (err) return res.send(err);
//        console.log('\t>> result'.grey, result);
//        res.json(result);
//    });
//});

//app.put('/api/techtalk/:id', checkAuth, function(req, res) {
//    var updatedData = req.body;
//    delete updatedData._id;
//    updatedData.updated = new Date();
//
//    TechTalk.findOneAndUpdate({id: req.params.id}, { $set: updatedData }, function(err, result) {
//        if (err) return res.send(err);
//        //console.log('\t>> result'.grey, result);
//        res.json(result);
//    });
//});

//app.delete('/api/techtalk/:id', checkAuth, function(req, res) {
//    console.log('/api/techtalk/:id'.cyan, req.params.id);
//    TechTalk
//        .remove({id: req.params.id})
//        .exec(function(err) {
//            if (err) return res.send(err);
//            res.send('ok');
//        });
//});

/**
 * Tags
 */

/*app.get('/api/tag/reset', function(req, res) {
 var tags = [];
 Tag.remove({}, function() {
 for (var i = 0; i < data.tags.length; i++) {
 tags.push({_id: data.tags[i]});
 }
 Tag.create(tags, function(err, result) {
 if (err) return res.send(err);
 res.send(result);
 });
 });
 });*/

//app.get('/api/tag', function(req, res) {
//    Tag
//        .find({})
//        .exec(function(err, results) {
//            if (err) return res.send(err);
//            console.log('\t>> results'.grey, results);
//
//            var tags = [];
//            for (var i = 0; i < results.length; i++) {
//                tags.push(results[i]._id);
//            }
//            res.json(tags);
//        });
//});

//app.post('/api/tag', function(req, res) {
//    console.log('/api/tag'.cyan, req.body);
//    Tag.create({_id: req.body.tag}, function(err, result) {
//        if (err) return res.send(err);
//        console.log('\t>> result'.grey, result);
//        res.json(result);
//    });
//});

/**
 * News
 */

/*app.get('/api/news/reset', function(req, res) {
 News.remove({}, function() {
 res.send({});
 });
 });*/

//app.get('/api/news', function(req, res) {
//    console.log('/api/news?page=1&amount=5'.cyan, req.query);
//    var page = req.query.page,
//        countOnPage = req.query.amount || 5;
//
//    News
//        .find({})
//        .sort('-date')
//        .exec(function(err, results) {
//            if (err) return res.send(err);
//            console.log('\t>> result'.grey, results);
//            if (page) {
//                var from = (page - 1) * countOnPage,
//                    to = from + countOnPage;
//                res.json(results.slice(from, to));
//            } else {
//                res.json(results);
//            }
//        });
//});

//app.get('/api/news/:id', function(req, res) {
//    console.log('/api/news/:id'.cyan, req.params.id);
//    var id = req.params.id;
//
//    News
//        .findById(id)
//        .exec(function(err, result) {
//            if (err) return res.send(err);
//            console.log('\t>> result'.grey, result);
//            res.json(result);
//        });
//});

//app.post('/api/news', function(req, res) {
//    console.log('/api/news'.cyan, req.body);
//    News.create(req.body, function(err, result) {
//        if (err) return res.send(err);
//        console.log('\t>> results'.grey, result);
//        res.json(result);
//    });
//});

//app.put('/api/news/:id', function(req, res) {
//    console.log('/api/news'.cyan, req.params.id);
//    console.log('/api/news'.cyan, req.body);
//    var id = req.params.id;
//    var updatedData = {
//        title: req.body.title,
//        content: req.body.content,
//        updated: new Date()
//    };
//
//    News.findByIdAndUpdate(id, { $set: updatedData }, function(err, result) {
//        if (err) return res.send(err);
//        console.log('\t>> results'.grey, result);
//        res.json(result);
//    });
//});

//app.delete('/api/news/:id', function(req, res) {
//    console.log('delete news id '.cyan, req.params.id);
//    var id = req.params.id;
//
//    News.findByIdAndRemove(id, function(err) {
//        if (err) return res.send(err);
//        res.send('ok');
//    });
//});


//My posts
//app.get('/api/tt', function(req, res) {
//    console.log('/api/tt'.cyan);
//    var data = JSON.parse(fs.readFileSync('./techtalk.json', 'utf8'));
//    console.log('\t>> data'.blue, data);
////    res.json(data);
//});

app.get('/api/ideas', function(req, res) {
    console.log('/api/ideas'.cyan, req.query);

    Idea
        .find({type: 'idea'})
        .populate('author')
        .exec(function(err, results) {
            if (err) return res.send(err);
            console.log('\t>> result'.grey, results);
            res.json(results);
        });
});

app.get('/api/ideas/:id', function(req, res) {
    console.log('/api/ideas/:id'.cyan, req.params.id);
    var id = req.params.id;

    Idea
        .findOne({ _id: id })
        .populate('author')
        .exec(function(err, result) {
            if (err) return res.send(err);
            console.log('\t>> result'.green, result);
            res.json(result);
        });
});

app.put('/api/ideas/:id', checkAuth, function(req, res) {
    var updatedData = req.body;
    delete updatedData._id;

    Idea.findOneAndUpdate({_id: req.params.id}, { $set: updatedData }, function(err, result) {
        if (err) return res.send(err);
        console.log('\t>> result'.grey, result);
        res.json(result);
    });
});
app.post('/api/ideas', checkAuth, function(req, res) {
    console.log('/api/idea'.cyan, req.body);
    Idea.create(req.body, function(err, result) {
        if (err) return res.send(err);
        Idea.findOne({_id: result._id})
            .populate('author')
            .exec(function(err, result){
                if (err) return res.send(err);
                console.log('\t>> results'.grey, result);
                res.json(result);
            });
    });
});

app.get('/api/comment', function(req, res) {
    console.log('/api/comment?ideaId'.cyan, req.query.ideaId);
    var id = req.query.ideaId;

    Comment
        .find({ idea: id })
        .populate("author")
        .exec(function(err, result) {
            if (err) return res.send(err);
            console.log('\t>> result'.green, result);
            res.json(result);
        });
});

app.post('/api/comment', checkAuth, function(req, res){
    console.log('/api/comment'.cyan, req.body);
    var ideaId = req.body.idea;
    // Create comment
    Comment.create(req.body, function(err, newComment) {
        if (err) return res.send(err);

        Idea.findOne({_id: ideaId}, function(err, idea) {
            if (err) return res.send(err);
            idea.comments.push(newComment._id);
            console.log("*****"+idea);
            // Save changed idea
            idea.save(function(err) {
                if (err) return res.send(err);
                console.log('\t>> result'.red, newComment);
                Comment
                    .findOne({ _id: newComment._id })
                    .populate("author")
                    .exec(function(err, result) {
                        if (err) return res.send(err);
                        console.log('\t>> result'.green, result);
                        res.json(result);
                    });
            });
        });
    });
});

app.delete('/api/comment/:commentId', checkAuth, function(req, res){
    console.log('/api/comment/:commentId'.cyan, req.params.commentId);
    var commentId = req.params.commentId;

    // Find comment to get ideaId
    Comment.findOne({_id: commentId}, function(err, comment) {
        if (err) return res.send(err);
        // Find idea to delete commentId from array
        Idea.findOne({_id: comment.idea}, function(err, idea) {
            if (err) return res.send(err);
            var ind = idea.comments.indexOf(commentId);
            idea.comments.splice(ind, 1);
            // Save changed idea
            idea.save(function(err) {
                if (err) return res.send(err);
                // Remove comment
                Comment.remove({_id: commentId}, function(err) {
                    if (err) return res.send(err);
                    console.log('\t>> result'.grey, idea);
                    res.json(idea);
                });
            });
        });
    });
});
//
//app.post('/api/like', checkAuth, function(req, res){
//    console.log('/api/like'.cyan, req.body);
//    var ideaId = req.body.ideaId,
//        authorId = req.session.user._id;
//    Idea.findOne({_id: ideaId}, function(err, idea) {
//        if (err) return res.send(err);
//        idea.likes.push(authorId);
//        idea.save(function(err) {
//            if (err) return res.send(err);
//            console.log('\t>> result'.grey, idea);
//            res.json(idea);
//        });
//    });
//});
//
//app.delete('/api/like', checkAuth, function(req, res){
//    console.log('/api/like?ideaId'.cyan, req.query.ideaId);
//    var ideaId = req.query.ideaId,
//        authorId = req.session.user._id;
//    Idea.findOne({_id: ideaId}, function(err, idea) {
//        if (err) return res.send(err);
//        var ind = idea.likes.indexOf(authorId);
//        idea.likes.splice(ind, 1);
//        idea.save(function(err) {
//            if (err) return res.send(err);
//            console.log('\t>> result'.grey, idea);
//            res.json(idea);
//        });
//    });
//});

//handling routes on client
app.all('*', function(req, res) {
    res.render('index1');
});

//server starts here
app.listen(app.get('port'));
console.log(('start web-server on port ' + app.get('port')).green);