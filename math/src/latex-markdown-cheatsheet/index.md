# LaTeX → Markdown cheatsheet

Quick reference for writing math in Markdown with the **KaTeX** renderer.

## Index

### Syntax / formatting

- [greek-letters](greek-letters)
- [text-spacing-escaping](text-spacing-escaping)
- [fonts-and-styles](fonts-and-styles)
- [superscripts-subscripts](superscripts-subscripts)
- [fractions-and-radicals](fractions-and-radicals)
- [big-operators](big-operators)
- [arrows](arrows)
- [delimiters](delimiters)
- [accents](accents)
- [annotations](annotations)
- [sizing](sizing)
- [dots](dots)

### Environments

- [matrices-and-arrays](matrices-and-arrays)
- [multiline-environments](multiline-environments)
- [cases](cases)

### Math notation by subject

- [functions-and-operators](functions-and-operators)
- [relations](relations)
- [logic-and-proofs](logic-and-proofs)
- [set-theory](set-theory)
- [probability](probability)
- [combinatorics](combinatorics)
- [geometry](geometry)

## Conventions

- Renderer: **KaTeX**. Commands are chosen for KaTeX support; LaTeX-only
  packages and commands (`\usepackage{...}`, `\mbox`, `dcases`) are avoided.
- Simple one-line commands use a two-column table: rendered result on the left,
  source on the right.
- Multi-line environments show a rendered block followed by a fenced `latex`
  block you can copy.
- In tables the source is shown verbatim with `\verb!...!`. The `!` is the
  `\verb` delimiter, chosen because it does not conflict with the `|`
  characters that separate Markdown table cells. Copy the text between the
  `!` marks.
- `\Large`/`\large` and `\\[1em]` are for readability on this page, not part of
  the snippet.

## Maintenance

- One canonical home per command. If a symbol is useful in two categories, put
  the full example in one and add a `See also` link in the other instead of
  duplicating the row.
- Folder names describe the LaTeX construct first; subject areas are collected
  in their own section of the index above.
