let game = null;
const MAX_FAULTS = 9;
const wordList = [
  "Higher-Order Components",
  "styled-components",
  "Single File Components",
  "Progressive Web App",
  "Cascading Style Sheets",
  "Svelte",
  "Service Worker",
  "CSS Custom Properties",
  "Syntactically Awesome Style Sheets",
  "Hangman",
  "Hooks",
  "Webpack",
  "Hot Module Replacement",
  "Lifecycle",
  "Typescript",
  "Reactive Programming",
  "Uncontrolled Components",
  "Strict Mode",
  "Computed Properties",
  "Event Handling",
  "Server-Side Rendering",
  "Reactivity",
  "Internationalization",
  "Accessibility",
  "Ahead-of-Time Compilation",
  "Source Maps",
  "Dependency Injection",
  "Node Package Manager",
  "Virtual DOM",
  "Single Page Application",
  "Redux",
  "State Management",
  "Declarative Routing",
  "Code Splitting",
  "Lazy Loading",
  "CSS Modules",
  "Flexbox",
  "Media Queries",
  "Localhost",
];

function reinitGame() {
  game = initNewGame();
}

function hideModal() {
  const modal = document.getElementById("modal");
  modal.style.display = "none";
}

function showModal(content) {
  const modal = document.getElementById("modal");
  const modalContent = modal.querySelector(".modal__content");
  modalContent.innerHTML = content;
  setTimeout(() => (modal.style.display = ""), 300);
}

function gameEndHandler() {
  const content = game.hasWon()
    ? `Great, you are a winner!`
    : `Oh no, you fucked up! We were looking for <em>${game.getWord()}</em>.`;
  showModal(content);
}

function initNewGame() {
  const hangman = new Hangman(getRandomWord(), gameEndHandler);
  hideModal();
  drawGame(hangman);
  return hangman;
}

function getRandomWord() {
  const index = Math.floor(Math.random() * wordList.length);
  return wordList[index];
}

function guessLetter(letter) {
  if (game && !game.isFinished()) {
    game.pickedLetter(letter);
    drawGame(game);
  }
}

function drawHangman(faults) {
  const parts = [
    '<div class="drawing__part drawing__part-1"></div>',
    '<div class="drawing__part drawing__part-2"></div>',
    '<div class="drawing__part drawing__part-3"></div>',
    '<div class="drawing__part drawing__part-4"></div>',
    '<div class="drawing__part drawing__part-5"></div>',
    `<div class="drawing__part drawing__part-6a"></div>`,
    `<div class="drawing__part drawing__part-6b"></div>`,
    `<div class="drawing__part drawing__part-7a"></div>`,
    `<div class="drawing__part drawing__part-7b"></div>`,
  ];

  const visibleParts = parts.splice(0, faults);
  const parent = document.querySelector("#drawing .drawing__container");
  parent.innerHTML = visibleParts.join("");
}

function drawResult(faults) {
  const texts = [
    /* 0 */ "Let's find that word!",
    /* 1 */ "Let's hang out.",
    /* 2 */ "Don't worry, everything is fine.",
    /* 3 */ "Don't worry, everything is fine.",
    /* 4 */ "Don't worry, everything is fine.",
    /* 5 */ "Ooh... be careful!",
    /* 6 */ "That's not good!",
    /* 7 */ "OMG!!!",
    /* 8 */ "HEEEELP!",
    /* 9 */ "R.I.P.",
  ];

  const container = document.querySelector("#drawing .drawing__message");
  container.innerText = texts[faults];
}

function drawKeyboard(foundLetters, faultyLetters) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const keys = letters.map((letter) => {
    const found = foundLetters.includes(letter);
    const faulty = faultyLetters.includes(letter);
    return { letter, found, faulty };
  });

  const parent = document.getElementById("keyboard");
  parent.innerHTML = "";
  keys.map((key) => {
    const el = document.createElement("button");
    el.innerText = key.letter;
    el.disabled = key.found || key.faulty;
    el.className = "keyboard__key";
    key.found && el.classList.add("keyboard__key--found");
    key.faulty && el.classList.add("keyboard__key--is-faulty");

    el.onclick = () => {
      guessLetter(key.letter);
    };

    parent.appendChild(el);
  });
}

function drawCharList(chars) {
  const parent = document.getElementById("chars");
  parent.innerHTML = "";

  chars.forEach((char) => {
    const charEl = document.createElement("div");
    charEl.className = `chars__char ${
      char.isLetter ? "chars__char--is-letter" : ""
    }`;
    charEl.innerText = char.show ? char.value : "";
    parent.appendChild(charEl);
  });
}

function drawGame(hangman) {
  drawResult(hangman.getNumberOfFaults());
  drawHangman(hangman.getNumberOfFaults());
  drawCharList(hangman.getCharList());
  drawKeyboard(hangman.getFoundLetters(), hangman.getFaultyLetters());
}

function listenForInputs(callback) {
  window.addEventListener("keydown", (event) => {
    const pressedOtherKey = event.altKey || event.ctrlKey || event.metaKey; // Shift key is allowed
    const key = event.key.toUpperCase();
    const isLetter = key.match(/[A-Z]/);
    !pressedOtherKey && isLetter && callback(key);
  });
}

class Hangman {
  constructor(word, onEndGame) {
    this.word = word.toUpperCase();
    this.pickedLetters = [];
    this.faults = 0;
    this.onEndGame = onEndGame;
  }

  getWord() {
    return this.word;
  }

  getCharsOfWord() {
    return this.word.split("");
  }

  getLettersOfWord() {
    const chars = this.getCharsOfWord();
    return chars
      .filter((char) => char.match(/[A-Z]/))
      .filter((char, index, list) => list.indexOf(char) === index);
  }

  getNumberOfFaults() {
    return this.faults;
  }

  getFaultyLetters() {
    return this.pickedLetters.filter((letter) => {
      return !this.word.includes(letter);
    });
  }

  getFoundLetters() {
    return this.pickedLetters.filter((letter) => {
      return this.word.includes(letter);
    });
  }

  getCharList() {
    const chars = this.getCharsOfWord();
    return chars.map((char) => {
      const isLetter = char.match(/[A-z]/);
      const pickedLetterAlready = this.pickedLetters.includes(char);
      const show = pickedLetterAlready || !isLetter;
      return { isLetter, show, value: char };
    });
  }

  pickedLetter(letter) {
    const alreadyPicked = this.pickedLetters.includes(letter);
    const contains = this.word.includes(letter);

    if (alreadyPicked) {
      console.log("Uuh, you already picked that letter");
      return;
    }

    this.pickedLetters.push(letter);

    if (contains) {
      console.log("Yeah, you are great!");
    } else {
      console.log("Oh no, try it again");
      this.pickedLetters.push(letter);
      this.faults += 1;
    }

    if (this.isFinished()) {
      this.onEndGame();
    }
  }

  hasWon() {
    const letters = this.getLettersOfWord();
    return (
      !this.hasLost() &&
      letters.every((char) => {
        return this.pickedLetters.includes(char);
      })
    );
  }

  hasLost() {
    return this.faults >= MAX_FAULTS;
  }

  isFinished() {
    return this.hasLost() || this.hasWon();
  }
}

game = initNewGame();
listenForInputs((letter) => {
  guessLetter(letter);
});
