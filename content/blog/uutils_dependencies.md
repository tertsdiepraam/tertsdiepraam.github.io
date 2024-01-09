+++

title = "Analyzing uutils coreutils dependencies"

+++

uutils is a full rewrite of the GNU coreutils in Rust. That's a big effort and the project is quite large. As a result, the dependency graph is huge too. A large dependency graph is hard to reason about and to keep up to date, so it makes development harder.

In this post I want to investigate how we can analyze large dependency trees and how we can keep them in check.This is an exploration and I don't pretend to have all the answers, but hopefully this is useful.

# What sparked this investigation

When uutils is posted to HackerNews or some other forum, we always get criticism about our number of dependencies. The lazy version of that criticism is that somebody just looks at the `Cargo.lock`, counts the entries in it and cries something along the lines of "382 dependencies?! For coreutils?! These devs are useless!"

> If you want to verify this number, an easy command is using `ripgrep` to count the `[[package]]` entries:
>     rg -F '[[package]]' Cargo.lock --count

Of course, if you know a bit about `cargo`, you know that this is not quite fair. There's many kinds of dependencies, and only some are important to most people. For example, nobody cares about the number of dependencies that are only used in testing and aren't part of the actual shipped binaries. Also, more than 100 of those entries are not dependencies; they are our own crates.

Nevertheless, there are good reasons to care about dependencies:

- Dependencies need to be kept up to date in the project
- Dependencies need to be maintained
- Dependencies need to be reviewed
- Dependencies need to be deduplicated (more about that later)

So, I set out to do a more in depth analysis, so that I can decide for myself how bad our dependencies actually are.

# A better dependency count

Let's start with some simple analysis of `Cargo.lock`. While `ripgrep` is amazing, `Cargo.lock` is structured data, so it's not the best tool for the job. Instead, I'll be using `nu`.

We can open and load `Cargo.lock` like this:

```
> open Cargo.lock | from toml
╭─────────┬──────────────────╮
│ package │ [table 382 rows] │
│ version │ 3                │
╰─────────┴──────────────────╯
```

> Note: nushell usually parses TOML automatically, but it only does that for files with the `.toml` extension.

That's handy! We get the count for free! Since we don't care about the version, let's limit ourselves to the `package` field:

```
> let package = (open Cargo.lock | from toml | get package)
```

This gives us a giant table with the following columns:

- checksum
- name
- source
- version
- dependencies

We can now easily filter our own crates out because those do not have a `source`:

```
> $package | compact source
```

We are now left with a table of 273 external crates. However, some of those are duplicated. I'll talk more about that later. For now, let's deduplicate.

```
> let $external = ($package | compact source | uniq-by name)
```

That leaves us with 259 external crates.

# Transitive dependencies

So now, let's see which ones are direct dependencies and which are transitive. There's probably tools for doing this, but I'm having with `nu`, so I'll stick with it.

First, let's get a list of the names of direct dependencies:

```
> let direct = ($package | where source? == null | get dependencies? | flatten | compact | sort | uniq)
```

This includes our own crates so we have to filter them out. I'm not a nushell expert so there's probably a better way to do this, but this is the command I came up with:

```
> let direct_external = ($direct | where {|name| $external | any {|ex| $ex.name == $name}})
```

This gives us a list of 94 dependencies, which means we have 165 transitive dependencies.

# Counting projects instead of crates

So, that's about as far as I can go with only `Cargo.lock`. Luckily, `crates.io` has an API! Let's see if we can use it from `nu`:

```
> http get crates.io/api/v1/crates/clap
╭────────────┬────────────────────╮
│ categories │ [table 1 row]      │
│ crate      │ {record 19 fields} │
│ keywords   │ [table 5 rows]     │
│ versions   │ [table 360 rows]   │
╰────────────┴────────────────────╯
```

That seems to work! Let's do that for all our external dependencies.

```
> let external2 = (
    $external 
    | get name 
    | each {|name| 
        print $name; 
        http get $"https://crates.io/api/v1/crates/($name)" | get crate
    }
)
```

Time to apply an assumption: two crates belong to the same "project" if they have the same repository. It's not 100% true, but it's close enough for me.

```
> $external2 | uniq-by repository | length
202
```

Ok, now let's do the same for direct external dependencies:

```
> let direct_external2 = ($direct_external | each {|name| print $name; http get $"https://crates.io/api/v1/crates/($name)" | get crate})
> $direct_external2 | uniq-by repository | length
86
```

# Who are we depending on?

Who's in charge of these dependencies? Crates have owners, but I think the github organisation/owner is a better indicator of owner in this case. Let's see where that leads us.

```
> let owners = ($external2 | compact repository | group-by { get repository | url parse | get path | path split | get 1 })
> $owners | columns | length
126
```

Many owners are well-known and trusted individuals and organisations in the Rust community. Names like "dtolnay", "BurntSushi", "matklad", "seanmonstar", "rust-cli", "clap-rs", "rust-lang", "chronotope", "crossbeam-rs" and, of course, "nushell". However, there are plenty of names that are unfamiliar to me. That does not mean that the project is bad, but it does mean that we need to be more careful with those dependencies.

If you're interested, here are the organisations with the most crates used by uutils:

- `rust-lang`: 21
- `RustCrypto`: 11
- `dtolnay`: 10
- `microsoft`: 9
- `rust-cli`: 8
- `BurntSushi`: 8

I got those counts with this command:

```
> $owners | transpose | insert size { get column1 | length } | sort-by size
```

# What's actually used (on Unix)?

Coming back to something I talked about before: which dependencies are actually relevant. `Cargo.lock` includes much more than what we're actually using. `Cargo.lock` contains the entire dependency graph, including dependencies that we are not using, either because they are optional or because we don't use the feature of a depedency that enables that dependency. We need a better way to get that info.

Luckily, we have that info in the form of `cargo tree`. I'll let `cargo tree` print out all the non-dev dependencies, which are the ones that end up in the final binary. I'll also limit to the features that can be enabled on Unix and leave out Windows and other platforms. Cargo tree gives us a string output, so parsing it is a bit ugly, but this seems to work:

```
> let used_crates = (
    cargo tree -e no-dev --features unix 
    | rg "[a-zA-Z_-]+ v[0-9.]+" -o
    | lines
    | each { |line| str substring 0..($line | str index-of " ") }
    | uniq
)
```

Again, let's intersect with the external deps:

```
> let used_external = ($external.name | where {|name| $used_crates | any {|used| $used == $name }})
> $used_external | length
158
```

And external & direct:

```
> let used_direct_external = ($direct_external | where {|name| $used_crates | any {|used| $used == $name }})
> $used_direct_external | length
70
```

# Concluding the counts

So we have several "dependency counts" now. Here's an overview:

- External crates: 259
- External "projects": 202 
- External used crates: 158
- Direct external crates: 94
- Direct external "projects": 84
- Direct external used crates: 70

Which one you care about is up to you.

# Making a good nu script for this

All the commands above we're just improvised. We can probably do a bit better.
