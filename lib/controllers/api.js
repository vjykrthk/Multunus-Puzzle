'use strict';
var Twit = require('twit');
var utils = require('./utils');
var async = require('async');
var twitter = require('./twitter');
var database = require('./database');

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
    var tweeter_id = req.params.id;
    console.log("tweeter_id : ", tweeter_id);
    async.waterfall([
        function(cb) {
            database.get_tweeter_updatedtime(tweeter_id, cb)
        },
        function(updated_time, cb) {            
            var diff = utils.get_difference_in_minutes(updated_time); 
            async.waterfall([
                function(cb) {
                    twit.get('statuses/user_timeline', { user_id: tweeter_id, count: 10, include_rts: false, exclude_replies: true }, cb);    
                }
            ], 
            function(err, reply) {
                console.log("reply :", reply);
                var tweeter = { image: utils.get_image_url(reply[0].user) };
                if(diff > 15) {
                    console.log("api call");
                    var tweet_ids = twitter.get_tweet_ids(reply);
                    async.waterfall([
                        function(cb) {
                            api_call(tweeter_id, tweet_ids, cb);
                        }
                    ],
                    function(err, results) {
                      if(err) {
                        console.log("err :", err);
                      } else {
                        res.json({ tweeter: tweeter, retweeters: results });
                      }
                    });
                    
                } else {
                    console.log("database call");
                    async.waterfall([
                        function(cb) {
                            database_call(tweeter_id, cb);
                        }
                    ], function(err, results) {
                        if(err) {
                            console.log("err :", err);
                        } else {
                            res.json({ tweeter: tweeter, retweeters: results });
                        }
                    });
                }              
            });           
        }
        
    ], function(err, result) {

    });    
}

function api_call(tweeter_id, tweet_ids, callback) {
    async.concat(tweet_ids, function(tweet_id, cb) {
        twit.get('statuses/retweets/:id', { id: tweet_id, count:10 }, function(err, reply) {
                if(reply && reply !== null) {
                    cb(null, twitter.get_retweeters(reply));    
                } else {
                    cb(err);
                }                
            });
        }, 
        function(err, results) {
            if(err) {
                //Todo::retrive from database
            } else {
                var r = twitter.get_filtered_retweeters(results);
                async.parallel([
                    function() {
                        callback(null, results);                        
                    }, 
                    function() {
                        database.set_tweeter_updatedtime(tweeter_id);                            
                        database.insert_retweeters(tweeter_id, results);
                    }
                ]);
            }
    });
}

function database_call(tweeter_id, callback) {
    async.waterfall([
    function(cb) {
        database.get_retweeters(tweeter_id, cb)    
    }
    ], 
    function(err, result) {
        if(err) {
            console.log("databaseError : ", err);
        } else {
            callback(null, result);
        }
    });
}


