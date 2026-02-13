
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Parser = require('rss-parser');
const NewsCache = require('./models/NewsCache');

const app = express();
const parser = new Parser();

app.use(cors());
app.use(express.json());

// IN- Memory fallback 
let memoryCache = {};
let isMongoConnected = false;


mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('Connected to MongoDB');
    isMongoConnected = true;
})
.catch(err => {
    console.log('Could not connect to MongoDB, using in-memory cache instead.');
    console.log('To enable persistence, please install and run MongoDB');
    isMongoConnected = false ;
});

const FEED_URLS = {
    thehindu: 'https://www.thehindu.com/feeder/default.rss',
    toi:'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
    ht:'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml',
    ie:'https://indianexpress.com/feed/'
};

const CACHE_DURATION = 15 * 60 * 1000 ; // 15 minutes


const filterByHours = (articles, hours) => {
    const cuttoff = Date.now() - ( hours * 60 * 60 * 1000);
    return articles.filter(article => {
        const pubDate = new Date(article.pubDate).getTime();
        return !isNaN(pubDate) && pubDate > cuttoff ;
    });
};

app.get('/api/news', async (req, res)  => {
    const { source, hours } = req.query;
    
    if(!source || !FEED_URLS[source]) {
        return res.status(400).json({error: 'Invalid/ Missing Source parameter'});

    }
    
    try {
        let articles = null ;
        let lastUpdated = null ;
        
        if(isMongoConnected){
            const cacheData = await NewsCache.findOne({ source});
            if(cacheData){
                articles = cacheData.articles;
                lastUpdated = cacheData.lastUpdated;
            }
        } else {
            if(memoryCache[source]) {
                articles = memoryCache[source].articles;
                lastUpdated = memoryCache[source].lastUpdated;
            }
        }
        
        
        if(articles && lastUpdated && (Date.now() - new Date(lastUpdated).getTime() < CACHE_DURATION)) {
            console.log(`Serving ${source} from cache (${isMongoConnected ? 'MongoDB' : 'Memory'})`);
            const timeWindow = hours ? parseInt(hours) : 5 ;
            return res.json(filterByHours(articles, timeWindow));
        }
        
        // fetch Data
        console.log(`Fetching ${source} from RSS`);
        const feed = await parser.parseURL(FEED_URLS[source]);
        
        const newArticles = feed.items.map(item => ({
            title:item.title,
            link:item.link,
            pubDate: item.pubDate,
            contentSnippet: item.contentSnippet,
            categories: item.categories || []
        }));
        
        //  Update cache
        if(isMongoConnected){
            await NewsCache.findOneAndUpdate(
                {source},
                {articles: newArticles, lastUpdated: Date.now()},
                {upsert: true, new:true}
            );
        }else{
            memoryCache[source] = {
                articles:newArticles,
                lastUpdated:Date.now()
            };
        }
        
        //  time filter on data
        const timeWindow = hours ? parseInt(hours) : 5 ;
        res.json(filterByHours(newArticles, timeWindow));
        
    } catch (err) {
        console.error(`Error fetching ${source}:`, err);
        res.status(500).json({error: 'Failed to fetch news'});
    }
});



const path = require("path");

app.use(express.static(path.join(__dirname, "../client/dist")));

app.use((req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

const port = process.env.PORT || 5000;
app.listen(port, () =>  {
    console.log(`Server running on port ${port}`);
});
