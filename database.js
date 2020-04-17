var express = require('express');
var app = express();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var dateFormat = require('dateformat');
var flash = require('express-flash');
var session = require('express-session');
// const { check, validationResult } = require('express-validator');
// var validator = require('express-validator');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(flash());

// app.use(validator())

app.use(session({ 
    secret: '123456cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "products"
});

con.connect(function(err){
    if(err){
        console.log("database is not connected");
    }
    else{
        console.log("database is connected succefuly");
    }
});

app.set('view engine', 'ejs');

/* Home page */
app.get('/home', function(req, res) {
    var drinks = [
        { name: 'Bloody Mary', drunkness: 3 },
        { name: 'Martini', drunkness: 5 },
        { name: 'Scotch', drunkness: 10 }
    ];

    res.render('index', {
        drinks: drinks,
    });
});

/* About page */
app.get('/about', function(req, res){
    res.render('about');
});

app.post('/submit', function(req, res){
    var name = req.body.name;
    var email = req.body.email;

    // req.assert('name', 'Name is required').notEmpty();
    // req.assert('email', 'A valid email is required').isEmail();

    // check('name').notEmpty();
    // check('email').isEmail();

    // name: req.sanitize('name').escape().trim(),
    // email: req.sanitize('email').escape().trim()

    //next

        var insertAt = dateFormat(new Date(), "yyyy-mm-dd h:MM:ss");
        var sql = "CREATE TABLE if not exists users3 (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), insertAt VARCHAR(255))";
        con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table created");
        });
       sql = "INSERT INTO users3 (name, email, insertAt) VALUES ('"+name+"', '"+email+"','"+insertAt+"' )";
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted, ID: " + result.insertId);

        res.redirect('http://localhost:9000/home');
        console.log("OpenAt " + insertAt);
      });
    });

app.get('/user-list', function(req, res) {
    var sql='SELECT * FROM users3';
    con.query(sql, function (err, data) {
    if (err) {
        console.error('Error:- ' + err.stack);
        return;
    }
    console.log('Connected Id:- ' + con.threadId);
    res.render('user-list', { title: 'User List', userData: data});
  });
});

//show edit user form
app.get('/edit/(:id)', function(req, res){
    con.query('SELECT * FROM users3 WHERE id = ' + req.params.id, function(err, data, fields){
        if(err) throw err

        // if user not found
        if (data.length <= 0) {
            req.flash('error', 'users3 not found with id = ' + req.params.id)
            res.redirect('/http://localhost:9000/home')
        }
        else { // if user found
            res.render('edit-user', { 
            title: 'Edit List', 
            id: data[0].id,
            name: data[0].name,
            email: data[0].email  
            });
        } 
    });
});

// EDIT user post data
app.post('/update/:id', function(req, res) {
 
        var user = {
            name: req.body.name,
            email: req.body.email
        }
        con.query('UPDATE users3 SET ? WHERE id = ' + req.params.id, user, function(err, result) {

                if (err) {
                    req.flash('error', err)

                    res.render('edit-user', {
                        title: 'Edit user',
                        id: req.params.id,
                        name: req.body.name,
                        email: req.body.email
                    })
                }
                else {
                    req.flash('success', 'Data updated successfully!');
                    res.redirect('/user-list');
                }
            })
})

//DELET USER
app.get('/delete/(:id)', function(req, res) {
    var user = { id: req.params.id }

con.query('DELETE FROM users3 WHERE id = ' + req.params.id, user, function(err, result) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)
                res.redirect('/user-list')
            } else {
                req.flash('success', 'Customer deleted successfully! id = ' + req.params.id)
                res.redirect('/user-list')
            }
        })
   })

app.listen(9000, function () {
    console.log('Connected to port 9000');
});
