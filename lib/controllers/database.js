var pg = require('pg');
var async = require('async');
var utils = require('./utils');
var conString = "postgres://postgres:123456@localhost/multunus_puzzle";
exports.insert_into_db = function() {	
	var client = new pg.Client(conString);

	async.waterfall([
		function(cb) {
			client.connect(cb);
		},
		function(result, cb) {
			client.query('SELECT NOW() AS "theTime"', cb);
		}
	], function(err, result) {
			client.end();
			if(err) {
		      return console.error('error running query', err);
		    } else {
		    	console.log(result.rows[0].theTime);
		    }
	});
}

exports.insert_retweeters = function(tweeter_id, retweeters) {
	var client = new pg.Client(conString);
	async.waterfall([ function(cb) {
		client.connect(cb);
	}, 
	function(result, cb) {
		client.query("DELETE FROM multunus_retweeters WHERE tweeter_id = $1", [tweeter_id], cb);
	},
	function(result, cb) {
		var q = "INSERT INTO multunus_retweeters"; 
			q += " (tweeter_id, followers_count, following_count, image, user_id)";
			q += " VALUES ( $1, $2, $3, $4, $5)";
			async.eachSeries(retweeters, function(retweeter, callback) {								
				client.query(q, utils.get_insertable_array(tweeter_id, retweeter), callback);
			}, cb);
	}
	], function(err, result) {		
		client.end();
		if(err) {
		    return console.error('error running query', err);
		} else {
			//console.log(result.rows[0].theTime);
		}
	});
}

exports.get_retweeters = function(tweeter_id, callback) {
	var client = new pg.Client(conString);
	async.waterfall([ function(cb) {
		client.connect(cb);
	}, function(result, cb) {											
			client.query("SELECT * FROM multunus_retweeters where tweeter_id = $1  ORDER BY followers_count DESC", [tweeter_id], cb);			
	}
	], function(err, result) {		
		client.end();
		if(err) {
		    return console.error('error running query', err);
		} else {
			callback(null, result.rows)
			//return result.rows;
		}
	});	
}

exports.get_tweeter_updatedtime = function(tweeter_id, callback) {
	var client = new pg.Client(conString);
	async.waterfall([
		function(cb) {
			client.connect(cb);
		},
		function(result, cb) {
			client.query("SELECT updated_at FROM multunus_tweeter where tweeter_id = $1", [tweeter_id], cb);
		}
	], function(err, result) {
			if(err) {
				return console.error('error running query', err);
			} else {				
				if(result.rows.length == 0) {
					callback(null, null);
				} else {
					callback(null, result.rows[0].updated_at);	
				}
			}
	});
}

exports.set_tweeter_updatedtime = function(tweeter_id) {
	var client = new pg.Client(conString);
	async.waterfall([
		function(cb) {
			client.connect(cb);
		},
		function(result, cb) {
			client.query("DELETE FROM multunus_tweeter WHERE tweeter_id = $1", [tweeter_id], cb);			
		},
		function(result, cb) {
			client.query("INSERT INTO multunus_tweeter (tweeter_id, updated_at) VALUES ($1, $2)", [tweeter_id, Date.now()], cb);
		}	
	], function(err, result) {
			if(err) {
				return console.error('error running query', err);
			} else {
				//console.log("result : ", result);
			}
	});	
}