'use strict';

var Twit = require('twit');
var utils = require('./utils');

var twit = new Twit({
    consumer_key: '0ENSUqUX6G4FZl1W0ag',
    consumer_secret: 'LADxtPszOxBb1EHBeEhmz1N2Bp7CcZCoArrH3IP8C4',
    access_token: '1171769616-8ZGGVg9voQZJ1Z0D4wP4aYT5AhKzS9iGpsIuzKg',
    access_token_secret: '0plpPJ78reQA0WQguSDNICGqyO7bAHCPiVUHNPfM7Ws'
});

var screen_names = ["@github", "@twitter", "@timoreilly", "@martinfowler", "@gvanrossum", "@BillGates", "@spolsky", "@firefox", "@dhh"];


exports.tweeters = function (req, res) {
    var tweeters = [];
    for (var i = 0; i < screen_names.length; i++) {
        twit.get('users/show', { screen_name: screen_names[i], count: 1}, function (err, reply) {
            if (reply && reply !== null) {
                var image = reply.profile_image_url.replace("_normal", "");
                var tweeter = { id: reply.id, image: image};
                tweeters.push(tweeter);
                console.log(tweeters);
                if (tweeters.length === screen_names.length) {
                    res.json(tweeters);
                }
            } else {
                console.log(err);
            }
        });
    }
};


exports.retweeters = function (req, res) {
    twit.get('statuses/user_timeline', { user_id: req.params.id, count: 10, include_rts: false, exclude_replies: true }, function (err, reply) {
        //console.log("reply : ", reply);
        var tweeter = { image: reply[0].user.profile_image_url.replace("_normal", "") }

        var tweet_ids = [];
        for (var i = 0; i < reply.length; i++) {
            tweet_ids.push(reply[i].id_str);
        }

        var retweeters = [];
        var count = 0;
        for (var j = 0; j < tweet_ids.length; j++) {
            twit.get('statuses/retweets/:id', { id: tweet_ids[j], count: 10  }, function (err, reply) {
                count += 1;
                if (reply && reply !== null) {
                    for (var m = 0; m < reply.length; m++) {
                        var retweeter = {};
                        retweeter.image = reply[m].user.profile_image_url.replace("_normal", "");
                        retweeter.followers_count = reply[m].user.followers_count;
                        retweeter.following_count = reply[m].user.friends_count;
                        retweeter.user_id = reply[m].user.id_str;
                        retweeters.push(retweeter);
                    }
                } else {
                    console.log(err);
                }

                if (count === tweet_ids.length) {
                    var unique = {};
                    var m = 0;
                    while(m < retweeters.length) {
                        if(unique[retweeters[m].user_id]) {
                            var cut = retweeters.splice(m, 1);
                        } else {
                            unique[retweeters[m].user_id] = true;
                            m++;
                        }
                    }
                    retweeters.sort(function(user1, user2) {
                        if(user1.followers_count < user2.followers_count)
                            return -1;
                        if(user1.followers_count > user2.followers_count)
                            return 1;
                        return 0;
                    });
                    retweeters.splice(10);
                    //console.log(retweeters.reverse());
                    res.json({tweeter: tweeter, retweeters: retweeters.reverse()});
                }
            });
        }

    });
}


