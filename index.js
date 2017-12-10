const commentsStream = require('youtube-comments-stream');
const VIDEO_ID = 'AiBqyXNtOEs';
const stream = commentsStream(VIDEO_ID);
var comments = 0;
var votes = {
	"4": 0,
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
var commentors = {};
var contestants = {
	"4": "Four",
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

console.log("Getting comments...");

stream.on('data', function (comment) {
	// comments.push(comment.text);
	comments++;
	if (commentors[comment.authorLink]) return shinycowards++;
	var c = (comment.text + "").toLowerCase();
	commentors[comment.authorLink] = c;
	process.stdout.write("\033c");
	// console.log(Object.keys(comment));
	console.log(`Getting comments... ${comments} comments, ${votes} valid votes`);
	console.log(Object.keys(votes).map(function(l) {
		if (c.indexOf(`[${l}]`) > -1) {
			votes[l]++;
			totalvotes++;
		}
		return `${contestants[l]}: ${votes[l]}`;
	}).join("\n"));
});

stream.on('error', function (err) {
	console.error('ERROR READING COMMENTS:', err)
});

stream.on('end', function () {
	process.stdout.write("\033c");
	console.log("FINAL RESULTS:");
	console.log(Object.keys(votes).map(function(l, i) {
		return `${contestants[l]}: ${votes[l]}`;
	}).join("\n"));
	console.log("____________________________");
	console.log(`Total comments: ${comments}`);
	console.log(`Total votes: ${totalvotes + shinycowards}`);
	console.log(`Shiny coward votes: ${shinycowards}`);
	console.log(`Valid votes: ${totalvotes}`);
	process.exit();
});