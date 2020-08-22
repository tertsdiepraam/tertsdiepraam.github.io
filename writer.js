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
    if (el.firstChild !== null) {
        return el.firstChild;
    }
    while (el.nextSibling === null) {
        el = el.parentNode;
        if (el === null) {
            return null;
        }
    }
    return el.nextSibling;
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
        this.html = text_el;
        this.init('HOME');
        this.steps_past_mistake = null;
    }

    init(key) {
        this.STATE = WRITE;
        this.key = key;
        this.next_key = null;
        this.reference_html = document.createElement('div');
        this.reference_html.innerHTML = marked(TEXT[key])
        this.reference_element = this.reference_html;
        this.html.innerHTML = "";
        this.element = this.html;

        makeMistakes(this.reference_element);
    }

    update() {
        console.log(this.element);
        switch (this.STATE) {
        case WRITE:
            this.write();
            break;
        case DELETE:
            this.erase();
            break;
        case CORRECT:
            this.correct();
            break;
        case DONE:
            break;
        }
    }

    setText(key) {
        this.next_key = key;
        if (key === this.key) {
            this.STATE = WRITE;
        } else {
            this.STATE = DELETE;
        }
    }

    write() {
        if (this.steps_past_mistake !== null) {
            if (Math.random() < (this.steps_past_mistake / 40)) {
                this.STATE = CORRECT;
                return;
            }
            this.steps_past_mistake++;
        }
        if (this.reference_element.nodeName === "#text"
            && this.reference_element.data.length > this.element.data.length) {
            this.addCharacter();
        } else {
            if (!this.addElement()) {
                this.STATE = DONE;
            }
        }
    }

    correct() {
        if (!this.remove() || this.steps_past_mistake === 0){
            const idx = this.element.data.length+2;
            this.reference_element.wrong_text =
                this.reference_element.data.substr(0,idx)
                + this.reference_element.wrong_text.substr(idx);
            this.steps_past_mistake = null;
            this.STATE = WRITE;
        }
    }

    erase() {
        this.steps_past_mistake = null;
        if (!this.removeElement()) {
            this.init(this.next_key);
        }
    }

    remove() {
        this.steps_past_mistake--;
        if (this.reference_element.nodeName === "#text"
            && this.element.data.length > 0) {
            return this.removeCharacter();
        } else {
            return this.removeElement();
        }
    }

    addCharacter() {
        let idx = this.element.data.length;
        this.element.data += this.reference_element.wrong_text[idx];
        if (this.steps_past_mistake === null
            && this.reference_element.wrong_text[idx] != this.reference_element.data[idx])
            this.steps_past_mistake = 1;
        return true;
    }

    addElement() {
        if (this.reference_element.firstChild !== null) {
            this.reference_element = this.reference_element.firstChild;
            this.element.appendChild(this.reference_element.cloneNode(false));
            this.element = this.element.firstChild;
            if (this.element.nodeName === "#text") {
                this.element.data = '';
            }
            return true;
        }

        let tmp_reference = this.reference_element;
        let tmp_mistakes = this.element;
        while (tmp_reference.nextSibling === null) {
            if (tmp_reference.parentNode === null) {
                return false;
            }
            tmp_reference = tmp_reference.parentNode;
            tmp_mistakes = tmp_mistakes.parentNode;
        }
        this.reference_element = tmp_reference;
        this.element = tmp_mistakes;

        let new_element = this.reference_element.nextSibling.cloneNode(false);
        if (new_element.nodeName === "#text") {
                new_element.data = "";
        }
        this.element.parentNode.appendChild(new_element);
        this.element = this.element.nextSibling;
        this.reference_element = this.reference_element.nextSibling;
        return true;
    }

    removeCharacter() {
        this.element.data = this.element.data.substr(0, this.element.data.length-1);
        return true;
    }

    removeElement() {
        if (this.reference_element.previousSibling !== null) {
            this.reference_element = this.reference_element.previousSibling;
            let previous = this.element;
            this.element = this.element.previousSibling;
            previous.remove();
            while (this.reference_element.lastChild !== null) {
                this.reference_element = this.reference_element.lastChild;
                this.element = this.element.lastChild;
            }
            return true;
        } else if (this.reference_element.parentNode !== null) {
            this.reference_element = this.reference_element.parentNode;
            let previous = this.element;
            this.element = this.element.parentNode;
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

function makeMistakes(el) {
    while (el !== null) {
        if (el.nodeName === "#text") {
            let num_mistakes = Math.max(getRandomInt(-5,5), 0);
            let text = el.data.split('');
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
            el.wrong_text = text.join('');
        }
        el = next_element(el);
    }
}
