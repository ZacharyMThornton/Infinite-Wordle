// html constants
const answerBox = document.getElementById('answer');
const board = document.getElementById('text-board');
const rows = document.getElementsByClassName('row');
const keyboard = document.getElementById('keyboard');
const keyboardRows = keyboard.children;
const topRow = Array.from(keyboardRows[0].children);
const midRow = Array.from(keyboardRows[1].children);
const bottomRow = Array.from(keyboardRows[2].children);

let letters = topRow.concat(midRow, bottomRow);

// row and count of the cursor
let playerRow = 0; // row that you first start at is 0
let count = 0;

// set game variables
let words = []
let answer;

// fetch game variables from json file
fetch('words.json')
  .then(response => response.json()) // Parse JSON
  .then(data => {
    // Access the "words" array
    randIndex = Math.floor((14854)*Math.random());
    words = data.words;
    answer = words[randIndex]

  })
  .catch(error => console.error('Error loading JSON:', error));

// test if an input is a character
function isLetter(char){
    return /^[a-zA-Z+$]/.test(char);
}

// make sure the user has entered all possible letters they can
function isFilled(boxes){
    filled = true;
        for (let i = 0; i < boxes.length; i++){
            if (boxes[i].innerText == ''){
                filled = false;
                break;
            }
        }
    return filled;
}

// make sure the user made a valid guess
function isValidGuess(guess){
    valid = false
    for (let i = 0; i < words.length; i++){
        if (words[i] === guess){
            valid = true;
            break;
        }
    }
    
    return valid;
}

function itemCount(item, array){
    count = 0;
    for (let i = 0; i < array.length; i++){
        if (array[i] == item){
            count++;
        }
    }
    return count;
}

// finds the letters in the guess that are in the correct position
function perfectLetters(guess){
    letterIndices = [];
    for (let i = 0; i < 5; i++){
        if (answer[i] == guess[i].toLocaleLowerCase()){
            letterIndices.push(i);
        }
    }
    return letterIndices;
}

function correctLetters(guess, perfect) {
    let letterIndices = [];
    let answerCounts = {};  // Track letter counts in the answer
    let usedCounts = {};    // Track how many times each letter has been used for "misplaced" marking

    // Count occurrences of each letter in the answer
    for (let i = 0; i < answer.length; i++) {
        let letter = answer[i].toLowerCase();
        answerCounts[letter] = (answerCounts[letter] || 0) + 1;
    }

    // Reduce counts for perfect matches
    for (let index of perfect) {
        let letter = guess[index].toLowerCase();
        answerCounts[letter]--;  // Reduce available occurrences
    }

    // Find misplaced letters
    for (let j = 0; j < guess.length; j++) {
        let letter = guess[j].toLowerCase();
        if (perfect.includes(j)) continue; // Skip perfect matches

        // If the letter exists in the answer and there are remaining unmatched occurrences
        if (answerCounts[letter] > (usedCounts[letter] || 0)) {
            letterIndices.push(j);
            usedCounts[letter] = (usedCounts[letter] || 0) + 1; // Track used occurrences
        }
    }

    return letterIndices;
}

function wrongLetters(guess){
    letterIndices = [];
    let guessArray = guess.split('');
    let answerSet = new Set(answer);
    guessArray.forEach((item, index) => {
        if (!answerSet.has(item.toLowerCase())){
            letterIndices.push(index);
        }
    })
    
    return letterIndices
    
}

let guess = '';

// listen for keydown
document.addEventListener('keydown', function() {
    // get each box in the current row
    boxes = rows[playerRow].children;

    // reset the row animation
    for (let i = 0; i < boxes.length; i++){
        boxes[i].style.removeProperty('animation');
    }

    if (isLetter(event.key) && (event.key).length == 1){
        if (boxes[count].innerText != '' && count < 4){
            count += 1;
        }
        if (boxes[count].innerText == ''){
            boxes[count].innerText = (event.key).toUpperCase();
            count = count == 4 ? 4: count + 1;
        }

    } else if (event.key == 'Backspace'){
        // if the player hits the back space
        if (boxes[count].innerText == '' && count > 0){
            count -= 1;
        }
        boxes[count].innerText = '';
        count = count == 0 ? 0 : count - 1;

    } else if (event.key == 'Enter' && isFilled(boxes)){
        // if the player hits the enter button
        // game logic here
        for (let i = 0; i < boxes.length; i++){
            guess += boxes[i].innerText;
        }

        if (isValidGuess(guess.toLocaleLowerCase())){
            let perfect = perfectLetters(guess);

            let correct = correctLetters(guess, perfect);

            let wrong = wrongLetters(guess);

            for (let i = 0; i < correct.length; i++){
                boxes[correct[i]].style.backgroundColor = 'blue';
                for (let j = 0; j < letters.length; j++){
                    if (letters[j].innerText == boxes[correct[i]].innerText && letters[j].style.backgroundColor != 'green')
                        letters[j].style.backgroundColor = 'blue';
                }
            }

            for (let i = 0; i < perfect.length; i++){
                boxes[perfect[i]].style.backgroundColor = 'green';
                for (let j = 0; j < letters.length; j++){
                    if (letters[j].innerText == boxes[perfect[i]].innerText)
                        letters[j].style.backgroundColor = 'green';
                }
            }
            
            for (let i = 0; i < boxes.length; i++){
                if (boxes[i].style.backgroundColor == ''){
                    boxes[i].style.backgroundColor = '#303030'
                }
            }

            for (let i = 0; i < wrong.length; i++){
                for (let j = 0; j < letters.length; j++){
                    if (letters[j].innerText == boxes[wrong[i]].innerText)
                        letters[j].style.backgroundColor = '#303030';
                }
            }

            if (guess.toLocaleLowerCase() == answer){
                for (let i = 0; i < boxes.length; i++){
                    boxes[i].style.backgroundImage = "linear-gradient(135deg,red,orange,yellow,green,blue,indigo)";
                    boxes[i].style.color = "black";
                    for (let j = 0; j < letters.length; j++){
                        if (letters[j].innerText == boxes[i].innerText){
                            letters[j].style.backgroundImage = 'linear-gradient(135deg,red,orange,yellow,green,blue,indigo)';
                            letters[j].style.color = 'black';
                        }
                    }
                }
            }

            perfect = [];
            correct = [];

            guess = '';
            if (playerRow == 5 && guess != answer){
                answerBox.style.display = 'block';
                answerBox.style.animation = 'showAnswer 0.3s ease-in';
                answerBox.innerText = answer;
                console.log(answer);
            }
            playerRow = playerRow == 5 ? 5 : playerRow + 1;
            count = 0;


        } else {
            guess = '';
            for (let i = 0; i < boxes.length; i++){
                boxes[i].style.animation = 'wrongGuess 0.5s ease-in-out'
            }
        }

    }
});

