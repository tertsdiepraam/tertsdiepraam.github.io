+++
title = "Is The Web Too Many Things?"
date = 2020-10-19
description = "The web is held back by all the things we expect it to be. Or is it?"
+++

# Part 1: The Web is Awesome
The web is awesome and I'll fight anyone who says otherwise. The possibilities
are almost endless.

Let's back up a bit. What is the Web? The (World Wide) Web is the part of the
internet you can visit with a web browser. As we all know, the web can do many
things:

- *File transfer* (downloads, WeTransfer)
- *Document viewing* (articles, blogs, books)
- *Media consumption* (YouTube, Netflix et al.)
- *Personal Communication* (WhatsApp, Slack, e-mail, Zoom)
- *Sharing* (Facebook, Twitter)
- *Collaboration* (Google Docs, GitHub/GitLab et al.)
- *Desktop apps* (Electron)
- *Mobile apps* (Progressive Web Apps, Ionic, WebView apps)

At the core of the internet is HTTP(S), which is just file transfer for HTML
documents. Over time, the web has adopted an astounding amount of features, most
of which it was not originally intended for. In fact, most features stem from
browsers trying to innovate faster than the competition. This is how JavaScript
started.

Originally, the web started out as a way to share and view documents using HTML.
Services such as blogs and Wikipedia are therefore also a perfect fit for the
Web. We can even make documents look good with CSS and we're all good.

Nowadays, the web provides a robust cross-platform framework for apps and
documents which is cheap to develop for. Ultimately, this is what makes it so
popular among developers. Wanna build an application that works on Windows, Mac,
Linux, Android *and* iOS? Just make it a responsive web app and your development
costs are reduced by a factor of 5. Now, this comes at some performance and
memory costs, but the average user won't care anyway.

# Part 2: The Web has Problems
I specifically highlighted the two use-cases for the web that I find most
important: documents and apps. On the web, these are the one and the same.
In my opinion, these are definitely not the same.

Documents need to just supply a HTML document with some styling and maybe some
JavaScript for more complex behaviour. In other words, they need a traditional
web page. However, some nice features are also currently missing from web
browsers, such a nice built-in navigation, highlighting, annotations and other
features that we've come to expect from document viewers. Why? It's because
these features are in tension with the other main use-case: web apps.

A web app needs to programmatically alter the DOM and process more data. It
needs full control over what is visible. It must do this as quickly as possible.
This leads to frameworks such as Angular, Vue, React and Svelte to work around
the limitations of the Web as much as possible. Still, the apps built with these
frameworks are limited by the performance of JavaScript and the DOM. These apps
are usually turned into desktop apps using Electron, which is essentially a
Chromium browser that just displays the app. This is cool, but uses a lot of
memory and is generally slower than I'd like it to be.

Combining these use-cases into a single platform is almost guaranteed to cripple
at least on of them. Because they are in tension with each other. Fundamentally,
a document is viewed, while an app is run on its own. Ultimately, nothing
reaches its full potential here. Web browsers provide neither a full fledged
document viewing experience or an ergonomic and fast framework for apps.

The incremental addition of advanced features to the spec intended for documents
made the spec increasingly complex. So complex that there are in practice only
three full implementations: Chromium, Firefox and WebKit (Safari). These created
by a handful of companies, making the Web much less open. Other partial
implementations exist, but these will almost certainly never get the funding to
be able to expand. Not everyone is worried about this, but I am, which is why I
use Firefox (also it's a great browser).

# Part 3: Towards a Solution
I've talked about the tensions between the use-cases of the web. So what if we
were to split the web up? What if we created different "browsers" for different
use-cases. In my (humble) opinion, this will be the only option for the web in
the future, as it will grow more complex and will almost inevitably become more
of a Google monopoly. Maybe, instead of fighting that future, we need to create
our own.

Personally, I don't like reading articles that only discuss problems and no
solutions, so below is what I would propose. This is definitely unfinished and
vague, but it's a start. Keep in mind that these solutions are purely
idealistic. I have not thought about how advertisements and other commercial
considerations could be incorporated in these formats.

## Use-case 1: Documents & Static Sites
If you've bought an (non-Kindle) eReader, you're probably familiar with the EPUB
file format. For the uninitiated, EPUB is essentially a subset of HTML. EPUB has
little support for styling, animations or graphical capabilities, but it works
for books and articles. The EPUB format then ensures that a simple document
viewer (such as an eReader) does not need to implement the full HTML spec in
order to work correctly. To me, that sounds a lot like the HTML of old.

Currently, websites implement their own formatting, styling, accessibility
features and navigation. I propose that there should be a subset of HTML, much
like EPUB, that is by default displayed in a interface much like reader view in
Firefox or Chrome. Styling should be possible but limited to the point where it
could be turned off entirely. Browsers should implement accessibility,
navigation, highlighting and annotations. So essentially, they should be EPUB
readers with an address bar and tabs. There should also be some way to
incorporate search engines but only for other document-type web pages. This
format should also include images, videos and forms. And native math support
would be amazing too!

Now, I do see some problems with this. First, interactive code examples
as provided in some programming documentation would be impossible. But we could
make simple web apps to fix that. Second, while Wikipedia seems like a perfect
candidate for this model, editing it would be complicated to implement, except
through forms maybe. The same applies to forums. Third, companies like to brand
their websites with fancy styling. While that is technically unnecessary, I can
see why they want that. We could partially support this by letting them theme
the default look, but that's tricky without feature creep. On the other hand,
standardizing the layout of web more would make it much more accessible.

[insert Firefox reader mode here]

## Use-case 2: Desktop Apps
The current web is both good and bad for desktop app development. Many
developers (rightly) like to use the web technology they are familiar with to
create beautiful platform-independent apps. However, solutions like Electron are
slow. In Electrons case, this is because an entire browser instance needs to be
started, including a full JavaScript runtime.

My solution to this is to adopt the route taken by projects such as Ultralight
and Sciter: compiled code that uses HTML+CSS for formatting. If JavaScript is
still necessary, the app could bundle it's own interpreter. This brings the best
of both worlds. Compiling the code with allow the applications to approach
projects like GTK and Qt in speed and startup times. Ultimately, we just need to
improve our native frameworks, with or without HTML/CSS.

## Use-case 3: Web Apps
However, there are also plenty of complex web apps that are accessible from
the browser, like online photo editors, word processors and email applications.
Since web apps are not explicitly installed by the user, another layer of
security and sandboxing is needed. On top of that, the app needs to be truly
portable and fast to download. The sandboxing and portability can be provided by
the WebAssembly standard, which could become the main way to interface with the
DOM instead of JavaScript.

Using these through a browser could even be unnecessary. Or rather, the browser
for these kinds of apps should be tightly coupled to the OS. I could make links
on my desktop to immediate download and run them or open them from the search
bar in my OS. This would make them feel much more like native apps in
performance and behaviour. Why this last part? Well, when I use one of these
apps, I almost always put them in a window of their own anyway, because they are
more important than the rest of my tabs.

