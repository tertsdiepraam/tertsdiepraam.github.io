+++

title = "On Rust's error handling"
draft = true
+++

Rust's error handing has been debated online many times. I've seen many blog
posts arguing in its favor and many criticizing it harshly. In this post, I want
to give a more nuanced take. I will explore how it relates to other languages
and what the advantages and disadvantages are compared to these other systems.
I will try to explain why I think that Rust's error system is good, but maybe
not great.

# Part 1: Option

Many discussions of `Result` start with its simpler cousin `Option`. While they
are similar from Rust's perspective (with `Option<T>` being almost identical to
`Result<T, ()>`), that connection is not obvious in other languages. In those
languages, an error only occurs when a `None` (or `nil` or `null` or whatever
your favorite language uses) is being used.

This is one of the first things that Rust gets right: nullability is opt-in.
Most values in Rust simply cannot be `None`. It's only when we wrap them in
`Option` that they become "nullable". This seems to be the design that many
newer languages statically typed have converged to such as Swift and Kotlin.

Compared to those languages, Rust's solution is actually a bit verbose. Say we
want to assign a value to a variable that can be `null`. Here's Rust:

```rust
let x: Option<T> = Some(5);
```

and here's Swift:

```swift
let x: Int? = 5
```

I've written both with type annotations to make it clear what's happening. In
Rust, `Option` is just an `enum` where the `Some` must be constructed. In Swift,
they've chosen to bake nullability more into the language and any value can
implicitly be converted into it's nullable counterpart. This is quite handy
sometimes, because the `Some`-wrapping can get verbose.

```rust
fn digits(a: i32) -> Option<i32> {
    if a < 10 {
        Some(1)
    } else if a < 100 {
        Some(2)
    } else {
        None
    }
}
```

Here, we have to wrap each value that we want to return in `Some`. Now in Swift
we get:

```swift
func digits(a: Int) -> Int? {
    if a < 10 {
        return 1
    } else if a < 100 {
        return 2
    } else {
        return nil
    }
}
```

Okay, so why doesn't Rust do this automatic conversion? I can think of several
reasons. The first is that it doesn't want to make `Option` too special.
Another reason might have something to do with the fact that Rust also has
`Some(Some(5))`, which can be valid. Meanwhile Swift doesn't have an `Int??`
type, because it would be ambiguous whether `nil` is equivalent to `None` or
`Some(None)`. Sometimes, Swift's automatic conversion hides some information.
For example, this is fine in Swift:

```swift
func foo() -> Int {
    return 5
}

func bar() -> Int? {
    return foo()
}
```

We can't tell from `bar` whether `foo` returns `Int` or `Int?`. In Rust we need
to explicitly wrap the call in `Some`:

```rust
fn foo() -> i32 {
    5
}

fn bar() -> Option<i32> {
    Some(foo())
}
```

For some people (or contexts) this might be too explicit, for others, Swift's
solution is perfectly fine.

So far, we've talked about constructing nullable values, but not about working
with them. To use the value inside `Some` in Rust, we have to somehow check that
the value is `Some`. Here are just some of the ways to do that:

```rust
match val {
    Some(x) => { /* ... */ }
    None => { /* ... */ }
}

if let Some(x) = val {
    /* ... */
}

let Some(x) = val else {
    /* ... */
}

x.unwrap();
x.unwrap_or(y);
x.unwrap_or_else(|| x);
```

We can branch in several ways, provide defaults, transform the value, you name
it. This is another strength: we have to think about the nullability.

Another strength of Rust's `Option`: it's just an `enum`.
This means that we can use all of Rust's pattern matching, implement methods
for it and pass it around as a normal type. This might seem like a simple point
but it really demystifies some of handling around `Option`: there are no hidden
conversions, no magic and (almost) no special language features for it. In that
sense, `Option` is just convention.

That being said, here are Swift's versions of the `match` and `if` expressions
above:

```swift
switch (val){
case .some(let x): // or `case let x?`
  /* ... */
case .none:
  /* ... */
}

if let val { // or `let val = val`
    /* ... */
}

guard let val else { // or `let val = val`
    /* ... */
}
```

Hey look at that `switch` statement! We have `.some` and `.none` there, just
like in Rust. Turns out that Swift was doing everything Rust-style all along but
just hiding it well. This looks great to me, because it always allows us to use
the enum variants if we want, but we could leave that out to simplify the code
if it's obvious. I only have one issue with it, which is that it breaks the
assumption that an assignment is an irrefutable pattern. If I write
`let x = val`, I expect `x` to be the same as `val`, that's not the case in the
examples above, because `val` might be `Int?` where `x` is `Int`.

Rust could definitely do the same thing: keep `Option<T>` but provide the
alternative syntax `T?` and automatically convert by wrapping a value in `Some`.
I don't think it needs `nil`, that could just be `None`. This does make `Option`
"special" compared to other user-defined alternatives. That is a common argument
against introducing syntax like this. However, that fails to consider that
`Option` is already special; it has _niche_ optimizations and it implements the
`Try` trait (so that the `?` operator can be used with it). Additionally, it
just has a special meaning by convention: it's the defacto way to provide
missing values.

There are however issues with this idea. For example, type inference gets harder.
Here is an example:

```rust
struct Foo;
struct Bar;

impl From<Foo> for Bar { /* ... */ }
impl From<Foo?> for Bar? { /* ... */ }
impl From<Foo> for Bar? { /* ... */ }
impl From<Foo?> for Bar { /* ... */ }

fn main() {
    let x = Foo;
    let y = x.into(); // what is the type of `y`?
}
```

Of course, we can come up with rules to fix this, for example:

1. Only do `Some`-wrapping when the resulting type is known.
2. Only do `Some`-wrapping when returning.
3. Do not involve `Some`-wrapping when resolving traits.
4. Only consider 

The rules for this can get surprisingly tricky! I'd love to know how Swift gets
around this issue. My guess is that Rust would need more type annotations
to resolve this.
