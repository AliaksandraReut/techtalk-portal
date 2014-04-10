var mg = require("mongoose"),
    Schema = mg.Schema,
    LikeSchema = new Schema({
        _id:          { type: String, unique: true},
        ideaId:      { type: String},
        userId:      { type: String},
        created:     { type: Date, 'default': Date.now },
        updated:     { type: Date, 'default': Date.now }
    }, {_id: false});

exports.Like = mg.model('Like', LikeSchema);