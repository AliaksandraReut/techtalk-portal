var mg = require("mongoose"),
  Schema = mg.Schema,
  IdeaSchema = new Schema({
    author:         { type: String, ref: 'User' },
    ideaText:       { type: String },
    comments:	    [ { type: String, ref: 'Comment'} ],
    likes:          [ { type: String, ref: 'User'} ],
    created:        { type: Date, 'default': Date.now },
    updated:        { type: Date, 'default': Date.now },
    type:           { type: String, 'default': 'idea'},
    ttDate:         { type: Date},
    ttTime:         { type: Date},
    ttLocation:     { type: String},
    ttLectors:       { type: String, ref: 'User'}
  });

exports.Idea = mg.model('Idea', IdeaSchema);