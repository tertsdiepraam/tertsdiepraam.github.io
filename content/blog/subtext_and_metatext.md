+++

title = "The Subtext and Metatext of Code"

description = "How to convey intent, reasoning and context between the lines."

date = "2022-11-01"

+++

Programming relies heavily on implicit information, probably even more than we
would like to admit. When we come across foreign code, we make bold assumptions
and rely on conventions to try to build a mental model of the code. If that's
easy to do, we call the code "clear", but that term is too vague. Instead, I
would like to propose that we borrow some concepts from linguistics: subtext and
metatext.

If we want our code to be understood by others, we need to explain the intent
and context behind the code to the reader. We can do this explicitly via
comments or implicitly, by including signals that hint toward the function of
the code (e.g. choosing clear variable names). Because these signals are just
hints, the term subtext is appropriate. Similarly, comments are a part of the
code that are about the code itself and can be called metatext.

# Text, subtext & metatext

Let's make these definitions a bit more formal:

- The **_text_** is the literal code, excluding comments and docstrings.
- The **_subtext_** is the context, intent and reasoning behind the code implied
  by the text.
- The **_metatext_** is anything that explains the code apart from the text. For
  example, comments and documentation.

That's all very abstract, so let's look at an example. The code below is
basically devoid of subtext and metatext. It is a function calculating the
factorial of a natural number, but nothing in the code hints to that
functionality.

```python
def a(b):
    if b == 0:
        return 1
    else:
        return b * a(b-1)
```

Our goal is now to change the text such that it includes hints to the intent,
that is, the subtext. We can do this by choosing better names. The `factorial`
name explains that this defines a function that computes a factorial. `n`
implies by convention that the input should be a natural number. The result is
much clearer!

```python
def factorial(n):
    if n == 0:
        return 1
    else:
        return n * factorial(n-1)
```

Finally, we can add metatext with comments and type hints[^1]. In the metatext,
we can explain anything not immediately obvious from the code. We explicitly
state that `n` should be an `int` and that `n` should be a natural number (i.e.
greater than zero). We also state the limitations of the code in the metatext.

```python
def factorial(n: int) -> int:
    """
    Computes the factorial of a natural number `n`

    Warning: this function will not terminate if `n` is negative.
    """
    # TODO: Rewrite without recursion for better performance.

    # We calculate the factorial by recursion. The base case of
    # the recursion comes from the fact that 0! = 1.
    if n == 0:
        return 1
    else:
        return n * factorial(n-1)
```

It should be obvious that good code has both good subtext and good metatext. In
most cases, neither is sufficient to convey the intent efficiently. However,
your opinion on what constitutes good sub- or metatext might differ from my
opinion and that's okay. It also depends on the context and purpose of the code.
For example, the requirements change depending on whether it is production code
or code written for educational purposes.

# Basic subtext

Now, let's explore how we can use subtext to our advantage. We start with this
example of some intentionally bad Python code:

```python
x = [4, 10, 2]
z = 0
for y in x:
    z += x
```

The code above computes the sum of 3 numbers, but you have to read the full code
to understand it, because the subtext is missing. We can add subtext with better
variable names:

```python
numbers = [4, 10, 2]
total_sum = 0
for number in numbers:
    total_sum += number
```

Now, when you see the variables `numbers` and `total_sum`, you can already guess
what the rest of the code is going to do and you only have to check that
assumption. Of course, subtext can also imply incorrect information, for
example, if the variable names do not match the actual computation[^2]:

```python
numbers = [4, 10, 2]
total_product = 0
for number in numbers:
    total_product += number
```

Changing variable names is not all we can do to improve subtext. To show our
intent even more clearly, we can call the `sum` function instead of using a
`for` loop. The difference is that a `for` loop is a general construct for all
kinds of loops, but that `sum` can only be used for, well, summing things. So
`sum` carries the subtext that our intent is to sum things.

```python
numbers = [4, 10, 2]
total_sum = sum(numbers)
```

In this final version, the code is immediately obvious, because the subtext
supports the text. When people say that code should be "self-documenting", this
is what they mean: that the subtext resolves most questions about the code.

Note that there are also multiple pieces of the code signalling that we are
summing the numbers (the variable and function name). If there is consistency
between multiple signals, that will help the reader to confidently build a
mental model of the code.

Here are some basic guidelines for good subtext:

- Give variables descriptive names.
- Give functions descriptive names.
- Give source files descriptive names.
- Break complicated expressions up into several steps (with descriptive names).
- Use specialized functions and language constructs over general functions and
  language constructs.
- Organize the source files in a logical way.

# Conventional subtext

Subtext is also about convention, both within a codebase and within the larger
programming community. For example, `n` implies that a variable holds an integer
and `df` is often used for Pandas data frames. Using other names, like `b` and
`table`, could be confusing to other programmers. Similarly, using `df` for an
integer would also be confusing.

Python has two main constructs for applying some function to the elements of a
list: `map` and list comprehensions.

```python
def double(x):
    return 2*x

numbers = [4, 10, 2]

# map
doubled = list(map(double, numbers))

# list comprehension
doubled = [double(n) for n in numbers]
```

In my experience, most python programmers prefer the list comprehension and will
use that instinctively. So, the list comprehension should be used, even if you
do not agree with that preference (e.g. if you have a background in functional
programming), because it carries subtext by convention established in the Python
community.

However, if `map`, `filter` and `fold` are already used a lot in the codebase,
then the `map` might be more appropriate, because it carries subtext by
convention established in the codebase itself, overriding the conventions from
the larger Python community.

Conventions are usually difficult to pick up for programmers that are new to a
language or framework, because you usually pick them up by just reading a lot of
code. However, specifically focusing on learning the conventions and best
practices to pick them up quickly is well worth your time.

# Metatext

Subtext is often not enough to explain the full context and intent of the code.
For instance, it is really difficult to express assumptions and edge cases in
text and subtext alone. In these cases, we need to resort to metatext. Metatext
is anything written about the code that helps in understanding the code. Here
are some examples:

- Comments
- Docstrings
- Documentation
- Type hints
- README
- Architecture diagrams
- Commit messages
- Pull request descriptions
- Tests
- Stack Overflow answers
- Benchmarks
- Tutorials

None of these have any influence on what the code does, but they exist to
explain what the code does and why certain changes have been made. All of them
have slightly different purposes and audiences. They might be official
documentation or written by third-parties.

Like subtext, metatext can go out of sync with the text. So it's important to
update documentation along with changes to the code. Because metatext is such a
broad concept, this task is especially difficult and daunting. For example,
Stack Overflow answers for fast-changing libraries often stay outdated for a
long time (or indefinitely), because nobody wants to search through the entirety
of Stack Overflow to update every answer about a problem. This might not be a
problem on its own, but if many communication channels go out of date, then
newcomers are more likely to be presented with incorrect information and won't
be able to use the library.

The usefulness of metatext also depends on convention. Information should be
available in the places one might expect them. For example, I would not expect
to find API documentation in a commit message, so if it's hidden there I won't
find it.

Comments are a special kind of metatext, because they always appear alongside
the text. To be useful, they should therefore not repeat information that is
already easily gathered from the text or subtext. Consider the following
example:

```python
# bad: states the obvious
# Divide x by 100
x /= 100

# good: gives reason for division
# Convert percentage into fraction
x /= 100
```

On the other hand, docstrings should state some things that are obvious from the
function body, because we cannot assume that a user of the function will look at
the function body.

# Conclusion

Clear code is code where the text, subtext and metatext all support each other
to convey the intent, reasoning and context behind a computation. For every
change you make to code, you should consider how you can update the subtext and
metatext such that your change becomes clear to others.

<hr style="margin: 2em 0;">

[^1]: In statically typed languages, types should probably be understood as part
of the text or subtext, not the metatext. If you are enforcing the use of some
static type checker in a dynamically typed languages, then the type hints could
also be understood as subtext. In this post, I'm sticking with un-type-checked
Python and am therefore considering type hints to be nothing more than a comment
and hence metatext.

[^2]: One might call this code "ironic", since its text and subtext do not
match, but that concept does not seem particularly useful in the context of
programming.
