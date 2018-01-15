var Getter = require("./getter.js");
const VIDEO_ID = 'K-JvpRzBmBA';
var getter = Getter(VIDEO_ID);
var comments = 0;
var commentObjs = [];
var votes = {
	a: 0,
	b: 0,
	c: 0,
	d: 0,
	e: 0,
	f: 0,
	g: 0
};
var totalvotes = 0;
var shinycowards = 0;
var shinline = 0;
var deadlinevotes = 0;
var commentors = {};
var exportedjson = {};
var fs = require("fs");
var contestants = {
	a: "David",
	b: "Woody",
	c: "Nickel",
	d: "Balloony",
	e: "Roboty",
	f: "Rocky",
	g: "Cloudy"
};
var checker = /\[([a-g])\]/gi;
process.stdout.write("Getting comments... ");

function allMatches(str, checker) {
	var matches = []
	var result;
	while (result = checker.exec(str)) {
		matches.push(result[1]);
	}
	return matches;
}


getter.on('stats', function(s) {
	stats = s;
});

getter.on('data', function (comment) {
	comments++;
	var secondsAfter = (new Date(comment.publishedAt).getTime() - new Date(stats.published).getTime()) / 1000;
	if (!comment || !comment.authorChannelId) return;
	if (commentors[comment.authorChannelId.value]) return shinycowards++;
	var hasVoted = false;
	var c = (comment.textDisplay + "").toLowerCase();
	allMatches(c, checker).forEach(function(l) {
		if (secondsAfter <= 172800 && !hasVoted) {
			votes[l]++;
			totalvotes++;
			hasVoted = true;
			commentors[comment.authorChannelId.value] = c;
			commentObjs.push({
				timestamp: comment.publishedAt,
				vote: l
			});
			process.stdout.write(`\x1b[92m${l}\x1b[0m`);
		} else if (secondsAfter > 172800) {
			deadlinevotes++;
			process.stdout.write(`\x1b[91m${l}\x1b[0m`);
		} else if (hasVoted) {
			shinline++;
			process.stdout.write(`\x1b[33m${l}\x1b[0m`);
		}
	});
});

getter.on('error', function (err) {
	console.error('ERROR READING COMMENTS:', err)
});

getter.on('end', function () {
	process.stdout.write(" Done collecting, now exporting votes to .json... ");
	var currentVotes = {
		a: 0,
		b: 0,
		c: 0,
		d: 0,
		e: 0,
		f: 0,
		g: 0
	}
	commentObjs.sort(function(a, b) {
		if (new Date(a.timestamp).getTime() < new Date(b.timestamp).getTime()) return -1;
		if (new Date(a.timestamp).getTime() > new Date(b.timestamp).getTime()) return 1;
		return 0;
	}).forEach(function(comment) {
		currentVotes[comment.vote]++;
		var iHateLinks = {};
		Object.keys(currentVotes).forEach(l => iHateLinks[l] = currentVotes[l]);
		exportedjson[new Date(comment.timestamp).getTime() / 1000] = iHateLinks;
	});
	fs.writeFileSync("./votes.json", JSON.stringify(exportedjson, null, "\t"));
	console.log("Done!");
	process.exit();
});
