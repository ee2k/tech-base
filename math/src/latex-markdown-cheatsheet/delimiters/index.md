# LaTeX delimiters

## Auto-sizing delimiters

||||
|-|-|-|
| $\Large \left[ ... \right]$ |&emsp;&emsp;| $\Large \verb!\left[ ... \right]!$ |
| $\Large \left\lbrace ... \right\rbrace$ || $\Large \verb!\left\{ ... \right\}!$ |
| $\Large \left( ... \right)$ || $\Large \verb!\left( ... \right)!$ |
| $\Large \left\lvert ... \right\rvert$ || $\Large \verb!\left\lvert ... \right\rvert!$ |
| $\Large \left\langle ... \right\rangle$ || $\Large \verb!\left\langle ... \right\rangle!$ |
| $\Large \left\lfloor ... \right\rfloor$ || $\Large \verb!\left\lfloor ... \right\rfloor!$ |
| $\Large \left\lceil ... \right\rceil$ || $\Large \verb!\left\lceil ... \right\rceil!$ |
| $\Large \left\lVert ... \right\rVert$ || $\Large \verb!\left\lVert ... \right\rVert!$ |
| $\Large \left\lvert ... \right\rvert$ || $\Large \verb!\left\lvert ... \right\rvert!$ |
| $\Large \left. \frac{a}{b} \right\rvert$ || $\Large \verb!\left. \frac{a}{b} \right\rvert!$ (invisible left) |

`|` is shorthand for `\lvert`/`\rvert`; the long form is shown in the source
column because a literal `|` would split the Markdown table cell. Use `.` for a
delimiter you want to hide. `\left` and `\right` must pair up.

## Fixed sizes

||||
|-|-|-|
| $\Large \big( ... \big)$ |&emsp;&emsp;| $\Large \verb!\big( ... \big)!$ |
| $\Large \Big( ... \Big)$ || $\Large \verb!\Big( ... \Big)!$ |
| $\Large \bigg( ... \bigg)$ || $\Large \verb!\bigg( ... \bigg)!$ |
| $\Large \Bigg( ... \Bigg)$ || $\Large \verb!\Bigg( ... \Bigg)!$ |

Here "size" means delimiter scaling only. Text sizes (`\tiny`, `\Huge`, …)
are in [sizing](../sizing/).
