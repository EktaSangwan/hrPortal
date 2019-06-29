var User = require('./models/user');
var multer = require('multer');
var fs= require('fs');


var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads/images')
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now())
    }
});
var upload = multer({storage: storage});





function getUsers(res) {
    User.find(function (err, users) {


        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err) {
            res.send(err);
        }

        res.json(users); // return all users in JSON format
    });
};

module.exports = function (app) {

    /* ======================================================================== */
    /* ==================== User Management API =============================== */
    /* ======================================================================== */

    app.get("*/api/users", (req, res, next) => {
        User.find({})
            .exec()
            .then(docs => {
                res.status(200).json({
                    docs
                });
                //console.log(docs);
            })
            .catch(err => {
                console.log(err)
            });
    });


    //get user by params
    app.post('*/api/userDetails', function (req, res) {
        console.log(req.body.firstName);
        User.findOne({
            firstName: req.body.firstName
        }, function (err, user) {
            if (err) {
                res.json([]);
            } else {
                console.log(user);
                res.json(user);
            }
        });

    });

    // create user and send back all users after creation
    app.post('*/api/users', function (req, res) {
        let isUploaded = false;
        let isApproved = false;
        // if(req.body.profilePicture != "") {
        //     isUploaded = true;
        // }
        User.create({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                doj: req.body.doj,
                endDate: req.body.endDate,
                profilePicture: req.body.profilePicture,
                isUploaded: isUploaded,
                isApproved: isApproved
            },
            function (err, user) {
                if (err) {
                    return res.send(err);
                } else
                    // get and return all the users after you create another
                    getUsers(res);
            });

    });

    // create user and send back all users after creation
    app.put('*/api/users', function (req, res) {
        let query = {
            _id: req.body._id
        };
        let newvalues = {
            $set: req.body
        }

        console.log(newvalues);
        User.updateOne(query, newvalues, function (err, user) {
            if (err) {
                console.log(err);
                return res.send(err);
            } else
                // get and return all the users after you create another
                console.log(user);
            getUsers(res);
        });

    });

    // delete a user
    app.delete('*/api/users/:user_id', function (req, res) {
        User.remove({
            _id: req.params.user_id
        }, function (err, user) {
            if (err)
                res.send(err);
            getUsers(res);
        });
    });

    // /////Profile picture upload
    // app.post('/uploads', upload.single('photo'), (req, res) => {
    //     if (req.file) {
    //         res.json(req.file);
    //     }
    //     else throw 'error';
    // });
    



    app.post('/upload/photo', upload.single('myImage'), (req, res) => {
        var img = fs.readFileSync(req.file.path);
     var encode_image = img.toString('base64');
     // Define a JSONobject for the image attributes for saving to database
      
     var profilePicture = {
          contentType: req.file.mimetype,
          image:  new Buffer(encode_image, 'base64')
       };
    User.create(profilePicture, (err, result) => {
        console.log(result)
     
        if (err) return console.log(err)
     
        console.log('saved to database')
        res.redirect('/')
       
         
      });
    });



    // application startup -------------------------------------------------------------
    app.get('*', function (req, res) {
        // load the html form on localhost:port_number
        res.sendFile(__dirname + '/public/index.html');
    });




};