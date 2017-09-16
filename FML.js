const DEFAULT_CSS_STYLE = {
  "!": "new element",
  ".": "class",
  "#": "id"
}

// User called functions
function decode(str, style) {
  let td_lines = split_with_empty(str, "\n")
  let elements = []
  let element  = null
  for (let line of td_lines) {
    if (line.startsWith("!")) {
      elements.push(decodeHeader(line, style))
      element = elements[elements.length-1]
    } else {
      if (element) {
        element.content += line + "\n"
      } else {
        throw Error("File must start with a '!'")
      }
    }
  }
  return elements
}

function decodeToHTML(str, style) {
  if (typeof style === 'undefined') { style = DEFAULT_CSS_STYLE }
  return decode(str, style).map(elementToHTML)
}

// Decoding helper functions
function decodeHeader(line, style) {
  const [name, ...expressions] = line.slice(1, line.length-1).trim().split()
  const element = {
    name: name.trim(),
    content: ""
  }
  const processed_attributes = expressions.map(attr => process_attribute(attr, style))
  for (let [key, value] of processed_attributes) {
    if (e.hasOwnProperty(key)) {
      element[key] += ' ' + value
    } else {
      element[key] = value
    }
  }
  return element
}

function linksToHTML(line, style) {
  const link_regex = /\{.+?\}/g
  const matches = line.match(link_regex)
  if (!matches) {
    return line
  }
  const links = matches.map(match => {
    const [text, href] = match.slice(1,match.length-1).split("|").map(str => str.trim())
    if (href) {
      return "<a href=\"{0}\">{1}</a>".replace("{0}", href).replace("{1}", text)
    } else {
      return "<a href=\"{0}\">{0}</a>".replace("{0}", text)
    }
  })

  let new_line = line
  for (let i=0; i<links.length; i++) {
    console.log(matches[i], links[i])
    new_line = new_line.replace(matches[i], links[i])
  }
  return new_line
}

function process_attribute(attr, style) {
  type = style[attr[0]]
  value = attr.slice(1, attr.length)
  return [type, value]
}

function elementToHTML(element) {
  let DOM_element = document.createElement(element.name)
  DOM_element.innerHTML = linksToHTML(element.content.trim()).replace(new RegExp("\n", "g"), "\n<br>")

  delete element.name
  delete element.content

  Object.assign(DOM_element, element)
  return DOM_element
}

// General helper functions
function split_with_empty(s, delimiter) {
  let array = []
  let index = s.indexOf(delimiter)
  while (index >= 0) {
    array.push(s.slice(0,index))
    s = s.slice(index+1, s.length)
    index = s.indexOf(delimiter)
  }
  array.push(s)
  return array
}
