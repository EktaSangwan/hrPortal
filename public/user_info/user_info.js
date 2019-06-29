$(document).ready(function () {
    var currentuser = JSON.parse(sessionStorage.getItem('currentUser'));
    document.getElementById('userFirstName').innerHTML = currentuser.firstName;
    document.getElementById('userLastName').innerHTML = currentuser.lastName;
    document.getElementById('userJoining').innerHTML += currentuser.doj;
    document.getElementById('userEndDate').innerHTML += currentuser.endDate;
    var pp = document.getElementById('disPP');

    if (currentuser.profilePicture != "" && currentuser.isApproved) {
        pp.src = "data:image/png;base64," + currentuser.profilePicture;
    } else {
        pp.src = "https://cdn.pixabay.com/photo/2017/08/04/11/16/cute-2579862_960_720.jpg";
    }

    if (currentuser.isApproved) {
        document.getElementById("upload-file").hidden = true;
        document.getElementById("uploader-btn").disabled = true;
    }

});


function uploadFile() {

    var data = new FormData(),
        request;

    data.append('myFile', document.getElementById('upload-file').files[0]);

    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            console.log(request.responseText);
            let response = JSON.parse(request.responseText);
            if (response.success) {
                var currentuser = JSON.parse(sessionStorage.getItem('currentUser'));
                currentuser.isUploaded = true;
                currentuser.fileId = response.fileId;
                currentuser.googleDataId = response.googleDataId;
                currentuser.fileName = response.fileName;
                currentuser.isApproved = false;
                currentuser.isRejected = false;
                updateUserData(currentuser);
            }
        }
    }

    request.open('POST', '/file/uploads');

    request.send(data);

}

function updateUserData(userInput) {
    let http = new XMLHttpRequest();

    http.open('PUT', "/api/users", true);

    http.setRequestHeader('Content-type', 'application/json');

    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            sessionStorage.setItem('users', http.responseText);
        }
    }
    http.send(JSON.stringify(userInput));
}

function uploadAttendance() {
    var data = new FormData(),
        request;

    data.append('myAttendance', document.getElementById('attendance-file').files[0]);

    var request = new XMLHttpRequest();
    var currentuser = JSON.parse(sessionStorage.getItem('currentUser'));
    let url = "/file/uploads/attendance/?firstName=" +currentuser.firstName;
    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            let response = JSON.parse(request.responseText);
            if (response.success) {
                update
            }
        }
    }

    request.open('POST', url);

    request.send(data);
}