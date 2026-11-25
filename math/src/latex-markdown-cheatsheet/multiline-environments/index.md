# LaTeX multiline environments

Use `&` to mark alignment points and `\\` to break lines. `\\[1em]` adds extra
vertical space (useful in KaTeX).

## align

$$
\begin{aligned}
f(x) &= x^2 + 2x + 1 \\
     &= (x+1)^2
\end{aligned}
$$

```latex
\begin{align}
f(x) &= x^2 + 2x + 1 \\
     &= (x+1)^2
\end{align}
```

## aligned (inside display math)

$$
\begin{aligned}
a &= b + c \\
d &= e - f
\end{aligned}
$$

```latex
$$
\begin{aligned}
a &= b + c \\
d &= e - f
\end{aligned}
$$
```

## gather / gathered

$$
\begin{gathered}
y = x^2 \\
z = \sqrt{x}
\end{gathered}
$$

```latex
\begin{gather}
y = x^2 \\
z = \sqrt{x}
\end{gather}
```

## split (inside equation)

$$
\begin{split}
(a+b)^2 &= a^2 + 2ab + b^2 \\
        &= a^2 + b^2 + 2ab
\end{split}
$$

```latex
\begin{equation}
\begin{split}
(a+b)^2 &= a^2 + 2ab + b^2 \\
        &= a^2 + b^2 + 2ab
\end{split}
\end{equation}
```

## Tags and numbering

$$
\begin{align}
a &= b\\
c &= d
\end{align}
$$

$$
\begin{align}
a &= b \notag \\
c &= d \tag{*}
\end{align}
$$

`\notag` suppresses the equation number; `\tag{*}` replaces it with a custom
tag. Both only work in display math.

```latex
\begin{align}
a &= b \notag \\
c &= d \tag{*}
\end{align}
```

Piecewise functions live in [cases](../cases/); matrices in
[matrices-and-arrays](../matrices-and-arrays/).
