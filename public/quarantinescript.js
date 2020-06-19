const myLat = document.getElementById('lat');
const myLon = document.getElementById('lon');
const myBtn = document.getElementById('btn');
const myCreds = document.getElementById('credits');
const oneWord = document.getElementById('oneW');
const yolkClick = document.getElementById('heading');
let yolkCount = document.getElementById('yolk');
let userLocStatus = document.getElementById('locStatus');
let userTextIn = document.getElementById('txtIn');
let gotWordsPara = document.getElementById('gotWords');
let otherEntries = document.getElementById('others');
let formValidator = document.getElementById('formControl');
let cred = document.getElementById('credits');
let mydata = {};
let lon = null;
let lat = null;
let gotLocation = false;


let regeX = /^[A-Za-z]+$/; //oldest regeX
//let regeX = /^[A-Za-z ]+$/gim;
//let regeX = /^[A-Za-z\S]+$/gim;
//let regeX = /^[[:alpha:]]+$/;
let regeXnums = /\d/gim;
let userTestString = userTextIn.value;


userTextIn.addEventListener('focus', () => {
    oneWord.style.textDecoration = 'underline';

    if (window.matchMedia("(max-width: 400px)").matches) {
        cred.style.visibility = 'hidden';
    }
    else {
        cred.style.visibility = 'visible';
    }

    // if(regeX.test(userTestString) == true){
    //     myBtn.disabled = false;
    //     myBtn.style.opacity = 1;
    //     //console.log('focus in : true : ' + userTestString);
    //     //formValidator.style.visibility = 'hidden';
    // }
    // else{
    //     myBtn.disabled = true;
    //     myBtn.style.opacity = 0.6;
    //     //console.log('focus in : FALSE : ' + userTestString);
    //     if(userTestString.trim().indexOf(" ") > 0){
    //         formValidator.style.visibility = 'visible';
    //         formValidator.innerText = "Please remove space after the last character.";
    //     }
    //     if(regeXnums.test(userTestString)){
    //         formValidator.style.visibility = 'visible';
    //         formValidator.innerText = "Numbers and special characters are not accepted.";
    //     }
    // }
});

userTextIn.addEventListener('blur', () => {
    cred.style.visibility = 'visible';
    formValidator.style.visibility = 'hidden';
    oneWord.style.textDecoration = 'none';

    if (userTestString !== '') {
        if (myBtn.disabled === true) {
            myBtn.style.opacity = 0.6;
        }
    }
    else {
        myBtn.style.opacity = 0;
    }
});


// new addition on 13 June 2020
// userTextIn.addEventListener('input', (event) => {

//     userTestString = event.target.value;
//     let userStr = event.target.value.trim();

//     myBtn.disabled = true;
//     myBtn.style.opacity = 0.6;
//     formValidator.style.visibility = 'hidden';

//     if(userStr !== ""){
//         if(regeX.test(event.target.value.trim()) == false){
//         myBtn.disabled = true;
//         myBtn.style.opacity = 0.6;
//         console.log('validation FAIL REGEX');
//         formValidator.style.visibility = 'visible';
//         formValidator.innerText = "Accepting only One Word with characters from the English Alphabet set. Numbers and special characters are not accepted.";
//         }
//         else {
//             myBtn.disabled = false;
//             myBtn.style.opacity = 1;
//             console.log('validation SUCCESS');
//             formValidator.style.visibility = 'hidden';
//         }
//     }
//     else{
//         myBtn.disabled = true;
//         myBtn.style.opacity = 0.6;
//     } 
    
// });


//addition by Angad 13 June 2020
function activateButton() {
    myBtn.disabled = false;
    myBtn.style.opacity = 1;
}
    
function deactivateButton() {
    myBtn.disabled = true;
    myBtn.style.opacity = 0.6;
}
    
function showForm(msg) {
    formValidator.style.visibility = 'visible';
    formValidator.innerText = msg;
}
    
function clearForm() {
    formValidator.style.visibility = 'hidden';
    formValidator.innerText = "";
}
    
userTextIn.addEventListener('input', (event) => { 
    userTestString = event.target.value;
    let userStr = event.target.value.trim();
    
    clearForm();
    deactivateButton();
    
    if (userStr) {
        if(regeX.test(event.target.value.trim()) == true){
            //console.log('validation SUCCESS');
            activateButton();
            clearForm();
        } 
        else {
            //console.log('validation FAIL REGEX');
            deactivateButton();
            showForm("Accepting only One Word with characters from the English Alphabet set. Numbers and special characters are not accepted.");
        }
    }       
});
    


//////////////////////////////


yolkClick.addEventListener('click', async function () {
    let docCountRec = await fetch('/count');
    let docCount = await docCountRec.json();
    yolkCount.textContent = docCount;
    yolkCount.style.visibility = 'visible';
    setTimeout(() => {
        yolkCount.style.visibility = 'hidden';
    }, 3000);
});

myBtn.addEventListener('click', sendToBackend);

function sendToBackend() {
    if ('geolocation' in navigator) {
        //console.log('GeoLocation available');
        //userLocStatus.textContent = 'location available';
        navigator.geolocation.getCurrentPosition(position => {
            lat = position.coords.latitude;
            lon = position.coords.longitude;
            gotLocation = true;
            //myLat.textContent = position.coords.latitude.toFixed(2);
            //myLon.textContent = position.coords.longitude.toFixed(2);

            callServer();

            setTimeout(() => {
                userTextIn.disabled = true;
                myBtn.innerText = 'Thanks';
                myBtn.disabled = true;
                myBtn.style.opacity = 0.6;
                userTextIn.style.borderColor = "#333";
                userTextIn.style.opacity = 0.6
            }, 500);

        }, handleNavigatorError);
    }
    else {
        console.log('GeoLocation NOT available');
        userLocStatus.textContent = 'location NOT available';
    }
}


function handleNavigatorError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            callServer();
            setTimeout(() => {
                userTextIn.disabled = true;
                myBtn.innerText = 'Thanks';
                myBtn.disabled = true;
                myBtn.style.opacity = 0.6;
                userTextIn.style.borderColor = "#333";
                userTextIn.style.opacity = 0.6;
            }, 500);
            console.log("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            console.log("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.");
            break;
    }
}


async function callServer() {
    mydata = {
        userLat: lat,
        userLong: lon,
        timeStamp: Date.now(),
        userInput: userTextIn.value.trim(),
    };

    const options = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(mydata)
    };

    const sendToServer = await fetch('/api', options);
    const dataFromServer = await sendToServer.json();
    //console.log(dataFromServer);

    if (gotLocation) {
        callLocationApi();
    }

    setTimeout(getFromBackendNew, 500);
}

async function callLocationApi() {
    const apiURL = `/revGeo/${lat},${lon}`;
    const responseLocn = await fetch(apiURL);
    const responseLocnJson = await responseLocn.json();
    //console.log('reverse geoCoded ' + responseLocnJson.address.city);
}


async function getFromBackendNew() {
    const responseRec = await fetch('/words');
    const dataReceived = await responseRec.json();

    let wordsString = '';
    for (let i = 0; i < dataReceived.length; i++) {
        let userWord = dataReceived[i].userInput;
        let firstChar = '';
        let otherChars = '';
        let dataString = '';
        let newUserWord = '';
        if (dataReceived[i].city) {

            for (let i = 0; i < userWord.length; i++) {
                if (i == 0) {
                    firstChar = userWord.charAt(i).toUpperCase();
                }
                else {
                    otherChars = otherChars.concat(userWord.charAt(i).toLowerCase());
                }
            }
            newUserWord = firstChar.concat(otherChars);
            dataString = '<b>' + newUserWord + '</b> ' + '<span class="curlyText"> {' + dataReceived[i].city + ', ' + dataReceived[i].country + ', ' + new Date(dataReceived[i].timeStamp).toDateString() + '}</span>. ';
            wordsString = wordsString.concat(dataString);

        }
        else {

            for (let i = 0; i < userWord.length; i++) {
                if (i == 0) {
                    firstChar = userWord.charAt(i).toUpperCase();
                }
                else {
                    otherChars = otherChars.concat(userWord.charAt(i).toLowerCase());
                }
            }
            newUserWord = firstChar.concat(otherChars);
            dataString = '<b>' + newUserWord + '</b> ' + '<span class="curlyText"> {Location Access Denied, ' + new Date(dataReceived[i].timeStamp).toDateString() + '}</span>. ';
            wordsString = wordsString.concat(dataString);
        }
    }
    gotWordsPara.innerHTML = wordsString;
    otherEntries.innerText = 'Words received:';
    // otherEntries.style.visibility = 'visible';
    // gotWordsPara.style.visibility = 'visible';
    otherEntries.style.opacity = 1;
    gotWordsPara.style.opacity = 1;

}


let colorsArr = [[243, 181, 166], [143, 82, 56], [63, 43, 40], [184, 119, 84], [182, 108, 63], [232, 200, 173], [232, 202, 197], [238, 189, 153], [182, 119, 73], [236, 219, 213], [243, 203, 176], [217, 155, 120], [229, 184, 178], [222, 176, 149], [230, 191, 168], [230, 201, 179], [184, 119, 84], [189, 135, 105], [216, 167, 139], [208, 154, 127], [231, 201, 188], [183, 98, 64], [228, 180, 154], [189, 138, 105], [173, 109, 77], [158, 93, 55], [174, 119, 95], [144, 76, 52], [208, 154, 127], [225, 160, 128], [227, 179, 153], [208, 147, 120], [230, 196, 174], [235, 217, 204], [220, 142, 146], [228, 173, 152], [219, 164, 123], [226, 211, 205], [212, 177, 163], [230, 200, 187], [220, 174, 143], [208, 148, 126], [222, 193, 180], [230, 193, 183], [225, 151, 139], [166, 95, 65], [168, 114, 84], [221, 175, 146], [235, 209, 185], [208, 143, 109], [226, 210, 199], [182, 108, 63], [158, 93, 55], [219, 164, 123], [158, 93, 55], [188, 133, 91], [187, 119, 85], [235, 168, 129], [234, 209, 193], [189, 144, 109], [132, 75, 58], [231, 188, 158], [196, 111, 61], [222, 181, 153], [245, 202, 186], [206, 133, 104], [237, 189, 163], [106, 51, 32], [244, 213, 190], [215, 136, 98], [228, 181, 160], [167, 104, 81], [239, 183, 167], [233, 219, 213], [106, 57, 41], [213, 185, 167], [208, 142, 89], [242, 182, 159], [248, 231, 223], [181, 134, 102], [210, 175, 153], [54, 41, 35], [212, 167, 141], [174, 95, 64], [80, 43, 32], [97, 53, 40], [230, 192, 177], [134, 78, 53], [232, 212, 207], [96, 54, 32], [214, 195, 187], [85, 45, 26], [224, 204, 202], [220, 174, 156], [243, 205, 202], [95, 52, 38], [150, 90, 66], [151, 96, 71], [246, 212, 198], [213, 185, 167], [199, 152, 127], [192, 143, 118], [146, 76, 41], [210, 175, 153], [208, 154, 135], [132, 67, 36], [242, 193, 181], [242, 164, 137], [212, 177, 163], [228, 181, 168], [197, 136, 127], [217, 147, 124], [240, 203, 180], [206, 133, 104], [232, 215, 199], [230, 192, 177], [81, 44, 33], [155, 84, 50]];

setInterval(() => {
    let randomColor = Math.floor(Math.random() * colorsArr.length);
    document.body.style.backgroundColor = 'rgb(' + colorsArr[randomColor][0] + ',' + colorsArr[randomColor][1] + ',' + colorsArr[randomColor][2] + ')';
    myCreds.style.backgroundColor = 'rgb(' + colorsArr[randomColor][0] + ',' + colorsArr[randomColor][1] + ',' + colorsArr[randomColor][2] + ')';
}, 6500);

console.log('made by Karan Dudeja, http://kdo.fyi');