var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');

var process = require('./process');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended : false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/opr', function(req, res) {
    var username = 'giantblargg',
        token = '26BC98ED-6BBE-4CCD-8BF0-F01A15CB5C5A',
        domain = 'frc-api.usfirst.org/api/v1.0',
        prefix = 'https://' + username + ':' + token + '@' + domain,
        teams,
        matches;
    function check(object) {
        teams = object.teams || teams;
        matches = object.Matches || matches;
        if (teams && matches) {
            res.send(process(teams, matches));
        }
    }
    
    request.get({
        url : prefix + '/teams/2015/?eventCode=' + req.url.substring(1),
        headers : {
            'accept' : 'application/json'
        }
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            check(JSON.parse(body));
        }
    });
    request.get({
        url : prefix + '/matches/2015/' + req.url.substring(1),
        headers : {
            'accept' : 'application/json'
        }
    }, function(error, response, body) {

        if (!error && response.statusCode == 200) {
            check(JSON.parse(body));
        }
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message : err.message,
            error : err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message : err.message,
        error : {}
    });
});

module.exports = app;
