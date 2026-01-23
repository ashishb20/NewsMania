const mongoose = require('mongoose');

const newsCacheSchema = new mongoose.Schema({
    source: {
        type : String,
        required : true,
        unique : true
    },
    articles: [{
        title: String,
        link: String,
        pubDate: String,
        contentSnippet: String,
        categories: [String]
    }],
    lastUpdated: {
        type : Date,
        default : Date.now
    }
});

module.exports = mongoose.model('NewsCache', newsCacheSchema);