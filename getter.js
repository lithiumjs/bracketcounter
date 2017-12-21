var EventEmitter = require("events").EventEmitter;
var https = require("https");
var key = "AIzaSyAXpG8mF9Cw0mYv7Rnps-_0z3K9nO5injw"; // thanks figgyc

const stringify = require("querystring").stringify;

function httpsReq(uri, options, callback) {
	https.get(uri + stringify(options), (res) => {
		if (res.statusCode != 200) callback({errorCode: res.statusCode});

		var d = [];

		res.on("data", data => d.push(data));

		res.on("end", function() {
			try {
				var data = JSON.parse(d.join(""));
			} catch(e) {
				// try again
				return setTimeout(() => httpsReq(uri, options, callback), 0);
			}
			if (!data || !data.items) setTimeout(() => httpsReq(uri, options, callback), 0);
			callback(data);
		});
	}).on("error", function(e) {
		// try yet again
		setTimeout(() => httpsReq(uri, options, callback), 0);
	});
}

function getThread(getter, commentID) {
	var options = {
		maxResults: 100,
		parentId: commentID,
		part: "snippet",
		textFormat: "plainText",
		key: key
	}
	
	httpsReq("https://content.googleapis.com/youtube/v3/comments?", options, (data) => {
		if (data.errorCode) getter.emit("error", data.errorCode);
		data.items.map(function(item) {
			getter.emit("data", item.snippet);
		});
	});
}

function getNext(getter, videoID, pageToken) {
	var options = {
		maxResults: 100,
		moderationStatus: "published",
		order: "time",
		part: "snippet",
		textFormat: "plainText",
		videoId: videoID,
		key: key
	};

	if (pageToken) options.pageToken = pageToken;

	httpsReq("https://content.googleapis.com/youtube/v3/commentThreads?", options, (data) => {
		if (data.errorCode) getter.emit("error", data.errorCode);
		data.items.forEach(function(item) {
			if (!item || !item.snippet.topLevelComment) return;
			getter.emit("data", item.snippet.topLevelComment.snippet);
			if (item.snippet.totalReplyCount > 0) getThread(getter, item.id);
		});
		if (data.nextPageToken) {
			setTimeout(() => getNext(getter, videoID, data.nextPageToken), 0);
		} else {
			getter.emit("end");
		}
	});
}

module.exports = function(videoID) {
	var Getter = new EventEmitter();

	var options = {
		id: videoID,
		part: "statistics,snippet",
		key: key
	};

	httpsReq("https://content.googleapis.com/youtube/v3/videos?", options, (data) => {
		if (data.errorCode) getter.emit("error", data.errorCode);

		var stats = data.items[0].statistics;
		stats.published = data.items[0].snippet.publishedAt;
		Getter.emit("stats", stats);
	});

	getNext(Getter, videoID);

	return Getter;
};