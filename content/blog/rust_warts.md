+++

title = "Rust warts"
author = ["Terts Diepraam", "Jonathan Dönzelmann"]
+++

# Ambiguity with variables in patterns

```rust
enum Colour {Black, Red};
use Colour::*;

let c: Colour;
match c {
    Black => {}
    White => {}
    Red => {}
}
```

Gives warning: unreachable pattern `Red`.

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
