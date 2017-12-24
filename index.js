var Getter = require("./getter.js");
const VIDEO_ID = 'MiZ8V3NHwfM';
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
	h: 0,
	i: 0
};
var totalvotes = 0;
var shinycowards = 0;
var deadlinevotes = 0;
var commentors = {};
var contestants = {
	4: "Four",
	x: "X",
	a: "Pen",
	b: "Liy",
	c: "Black Hole",
	d: "Tree",
	e: "Remote",
	f: "Pie",
	g: "Bottle",
	h: "Pillow",
	i: "Satomi"
};

console.log("Getting comments...");

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
			if (secondsAfter <= 172800 && !hasVoted) {
				votes[l]++;
				totalvotes++;
				hasVoted = true;
			} else if (hasVoted) {
				shinycowards++;
			} else if (secondsAfter > 172800) {
				deadlinevotes++;
			}
		}
		var barlength = Math.floor(width * (votes[l] / totalvotes)) || 0;
		// var bfs = "█";
		// var bms = "▒";
		return `${contestants[l]}: ${votes[l]}` + "\n\033[107m" + " ".repeat(barlength) + "\033[100m" + " ".repeat(width - barlength) + "\033[0m";;
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
		var barlength = Math.floor(width * (votes[l] / totalvotes)) || 0;
		// var bfs = "█";
		// var bms = "▒";
		return `${contestants[l]}: ${votes[l]}` + "\n\033[107m" + " ".repeat(barlength) + "\033[100m" + " ".repeat(width - barlength) + "\033[0m";
	}).join("\n"));
	console.log("_".repeat(process.stdout.columns));
	console.log(`Total comments: ${comments}`);
	console.log(`Total votes: ${totalvotes + shinycowards + deadlinevotes}`);
	console.log(`Shiny coward votes: ${shinycowards}`);
	console.log(`Votes after deadline: ${deadlinevotes}`); 
	console.log(`Valid votes: ${totalvotes}`);
	process.exit();
});
