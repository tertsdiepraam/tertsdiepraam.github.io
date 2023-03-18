+++

<<<<<<< HEAD
title = "Rewriting assert! to assert_eq! with a declarative macro"
=======
title = "Trying to rewrite assert! to assert_eq! with a declarative macro"
>>>>>>> 61d4c1a (first version of assert macro post)

+++

Rust has a couple of assert macros in its standard library:

- `assert!`,
- `assert_eq!`, and
- `assert_ne!`.

The first just takes a boolean expression and panics if it evaluates to `false`.
The other two are just special cases where you pass to arguments and the
assertion checks that whether they are equal or not, respectively, but their
output is more helpful, because they print both operands, instead of just saying
that the assertion failed.

This brings up an interesting question: why can the macro not just detect that
the expression in `assert!` is `A == B` or `A != B` and use `assert_eq!` or
`assert_ne!` automatically? In many cases that would be a bit easier to read. Compare these calls:

```rust
assert!([1,2,3] == [4,5,6]);
assert_eq!([1,2,3], [4,5,6]);
```

It's not much of a difference, but I like the first one just a bit better.

A proc macro could definitely do this (as for example the
[`assert2`](https://crates.io/crates/assert2) crate proves), but is it also
possible with a declarative macro?

**Before you continue, I want to spoil the end: I failed.** I was able to cover the most common cases, but there are expressions which I couldn't find a solution for. Still, I think it's interesting to investigate why this problem is hard and what techniques I used along the way.

# Why the simple solution does not work

Declarative macros in Rust are basically pattern matches on the token streams of
their input. In theory we could therefore first define a case for `==`, then one
for `!=` and finally fall back to the general case. It would look like this:

> Note: To make this all work properly in a library, all nested macros need to
> be qualified with an absolute path, so that they don't need to be imported by
> the calling code.

```rust
macro_rules! fancy_assert {
    ($a:expr == $b:expr) => { assert_eq!($a, $b)};
    ($a:expr != $b:expr) => { assert_ne!($a, $b)};
    ($a:expr) => { assert!($a)};
}
```

Sadly, the compiler complains with the following error:

```plain
error: `$a:expr` is followed by `==`, which is not allowed for `expr` fragments
 --> src/main.rs:2:14
  |
2 |     ($a:expr == $b:expr) => {
  |              ^^ not allowed after `expr` fragments
  |
  = note: allowed there are: `=>`, `,` or `;`
```

We cannot use a `==` token after an expression, which makes sense because the
`==` could itself be part of the expression. Technically, it might be possible
to parse with backtracking but the pattern matching for declarative macros is
not that advanced. So it seems like we can't use expressions for this purpose.

# Matching on token trees

Luckily, Rust also allows us to match on token trees, which are single tokens or
tokens in matching delimiters like `()`, `[]` and `{}`. So instead of matching
on the expression, we'll match on a list of token trees and find the `==`
ourselves.

Here's the general idea: we have some marker token in the token tree that we
move recursively through the list of token trees. When we encounter a `==` or
`!=`, we expand to a `assert_eq!` or `assert_ne!` respectively.

Here is our first attempt at this:

```rust
macro_rules! internal_assert {
    // If the token after the `;` is ==, we use assert_eq!
    ($($prev:tt)* ; == $($next:tt)*) => {
        assert_eq!($($prev)*, $($next)*)

    };
    // If the token after the `;` is !=, we use assert_ne!
    ($($prev:tt)* ; != $($next:tt)*) => {
        assert_ne!($($prev)*, $($next)*)

    };
    // If we reached the last token, we use assert!
    ($($prev:tt)* ; $(last:tt)?) => {
        assert!($($prev:tt)* $(last)?)
    };
    // Else we recurse by putting the `;` to the right
    ($($prev:tt)* ; $curr:tt $($next:tt)*) => {
        internal_assert!($($prev)* $curr; $($next)*)
    };
}

macro_rules! fancy_assert {
    ($head:tt $($tail:tt)*) => { internal_assert!($head; $($tail)*) }
}
```

Again, this doesn't compile with the following error:

```plain
error: local ambiguity when calling macro `internal_assert`: multiple parsing options: built-in NTs tt ('prev') or 1 other option.
  --> src/main.rs:17:56
   |
17 |     ($head:tt $($tail:tt)*) => { internal_assert!($head; $($tail)*) }
   |                                                        ^
...
46 |     fancy_assert!(5 == 6);
   |     --------------------- in this macro invocation
   |
   = note: this error originates in the macro `fancy_assert` (in Nightly builds, run with -Z macro-backtrace for more info)

error: could not compile `assert_macro` due to previous error
```

This error is very similar to the last one, because it's ambiguous whether the
`;` should be parsed as a token tree or as the `;` in the pattern.

# A cursed solution

How can we put that `;` somewhere unambiguous? Well, we could use every other
position as a marker that could be either `,` or `;` an expression like this:

```txt
2 + 4 == 3 + 3
```

would first be expanded into

```txt
2; +, 4, ==, 3, +, 3
```

And then we can match those tokens without the `tt` pattern!

Here's what that looks like in code:

```rust
macro_rules! internal_assert {
    ($($prev:tt),* ; ==, $($next:tt),*) => {
        assert_eq!($($prev)*, $($next)*)
    };
    ($($prev:tt),* ; !=, $($next:tt),*) => {
        assert_ne!($($prev)*, $($next)*)
    };
    ($($prev:tt),* ; $(last:tt)?) => {
        assert!($($prev:tt)* $(last)?)
    };
    ($($prev:tt),* ; $curr:tt, $($next:tt),*) => {
        internal_assert!($($prev),*, $curr; $($next),*)
    };
}

macro_rules! fancy_assert {
    ($head:tt $($tail:tt)*) => { internal_assert!($head; $($tail),*) }
}
```

And it works! I was happy with this for a little while, but I still found this
solution to be lacking a bit. The insertion of `,` just didn't sit right with
me. So let's try another solution.

# Brackets to the rescue

I had kept thinking about this "marker" as the obvious solution, but the fact
that the marker needs to be a token itself makes things difficult. So what
symbol could we use that's not a token tree? Let's review the definition of a
token tree:

> "a single token or tokens in matching delimiters (), [], or {}"

That means the delimiters are special! We can use those! Because we already have
so many `()` in our rules, I think it's best if we make `{}` our special
symbols.This looks much better than our previous attempt:

```rust
macro_rules! internal_assert {
    // If the first token on the right is ==, we use assert_eq!
    ({ $($prev:tt)* } { == $($next:tt)* }) => {
        assert_eq!($($prev)*, $($next)*)
    };
    // If the first token on the right is !=, we use assert_ne!
    ({ $($prev:tt)* } { != $($next:tt)* }) => {
        assert_ne!($($prev)*, $($next)*)
    };
    // If we did not encounter `==` or `!=`, we use assert!
    ({ $($prev:tt)* } {}) => {
        assert!($($prev)*)
    };
    // If we have tokens left, but it's not `==` or `!=` move
    // the token to the left braces.
    ({ $($prev:tt)* } { $curr:tt $($next:tt)* }) => {
        internal_assert!( { $($prev)* $curr } { $($next)* })
    };
}

macro_rules! fancy_assert {
    ($($tokens:tt)*) => { internal_assert!({} { $($tokens)* }) }
}
```

That's it! I have tested this with the following expressions:

```rust
fancy_assert!(5 == 6); // => assert_eq!
fancy_assert!(2 + 4 == 3 + 4); // assert_eq!

fancy_assert!(5 != 5); // => assert_eq!
fancy_assert!(2 + 4 != 3 + 3); // assert_eq!

fancy_assert!(false); // => assert!
fancy_assert!(!Vec::<i32>::new().is_empty()); // => assert!

// Note that we can even use `==` inside the expression, because
// everything between parentheses is a single token tree.
fancy_assert!(!(3 == 4)); // => assert!
```

# Chaining comparison operators

However, there is one case we did not think about yet: what if there are
multiple comparison operators in the expression? As it turns out, normal Rust
does not allow that. For example, this expression does not compile:

```rust
assert!(true == true == true);
```

But in our last version, this does compile:

```rust
fancy_assert!(true == true == true);
```

because it gets rewritten to

```rust
assert_eq!(true, true == true)
```

And so the final expression that Rust gets only has one comparison operator.
This seems like it might trip people up, so we should restrict that. This
essentially boils down to asserting that the tokens form a valid expression.

A naive solution would be to only accept expressions as input an then pass that
as tokens to the internal macro (`internal_assert!` is unchanged from above):

```rust
macro_rules! fancy_assert {
    ($e:expr) => { internal_assert!({} { $e }) }
}
```

It compiles, so I tried to run this with `fancy_assert!(5 == 6)` and...

```plain
thread 'main' panicked at 'assertion failed: 5 == 6', src/main.rs:46:5
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

Oh, it broke the macro? We have a valid assertion, but we just get the normal
`assert!`, not `assert_eq!`. It seems like Rust is somehow changing the tokens
of the expression and it is parsed as a single token tree.

This means that our public macro needs to accept a list of token trees which
need to be passed to the internal macro directly. But, we can still fix it! All
we have to do is make a third macro that only accepts valid expressions!

```rust
macro_rules! is_expr {
    ($e:expr) => {};
}

macro_rules! fancy_assert {
    ($($t:tt)*) => {
        is_expr!($($t)*);
        internal_assert!({} { $($t)* })
    }
}
```

The `is_expr!` macro does not actually generate any code, it just acts as a
guard, which generates this error when we try to chain comparison operators:

```plain
error: comparison operators cannot be chained
  --> src/main.rs:50:24
   |
50 |     fancy_assert!(true == true == true); // => assert_eq!
   |                        ^^      ^^
   |
help: split the comparison into two
   |
50 |     fancy_assert!(true == true && true == true); // => assert_eq!
   |                                +++++++
```

Problem solved! Right?

# Lower precedence operators

What if we follow the suggestion from the compiler in that last error message? That would not work because it would expand to

```
assert_eq!(true, true && true == true);
```

That's using the wrong precedence.

So if any of these tokens appear, we need to fall back to `assert!`. So before we use our `interal_assert` macro, we can first scan for those tokens. Luckily, we can do that with a similar technique to above.

```rust
macro_rules! scan_lower_precedence {
    ({ $($prev:tt)* } { && $($next:tt)* }) => {
        assert!($($prev)* && $($next)*)
    };
    ({ $($prev:tt)* } { || $($next:tt)* }) => {
        assert!($($prev)* || $($next)*)
    };
    ({ $($prev:tt)* } {}) => {
        internal_assert!({} {$($prev)*})
    };
    ({ $($prev:tt)* } { $curr:tt $($next:tt)* }) => {
        scan_lower_precedence!({ $($prev)* $curr } { $($next)* })
    };
}

macro_rules! fancy_assert {
    ($($t:tt)*) => { is_expr!($($t)*); scan_lower_precedence!({} { $($t)* }) }
}
```

# If expressions

At this point, I really thought I was done and I was ready to put this all in a crate and publish it with great fanfare. But it turned out there were bigger problems than `&&` and `||`.

The problem lies with `if`, `match`, `for` & `while` which can all contain `==` in their expressions without them being enclosed within delimiters.

I kept trying an I got `if` expressions mostly working, by using a stack to keep track of nested `if` statements. Here it is:

```rust
// The first argument is the callback for the macro with
// which we should continue execution when the stack is
// empty.
//
// The second argument is a stack of if's and matches that
// we are currently in. The base case is [] and each item
// wraps the last [if [if []]].
//
// If we find an `if`, we push it to the stack, if we find
// the end we pop it.
macro_rules! parse_cond {
    // Found the end of an if expression and if is at the top of the stack
    ($cb:ident [if $stack:tt] { $($prev:tt)* } { $then:block else $else:block $($next:tt)* }) => {
        parse_cond_or_callback!($cb $stack { $($prev)* $then else $else } { $($next)* })
    };
    // Found the start of an if expression, put it on the stack and continue
    ($cb:ident $stack:tt { $($prev:tt)* } { if $($next:tt)* }) => {
        parse_cond!($cb [if $stack] { $($prev)* if } { $($next)* })
    };
    // Some other token, we just recurse
    ($cb:ident $stack:tt { $($prev:tt)* } { $curr:tt $($next:tt)* }) => {
        parse_cond!($cb $stack { $($prev)* $curr } { $($next)* })
    };
}

// Expand to the callback if the stack is empty or recurse otherwise
macro_rules! parse_cond_or_callback {
    ($cb:ident [] $prev:tt $next:tt) => { $cb!($prev $next) };
    ($cb:ident $stack:tt $prev:tt $next:tt) => { parse_cond!($cb $stack $prev $next)};
}

// For the macros below other cases are the same as before.
macro_rules! internal_assert {
    ({ $($prev:tt)* } { if $($next:tt)* }) => {
        parse_cond!(internal_assert [if []] { $($prev)* if } { $($next)* })
    };
    /* snip */
}

macro_rules! scan_lower_precedence {
    ({ $($prev:tt)* } { if $($next:tt)* }) => {
        parse_cond!(scan_lower_precedence [if []] { $($prev)* if } { $($next)* })
    };
    /* snip */
}
```

This works, but I couldn't find a solution for the other cases like `match` and the code would frankly become too complicated. Instead the "solution" would just be to give a compile-time error if we encounter any `match`, `while` or `for`. It's unsatisfying, but maybe someone with better macro-fu skills can do better.

# Ending this madness

The truth is that were only working with crude approximations of Rust syntax and that it is extremely hard to prove that it covers all cases. Instead of using the code from this post, I recommend `assert2`, which has this feature and much more and is actually able to parse the code.

I would like to see some of the functionality of `assert2` in the standard `assert`, since it would greatly improve the default testing facilities in Rust. I'd love to see some discussion in that space.

This whole ordeal was a fun experiment though! The technique for parsing is also interesting on its own. The Little Book of Rust Macros has a section on this technique, which they call [TT munching](https://veykril.github.io/tlborm/decl-macros/patterns/tt-muncher.html). It's a powerful technique, but also has quadratic time complexity, so use with caution. I can highly recommend looking at the Little Book if you need some advanced macro techniques. They also explain other techniques I used, like [callbacks](https://veykril.github.io/tlborm/decl-macros/patterns/callbacks.html) and [TT bundling](https://veykril.github.io/tlborm/decl-macros/patterns/tt-bundling.html). I foolishly figured these out myself, because I forgot about the book, but I recommend checking it out!

---

Thanks to Lucas, Jonathan & Arav for solving this problem with me, providing interesting test cases and proofreading drafts of this post.
