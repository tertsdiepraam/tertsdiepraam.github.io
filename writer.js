const TEXT = {
    "HOME":
`# Hi!
I'm Terts Diepraam and I am a

- software engineer,
- open source lover,
- film enthusiast,
- bad typist (although I'm trying to improve).

Want to get in contact? [Send me an email!](mailto:terts.diepraam@gmail.com)

My personal projects mostly live on GitLab. [Check it out!](https://gitlab.com/tertsdiepraam)

A few projects are still on GitHub. [Check that out too!](https://github.com/tertsdiepraam)

## More about me
Non-exhaustive list of programming-related technologies I love:
- Rust
- Python
- Godot
- Emacs
- LaTeX
- ...

I have worked with
- Linux
- Git
- Python (including NumPy, Pandas & SciPy)
- Rust
- LaTeX
- PHP
- HTML + CSS + JavaScript
- and more...
`,
             "RESUME":
`# Resume
## Education
 - Het 4e Gymnasium
 - Amsterdam University College

## Experience
 - Machine Learning Programs
 - Bit
 - Bit Academy
`,
             "PROJECTS":
`# Projects
This page contains a (non-exhaustive) list of personal projects.
## Sorters
A sorting algorithm visualizer for the browser written mostly in Rust with
WebAssembly. To my knowledge, this is one of the most feature-packed sorting
algorithm visualizers available in the browser. It supports a variety of sorting
algorithms, visualizations, colorschemes and more.

[Live demo](https://tertsdiepraam.gitlab.io/Sorters/) | [GitLab repository](https://www.gitlab.com/TertsDiepraam/Sorters)

## Removing Confusion from Petri Nets (Bachelor's Thesis)
Accompanying my bachelor's thesis, I wrote a Python implementation of the
algorithm described in the thesis. More information can be found on the Gitlab
repository and the thesis.

[GitLab repository](https://gitlab.com/tertsdiepraam/petrinet) | [Thesis](Terts_Diepraam_Thesis.pdf)

## Conway's Game of Life
Back in 2017, I implemented John Conway's Game of Life in JavaScript.

[Live demo](https://tertsdiepraam.github.io/Conways-Game-of-Life/) | [GitHub repository](https://www.github.com/TertsDiepraam/Conways-Game-of-Life/)
`,
};

let text_str = "";
let text_el = document.getElementById('text');

document.getElementById('button-home').onclick = () => {
    writer.setText("HOME");
}

document.getElementById('button-resume').onclick = () => {
    writer.setText("RESUME");
}

document.getElementById('button-projects').onclick = () => {
    writer.setText("PROJECTS");
}

// These serve as reference for the depth-first traversal of the DOM tree.
function next_element(el) {
    if (el.firstchild !== null) {
        return el.firstchild;
    }
    while (el.nextsibling === null) {
        el = el.parentnode;
        if (el === null) {
            return null;
        }
    }
    return el.nextsibling;
}

function previous_element(el) {
    if (el.previousSibling !== null) {
        el = el.previousSibling;
        while (el.lastChild !== null) {
            el = el.lastChild;
        }
        return el;
    }
    return el.parentNode;
}

let WRITE = 0;
let DELETE = 1;
let CORRECT = 2;
let DONE = 3;

class Writer {
    constructor() {
        this.mistakes_html = text_el;
        this.init('HOME');
    }

    init(key) {
        this.STATE = WRITE;
        this.current_key = key;
        this.correct_html = document.createElement('div');
        this.correct_html.innerHTML = marked(TEXT[key])
        this.correct_element = this.correct_html;
        this.mistakes_html.innerHTML = "";
        this.mistakes_element = this.mistakes_html;
        this.next_key = null;
    }

    update() {
        switch (this.STATE) {
        case WRITE:
            if (!this.add()) {
                this.STATE = DONE;
            };
            break;
        case DELETE:
            if (!this.remove_element()) {
                this.init(this.next_key)
            }
            break;
        case CORRECT:
            break;
        case DONE:
            break;
        }
    }

    setText(key) {
        this.next_key = key;
        this.STATE = DELETE;
    }

    add() {
        if (this.correct_element.nodeName === "#text"
            && this.correct_element.data.length > this.mistakes_element.data.length) {
            return this.add_character();
        } else {
            return this.add_element();
        }
    }

    add_character() {
        this.mistakes_element.data += this.correct_element.data[this.mistakes_element.data.length];
        return true;
    }

    add_element() {
        if (this.correct_element.firstChild !== null) {
            this.correct_element = this.correct_element.firstChild;
            this.mistakes_element.appendChild(this.correct_element.cloneNode(false));
            this.mistakes_element = this.mistakes_element.firstChild;
            if (this.mistakes_element.nodeName === "#text") {
                this.mistakes_element.data = '';
            }
            return true;
        }

        let tmp_correct = this.correct_element;
        let tmp_mistakes = this.mistakes_element;
        while (tmp_correct.nextSibling === null) {
            if (tmp_correct.parentNode === null) {
                return false;
            }
            tmp_correct = tmp_correct.parentNode;
            tmp_mistakes = tmp_mistakes.parentNode;
        }
        this.correct_element = tmp_correct;
        this.mistakes_element = tmp_mistakes;

        let new_element = this.correct_element.nextSibling.cloneNode(false);
        if (new_element.nodeName === "#text") {
                new_element.data = "";
            }
        this.mistakes_element.parentNode.appendChild(new_element);
        this.mistakes_element = this.mistakes_element.nextSibling;
        this.correct_element = this.correct_element.nextSibling;
        return true;
    }

    remove_element() {
        if (this.correct_element.previousSibling !== null) {
            this.correct_element = this.correct_element.previousSibling;
            let previous = this.mistakes_element;
            this.mistakes_element = this.mistakes_element.previousSibling;
            previous.remove();
            while (this.correct_element.lastChild !== null) {
                this.correct_element = this.correct_element.lastChild;
                this.mistakes_element = this.mistakes_element.lastChild;
            }
            return true;
        } else if (this.correct_element.parentNode !== null) {
            this.correct_element = this.correct_element.parentNode;
            let previous = this.mistakes_element;
            this.mistakes_element = this.mistakes_element.parentNode;
            previous.remove();
            return true;
        } else {
            return false;
        }
    }
}


writer = new Writer();
interval = setInterval(() => {writer.update()}, 20);

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function swap(array, idx) {
    let tmp = array[idx];
    array[idx] = array[idx+1];
    array[idx+1] = tmp;
}

function makeMistakes(txt) {
    // Force a copy of the text
    let text = txt.split('');
    let num_mistakes = text.length / 40 + getRandomInt(-5,5);
    for (var i=0; i<num_mistakes; i++) {
        if (getRandomInt(0,2)) {
            // Swap two characters
            let idx = getRandomInt(0, text.length-1);
            swap(text, idx);
        } else {
            // Type neighbouring character
            // TODO
        }
    }
    return text.join('');
}
