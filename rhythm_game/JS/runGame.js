// func to set html values
function setValues(htmlID, ypos, yunit, itemHeight, itemWidth, itemOpacity) {
    const obj = document.getElementById(htmlID);
    obj.style.top = ypos + yunit;
    obj.style.width = itemWidth + "px";
    obj.style.height = itemHeight + "px";
    obj.style.opacity = itemOpacity;

    // prevent scrollbars
    document.body.style.overflow = 'hidden';
}

//17 vh per beat--timing array for falling notes (referenced later)
const timing = [
    [-172, -36, 2, -36, -2,     -36,  -240, -240, -240, -172, -172, -308, -1000000],
    [-138, -36,    -70, -53,    -121, -240, -240, -70,  -172, -172, -444, -1000000],
    [-104, -53,    15, -36,     -206, -240, -240, -36,  -104, -172, -580, -1000000],
    [-70,  -2,     32, -36, -2, -121, -240, -240, -53,  -36,  -172, -716, -1000000],
]

// note class objects
const note1 = new Note("note1", -36, "./images/note.png", 144, 48, 'd');
const note2 = new Note("note2", -104, "./images/note.png", 144, 48, 'f');
const note3 = new Note("note3", -172, "./images/note.png", 144, 48, 'j');
const note4 = new Note("note4", -240, "./images/note.png", 144, 48, 'k');

// note html
const noteHTML1 = document.getElementById("note1");
const noteHTML2 = document.getElementById("note2");
const noteHTML3 = document.getElementById("note3");
const noteHTML4 = document.getElementById("note4");

// arrays containing diff types to ref notes
let arrNoteIDS = ["note1", "note2", "note3", "note4"];
let arrNotes = [note1, note2, note3, note4];
let arrNotesHTML = [noteHTML1, noteHTML2, noteHTML3, noteHTML4];

// bar object
const bar1 = new Bar("bar1", 78, 50, 600, 0.5);

// sounds
const tap = new Audio("./sounds/noteCut.mp3");
const song = new Audio("./sounds/songCut.mp3");

// function to initialize on load
function setup() {
    setValues("bar1", 78, "vh", 50, 600, 0.5);
    setValues("note1", -36, "vh", 48, 144, 1);
    setValues("note2", -104, "vh", 48, 144, 1);
    setValues("note3", -172, "vh", 48, 144, 1);
    setValues("note4", -240, "vh", 48, 144, 1);
}
// load window
window.onload = setup();


// calculate accuracy given two y-values
function calcAccuracy(noteY, barY) {
    console.log(noteY);
    console.log(barY);

    // set diff depending on if note further down or if bar further down
    let diff = noteY - barY; 
    if (diff < 0) {
        diff = barY - noteY;
    }

    // set to pixels to compare to the 50px height of note
    diff = diff/100 * window.innerHeight;
    console.log(diff);

    // initialize status message + set accuracy
    let status = "MISS";
    let accuracy = (150-diff)/150;

    // any sort of miss (out of range)
    if (diff > 150) {
        status = "MISS";
        accuracy = 0;
    }

    // other accuracy settings based on accuracy
    else if (0 < accuracy && accuracy <= .50) {
        status = "BAD";
    } else if (.50 < accuracy && accuracy <= .60) {
        status = "GOOD";
    } else if (.70 < accuracy && accuracy <= .85) {
        status = "GREAT";
    } else if (.85 < accuracy && accuracy <= 1) {
        status = "PERFECT";
    }

    // return
    return {status, accuracy};
}


// counters on html page
const accCounter = document.getElementById("accuracy1");
const statusMarker = document.getElementById("status1");

// update accuracy total (average of each note accuracy)
let totalAcc = 0;
let numNotes = 0;
function updateAccuracy(oldAcc, n, addAcc) {
    if (n <= 0) {
        return oldAcc;
    } else if (n == 1) {
        oldAcc = addAcc;
    } else {
        oldAcc = (oldAcc * (n-1) + addAcc)/n;
    }
    return oldAcc;
}


// run program/game
function runProgram() {
    let numTracks = arrNotes.length;

    // for loop for each note (4 notes, one per track)
    for (let i = 0; i < numTracks; i++) {
        // note moves down
        arrNotes[i].noteScroll();
        arrNotesHTML[i].style.top = arrNotes[i].y + "vh";
        
        // check if pressed
        if (arrNotes[i].pressed == true) {
            tap.play();
            numNotes++;

            // set status and accuracy of note
            console.log(arrNotes[i]);
            const {status, accuracy} = calcAccuracy(arrNotes[i].y, bar1.y);
            arrNotes[i].status = status;
            arrNotes[i].accuracy = accuracy;

            // update accuracy and status markers on html
            totalAcc = updateAccuracy(totalAcc, numNotes, accuracy);
            accCounter.innerHTML = (totalAcc*100).toFixed(1) + "%";
            statusMarker.innerHTML = status;
            
            // set to new position for next note and reset pressed
            arrNotes[i].y = timing[i][arrNotes[i].order] - (100-arrNotes[i].y);
            arrNotesHTML[i].style.top = arrNotes[i].y + "vh";
            arrNotes[i].order++;
            arrNotes[i].pressed = false;
        }

        // complete miss of note (off of page, no press)
        if (arrNotes[i].y >= 100) {
            numNotes++;

            // update markers on html page
            totalAcc = updateAccuracy(totalAcc, numNotes, 0);
            accCounter.innerHTML = (totalAcc*100).toFixed(1) + "%";
            statusMarker.innerHTML = "MISS";

            // set to new position for next note
            arrNotes[i].y = timing[i][arrNotes[i].order]
            arrNotesHTML[i].style.top = arrNotes[i].y + "vh";
            arrNotes[i].order++;
        }
    }
}


// key event listener
document.addEventListener('keydown', function(event) {
    const key = event.key;
    for (let i = 0; i < 4; i++) {
        // compare which note pressed
        if (key == arrNotes[i].key && arrNotes[i].y >= 0) {
            arrNotes[i].pressed = true;
        }
    }
});

// song over event listener--was intended for "play again"
var songFin = false;
song.addEventListener("ended", function() {
    songFin = true;
})


// interval (global)
var myIntervalID1;

// play game (also play song)
function startGame() {
    setup();
    song.play();
    myIntervalID1 = setInterval(runProgram, 17);

    // don't let start again in middle of song
    document.getElementById("startBtn").disabled = true;
}