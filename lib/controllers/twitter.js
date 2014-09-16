var utils = require('./utils');

exports.get_tweeter = function(data) {	
	return { id: data.id, image: utils.get_image_url(data)};
}

exports.get_tweet_ids = function(data) {
	var tweet_ids = [];
	for (var i = 0; i < data.length; i++) {
        tweet_ids.push(data[i].id_str);
    }
    return tweet_ids;
}

exports.get_retweeters = function(data) {
	var retweeters = [];
	for (var i = 0; i < data.length; i++) {
        retweeters.push(get_retweeter(data[i]));       
    }
    return retweeters;
}

exports.get_filtered_retweeters = function(retweeters) {
	var unique_retweeters = utils.get_unique_retweeters(retweeters);
    var sorted_retweeters = utils.get_sorted_retweeters(unique_retweeters);
    sorted_retweeters.splice(10);
    return sorted_retweeters.reverse();
}

function get_retweeter(data) {
	var retweeter = {};
	retweeter.image = utils.get_image_url(data.user);
	retweeter.followers_count = data.user.followers_count;
	retweeter.following_count = data.user.friends_count;
    retweeter.user_id = data.user.id_str;
    return retweeter;
}