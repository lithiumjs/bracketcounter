module.exports = {
	allMatches: function(str, checker) {
		var matches = []
		var result;
		while (result = checker.exec(str)) {
			matches.push(result[1]);
		}
		return matches;
	},
	colors: {
		reset: "\x1b[0m",
		bg: {
			default: "\x1b[49m",
			black: "\x1b[40m",
			red: "\x1b[41m",
			green: "\x1b[42m",
			yellow: "\x1b[43m",
			blue: "\x1b[44m",
			magenta: "\x1b[45m",
			cyan: "\x1b[46m",
			light_gray: "\x1b[47m",
			dark_gray: "\x1b[100m",
			light_red: "\x1b[101m",
			light_green: "\x1b[102m",
			light_yellow: "\x1b[103m",
			light_blue: "\x1b[104m",
			light_magenta: "\x1b[105m",
			light_cyan: "\x1b[106m",
			white: "\x1b[107m"
		},
		fg: {
			default: "\x1b[39m",
			black: "\x1b[30m",
			red: "\x1b[31m",
			green: "\x1b[32m",
			yellow: "\x1b[33m",
			blue: "\x1b[34m",
			magenta: "\x1b[35m",
			cyan: "\x1b[36m",
			light_gray: "\x1b[37m",
			dark_gray: "\x1b[90m",
			light_red: "\x1b[91m",
			light_green: "\x1b[92m",
			light_yellow: "\x1b[93m",
			light_blue: "\x1b[94m",
			light_magenta: "\x1b[95m",
			light_cyan: "\x1b[96m",
			white: "\x1b[97m"
		}
	}
};