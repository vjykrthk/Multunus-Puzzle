'use strict';
var Twit = require('twit');
var utils = require('./utils');
var async = require('async');
var twitter = require('./twitter');

var twit = new Twit({
    consumer_key: '0ENSUqUX6G4FZl1W0ag',
    consumer_secret: 'LADxtPszOxBb1EHBeEhmz1N2Bp7CcZCoArrH3IP8C4',
    access_token: '1171769616-8ZGGVg9voQZJ1Z0D4wP4aYT5AhKzS9iGpsIuzKg',
    access_token_secret: '0plpPJ78reQA0WQguSDNICGqyO7bAHCPiVUHNPfM7Ws'
});

var screen_names = ["@github", "@twitter", "@timoreilly", "@martinfowler", "@gvanrossum", "@BillGates", "@spolsky", "@firefox", "@dhh"];


exports.tweeters = function (req, res) {
    async.concat(screen_names, function(screen_name, cb) {
    twit.get('users/show', { screen_name: screen_name, count: 1}, function (err, reply) {
        if (reply && reply !== null) {
            cb(null, twitter.get_tweeter(reply));                 
        } else {            
            cb(err);            
        }
    }); 
    }, function(err, results) {
        if(err) {
            console.log("err : ", err);            
        } else {
            res.json(results);
        }
    });   
};


exports.retweeters = function (req, res) {
    twit.get('statuses/user_timeline', { user_id: req.params.id, count: 10, include_rts: false, exclude_replies: true }, function (err, reply) {
        var tweeter = { image: utils.get_image_url(reply[0].user) };

        var tweet_ids = twitter.get_tweet_ids(reply);        

        async.concat(tweet_ids, function(tweet_id, cb) {
            twit.get('statuses/retweets/:id', { id: tweet_id, count:10 }, function(err, reply) {
                if(reply && reply !== null) {
                    cb(null, twitter.get_retweeters(reply));    
                } else {
                    cb(err);
                }                
            });
        }, function(err, retweeters) {
            var unique_retweeters = utils.get_unique_retweeters(retweeters);
            var sorted_retweeters = utils.get_sorted_retweeters(unique_retweeters);
            sorted_retweeters.splice(10);
            res.json({tweeter: tweeter, retweeters: sorted_retweeters.reverse()});          
        });
      
    });
}


