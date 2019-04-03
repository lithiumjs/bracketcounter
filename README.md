# BFB Votes Collector

## How to run:

1. Install Node.js (if haven't done so)
2. Modify `config.json` (see changeable things)
3. Run cmd (or linux terminal) in this folder
4. Type `node index.js`
5. Just wait

## Changeable things:

* `config.json`
    * `videoID`: YouTube video ID (goes after `https://www.youtube.com/watch?v=`)
    * `names`: Names of contestants
    * `colors`: Color codes for corresponding contestants
    * `deadlineAfter`: Number of seconds since the video has been uploaded, when the votes are valid

## List of valid colors

* `black`
* `red`
* `green`
* `yellow`
* `blue`
* `magenta`
* `cyan`
* `light_gray`
* `dark_gray`
* `light_red`
* `light_green`
* `light_yellow`
* `light_blue`
* `light_magenta`
* `light_cyan`
* `white`
* `default` (Terminal's default foreground/background color)