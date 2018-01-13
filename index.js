var Getter = require("./getter.js");
const VIDEO_ID = 'K-JvpRzBmBA';
var getter = Getter(VIDEO_ID);
var comments = 0;
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
var contestants = {
	a: "David",
	b: "Woody",
	c: "Nickel",
	d: "Balloony",
	e: "Roboty",
	f: "Rocky",
	g: "Cloudy"
};
var colors = {
	a: ["\033[107m", "\033[97m"],
	b: ["\033[102m", "\033[92m"],
	c: ["\033[47m", "\033[37m"],
	d: ["\033[42m", "\033[32m"],
	e: ["\033[41m", "\033[31m"],
	f: ["\033[43m", "\033[33m"],
	g: ["\033[106m", "\033[96m"]
}

var checker = /\[([a-g])\]/gi;

function allMatches(str, checker) {
	var matches = []
	var result;
	while (result = checker.exec(str)) {
		matches.push(result[1]);
	}
	return matches;
}

console.log("Getting comments...");
var start = Date.now();

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
	if (comments % 100 == 0) {
		process.stdout.write("\033c");
		console.log(`${comments}/${stats.commentCount} comments, \x1b[92m${totalvotes} valid votes\x1b[0m, \x1b[31m${deadlinevotes} deadlined \x1b[0m, \x1b[33m${shinycowards} shiny cowards\x1b[0m, working for ${(Date.now() - start) / 1000}s`);
	}
	var width = process.stdout.columns;
	var multiplier = width / comments;
	var voteline = Math.floor(totalvotes * multiplier);
	var deadlineline = Math.floor(deadlinevotes * multiplier);
	var cowardline = Math.floor(shinycowards * multiplier);
	var filler = width - voteline - deadlineline - cowardline;
	if (comments % 100 == 0) console.log(`\x1b[102m${" ".repeat(voteline)}\x1b[43m${" ".repeat(cowardline)}\x1b[41m${" ".repeat(deadlineline)}\x1b[100m${" ".repeat(filler)}\x1b[0m`);
	allMatches(c, checker).forEach(function(l) {
		if (secondsAfter <= 172800 && !hasVoted) {
			votes[l]++;
			totalvotes++;
			hasVoted = true;
			commentors[comment.authorChannelId.value] = c;
		} else if (secondsAfter > 172800) {
			deadlinevotes++;
		} else if (hasVoted) {
			shinline++;
		}
	});
	if (comments % 100 == 0) console.log(Object.keys(votes).sort(function(a, b) {
		if (votes[a] > votes[b]) return -1;
		if (votes[a] < votes[b]) return 1;
		return 0;
	}).map(function(l) {
		var width = process.stdout.columns;
		var barlength = Math.floor(width * (votes[l] / totalvotes)) || 0;
		var textlen = `${contestants[l]}: ${votes[l]}`.length;
		var filler = width - barlength - textlen;
		return colors[l][0] + " ".repeat(filler > 0 ? barlength : barlength + filler) + "\033[100m" + " ".repeat(filler > 0 ? filler : 0) + 
		`${colors[l][1]}${contestants[l]}\x1b[39m: ${votes[l]}` + "\033[0m";
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
		var textlen = `${contestants[l]}: ${votes[l]}`.length;
		var filler = width - barlength - textlen;
		// return `${contestants[l]}: ${votes[l]}` + "\n\033[107m" + " ".repeat(barlength) + "\033[100m" + " ".repeat(width - barlength) + "\033[0m";
		return colors[l][0] + " ".repeat(filler > 0 ? barlength : barlength + filler) + "\033[100m" + " ".repeat(filler > 0 ? filler : 0) + 
		`${colors[l][1]}${contestants[l]}\x1b[39m: ${votes[l]}` + "\033[0m";
	}).join("\n"));
	console.log();
	var width = process.stdout.columns;
	var multiplier = width / comments;
	var voteline = Math.floor(totalvotes * multiplier);
	var deadlineline = Math.floor(deadlinevotes * multiplier);
	var cowardline = Math.floor(shinycowards * multiplier);
	var filler = width - voteline - deadlineline - cowardline;
	console.log(`\x1b[102m${" ".repeat(voteline)}\x1b[43m${" ".repeat(cowardline)}\x1b[41m${" ".repeat(deadlineline)}\x1b[100m${" ".repeat(filler)}\x1b[0m`);
	console.log(`Total comments: ${comments}`);
	console.log(`Total votes: ${totalvotes + shinycowards + shinline + deadlinevotes}`);
	console.log(`\x1b[33mShiny coward votes\x1b[0m: ${shinycowards + shinline}`);
	console.log(`\x1b[31mVotes after deadline\x1b[0m: ${deadlinevotes}`); 
	console.log(`\x1b[92mValid votes\x1b[0m: ${totalvotes}`);
	console.log(`Work time: ${(Date.now() - start) / 1000}s`);
	process.exit();
});
