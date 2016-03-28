var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var _ = require('lodash');
var Q = require('q');


function parseLine(l, interview, interviews) {
    var line = l.trim();
    if (line.startsWith('---')) {
        if (!!interview.Client) interviews.push(interview);
        return {};
    }
    var isHeader = false;
    ['Client', 'Candidate', 'Date', 'Type'].forEach(function(k) {
        if (line.startsWith(k)) {
            interview[k] = line.split(':')[1].trim();
            isHeader = true;
        }
    });
    if (!isHeader) {
        var matchRes = /^\d+\.\s*(.*)/.exec(line.trim());
        if (!!matchRes) {
            if (!interview.questions) interview.questions = [];
            interview.questions.push(matchRes[1]);
        }
    }
    return interview;
}


function parseFile(file) {
    var interviews = [];
    return fs.readFileAsync(file, 'utf8').then(function(cnt) {
        var interview = {};
        console.log(cnt.length);
        var lines = cnt.split('\n');
        lines.forEach(function(l) {
            interview = parseLine(l, interview, interviews);
        });
        if (!!interview.Client) interviews.push(interview);
        return interviews;
    });
}

function parseDir(dir) {
    return fs.readdirAsync(dir).then(function(files) {
        console.log("read dir ", files.length);
        var promises = _.map(files, function(file) {
            var filePath = dir + '/' + file;
            var fsStat = fs.statSync(filePath);
            if (fsStat.isDirectory()) return parseDir(filePath);
            else if (fsStat.isFile() && file.endsWith('.txt')) {
                return parseFile(filePath);
            } else console.log('ignore ', filePath);
        })
        return Promise.all(promises).then(function(interviewses) {
            return _.reduce(interviewses, function(interviews, item) {
                return interviews.concat(item);
            }, []);
        });
    });
}

module.exports = {
    parseFile: parseFile,
    parseDir: parseDir,
}
