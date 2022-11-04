+++

title = "Best Practices"

date = 2022-02-12

description = "Ever evolving list of best practices for programming"

+++

This is a list of best practices for programming. These are non-exhaustive, ever
evolving and should not be considered final. Also, every rule has many
exceptions; they are not meant to be followed to the letter. Almost every rule
should be followed by "when possible".

# General

1. Discuss best practices with the team.
2. Include best practices into the repository.

## Tooling

1. Enforce a linter and formatter for every language in the project.
2. Choose linters and formatters that are as opinionated as possible.
3. Linter warnings should be errors, unless explicitly silenced.
4. Set up CI/CD for linters and formatters on every PR.
5. Use Git.
6. In projects with heavy data processing, use a DAG pipelining tool.
7. Don't jump on the latest technology immediately, but don't be afraid to try
   new things either.
8. Pick tooling that is not specific to a single editor (e.g. no Org-mode)
9. Team members should pick their own editor.
10. Use strictly typed (variants of) languages (e.g. TypeScript, Python with
    MyPy, Rust)
11. Tooling, frameworks and libraries are often more important than the
    language.

## Comments & Documentation

1. Use doc comments
2. Comments should describe "why", not "what". Comments may also describe "how",
   but only when the "how" is complicated.
3. Doc comments should not repeat the function signature
4. Generate documentation from function signatures
5. The `README` should be focused on usage, not development, of the project.
6. Large projects should document the structure of the project.
7. Markdown is the lingua franca for documentation.
8. Outdated documentation is worse than no documentation.

## Issues & Pull Requests

1. Pull requests should be focused on a single change.
2. Always link to the issue the PR is solving.
3. Describe both the problem and the solution.
4. Don't shy away from changes just because they might cause a merge conflict.
5. Pull Requests should pass all tests.
6. Issues should be specific (e.g. not "Refactor X and Y", but "Decouple
   functions X and Y")

## Reviews

1. Reviews should always acknowledge the work put in by the contributor and
   thank them, regardless of the quality of the code.
2. Reviews should always assume the best intentions.
3. A review should often be a discussion instead of forcing changes.

## Tests

1. There is no need write all tests up front.
2. Add tests for every fix, so that any regression is caught.
3. Test both successes and failures.
4. Tests should be trivial to read and understand.

## Performance

1. Every claim about performance should be backed up by measurements.

# Specifics

## Rust

1. Think in `Iterator`s
2. `unsafe` for performance reasons should be put into a separate crate exposing
   a safe API when possible.

## HTML & CSS

1. Use plain HTML & CSS for small projects.
2. HTML/CSS are a compilation target in large projects.
3. Use flexbox and grid.

## Jupyter Notebooks

1. Imports that apply to multiple blocks should go into a separate code block at
   the top.
2. Imports that you use once can be put in the block where they are needed.
3. Structure the notebook with headings (see also here).
4. Long operations should be in separate code blocks.
5. Running the code from top to bottom should always work.
6. Don't make the code blocks too dependent on each other. Normally, you have
   some preparation steps (loading and preparing the data) and then some things
   that you tried. Ideally, those exploratory parts are only dependent on the
   preparation part and not on each other. This makes it easier to run specific
   parts without having to wait on the entire thing. If that is not feasible,
   then make it clear what the minimum amount of code is to run a certain block.
7. Make sure that the data is described in the notebook itself (which columns
   are we dealing with, what data types do they have & what do they represent).
8. Data science is often about exploration, so it's nice to document the things
   you tried that failed. You can do this by making your notebook into a
   narrative.
9. So you describe what you tried and why you tried it, then show the code and
   evaluate and repeat. (Of course, do make it very clear what didn't work)
10. Notebooks should be reproducible (taken from here)
11. The output of code cells should not be checked into Git.
12. Notebooks are purely for exploration. Code for in the data pipeline should
    be copied into the rest of the codebase.
