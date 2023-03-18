+++

title = "Rewriting assert! to assert_eq! with a declarative macro"

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
`assert_ne!` automatically?

A proc macro could definitely do this (as for example the
[`assert2`](https://crates.io/crates/assert2) crate proves), but is it also
possible with a declarative macro? Turns out the answer is yes and if you want
to know how, you can scroll to the end of this post, but I'd like to take you
along our journey of how we got to the final solution.

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

Luckily, Rust also allows us to match on token trees, which are single tokens of
a list of tokens enclosed by matching delimiters like `()`, `[]` and `{}`. So
instead of matching on the expression, we'll match on a list of token trees and
find the `==` ourselves.

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

That is exactly what we wanted, so I think that we've made the perfect[^1]
macro!

# Ending this madness

I'm not sure I recommend using this in real code. I think it works, but I didn't
do any checks for compile times. It was a fun experiment, though!

The recursive macro calls might slow down compilation a bit, but it might still
it might be faster than a similar proc macro. I haven't measured the
differences.

There are some interesting directions to take this idea further. First, we could
support more comparison operators, like `>=` and `<`, but there are no built-in
macros to rewrite too, so that requires some more work.

The technique for parsing is also interesting on its own. For example, it should
be possible to parse arithmetic expressions with operator precedence with this,
but that's a can of worms I won't open here.

In any case, I hope this inspires many macro crimes!

---

Thanks to Lucas, Jonathan & Arav for solving this problem with me.

[^1]: I'm sure it breaks in more cases and if you find any, I'd love to hear
about it!
