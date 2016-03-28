var parse = require('./parse');
var db = require('./db');

var interviews = [];
parse.parseDir(__dirname + '/data')
    .then(db.saveInterviews)
    .then(function(interviews) {
        db.dbConn.then(function(db){
            return db.close();
        });
    }).catch(console.log);
