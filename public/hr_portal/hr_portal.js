
$(document).ready(function () {
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();


    var calendar = $('#calendar').fullCalendar({
        editable: false,

        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        },



        events: [
            { start: "Jan 01, 2019", title: "New Year's Day", color: "red" }, { start: "Jan 14, 2019", title: "Makar Sankranti / Pongal", color: "red" }, { start: "Jan 26, 2019", title: "Republic Day", color: "red" }, { start: "Mar 04, 2019", title: "Maha Shivaratri", color: "red" }, { start: "Mar 21, 2019", title: "Holi", color: "red" }, { start: "Apr 06, 2019", title: "Ugadi / Gudi Padwa", color: "red" }, { start: "Apr 13, 2019", title: "Ram Navami", color: "red" }, { start: "Apr 17, 2019", title: "Mahavir Jayanti", color: "red" }, { start: "Apr 19, 2019", title: "Good Friday", color: "red" }, { start: "May 01, 2019", title: "Labor Day", color: "red" }, { start: "May 18, 2019", title: "Budhha Purnima", color: "red" }, { start: "Jun 05, 2019", title: "Eid-ul-Fitar", color: "red" }, { start: "Jul 04, 2019", title: "Rath Yatra", color: "red" }, { start: "Aug 12, 2019", title: "Bakri Id / Eid ul-Adha", color: "red" }, { start: "Aug 15, 2019", title: "Raksha Bandhan", color: "red" }, { start: "Aug 15, 2019", title: "Independence Day", color: "red" }, { start: "Aug 24, 2019", title: "Janmashtami", color: "red" }, { start: "Sep 02, 2019", title: "Vinayaka Chaturthi", color: "red" }, { start: "Sep 10, 2019", title: "Muharram", color: "red" }, { start: "Sep 11, 2019", title: "Onam", color: "red" }, { start: "Oct 02, 2019", title: "Mathatma Gandhi Jayanti", color: "red" }, { start: "Oct 08, 2019", title: "Dussehra / Dasara", color: "red" }, { start: "Oct 27, 2019", title: "Diwali / Deepavali", color: "red" }, { start: "Nov 10, 2019", title: "Milad un Nabi", color: "red" }, { start: "Nov 12, 2019", title: "Guru Nanak's Birthday", color: "red" }, { start: "Dec 25, 2019", title: "Christmas", color: "red" }
        ],


    });



});




const input = document.getElementById("searchText");

if (input) {
    input.addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            document.getElementById("searchButton").click();
        }
    });
}



async function getEmployee() {

    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "/api/userDetails", true);
    xmlHttp.setRequestHeader('Content-type', 'application/json');

    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            let obj;
            if (xmlHttp.responseText != "null") {
                obj = JSON.parse(xmlHttp.responseText);
                document.getElementById('data1').innerHTML = obj.firstName;
                document.getElementById('data2').innerHTML = obj.lastName;
                document.getElementById('data3').innerHTML = obj.doj;
                document.getElementById('data4').innerHTML = obj.endDate;
                if(obj.isApproved){
                    document.getElementById('data5').innerHTML = "Approved";
                }
                else if(!obj.isApproved){
                    if(obj.isRejected) {
                        document.getElementById('data5').innerHTML = "Rejected. Upload again!";
                    }
                    else {
                        if(obj.isUploaded){
                            document.getElementById('data5').innerHTML = "Pending";
                        }
                        else {
                            document.getElementById('data5').innerHTML = "Upload Pending";
                        }
                        
                    }
                }
                sessionStorage.setItem('currentUser', JSON.stringify(obj));
            }
            else {
                document.getElementById('data1').innerHTML = '';
                document.getElementById('data2').innerHTML = '';
                document.getElementById('data3').innerHTML = '';
                document.getElementById('data4').innerHTML = '';
                window.alert("No record found");
            }


        }
    }

    let payload = {
        "firstName": document.getElementById("searchText").value,
        "lastName": "",
        "doj": "",
        "endDate": ""
    }

    xmlHttp.send(JSON.stringify(payload));

}

