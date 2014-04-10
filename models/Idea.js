var mg = require("mongoose"),
  Schema = mg.Schema,
  IdeaSchema = new Schema({
    author:      { type: String, ref: 'User' },
    ideaText:    { type: String },
	comments:	 [ { type: String, ref: 'Comment'} ],
    likes:       [ { type: String, ref: 'Like'} ],
    created:     { type: Date, 'default': Date.now },
    updated:     { type: Date, 'default': Date.now }
  });

exports.Idea = mg.model('Idea', IdeaSchema);