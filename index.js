var Getter = require("./getter.js");
var VIDEO_ID = 'SDaS5VNbVOo';
var getter = Getter(VIDEO_ID);
var comments = 0;
var votes = {
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
var shinline = 0;
var deadlinevotes = 0;
var commentors = {};
var thecowards = {};
var contestants = {
	a: "Tennis Ball",
	b: "Golf Ball",
	c: "Basketball",
	d: "Grassy",
	e: "TV",
	f: "8-ball",
	g: "Blocky",
	h: "Robot Flower"
};
var colors = {
	a: ["\033[43m", "\033[33m"],
	b: ["\033[47m", "\033[37m"],
	c: ["\033[41m", "\033[31m"],
	d: ["\033[102m", "\033[92m"],
	e: ["\033[46m", "\033[36m"],
	f: ["\033[40m", "\033[30m"],
	g: ["\033[101m", "\033[91m"],
	h: ["\033[105m", "\033[95m"]
}

var checker = /\[([a-h])\]/gi;

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
	var hasVoted = false;
	if (commentors[comment.authorChannelId.value]) {
		hasVoted = true;
		shinycowards++;
	}
	var c = (comment.textDisplay + "").toLowerCase();
	if (comments % 100 == 0) {
		process.stdout.write("\033c");
		console.log(`${comments}/${stats.commentCount} comments, \x1b[92m${totalvotes} valid votes\x1b[0m, \x1b[31m${deadlinevotes} deadlined \x1b[0m, \x1b[33m${shinline} shiny cowards\x1b[0m, working for ${(Date.now() - start) / 1000}s`);
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
			commentors[comment.authorChannelId.value] = 1;
		} else if (secondsAfter > 172800) {
			deadlinevotes++;
		} else if (hasVoted) {
			shinline++;
			commentors[comment.authorChannelId.value]++;
			thecowards[comment.authorDisplayName] = (thecowards[comment.authorDisplayName] || 0) + 1
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
	var theShiniest = Object.keys(thecowards).reduce((shiniest, rn) => {
		if (thecowards[rn] > thecowards[shiniest]) return rn;
		else return shiniest;
	})
	console.log(`\x1b[102m${" ".repeat(voteline)}\x1b[43m${" ".repeat(cowardline)}\x1b[41m${" ".repeat(deadlineline)}\x1b[100m${" ".repeat(filler)}\x1b[0m`);
	console.log(`Total comments: ${comments}`);
	console.log(`Total votes: ${totalvotes + shinline + deadlinevotes}`);
	console.log(`\x1b[33mShiny coward votes\x1b[0m: ${shinline}`);
	console.log(`\x1b[31mVotes after deadline\x1b[0m: ${deadlinevotes}`); 
	console.log(`\x1b[92mValid votes\x1b[0m: ${totalvotes}`);
	console.log(`The shiniest coward: ${theShiniest} (${thecowards[theShiniest]} votes)`);
	console.log(`Work time: ${(Date.now() - start) / 1000}s`);
	process.exit();
});
