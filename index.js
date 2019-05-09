const alphabet = "abcdefghijklmnopqrstuvwxyz".split(""); // change this string if you need a different alphabet

console.log("\x1bc" + "Loading...");

const config = require("./config.json");
const Getter = require("./getter.js");
const util = require("./util.js");

const fg = util.colors.fg;
const bg = util.colors.bg;

const stats = {
	commentCount: 0,
	votes: {},
	shinyCowards: 0,
	votesAfterDeadline: 0,
	commentors: {},
	cowardVotes: {},
	videoStats: {},
	startedAt: Date.now()
};

const usedLetters = alphabet.slice(0, config.names.length);

usedLetters.forEach(l => stats.votes[l] = 0);

const getter = Getter(config.videoID);

const checker = new RegExp(`\\[([${usedLetters.join("")}])\\]`, "gi");

getter.on("stats", s => stats.videoStats = s);

getter.on("error", e => console.error("Error: " + e));

getter.on("data", comment => {
	++stats.commentCount;

	if (!comment || !comment.authorChannelId) return;

	let hasAlreadyVoted = false;

	if (stats.commentors[comment.authorChannelId.value]) {
		hasAlreadyVoted = true;
		++stats.shinyCowards;
	}

	const c = (comment.textDisplay + "").toLowerCase();
	const timeDifference = (new Date(comment.publishedAt).getTime() - new Date(stats.videoStats.published).getTime()) / 1000;

	if (timeDifference <= config.deadlineAfter || config.deadlineAfter == 0) {
		util.allMatches(c, checker).forEach(l => {
			if (!hasAlreadyVoted) {
				stats.votes[l] = (stats.votes[l] || 0) + 1;
				hasAlreadyVoted = true;
				stats.commentors[comment.authorChannelId.value] = 1;
			} else {
				++stats.commentors[comment.authorChannelId.value];
				stats.cowardVotes[comment.authorDisplayName] = (stats.cowardVotes[comment.authorDisplayName] || 0) + 1
			}
		});
	} else if (checker.test(c)) {
		++stats.votesAfterDeadline;
	}

	if (stats.commentCount % 100 == 0) {
		const totalVotes = Object.values(stats.votes).reduce((a, b) => a + b);

		process.stdout.write("\x1b[0;0f");

		console.log(`${stats.commentCount}/${stats.videoStats.commentCount} comments, ` +
					`${fg.light_green}${totalVotes} valid votes${util.colors.reset}, ` +
					`${fg.red}${stats.votesAfterDeadline} deadlined${util.colors.reset}, ` +
					`${fg.yellow}${stats.shinyCowards} shiny cowards${util.colors.reset}, `+
					`working for ${(Date.now() - stats.startedAt) / 1000}s`);

		const terminalWidth = process.stdout.columns;
		const multiplier = terminalWidth / stats.commentCount;
		const voteLine = Math.floor(totalVotes * multiplier);
		const SCLine = Math.floor(stats.shinyCowards * multiplier);
		const deadLine = Math.floor(stats.votesAfterDeadline * multiplier);
		const filler = terminalWidth - voteLine - deadLine - SCLine;

		console.log(bg.light_green +
					" ".repeat(voteLine) +
					bg.yellow +
					" ".repeat(SCLine) +
					bg.red +
					" ".repeat(deadLine) +
					bg.dark_gray +
					" ".repeat(filler) +
					util.colors.reset);

		console.log(usedLetters
					.sort((a, b) => stats.votes[b] - stats.votes[a])
					.map(l => {
						const contestant = alphabet.indexOf(l);
						const terminalWidth = process.stdout.columns;
						const barLength = Math.floor(terminalWidth * (stats.votes[l] / totalVotes)) || 0;
						const textLength = `${config.names[contestant]}: ${stats.votes[l]}`.length;
						const filler = terminalWidth - barLength - textLength;

						return (bg[config.colors[contestant]] +
								" ".repeat(filler > 0 ? barLength : barLength + filler) +
								bg.dark_gray +
								" ".repeat(filler > 0 ? filler : 0) +
								fg[config.colors[contestant]] +
								config.names[contestant] +
								fg.default +
								": " +
								stats.votes[l] +
								util.colors.reset);
					})
					.join(""));
	}
});

getter.on("end", () => {
	const totalVotes = Object.values(stats.votes).reduce((a, b) => a + b);
	process.stdout.write("\x1bc");
	console.log(usedLetters
				.sort((a, b) => stats.votes[b] - stats.votes[a])
				.map((l, i) => {
					const contestant = alphabet.indexOf(l);
					const terminalWidth = process.stdout.columns;
					const barLength = Math.floor(terminalWidth * (stats.votes[l] / totalVotes)) || 0;
					const textLength = `${config.names[contestant]}: ${stats.votes[l]}`.length;
					const filler = terminalWidth - barLength - textLength;

					return (bg[config.colors[contestant]] +
							" ".repeat(filler > 0 ? barLength : barLength + filler) +
							bg.dark_gray +
							" ".repeat(filler > 0 ? filler : 0) +
							fg[config.colors[contestant]] +
							config.names[contestant] +
							fg.default +
							": " +
							stats.votes[l] +
							util.colors.reset);
				})
				.join(""));

	console.log()

	const terminalWidth = process.stdout.columns;
	const multiplier = terminalWidth / stats.commentCount;
	const voteLine = Math.floor(totalVotes * multiplier);
	const SCLine = Math.floor(stats.shinyCowards * multiplier);
	const deadLine = Math.floor(stats.votesAfterDeadline * multiplier);
	const filler = terminalWidth - voteLine - deadLine - SCLine;

	console.log(bg.light_green +
				" ".repeat(voteLine) +
				bg.yellow +
				" ".repeat(SCLine) +
				bg.red +
				" ".repeat(deadLine) +
				bg.dark_gray +
				" ".repeat(filler) +
				util.colors.reset);

	let theShiniestCoward;
	if (Object.keys(stats.cowardVotes).length !== 0) {
		theShiniestCoward = Object.keys(stats.cowardVotes)
			.reduce((s, r) => (stats.cowardVotes[r] > stats.cowardVotes[s]) ? r : s);
	}
	
	const totalCowards = Object.values(stats.cowardVotes).reduce((a, b) => a + b, 0);

	console.log(`Total comments: ${stats.commentCount}`);
	console.log(`Total votes: ${totalVotes + totalCowards + stats.votesAfterDeadline}`);
	console.log(`${fg.yellow}Shiny coward votes${util.colors.reset}: ${totalCowards}`);
	console.log(`${fg.red}Votes after deadline${util.colors.reset}: ${stats.votesAfterDeadline}`);
	console.log(`${fg.light_green}Valid votes${util.colors.reset}: ${totalVotes}`);
	if (theShiniestCoward) {
		console.log(`The shiniest coward: ${theShiniestCoward} (${stats.cowardVotes[theShiniestCoward]} votes)`);
	}
	console.log(`Work time: ${(Date.now() - stats.startedAt) / 1000}s`);
	process.exit();
});