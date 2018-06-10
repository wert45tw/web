var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8888;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.route('/').get( function(req, res) {
    res.json({ message: "test api!" });
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.route('/selectid').post(function(req, res) {
	connection.query('USE ' + dbconfig.database);
	connection.query("SELECT * FROM users WHERE id = '" + req.body.id +"'", function(err, rows){
		res.json({
		    message_content: rows[0] 
		});   
	});
});


router.route('/login').post(function(req, res) {

	connection.query('USE ' + dbconfig.database);
	connection.query("SELECT * FROM users WHERE username = '" + req.body.username +"'", function(err, rows){

		if (err){	
			throw err;		
				res.json({
		        status: 0,
		        message_title: 'DBerror',
		        message_content: err
		    })
		} else if(!rows.length){
			res.json({
		        status: 1,
		        message_title: 'loginMessage',
		        message_content: 'No user found.'
		    })
		} else if(!bcrypt.compareSync(req.body.password, rows[0].password)){
			res.json({
		        status: 1,
		        message_title: 'loginMessage',
		        message_content: 'No user found.'
		    })
		}else{
			res.json({
			    status: 2,
			    message_title: 'Success',
			    message_content: rows[0]
			})
		}
	});
});

router.route('/signup').post(function(req, res) {

	connection.query('USE ' + dbconfig.database);
	connection.query("SELECT * FROM users WHERE username = '" + req.body.username +"'", function(err, rows){
		if (err){	
			throw err;		
				res.json({
		        status: 0,
		        message_title: 'DBerror',
		        message_content: err
		    })
		} else if(rows.length){
			res.json({
		        status: 1,
		        message_title: 'signupMessage',
		        message_content: 'That username is already taken.'
		    })
		}else{
			var newUserMysql = {
            	username: req.body.username,
                password: bcrypt.hashSync(req.body.password, null, null)  // use the generateHash function in our user model
			};
			console.log(newUserMysql.username)
			console.log(newUserMysql.password)
            var insertQuery = "INSERT INTO users ( username, password ) values ('"+newUserMysql.username+"','"+newUserMysql.password+"')";
            connection.query(insertQuery,function(err, rows) {
                newUserMysql.id = rows.insertId;
                res.json({
				    status: 2,
				    message_title: 'Success',
				    message_content: newUserMysql
				})
            });
		}
	});
});

app.use('/api', router);

app.listen(port);
console.log('Magic happens on port ' + port);

