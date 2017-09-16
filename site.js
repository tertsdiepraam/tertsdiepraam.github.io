const request_promises = send_requests(['about', 'projects'])

function send_request(url) {
  return new Promise(function(resolve, reject) {
    const req = new XMLHttpRequest()
    req.open('GET', url)
    req.responseType = "text"
    req.onload = () => {
      if (req.status == 200) {
        resolve(req.responseText)
      } else {
        reject(Error(req.statusText))
      }
    }
    req.onerror = () => {
      reject(Error("Network error: couldn't load \"" + url + "\""))
    }
    req.send()
  })
}

function send_requests(urls) {
  return urls.map(url => send_request(url + '.fml'))
}

window.onload = async () => {
  const page_div = document.getElementById("page")
  console.log("Window loaded!")

  // Wait for all the requests to resolve
  const content_text = await Promise.all(request_promises).then(values => values)

  console.log(content_text)
  for (file of content_text) {
    //console.log(file)
    let file_html = decodeToHTML(file)
    console.log(file_html)
    for (element of file_html) {
      //console.log(element)
      page_div.appendChild(element)
    }
  }
}
