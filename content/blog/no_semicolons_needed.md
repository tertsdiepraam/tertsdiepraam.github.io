+++

title = "No Semicolons Needed"
date = "2026-03-07"
description = "An overview how different languages split statements without requiring semicolons."

+++

I'm making a scripting language called [Roto](codeberg.org/NLnetLabs/roto).
Like so many programming languages, it has the goal of being easy to use and
read. These languages usually end up making semicolons to delimit or terminate
statements optional. This sounds simple, but how do they implement that? How do
they decide where a statement ends?

To illustrate the problem, we can take an expression and format it bit weirdly.
We can start with an example in Rust:

```rust
fn foo(x: u32) -> u32 {
  let y = 2 * x
      - 3;
  y
}
```

In Rust, that is perfectly unambiguous. Now let's do the same in Python:

```python
def foo(x):
  y = 2 * x
      - 3
  return y
```

We get an "unexpected indent" error! Since Python doesn't require semicolons, it
gets confused. As it turns out, many languages have different solutions to this
problem! Here's Gleam, for instance:

```gleam
fn foo(x) {
  let y = 2 * x
          - 3
  y
}
```

That's allowed! And if we `echo foo(4)` we get `5` just like in Rust. So, how
does Gleam determine that the expression continues on the second line?

I wanted to find out how different languages approach this problem, but I
couldn't find a good overview, so I decided to write one. And here it is. I
looked at 11 (!) languages that have optional semicolons to see how similar
their approaches are.

<blockquote class="note">

**NOTE**: I'm not fluent in all the languages below, in fact I've barely used some of
them. I've tried to mention some sources but I might still have gotten some
details wrong. Let me know if you find any mistakes!

</blockquote>

# Contents

This is a long post, so I'd understand if you just want to jump to your favorite
language, so here are links to all the sections:

1. [Python](#python)
2. [Go](#go)
3. [Kotlin](#kotlin)
4. [Swift](#swift)
5. [JavaScript](#javascript)
6. [Gleam](#gleam)
7. [Lua](#lua)
8. [Ruby](#ruby)
9. [R](#r)
10. [Julia](#julia)
11. [Odin](#odin)

# Languages

## Python

Let's start with the language with most famous for whitespace sensitivity
([citation needed]). Python starts with the assumption that one line is one
statement. In the [grammar](python-ref), it describes what it calls _logical
lines_ which are constructed from one or more _physical lines_, i.e. the lines
you see in your editor.

There are 2 ways that physical lines can be joined:

 - either **explicitly** with the `\` token,
 - or **implicitly** while the end of the line is enclosed between delimiters
   such as `()`, `[]`, `{}` or triple quotes.

The reference gives these examples:

```python
# Explicit joining
if 1900 < year < 2100 and 1 <= month <= 12 \
   and 1 <= day <= 31 and 0 <= hour < 24 \
   and 0 <= minute < 60 and 0 <= second < 60:   # Looks like a valid date
        return 1

# Implicit joining
month_names = ['Januari', 'Februari', 'Maart',      # These are the
               'April',   'Mei',      'Juni',       # Dutch names
               'Juli',    'Augustus', 'September',  # for the months
               'Oktober', 'November', 'December']   # of the year
 ```

Having only these rules would be fairly error prone. You can see this by
considering the example from the introduction again:

```python
y = 2 * x
    - 3
```

Python would simply treat that as two statements if you forget to put a
backslash at the end of the first line. Luckily, Python has a solution: it
strictly enforces correct indentation. Since the `- 3` is on a new line, it
must have the same indentation as the line before. This is not the only reason
that Python has that rule, because it also relies on indentation for the program
structure, but it does help.

Now let's consider the consequences of this approach. Python is quite principled
and strict about its statement separation. It is also very unambiguous.
It's easy to keep the rule of "one line, one statement" in your head while
programming with the two exceptions being quite explicit.

A somewhat ironic consequence for an indentation-based language, however,
is that this has encouraged the community to embrace explicit delimiters.
For example, the ubiquitous code formatters `black` and `ruff` both prefer
parentheses over backslashes.

```python
# "Unidiomatic"
y = long_function_name(1, x) \
  + long_function_name(2, x) \
  + long_function_name(3, x) \
  + long_function_name(4, x)

# "Idiomatic"
y = (
    long_function_name(1, x)
    + long_function_name(2, x)
    + long_function_name(3, x)
    + long_function_name(4, x)
)
```

I think this system is pretty good! It's simple, it's clear and the indentation
rules are likely to catch any mistakes.

Sources:

- [Python Reference](python-ref)
- [Black documentation](https://black.readthedocs.io/en/stable/the_black_code_style/current_style.html#how-black-wraps-lines)

[python-ref]: https://docs.python.org/3/reference/lexical_analysis.html

## Go

Go's approach is very different from Python's. In the [official book][go-book]
it states:

> Like C, Go's formal grammar uses semicolons to terminate statements, but
> unlike in C, those semicolons do not appear in the source. Instead the lexer
> uses a simple rule to insert semicolons automatically as it scans, so the
> input text is mostly free of them.

The first thing that I dislike about this is that it encourages thinking of
semicolons being inserted instead of statements being terminated. I find
to be a roundabout way of thinking about the problem. But alas, this is what
we're dealing with. I want to highlight something in that text: the semicolons
are inserted by the _lexer_. The reasoning behind this is this that it keeps the
rule for automatic semicolon insertion are very simple.

Go's lexer inserts a semicolon after the following tokens:

 - an identifier,
 - a basic literal,
 - or one of `break`, `continue`, `fallthrough`, `return`, `++`, `--`, `-`, `)`
   or `}`.

Simple enough! Let's go to our introductory example:

```go
var x = 4
var y = 2 * x
      - 3
```

Those lines end with numbers so the lexer inserts semicolons:

```go
var x = 4;
var y = 2 * x;
      - 3;
```

Just like Python, that seems error prone! But as we run this, Go has a nice
surprise in the form of an error (not just a warning!):

```
-3 (untyped int constant) is not used
```

So, it has some guardrails in place to prevent mistakes. Even when I replace `-3`
with more complex expressions it usually errors on unused values that might
occur by accident. That's good!

[This post](go-medium) gives us an example that doesn't error and where the
newline changes behaviour. It first requires a bit of setup:

```go
func g() int {
    return 1
}

func f() func(int) {
    return func(n int) {
        fmt.Println("Inner func called")
    }
} 
```

And then these snippets have a different meaning:

```go
f()
(g())
```

```go
f()(g())
```

I'm not too worried about this to be honest; it looks like this requires pretty
convoluted code to be considered ambiguous.

Now remember that this semicolon insertion is done entirely by the lexer. That
means that semicolons sometimes get inserted at unexpected places:

```go
if x    // <- semicolon inserted here
{
  ...
}

foo(
  x     // <- semicolon inserted here
)
```

Both of these result in parse errors. The fix is to adhere to Go's mandatory
formatting style:

```go
if x {
  ...
}

foo(x)
// or
foo(
  x,
)
```

That's fair, even if it seems a little pedantic. I like these formatting
choices, but I'd prefer if the "wrong style" was still syntactically valid but
a formatter would be able to fix it. As it stands with Go, its formatter also
errors on these invalid snippets. This strictness also seems to [lead to
confusion for newcomers][SO_GO] to the language every once in a while,
particularly if they come from languages like Java, where braces are often put
on a separate line.

So, Go's approach is simple, but in my opinion not not very friendly. It is
saved by disallowing some unused values, but I'm not competent enough with
writing Go to evaluate whether that covers all ambiguous cases.

Sources:

 - [Effective Go][go-book]
 - [Blog post on codegenes.net](https://www.codegenes.net/blog/syntax-error-unexpected-semicolon-or-newline-expecting/)
 - [Automatic semicolon insertion in Go][go-medium]
 - [Stack Overflow: Why do I get an error when putting opening braces on the next line in Go?][SO_GO]

[go-book]: https://go.dev/doc/effective_go#semicolons
[SO_GO]: https://stackoverflow.com/questions/7062276/why-do-i-get-an-error-when-putting-opening-braces-on-the-next-line-in-go
[go-medium]: https://medium.com/golangspec/automatic-semicolon-insertion-in-go-1990338f2649

## Kotlin

As far as I can tell, Kotlin does not have simple "rules" for when a newline
separates two statements, like Python and Go. Instead, it makes newlines an
explicit part of the grammar. So for each construct where a newline is allowed,
it opts into it explicitly. I'll spare you the BNF-like notation, but it seems
to boil down to this:

 - Statements are separated by one or more newlines or `;`.
 - If a construct is unambiguously incomplete, it is allowed to continue on the
   next line.
 - Delimited constructs (like function calls) allow newlines within them.
 - Newlines are not allowed before `(`, `[` or `{`.
 - Binary operators seem to fall into two camps:
   - `&&`, `||`, `?:`, `as`, `as?`, `.` and `.?` allow newlines on both side of
     the operator,
   - the rest of the operators only allow a newline _after_ the operator.
 - Prefix unary operators allow a newline after themselves.

This approach of baking newline handling into the grammar gives the
language designers a lot of control, but this comes at the cost of simplicitly
and transparency. This approach is like the opposite of Go's. It can get pretty
nuanced and there's no clear explanation of any of it that I can find.

My best attempt at summarizing this approach: an expression is allowed to
continue on the next line if that is unambiguous in the grammar.

After all that theory, we try our example:

```kotlin
var x = 4
var y = 2 * x
      - 3
print(y)
```

This gives us `8` with an unused value warning. That makes sense because `-`,
`+` and many other infix operators only allow newlines _after_ the operator.
However, the logical operators `&&` and `||` allow newlines on both sides.

```kotlin
// This is one expression:
var y = false
      || true

// This is two expressions:
var y = 1
      + 2
```

Another case where the "continue if unambiguous" approach gets into trouble
is if very similar operators have different rules. Kotlin has the `::` and `.`
operators to respectively access a method and a field of a class. Of these two,
`.` allows newlines on both sides, but `::` doesn't. That is because `::` also
refers to the root namespace, so it is a valid start of a new expression.

```kotlin
val x = foo
  .bar      // one expression!

val y = baz
  ::quux    // two expressions!
```

Since newlines are part of te grammar explicitly and therefore plainly
disallowed in some places. I expected that this would give me an error:

```kotlin
var y = (
    1
    + 2
)
```

I figured that wouldn't work because `+` only allows newlines after the operator.
But it works! It makes a lot of sense that they added this behaviour, but I
cannot find traces of this behaviour in the specification. If somebody could
show me where this is documented, I'd love to see it!

The vibe that I get from this implementation is that Kotlin's designers try
really hard to make the behaviour intuitive, regardless of how many rules and
exceptions they need. I guess that if people never run into problems with it,
then they don't need to understand it fully either. I'm not sure I agree with it
fully, but it's a somewhat reasonable position.

[This Stack Overflow answer][SO_Kotlin] echoes that sentiment:

> The rule is: Don't worry about this and don't use semicolons at all [...].
> The compiler will tell you when you get it wrong, guaranteed. Even if you
> accidentally add an extra semicolon the syntax highlighting will show you it
> is unnecessary with a warning of "redundant semicolon".

One might call this approach "don't worry, your IDE will fix it" and I guess
that's fair when the company behind the language creates IDEs. Nevertheless, if
that is truly the consensus in the community, they've done a pretty good job!

Another potential problem might be that all these complex rules make it much
harder to write custom parsers for Kotlin. I wouldn't want to be the person
responsible for maintaining its tree-sitter grammar for instance.

Sources:

 - [Kotlin language specification: Syntax and Grammar](https://kotlinlang.org/spec/syntax-and-grammar.html)
 - [Stack Overflow: What are the rules of semicolon inference?][SO_Kotlin]

[SO_Kotlin]: https://stackoverflow.com/questions/39318457/what-are-the-rules-of-semicolon-inference

## Swift

There is a somewhat obvious approach that hasn't come up yet: just parse as far
as you can ignoring newlines. Swift takes that approach and it's not hard to see why:

```swift
let x = 4
let y = 2 * x
      - 3
print(y)
```

That prints `5` as we would expect. The downside is that this prints `5` too:

```swift
let x = 4
let y = 2 * x
- 3
print(y)
```

But that's not too bad if you just have the rule that the language does not have
significant whitespace. If that's the rule then people should be able to
remember that. Interestingly, Swift does have _some_ significant whitespace
to prevent mistakes. For example, it is not allowed to put multiple statements on a
single line:

```swift
var y = 0
let x = 4 y = 4  // error!
```

They seem to have decided to ignore that in their grammar specification, but it
is part of the compiler.

With this approach, the most confusing examples I can find are around symbols
that can be both unary and binary operators (our eternal nemesis). This snippet
prints `8`:

```swift
let x = 4
let y = 2 * x
      -3
print(y)
```

Why? Because Swift has some special rules for parsing operators. If an operator
has whitespace on both or neither side, it's parsed as an infix operator. If it
has only whitespace on the left, it's a prefix operator. And finally, if only
has whitespace on the right, it's a prefix operator.

This means that this also parses as two statements:

```swift
let y = 2
      -foo()
```

Swift's designers seem to be aware of this problem (obviously) and therefore
emit a warning on unused values, which would trigger on the example above. That
should catch most erroneous cases.

Another tweak they seem to have made is that the parentheses of a function call
cannot be on their own line. The snippet below is parsed as two lines. They
check whether the `(` is at the start of the line and do not continue parsing if
that's the case. The same is also done for `[`. This is a pretty good rule! You
can check the JavaScript section to see how a language can get this wrong.

```swift
let y = x
  (1)
```

It's also worth discussing error reporting for syntax errors. Swift cannot
easily guess where a statement is supposed to end if the syntax isn't correct.

```swift
let x = 4
let y = ( 2 * x
print(y)
```

This snippet is obviously wrong, because there's a missing `)`, but Swift
instead complains about a missing `,` and a _circular reference_ because we're
using `y` before we declare it. It does that because it doesn't know that
the statement was supposed to end. Now, to be fair, I found only [1 comment]
complaining about that, so it might not be a big deal. I haven't written enough
Swift code to judge.

[1 comment]: https://softwareengineering.stackexchange.com/questions/291987/why-does-swift-not-require-semicolons#comment811665_291989

I like this approach a lot. It seems intuitive yet simple to understand and
debug. The error messages might take a bit of a hit, but you also get no
"missing semicolon" messages so that's a bit of a trade-off.

Sources:

 - [Swift Language Reference: Statements](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/statements)
 - [Swift Language Reference: Lexical Structure: Operators](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/lexicalstructure#Operators)
 - [Swift Forum: What are the rules of semicolon insertion in Swift?](https://forums.swift.org/t/what-are-the-rules-of-automatic-semicolon-insertion-in-swift/43532)
 - [Swift's parser](https://github.com/swiftlang/swift/blob/46e93980d4489345e7125eeec98d90c02a794b63/include/swift/Parse/Token.h#L231)

## JavaScript

JavaScript seems to be the language that has given Automatic Semicolon Insertion
a bad reputation. Its rules are pretty complex, but luckily there's a very good
[MDN article][MDN] about it.

There are three important cases where a semicolon is inserted:

1. If a token is encountered that is not allowed by the grammar that either
  a. is separated by at least one newline with the previous token,
  b. or if the token is `}`.
2. If the end of the input is reached and that is not allowed by the grammar.
3. If a newline is encountered in certain expressions such as after `return`,
   `break` or `continue`, among others.

Note that this is not everything! There are many exceptions to these rules, such
as that no semicolons are inserted in the `for` statement's head and that no
semicolon is inserted in places where it creates an empty expression.

All in all, this means that our example is parsed as one line:

```js
const y = 2 * x
   - 3
// is parsed as
const y = 2 * x
   - 3;
```

The complexity of these rules is kind of a problem in itself as these rules
are hard to remember. The worst part of this feature that the first rule only
triggers on invalid syntax. The MDN article is full of examples where this goes
wrong, such as these snippets, which are both parsed as a single line:

```js
const a = 1     // <- no semicolon inserted!
(1).toString()

const b = 1     // <- and also not here
[1, 2, 3].forEach(console.log)
```

If you want to code without semicolons in JS, you therefore have to think about
whether consecutive lines would be valid syntax if they were joined. Or you have
to learn a whole lot of rules such as:

- Never put the operand of `return`, `break`, etc. on a separate line.
- If a line starts with one of `(`, `[`, `` ` ``, `+`, `-`, `/`, prefix it with
  a semicolon, or end the previous line with a semicolon.
- And more!

No wonder that many people just opt to write the semicolons in JS. Take for
instance this quote from [JavaScript: The Good Parts][js-the-good-parts]:

> JavaScript has a mechanism that tries to correct faulty programs by
> automatically inserting semicolons. Do not depend on this. It can mask more
> serious errors.

In conclusion, you could write JS without semicolons, but the fact that many
people recommend you always add semicolons is quite damning. I haven't seen that
sentiment with the other languages in this post and it means that the feature
does more harm than good. This feature is too complex doesn't even manage to be
robust. Quite honestly, this feature is a disaster.

Sources:
 
 - [MDN: Lexical Grammar][MDN]
 - [JavaScript: The Good Parts][js-the-good-parts]

[js-the-good-parts]: https://www.oreilly.com/library/view/javascript-the-good/9780596517748/apas03.html
[MDN]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#automatic_semicolon_insertion

## Gleam

Gleam's appoach is very similar to Swift's: it also just parses the expressions
until they naturally end. Swift had a few exceptions to this though, so let's
investigate what Gleam does.

First, we can look at our recurring example:

```gleam
let y = 2 * x
      - 3
```

That's parsed as one expression as we might expect. However, we can remove one
space to change that:

```gleam
let y = 2 * y
      -3
```

Kind of like Swift, Gleam seems to parse the `-3` as a single token if it is
preceded by whitespace and as a binary operator otherwise. I couldn't find a
source for this so the details might be off here.

Gleam's approach of parsing everything regardless of whitespace does have some
strange consequences. For example, this is accepted and parses as 2 expressions:

```gleam
pub fn main() {
  1 + 1 1 + 1
}
```

I would personally require a newline there if I was designing Gleam, but this
is perfectly unambiguous. Gleam's formatter will also put both expressions on
their own line and Gleam will warn you about an unused value, so you'll notice
that something's off soon enough.

This is parsed as one expression, i.e. a function call:

```gleam
pub fn main() {
  foo
  (1 + 1)
}
```

Now if you've written any Gleam, you might be yelling at your screen, because
that second example isn't ambiguous! It can only be a function call because
Gleam uses `{}` for grouping expressions and if we use that it's not a function
call anymore:

```gleam
pub fn main() {
  foo
  { 1 + 1 }
}
```

In another stroke of genius ambiguity prevention, Gleam also doesn't have list
indexing with `[]`. So this is also parsed as two expressions:

```gleam
pub fn main() {
  foo
  [ 1 + 1 ]
}
```

It's interesting that Gleam doesn't have the same guardrails that Swift has.
It gets away with that by having a very unambiguous grammar. This is very
impressive language design. Its rules are also pretty easy to grasp, so it looks
like a pretty good implementation to me.

Sources: 

 - [Gleam Language Tour](https://tour.gleam.run/everything/)

## Lua

Speaking of languages that just parse the thing as far as they can, Lua does
that too! The [book] says:

> A semicolon may optionally follow any statement. Usually, I use semicolons
> only to separate two or more statements written in the same line, but this is
> just a convention. Line breaks play no role in Lua's syntax\[.\]

This means that it basically works like Gleam! What sets it apart is that it
does has indexing with `[]` and groups expressions with `()`. Here's an
example that requires a semicolon to prevent it being parsed as a single
statement:

```
(function() end)(); -- semicolon is required here
(function() end)()
```

There might be even more problematic cases, but I'm not good enough with Lua to
find them.

Sources:

 - [Programming in Lua][PIL]

[PIL]: https://www.lua.org/pil/1.1.html

## R

We've seen before that some language insert semicolons when reading further
would be invalid. R sort of takes the opposite approach: it inserts a semicolon
when the grammar allows it. Here's the official explanation from the [R Language
Definition][R_DEF]:

> Newlines have a function which is a combination of token separator and
expression terminator. If an expression can terminate at the end of the line the
parser will assume it does so, otherwise the newline is treated as whitespace.

There's one exception to this rule, which is that the `else` keyword can appear
on a separate line.

That approach somewhat reminiscent of Python's, but not quite the same, because
R allows expressions to continue to the next line if they are incomplete. Our
recurring example would look like this and parse as two expressions because the
grammar allows the expression to end after the `x`:

```r
y = 2 * x
  - 3
```

But with a slight modification it parses as one expression:

```r
y = 2 * x -
    3
```

The result is that you'd almost never have to worry about the next expression
being parsed as part of the former, unless you're quite explicit about them
being joined, for example with parentheses or trailing operators. The downside
is that I would generally prefer to write the operator at the start of the next
line, which we can only do if we wrap the expression in parentheses (just like
with Python).

It looks like a pretty good approach. I like that the newline has some semantic
meaning and it doesn't feel confusing.

Sources:

 - [R Language Definition][R_DEF]

[R_DEF]: https://cran.r-project.org/doc/manuals/r-release/R-lang.html#Separators-1

## Ruby

Another famously semicolonless language is of course Ruby. It has a very similar
approach to R, but as is becoming a bit of a theme, not quite the same. Like
R, it splits statements by lines, but allows the expression to continue if it's
incomplete. So we can basically copy our examples for R verbatim:

```ruby
# 2 expressions
y = 2 * x
  - 3

# 1 expression
y = 2 * x -
    3
```

But Ruby has a few more tricks up its sleeve. First, you can end a line with
`\` to explicitly continue the expression on the next line, kind of like Python.
Second, it has a special rule that lines starting with a `.`, `&&` or `||` are
a continuation of the line before. It does that to allow method chaining and
logical chains.

```ruby
File.read('test.txt')
    .strip("\n")
    .split("\t")
    .sort

File.empty?('test.txt')
  || File.size('test.txt') < 10
  || File.read('test.txt').strip.empty?
```

I find this slightly confusing, because it's strange that some operators can
start the next statement but not all of them. I guess it's not too bad to
remember 3 exceptions. So, it looks pretty good!

Sources:

 - [Ruby Documentation: Layout](https://docs.ruby-lang.org/en/4.0/syntax/layout_rdoc.html)

## Julia

Documentation on how Julia's syntax works was a bit hard to find, so I looked
at their parsing code. This means I have to guess a little bit at what the
intention is.

Here are some things I tried:

```julia
b = 3
  - 4
# -> 3

c = 3 -
  4
# -> -1

d = ( 3
  - 4)
# -> -1
```

It seems to be dependent on the kind of the expression whether a newline
continues a statement. But in general, they seem to prefer splitting into
multiple lines if that is legal. The newline is really treated as a separator in
the parser. In that sense, it matches other languages with a lot of use in the
scientific community such as Python and R.

If anybody knows where to find documentation on this, let me know!

Sources:

- [JuliaSyntax.jl](https://github.com/JuliaLang/JuliaSyntax.jl/blob/main/src/julia/parser.jl)

## Odin

While I was working on this post, GingerBill released a [blog post](odin-post)
that contained an explanation of Odin's approach. What I found particularly
interesting are the reasons he cites for implementing them:

> There were two reasons I made them optional:
>
> - To make the grammar consistent, coherent, and simpler
> - To honestly shut up these kinds of bizarre people

It looks like he didn't care much for that feature himself. What's nice about
this post is that he lays out some reasoning for Odin's approach. He describes
it as a mix of Python of Go, where there is semicolon insertion done by the
lexer, but not within `()`, `{}` and `[]`.

Another exception he lays out is that Odin has a few exceptions to allow braces
to start on the next line:

```odin
a_type :: proc()

a_procedure_declaration :: proc() {

}

another_procedure_declaration :: proc()
{

}

another_type :: proc() // note the extra newline separating the signature from a `{`

{ // this is just a block

}
```

In a way, this looks like the opposite of Go, where instead of enforcing a
certain coding style, they go out of their way to allow other coding styles
than their own. This rule seems a sign that their grammar might be a bit too
"overloaded", using very similar syntax for different concepts. But hey, they
probably had good reasons to do so.

Sources:

- [Choosing a Language Based on its Syntax](odin-post)

[odin-post]: https://www.gingerbill.org/article/2026/02/19/choosing-a-language-based-on-syntax/

## An idea I haven't seen yet

Here are some ideas I haven't seen being used and I wonder whether they make sense.

The only language that seems to consider indentation at all is Python, but only
to restrict mistakes. I would love to see a language try to implement a rule
where an indented line is considered part of the previous expression.

```python
x = 3
- 3   # two expressions!

x = 3
  - 3 # one expression!
```

This feels quite intuitive to me. I could see this being a replacement for
Python's line joining with `\\`. A problem is of course that now the indentation
always needs to be correct and many developers (myself included) like to just
have their formatter deal with the indentation.

# Overview

We made it to the end! I think the best way to summarize this document is by
grouping the languages:

- Split statements on newlines, with exceptions
  - Python
  - Ruby
  - R
  - Julia
  - Odin
  - Kotlin
- Continue statements on the next line, unless that's invalid
  - JavaScript
  - Swift
- Let the lexer insert semicolons
  - Go
- Do not consider whitespace while parsing
  - Lua
  - Gleam

<blockquote class="note">

**Note**: These categories are not perfect, for some languages, you could make
the argument that they fit in multiple categories.

</blockquote>

You could make some other categories as well. For example, you could call
Python, Ruby, R, Julia, and Odin _conservative_ in their parsing, as in, they
usually stop parsing at a newline. Lua, Gleam and Swift, on the other hand, are
more _greedy_: they usually keep parsing across newlines as far as they can.

Another distinction to make is how it is implemented. JavaScript, Go and Odin
have at least some part of the semicolon insertion implemented in the lexer,
while many other languages make it part of the parser.

A final interesting category are the languages that are entirely insensitive
to whitespace such as Lua and Gleam. Even though Swift gets close to this
category, it turned out to have some whitespace-sensitive rules.

# Conclusion

This turned out to be a much more complicated topic than I ever expected! While
there are approaches I like better than others, not all languages should use the
same solution, because there might be other ways that the syntax differs that
should be taken into account.

Nevertheless, I guess this is the part where I have to give my opinion about
all of this, so here are some guidelines I would use (which you might very well
disagree with):

- Prefer defining clear rules over baking it into your parser (looking at you Kotlin).
- Keep those rules as simple as possible (looking at you JS).
- I prefer grouping with `()` over splitting with `;` in a language with
  optional semicolons, so I would pick a strategy that splits on newlines in
  most cases.
- Add tooling to help catch mistakes (such as warnings on usused values) to
  prevent the most ambiguous cases.

Do you agree? What do you think is best? Have I missed any important languages?
Do you have cool ideas for better implementations? Let me know be responding to
[this post on Mastodon](todo)!

# Acknowledgements

Thanks to <insert names> for proof reading drafts of this post. Any mistakes are
my own. You can send corrections to <terts.diepraam@gmail.com> or [on
Mastodon](this-post).

No LLMs were used while writing this piece, neither for gathering information or
for writing.
