var Getter = require("./getter.js");
const VIDEO_ID = 'AiBqyXNtOEs';
var getter = Getter(VIDEO_ID);
var comments = 0;
var votes = {
	4: 0,
	x: 0,
	a: 0,
	b: 0,
	c: 0,
	d: 0,
	e: 0,
	f: 0,
	g: 0,
	h: 0
};
var totalvotes = 0;
var shinycowards = 0;
var deadlinevotes = 0;
var commentors = {};
var contestants = {
	4: "Four",
	x: "X",
	a: "Donut",
	b: "Bomby",
	c: "Naily",
	d: "Firey Jr.",
	e: "Bracelety",
	f: "Spongy",
	g: "Gelatin",
	h: "Barf Bag"
};

var stats = {};
// var deadline;

console.log("Getting comments...");

getter.on('stats', function(s) {
	stats = s;
	// deadline = new Date(s.published);
	// deadline.setTime(deadline.getTime() + 172800000); // +48 hours
});

getter.on('data', function (comment) {
	// console.log(comment);
	comments++;
	if (commentors[comment.authorChannelId.value]) return shinycowards++;
	// if (new Date(comment.publeshedAt).getTime() > deadline.getTime() && /\[.\]/i.test(comment.textDisplay)) return deadlinevotes++;
	var c = (comment.textDisplay + "").toLowerCase();
	commentors[comment.authorChannelId.value] = c;
	process.stdout.write("\033c");
	console.log(`Getting comments... ${comments}/${stats.commentCount} comments, ${totalvotes} valid votes, ${deadlinevotes} votes after voting deadline`);
	console.log(Object.keys(votes).sort(function(a, b) {
		if (votes[a] > votes[b]) return -1;
		if (votes[a] < votes[b]) return 1;
		return 0;
	}).map(function(l) {
		var width = process.stdout.columns;
		if (c.indexOf(`[${l}]`) > -1) {
			votes[l]++;
			totalvotes++;
		}
		var barlength = Math.floor(width * (votes[l] / totalvotes));
		var bfs = "█";
		var bms = "▒";
		return `${contestants[l]}: ${votes[l]}` + "\n" + bfs.repeat(barlength) + bms.repeat(width - barlength);
	}).join("\n"));
});

getter.on('error', function (err) {
	console.error('ERROR READING COMMENTS:', err)
});

getter.on('end', function () {
	process.stdout.write("\033c");
	console.log("FINAL RESULTS:");
	console.log(Object.keys(votes).sort(function(a, b) {
		if (votes[a] > votes[b]) return -1;
		if (votes[a] < votes[b]) return 1;
		return 0;
	}).map(function(l, i) {
		var width = process.stdout.columns;
		var barlength = Math.floor(width * (votes[l] / totalvotes));
		var bfs = "█";
		var bms = "▒";
		return `${contestants[l]}: ${votes[l]}` + "\n" + bfs.repeat(barlength) + bms.repeat(width - barlength);
	}).join("\n"));
	console.log("_".repeat(process.stdout.columns));
	console.log(`Total comments: ${comments}`);
	console.log(`Total votes: ${totalvotes + shinycowards + deadlinevotes}`);
	console.log(`Shiny coward votes: ${shinycowards}`);
	// console.log(`Votes after deadline: ${deadlinevotes}`); // will add later
	console.log(`Valid votes: ${totalvotes}`);
	process.exit();
});