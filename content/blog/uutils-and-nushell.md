+++

title = "uutils ❤️ nushell"
author = "Terts Diepraam"
+++

The uutils and nushell teams have an exciting announcement: we are collaborating!

For those unaware, here is a short summary of each project:

- [uutils](https://uutils.github.io/) reimplements unix utilities in Rust, with a focus on the coreutils and aiming for full compatibility with the GNU utilities.
- [nushell](https://www.nushell.sh/) is a new shell based on structured data (as opposed to text), also written in Rust.

## The Collaboration

The goals of the projects seems incompatible at first: uutils is backwards compatible, while nu bravely breaks with all tradition to do their own thing.
Yet, there are many utils that users simply expect to work in nu. For example, people expect to use `cp` with at least some of the traditional flags.

So the current situation is as follows: nu wants to support more of the traditional utilities, as long as they fit in the nu philosophy and uutils has extensive implementations of these utilities.
Why not integrate them over to nu?

After some back and forth between the projects, we came up with a way to do that. First, uutils will expose some of the internals of the utilities. For instance, in `cp`, there is a function
`copy` which takes some paths and a `CpOptions` struct, which we expose. nushell then wraps these functions with their own custom argument parser. This gets us the best of both worlds:

- We get the beautiful nu error messages and help text.
- We get the extensive set of options that uutils supports.
- We can accept nu data types as arguments.
- We can redesign the arguments to fit more in the nu ecosystem.

To do this for all[^1] utilities will take a while, so we will be taking a "crawl, walk, run" approach and tackle this incrementally. For the next nushell release, we will include only the `cp` command.

We could use your help! On the uutils side we can use some help with exposing all the necessary functionality, cleaning up the API and improving documentation. On the nushell side, you can help
with writing the argument parsers. TODO: Add links to issues.

## What this means for nushell

nushell will gain more commands and more options for commands. These won't be exactly compatible with GNU or uutils, but follow that distinct nushell style that we all love.


## What this means for uutils

`uutils` will start exposing a library of functions with the functionality of the utils. In a sense, it's the "librarification" of uutils. This library can of course be used by anyone!
If you're building a shell, a busybox-style binary or maybe a graphical interface to common utilities, this library might be of use to you. If you have any questions about this, do let us know!

## Final words


-- Terts Diepraam & [insert nushell authors]

[^1]: There are several utilities that nu won't need, so "all" means all applicable utils.
