+++

title = "Rust warts"
author = ["Terts Diepraam", "Jonathan Dönzelmann", "Jonathan Brouwer"]
+++

Every programming language is a deep rabbit hole of weirdness. The more you look, the more strange things you will find.
If you want to keep your sanity, don't look into Python's module system, JavaScript's type coercions or PHP... in general.
In contrast, Rust looks relatively sane to me. However, looks can be deceiving.

Over the past 6 months, we have been working on various hobby programming languages inspired by Rust. So, we dove into
the nitty gritty of Rust's parsing and typechecking rules. This post is a collection of the strange and surprising things
we found in the process.

None of these are really problematic, just strange.

# Bindings and constants in patterns

Take a look at this statement:

```rust
let foo = true;
```

Is this valid Rust? Will this putting this statement anywhere in your code create compile errors?

If your answer is yes, then you're wrong. It can generate this error:

```
 --> const-let-else.rs:5:6
  |
5 |     let foo = true;
  |         ^^^
  |         |
  |         pattern `true` not covered
  |         missing patterns are not covered because `foo` is interpreted as a constant pattern, not a new variable
  |         help: introduce a variable instead: `foo_var`
  |
  = note: `let` bindings require an "irrefutable pattern", like a `struct` or an `enum` with only one variant
  = note: for more information, visit https://doc.rust-lang.org/book/ch18-02-refutability.html
  = note: the matched value is of type `bool`
```

This is because I've hidden another line from you:

```rust
const foo: bool = false;
let foo = true;
```

If a constant is in scope, it transforms any pattern (and let bindings are patterns) into that value.
Effectively, we've written this:

```rust
let false = true;
```

Admittedly, that example is a bit convoluted, but this can get tricky in practice. Enum variants are also constants, which is why we can
use them as patterns. A similar problem then occurs when we use a variant that does not exist.

```rust
enum Colour {Red, Green, Yellow, Purple};
use Colour::*;

let c = Color::Red;

match c {
    Red => {}   // only Color::Red
    Green => {} // only Color::Green
    Blue => {}  // Any other color!
}
```

Luckily, the compiler has various system to prevent problems like this. It will encourage you to make any constants uppercase, capitalize enum variants and
lowercase bindings. Also, if we swap the order of `Blue` and `Green` in the `match` above, we would get an "unreachable pattern" warning.

# If and match don't require `;` to be a statement but can be an expression

This means that this is not possible:

```rust
fn foo() {
    if true { 2 } else { 3 } + 3;
}
```

# Struct literals are not allowed in the examinee for if and match

Because that is ambiguous (in LL(1)) with the block/match arms.

```rust
struct Foo {}

fn bar() {
    if Foo {} { 1 } else { 2 };
}

fn baz() {
    match Foo {} { Foo {} => () };
}
```

# Ambiguity between comparison operators and generics

```rust
if a as u32 < 3 {}
```

# Diverging blocks are inferred as `!`

Any block ending with `;` is `()`, but if it diverges it can be `!`,
so that `return x;` is possible. But then this is also possible:

```rust
fn foo() -> i32 {
    return 3;
    ();
}
```

but this isn't:

```rust
fn foo() -> i32 {
    return 3;
    ()
} 
```

See also [this comment][1] in the compiler.

[1]: (https://github.com/rust-lang/rust/blob/551abd65bee759c1fd1cc0acd5ba7e5723823c54/compiler/rustc_hir_typeck/src/fn_ctxt/checks.rs#L1725-L1731)

# Box deref is special

TODO: Brouwer?

# Maybe: expr/pattern ambiguity in grammar

though always resolved in the end based on context

# Drop checks

Implementing drop is a breaking change

TODO: Brouwer?