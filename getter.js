var EventEmitter = require("events").EventEmitter;
var https = require("https");
var key = "AIzaSyAXpG8mF9Cw0mYv7Rnps-_0z3K9nO5injw"; // thanks figgyc

function stringify(obj) {
	return Object.keys(obj).map(key => `${key}=${encodeURIComponent(obj[key])}`).join("&");
}
// ^ made by isinkin ^

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

	https.get("https://content.googleapis.com/youtube/v3/commentThreads?" + stringify(options), (res) => {
		if (res.statusCode != 200) getter.emit("error", res.statusCode);

		d = "";

		res.on("data", function(data) {
			d = d + data.toString();
		});

		res.on("end", function() {
			var data = JSON.parse(d);
			data.items.map(function(item) {
				getter.emit("data", item.snippet.topLevelComment.snippet);
			});
			if (data.nextPageToken) {
				setTimeout(() => getNext(getter, videoID, data.nextPageToken), 0);
			} else {
				getter.emit("end");
			}
		})
	}).on("error", (e) => getter.emit("error", e));
}

module.exports = function(videoID) {
	var Getter = new EventEmitter();

	https.get("https://content.googleapis.com/youtube/v3/videos?" + stringify({
		id: videoID,
		part: "statistics,snippet",
		key: key
	}), function(res) {
		if (res.statusCode != 200) Getter.emit("error", res.statusCode);

		d = "";

		res.on("data", function(data) {
			d = d + data.toString();
		});

		res.on("end", function() {
			var data = JSON.parse(d);
			var stats = data.items[0].statistics;
			stats.published = data.items[0].snippet.publishedAt;
			Getter.emit("stats", stats);
		});
	});

	getNext(Getter, videoID);

	return Getter;
};