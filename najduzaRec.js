var inputs = document.querySelectorAll(".square");
var btnSearch = document.getElementById("search");
var div = document.querySelector("#search-results");
var form = document.querySelector('#submit');
var feedbackEl = document.querySelector('#feedback');


var allWords;
var letters = [];
var foundedWords = [];
var keepSearching = true;


window.onload = fetchAllWords().then(words => allWords = words);

async function fetchAllWords() {

    let data = await fetch("./baza-reci.json");
    return data.json();
}

btnSearch.addEventListener("click", convertInputsToUppercase);
inputs.forEach(input => input.addEventListener("keyup", getInput));

function displaySpinner() {
    div.innerHTML = `
            <div class="lds-spinner spinner-adjust">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>`;
    setTimeout(() => proccessWithWords(), 1000);// one sec spinner looks good
}

function proccessWithWords() {
    let longestWords = [...allWords];
    let longestWordsTwo = longestWords.filter(word => word.length > 10);
    localStorage.setItem('longest', JSON.stringify(longestWordsTwo));

    allWords.forEach(function getLongestWord(word) {

        searchLongestWord(word);

    });
    checkFoundedWords();

}

function searchLongestWord(word) {
    /*
    this function is responsible for finding longest words using recursion.
    By checking first letter of the word, if we have that letter in inputs, increase our 
    founded counter by 1, check if founded counter is equal to word length (if so, the word is valid to push into array),
    and than remove that letter from inputs. Repeat this step for the next letter in word. 
    If we find any letter in word but not in inputs, skip the word (we cant have that word).
    */

    let temp = word;
    var countIndex = 0;
    var founded = 0;


    function compare(inputChars) {
        if (founded >= word.length) {
            foundedWords.push(temp);
            return;
        }

        let currentChar = temp.charAt(countIndex);
        let currentIndex = inputChars.indexOf(currentChar)
        let inputsArray = [...inputChars];

        if (inputsArray.includes(currentChar) && countIndex < word.length) {
            inputsArray.splice(currentIndex, 1);
            countIndex++;
            founded++;
            compare(inputsArray);
        }
        else {
            return;
        }

    }
    compare(letters);

}

function checkFoundedWords() {
    if (foundedWords) {
        div.innerHTML = "";
        if (foundedWords.length > 1) {
            sortWordsByLength(foundedWords);
            displayWordsOnScreen(foundedWords);
        } else {
            displayNoWordsFound();
        }
    } else {
        displayNoWordsFound();
    }
}

function displayNoWordsFound() {
    let newEl = document.createElement("h4");
    newEl.textContent = foundedWords[0] || "NIJE PRONADJENA REC U BAZI";
    div.appendChild(newEl);
}

function sortWordsByLength(wordsArray) {
    return wordsArray.sort(function (a, b) {
        if (a.length > b.length) {
            return -1;
        } else if (b.length > a.length) {
            return 1;
        } else {
            return 0;
        }
    })
}
function displayWordsOnScreen(sortedWords) {
    sortedWords.forEach(function (item) {
        let newEl = document.createElement("h4");
        newEl.textContent = item + ` (${item.length})`;
        div.appendChild(newEl);
    })
}

function convertInputsToUppercase() {
    //global variable letters set to empty in case new game started
    letters = [];
    inputs.forEach(function (input) {
        if (input.value === "") {
            return;
        }
        else {
            letters.push(input.value.toUpperCase());
        }
    });
    if (inputs.length <= 10) {
        return;
    }

    displaySpinner();
}

function getInput(e) {
    // cleaning previous results
    while (div.firstElementChild) {
        div.firstElementChild.remove();
    }
    //we will stop search if word over 10 letters is founded;
    keepSearching = true;
    //if backspace is pressed, we want to go back one square;

    if (e.keyCode == 8) {
        e.target.value = "";
        return e.target.previousElementSibling.focus();
    }

    checkZandJ(e);
    feedback(e);
}

function checkZandJ(e) {
    /*
    purpose of this function is just to check that provided input is J or Z.
    Why? -> Serbian alphabet contains special chars that are combination of two latinic letters:  'Lj', 'Nj', 'Dz'.
    So when someone type 'N', 'L' or 'D' inside app, we need to check what is the next user input. If it is 'J' or 'Z'
    than we have only one letter actualy, not two.
    */

    if (e.target.value.toUpperCase() == 'L' || e.target.value.toUpperCase() == 'N' || e.target.value.toUpperCase() == 'D') {
        e.target.maxLength = 2;
    } else {
        e.target.maxLength = 1;
    }
    if (e.target.value.length === 2) {
        let check = e.target.value.charAt(1).toUpperCase();
        let trueCheck = check == "J" || check == 'Z'; //will pick true if J or Z appears on anyside 

        if (!trueCheck) {
            e.target.value = '';
            e.target.maxLength = 1;
        }
    }
}

function removeFeedback() {
    //cleaning the feedback text, if any
    setTimeout(remove => {
        feedbackEl.textContent = '';
    }, 2000);
}

function feedback(e) {
    //if user entered numbers instead of letters, tryMultiply will result in number, and  wont be NaN
    var tryMultiply = e.target.value * 5;
    var checkNaN = isNaN(tryMultiply);

    if (e.target.value === "") {
        e.target.style.borderColor = "rgb(0, 0, 0)";
    }
    else if (!checkNaN) {
        e.target.value = "";
    }
    if (e.target.value != "") {
        e.target.style.borderColor = "rgb(247, 169, 70)";
    }
    if (e.target.value.toUpperCase() == 'L' || e.target.value.toUpperCase() == 'N' || e.target.value.toUpperCase() == 'D') {
        return e.target.focus();
    } else if (
        e.target.value.toUpperCase() == 'Q' ||
        e.target.value.toUpperCase() == 'W' ||
        e.target.value.toUpperCase() == 'Y' ||
        e.target.value.toUpperCase() == 'X'
    ) {
        e.target.value = "";
        feedbackEl.textContent = `SLOVO ${e.target.value} NIJE VALIDNO`;
        removeFeedback();
    }
    else {
        e.target.nextElementSibling.focus();
    }
}