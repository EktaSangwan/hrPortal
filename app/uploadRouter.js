'use strict';

const fs = require('fs');
const readline = require('readline');
const {
    google
} = require('googleapis');
var multer = require('multer');

// var drive = google.drive({
//     version: 'v3',
//     auth: auth.oAuth2Client,
// });
var upload = multer({
    dest: 'uploads/'
});
const storage = multer.diskStorage({
    /* 'some-destination' */
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

const TOKEN_PATH = 'app/assets/token.json';

const SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets'
];

var credentials = require('./assets/credentials.json');

function authorize(credentials, callback, file, res, queryParam) {
    const {
        client_secret,
        client_id,
        redirect_uris
    } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client, file, res, queryParam);
    });
}

function listFiles(auth, file, res) {
    const drive = google.drive({
        version: 'v3',
        auth
    });
    drive.files.list({
        pageSize: 10,
        fields: 'nextPageToken, files(id, name)',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const files = res.data.files;
        if (files.length) {
            files.map((file) => {
                console.log(`${file.name} (${file.id})`);
            });
        } else {
            console.log('No files found.');
        }
    });
}

function uploadTodrive(auth, file, res, queryParam) {
    console.log(queryParam);
    const drive = google.drive({
        version: 'v3',
        auth
    });
    let fileMetadata = {
        'name': file['originalname'] ? file['originalname'] : "testfile",
        'parents': ["1PJX-eysd37XFD52E9xnzMvPuoeOgpa8r"],
    };

    let media = {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.path)
    };

    drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
    }, function (err, response) {
        if (err) {
            // Handle error
            console.error(err);
            return res.send({
                success: false,
                err: err
            });
        } else {
            console.log("getting something");
            console.log(queryParam);
            updateUserAttendance(auth, res, queryParam)
        }
    });
}

function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log(authUrl);
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('Enter the code from that page here: GET /oauthCallback?code=', (code) => {
        console.log(code);
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

function updateUserAttendance(auth, res, queryParam){
    let sheets = google.sheets('v4');
    let date = new Date();
    let day = date.getDate() +"-" +date.getMonth()+"-"+date.getFullYear() ;
    let time = date.getHours() +":"+date.getMinutes() +":"+date.getSeconds() ;
    console.log(queryParam);
    sheets.spreadsheets.values.append({
      auth: auth,
      spreadsheetId: '1ohO7pN-phG4dG6wZksFZq8cfHzOmaQc_2aIlqivw7DI',
      range: 'sheet1!A2:B', //Change sheet1 if your worksheet's name is something else
      valueInputOption: "USER_ENTERED",
     
      resource: {
        majorDimension: "COLUMNS",
        values: [ [day], [time],[queryParam] ]
      }
    }, (err, response) => {
      if (err) {
        console.log('The API returned an error: ' + err);
        return;
      } else {
          res.send({
              success:true
          });
          console.log("Appended");
      }
    });
}

module.exports = function (app) {

    /* ======================================================================== */
    /* ================= Upload Document Related API ========================== */
    /* ======================================================================== */
    // Profile picture upload
    app.post('*/file/uploadpp', upload.single('photo'), (req, res) => {
        if (req.file) {
            res.json(req.file);
            console.log('picture received');
        } else throw 'error';
    });


    // Zip single upload handler
    // It should match the name field of the input type file on html
    app.post('*/file/uploads', upload.single('myFile'), function (req, res) {
        console.log("api is being approached");
        if (!req.file) {
            console.log("No file received");
            return res.send({
                success: false
            });
        } else {
            console.log('file received');
            const file = req.file;
            authorize(credentials, uploadTodrive, file, res);
        }
    });


    app.post('*/file/uploads/attendance/*', upload.single('myAttendance'), function (req, res) {
        if (!req.file) {
            console.log("No file received");
            return res.send({
                success: false
            });
        } else {
            console.log('file received');
            const file = req.file;
            var firstName = req.query.firstName;
            authorize(credentials, uploadTodrive, file, res, firstName);
        }
    });

    //Uploading multiple files
    app.post('/file/uploadmultiple', upload.array('myFiles', 12), (req, res, next) => {
        const files = req.files
        if (!files) {
            const error = new Error('Please choose files')
            error.httpStatusCode = 400
            return next(error)
        }
        res.send(files);
    })

};