$(document).ready(function () {
    document.getElementById('doj').value = moment(new Date).format("YYYY-MM-DD");
    document.getElementById('ed').value = moment(new Date).format("YYYY-MM-DD");

    //on page load keep the user list populated------------START
    $.ajax({
        url: "api/users",
        dataType: "json",
    }).done((data) => {
        if (data) {
            createDataTable(data.docs);
        }
    }).fail((err) => {
        console.log("Error");
    });

});


function createDataTable(data) {
    let odata = data;
    sessionStorage.setItem('users', JSON.stringify(odata));
    $('#myTable > tbody').empty();
    odata.forEach(item => {
        // Non approved users added to table
        if (!item.isApproved) {
            $('#myTable > tbody:last-child').append(getRowHtml(item));
        } else {
            //In future if some case required to handle approved users data
        }
    });
}

function getRowHtml(item) {
    var thtml = getTD(item.firstName) +
        getTD(item.lastName) +
        getTD(item.doj) +
        getTD(item.endDate) +
        getApproveBtn(item);

    thtml = getTR(thtml);
    return thtml;
}

function getTD(val) {
    return '<td>' + val + '</td>';
}

function getTR(val) {
    return '<tr>' + val + '</tr>';
}

function getApproveBtn(val) {
    if (val.isUploaded) {
        return `<td><button type="button" id="` + val._id + `" onclick="updateUploadStatus(event, true)" class="btn btn-default btn-sm "><span class="far fa-check-circle"></span> Approve </button>
            <button type="button" id="` + val._id + `" onclick="updateUploadStatus(event, false)" class="btn btn-default btn-sm "><span class="fa fa-trash-alt"></span> Reject </button></td>`;
    } else {
        return '<td><button type="button" disabled id="approveButton" class="btn btn-default btn-sm "><span class="far fa-check-circle"></span> Approve </button></td>';
    }
}

function findDuration() {
    let doj = document.getElementById("doj").value;
    let ed = document.getElementById("ed").value;
    console.log(doj);
    console.log(ed);
    let dateB = moment(doj);
    let dateC = moment(ed);
    let noDays = dateC.diff(dateB, 'days');
    let duration = document.getElementById("drn").innerHTML = "Worked for" + noDays + "days";
    console.log(duration);
}

async function createUser() {
    let fname = document.getElementById('firstname').value;
    let lname = document.getElementById('lastname').value;
    let doj = document.getElementById('doj').value;
    let ed = document.getElementById('ed').value;
    let pp = document.getElementById("ppInput").files[0];
    let imageString = "";

    if (pp) {
        let fileReader = new FileReader();
        const resizedImg = await resizeImage(pp);
        fileReader.readAsDataURL(resizedImg);
        fileReader.onload = function (readerEvent) {
            document.getElementById('preview').src = fileReader.result;
            document.getElementById('preview').hidden = false;
            imageString = fileReader.result.split(';base64,')[1];
            let userInput = {
                firstName: fname.toLowerCase(),
                lastName: lname.toLowerCase(),
                doj: doj,
                endDate: ed,
                profilePicture: imageString
            };
            uploadUserData(userInput);
        };
    } else {
        let userInput = {
            firstName: fname.toLowerCase(),
            lastName: lname.toLowerCase(),
            doj: doj,
            endDate: ed,
            profilePicture: imageString
        };
        uploadUserData(userInput);
    }
}

function uploadUserData(userInput) {
    console.log(userInput)
    let http = new XMLHttpRequest();

    http.open('POST', "/api/users", true);

    http.setRequestHeader('Content-type', 'application/json');

    http.onreadystatechange = function () {
        //Call a function when the state changes.
        if (http.readyState == 4 && http.status == 200) {
            sessionStorage.setItem('users', http.responseText);
            createDataTable(JSON.parse(http.responseText));
            document.getElementById('firstname').value = "";
            document.getElementById('lastname').value = "";
            document.getElementById('doj').value = moment(new Date).format("YYYY-MM-DD");
            document.getElementById('ed').value = moment(new Date).format("YYYY-MM-DD");
            

            document.getElementById("ppInput").value = null;
        }
    }
    http.send(JSON.stringify(userInput));
}

function getAllUsers() {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {}
    }
    xmlHttp.open("GET", "/api/users", true);
    xmlHttp.send(null);
}

async function updateUploadStatus(event, status) {
    let users = await JSON.parse(sessionStorage.getItem('users'));

    let currentUser = users.find(e => e._id === event.target.id);

    if(status) {
        currentUser.isApproved = true;
        currentUser.isRejected = false;
    }
    else {
        currentUser.isApproved = false;
        currentUser.isRejected = true;
        currentUser.fileId = "";
        currentUser.fileName = "";
        currentUser.googleDataId = "";
    }

    let http = new XMLHttpRequest();

    http.open('PUT', "/api/users", true);

    //Send the proper header information along with the request
    http.setRequestHeader('Content-type', 'application/json');

    http.onreadystatechange = function () {
        //Call a function when the state changes.
        if (http.readyState == 4 && http.status == 200) {
            sessionStorage.setItem('users', http.responseText);
            createDataTable(JSON.parse(http.responseText));
        }
    }

    http.send(JSON.stringify(currentUser));
}

var resizeImage = function (file) {
    var maxSize = 100;
    var reader = new FileReader();
    var image = new Image();
    var canvas = document.createElement('canvas');
    var dataURItoBlob = function (dataURI) {
        var bytes = dataURI.split(',')[0].indexOf('base64') >= 0 ?
            atob(dataURI.split(',')[1]) :
            unescape(dataURI.split(',')[1]);
        var mime = dataURI.split(',')[0].split(':')[1].split(';')[0];
        var max = bytes.length;
        var ia = new Uint8Array(max);
        for (var i = 0; i < max; i++)
            ia[i] = bytes.charCodeAt(i);
        return new Blob([ia], { type: mime });
    };
    var resize = function () {
        var width = image.width;
        var height = image.height;
        if (width > height) {
            if (width > maxSize) {
                height *= maxSize / width;
                width = maxSize;
            }
        } else {
            if (height > maxSize) {
                width *= maxSize / height;
                height = maxSize;
            }
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(image, 0, 0, width, height);
        var dataUrl = canvas.toDataURL('image/jpeg');
        return dataURItoBlob(dataUrl);
    };
    return new Promise(function (ok, no) {
        if (!file.type.match(/image.*/)) {
            no(new Error("Not an image"));
            return;
        }
        reader.onload = function (readerEvent) {
            image.onload = function () { return ok(resize()); };
            image.src = readerEvent.target.result;
            console.log(readerEvent.target.result);
        };
        reader.readAsDataURL(file);
    });
};