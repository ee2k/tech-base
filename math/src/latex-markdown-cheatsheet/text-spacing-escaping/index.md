# LaTeX text, spacing and escaping

## Text inside math

||||
|-|-|-|
| $\Large \text{if } x > 0$ |&emsp;&emsp;| $\Large \verb!\text{if } x > 0!$ |
| $\Large a \text{ and } b$ || $\Large \verb!a \text{ and } b!$ |
| $\Large \text{20\%}$ || $\Large \verb!\text{20\%}! $ |
| $\Large \mathrm{d}x$ || $\Large \verb!\mathrm{d}x!$ |

`\text{...}` preserves spaces; adjacent math needs its own `$...$` or a space
inside the braces (`\text{if }`). For font shapes see
[fonts-and-styles](../fonts-and-styles/).

## Spacing

||||
|-|-|-|
| $\Large a\,b$ |&emsp;&emsp;| $\Large \verb!a\,b!$ (thin) |
| $\Large a\:b$ || $\Large \verb!a\:b!$ (medium) |
| $\Large a\;b$ || $\Large \verb!a\;b!$ (thick) |
| $\Large a\!b$ || $\Large \verb!a\!b!$ (negative thin) |
| $\Large a\quad b$ || $\Large \verb!a\quad b!$ |
| $\Large a\qquad b$ || $\Large \verb!a\qquad b!$ |
| $\Large a\hspace{2em}b$ || $\Large \verb!a\hspace{2em}b!$ |
| $\Large a \\[1em] b$ || $\Large \verb!a \\[1em] b!$ (extra row space) |

`\\[1em]` is mainly used inside display math and arrays — see
[multiline-environments](../multiline-environments/) and
[matrices-and-arrays](../matrices-and-arrays/).

## Escaping special characters

||||
|-|-|-|
| $\Large \%$ |&emsp;&emsp;| $\Large \verb!\%!$ |
| $\Large \&$ || $\Large \verb!\&!$ |
| $\Large \_$ || $\Large \verb!\_!$ |
| $\Large \#$ || $\Large \verb!\#!$ |
| $\Large \$$ || $\Large \verb!\$!$ |
| $\Large \{$ || $\Large \verb!\{!$ |
| $\Large \}$ || $\Large \verb!\}!$ |
| $\Large \backslash$ || $\Large \verb!\backslash!$ |

KaTeX does not support LaTeX's `\textbackslash`; use `\backslash` as shown
above. Prefer commands over pasted Unicode symbols (`≤`, `≈`, `∝`, …) so the
source stays portable — see [relations](../relations/).
