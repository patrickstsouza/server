// express is the server that forms part of the nodejs program
var express = require('express');
var path = require("path");
var app = express();

// adding functionality to allow cross-domain queries when PhoneGap is running a server
app.use(function (req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
	res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	next();
});


// adding functionality to log the requests
app.use(function (req, res, next) {
	var filename = path.basename(req.url);
	var extension = path.extname(filename);
	console.log("The file " + filename + " was requested.");
	next();
});


// add an http server to serve files to the Edge browser 
// due to certificate issues it rejects the https files if they are not
// directly called in a typed URL
var http = require('http');
var httpServer = http.createServer(app);
httpServer.listen(4480);

var fs = require('fs')

// read in the file and force it to be a string by adding “” at the beginning
var configtext;
try {
	configtext = "" + fs.readFileSync("/home/studentuser/certs/postGISConnection.js");
} catch(e) {
	// On windows lets get the db connection data from a file in the same dir
	configtext = "" + fs.readFileSync('./postGISConnection.js');
}

// now convert the configruation file into the correct format -i.e. a name/value pair array
var configarray = configtext.split(",");
var config = {};
for (var i = 0; i < configarray.length; i++) {
	var split = configarray[i].split(':');
	config[split[0].trim()] = split[1].trim();
}
console.log(`database connection object: ${JSON.stringify(config, null, 2)}`)

var pg = require('pg');
var pool = new pg.Pool(config);

// app.get('/postgistest', function (req, res) {
// 	pool.connect(function (err, client, done) {
// 		if (err) {
// 			console.log("not able to get connection " + err);
// 			res.status(400).send(err);
// 			return;
// 		}
// 		console.log('connected to database');
// 		client.query('SELECT name FROM united_kingdom_counties'
// 			, function (err, result) {
// 				done();
// 				if (err) {
// 					console.log(err);
// 					res.status(400).send(err);
// 				}
// 				res.status(200).send(result.rows);
// 			});
// 	});
// });

// var bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({
// 	extended: true
// }));
// app.use(bodyParser.json());

// app.post('/uploadData', function (req, res) {
// 	// note that we are using POST here as we are uploading data
// 	// so the parameters form part of the BODY of the request rather than the RESTful API
// 	console.dir(req.body);
// 	pool.connect(function (err, client, done) {
// 		if (err) {
// 			console.log("not able to get connection " + err);
// 			res.status(400).send(err);
// 			return;
// 		}


// 		// pull the geometry component together
// 		// note that well known text requires the points as longitude/latitude !
// 		// well known text should look like: 'POINT(-71.064544 42.28787)'
// 		var geometrystring = "st_geomfromtext('POINT(" + req.body.longitude + " " + req.body.latitude + ")'";
// 		var querystring = "INSERT into formdata (name,surname,module,language, modulelist, lecturetime, geom) values('";
// 		querystring = querystring + req.body.name + "','" + req.body.surname + "','" + req.body.module + "','";
// 		querystring = querystring + req.body.language + "','" + req.body.modulelist + "','" + req.body.lecturetime + "'," + geometrystring + "))";

// 		console.log(querystring);
// 		client.query(querystring, function (err, result) {
// 			done();
// 			if (err) {
// 				console.log(err);
// 				res.status(400).send(err);
// 			}
// 			res.status(200).send("row inserted");
// 		});
// 	});
// });