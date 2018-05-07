// express is the server that forms part of the nodejs program
var express = require('express');
var path = require("path");
var app = express();

// adding functionality to allow cross-domain queries when PhoneGap is running a server
app.use(function (req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Headers", "*");
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


// Needed to access the body of the client's requests as javascript objects. Will only work if client sends 'Content-Type: application/json' 
// Source: https://stackoverflow.com/questions/11625519/how-to-access-the-request-body-when-posting-using-node-js-and-express
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

// Endpoint for adding a question from the web configuration tool
app.post('/addQuestion', function(req, res) {
	console.log('>>> called addQuestion', req.body);

	pool.connect(function (err, client, done) {
		if (err) {
			console.log("not able to get connection " + err);
			res.status(400).send(err);
			return;
		}

		var values = req.body;
		var querystring = `
		insert into public.webmobile_questions (question, answer1, answer2, answer3, answer4, correct_answer, geom)
		values ('${values.question}', '${values.answer1}', '${values.answer2}', '${values.answer3}', '${values.answer4}', '${values.correctAnswer}', st_geomfromtext('POINT(${values.lat} ${values.long})', 4326))
		`;
		console.log("connected to database, executing query:", querystring);

		client.query(querystring, function (err, result) {
			done();
			if (err) {
				console.log(err);
				res.status(400).send(err);
				return;
			}
			console.log("executed query successfully. result:", result);
			res.status(200).send("added question");
		});		
	});
});

// Client app asks for a question for a specific location
app.post('/getQuestionForLocation', function(req, res) {
	console.log('>>> called getQuestionForLocation', req.body);

	pool.connect(function (err, client, done) {
		if (err) {
			console.log("not able to get connection " + err);
			res.status(400).send(err);
			return;
		}

		var values = req.body;

		// Creates a query that searches for all questions that are within 10 meters of the user location
		// Source: https://gis.stackexchange.com/questions/77688/postgis-get-the-points-that-are-x-meters-near-another-point-in-meters
		var querystring = `
		select * from public.webmobile_questions
		where ST_DWithin(geom::geography, st_geomfromtext('POINT(${values.lat} ${values.long})', 4326)::geography, 10)
		and id not in
		(
			select questionId as id from public.webmobile_answers
			where phoneId = '${values.phoneId}'
		);
		`;
		console.log("connected to database, executing query:", querystring);

		client.query(querystring, function (err, result) {
			done();
			if (err) {
				console.log(err);
				res.status(400).send(err);
				return;
			}

			var ret;
			if (result.rowCount === 0) {
				ret = {};
			} else {
				ret = result.rows[0];
			}
			console.log("executed query successfully. result:", result);
			res.status(200).send(JSON.stringify(ret));
		});		
	});
});

// Client app saves the answer for a question
app.post('/saveAnswer', function(req, res) {
	console.log('>>> called saveAnswer', req.body);

	pool.connect(function (err, client, done) {
		if (err) {
			console.log("not able to get connection " + err);
			res.status(400).send(err);
			return;
		}

		var values = req.body;
		var querystring = `
		insert into public.webmobile_answers (questionId, phoneId, answer)
		values (${values.questionId}, '${values.phoneId}', '${values.answer}')
		`;
		console.log("connected to database, executing query:", querystring);

		client.query(querystring, function (err, result) {
			done();
			if (err) {
				console.log(err);
				res.status(400).send(err);
				return;
			}
			console.log("executed query successfully. result:", result);
			res.status(200).send("saved answer");
		});		
	});
});