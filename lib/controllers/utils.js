'use strict'

exports.unique_elements = function(value, index, self) {
    return self.indexOf(value) === index;
}

exports.get_image_url = function(data) {
	return data.profile_image_url.replace("_normal", "");
}

exports.get_unique_retweeters = function(retweeters) {
	var unique = {};
    var i = 0;
    while(i < retweeters.length) {
        if(unique[retweeters[i].user_id]) {
            var cut = retweeters.splice(i, 1);
        } else {
            unique[retweeters[i].user_id] = true;
            i++;
        }
    }
    return retweeters;
}

exports.get_sorted_retweeters = function(retweeters) {
	retweeters.sort(function(user1, user2) {
        if(user1.followers_count < user2.followers_count)
            return -1;
        if(user1.followers_count > user2.followers_count)
            return 1;
        return 0;
    });
    return retweeters;
}
