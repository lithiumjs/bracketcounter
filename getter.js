const EventEmitter = require("events").EventEmitter;
const https = require("https");
const key = "AIzaSyAXpG8mF9Cw0mYv7Rnps-_0z3K9nO5injw"; // thanks figgyc

const stringify = require("querystring").stringify;

function httpsReq(uri, options, callback) {
	https.get(uri + stringify(options), (res) => {
		if (res.statusCode == 403 || res.statusCode == 404) return callback({errorCode: res.statusCode});
		else if (res.statusCode != 200) return setTimeout(() => httpsReq(uri, options, callback), 0);

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

// DEPRECATED: Will eat your API quota if used
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
		part: "snippet, replies",
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
			if (item.snippet.totalReplyCount > 0) {
				item.replies.comments.forEach(function (reply) {
					getter.emit("data", reply.snippet);
				});
			}
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
		if (data.errorCode) Getter.emit("error", data.errorCode);

		var stats = data.items[0].statistics;
		stats.published = data.items[0].snippet.publishedAt;
		Getter.emit("stats", stats);
	});

	getNext(Getter, videoID);

	return Getter;
};
