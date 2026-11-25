# LaTeX matrices and arrays

## Matrix

$$
\begin{bmatrix}
1 & 2 & 3 \\[1em]
4 & 5 & 6 \\[1em]
7 & 8 & 9
\end{bmatrix}
$$

```latex
\begin{bmatrix}
1 & 2 & 3 \\[1em]
4 & 5 & 6 \\[1em]
7 & 8 & 9
\end{bmatrix}
```

`\\[1em]` adds row spacing; plain `\\` is usually enough.

## Matrix environments

||||
|-|-|-|
| $\Large \begin{matrix} a & b \\ c & d \end{matrix}$ |&emsp;&emsp;| $\Large \verb!\begin{matrix}...\end{matrix}!$ |
| $\Large \begin{pmatrix} a & b \\ c & d \end{pmatrix}$ || $\Large \verb!\begin{pmatrix}...\end{pmatrix}!$ |
| $\Large \begin{bmatrix} a & b \\ c & d \end{bmatrix}$ || $\Large \verb!\begin{bmatrix}...\end{bmatrix}!$ |
| $\Large \begin{Bmatrix} a & b \\ c & d \end{Bmatrix}$ || $\Large \verb!\begin{Bmatrix}...\end{Bmatrix}!$ |
| $\Large \begin{vmatrix} a & b \\ c & d \end{vmatrix}$ || $\Large \verb!\begin{vmatrix}...\end{vmatrix}!$ |
| $\Large \begin{Vmatrix} a & b \\ c & d \end{Vmatrix}$ || $\Large \verb!\begin{Vmatrix}...\end{Vmatrix}!$ |
| $\Large \begin{smallmatrix} a & b \\ c & d \end{smallmatrix}$ || $\Large \verb!\begin{smallmatrix}...\end{smallmatrix}!$ |

## Array with custom alignment

$$
\begin{array}{ccl}
\text{center}&\text{center}&\text{left}\\[0.5em]
\text{Condition A}&→&\text{Rule A}\\[0.5em]
\text{Condition CDEFG}&→&\text{Rule CDEFG}
\end{array}
$$

```latex
\begin{array}{ccl}
\text{center}&\text{center}&\text{left}\\[0.5em]
\text{Condition A}&\to&\text{Rule A}\\[0.5em]
\text{Condition CDEFG}&\to&\text{Rule CDEFG}
\end{array}
```

Column specs: `c` centre, `l` left, `r` right. Use `\hline` for a horizontal
rule between rows.

## Column vectors

$$
\begin{bmatrix}
\big|&\big|&&\big|\\
u_1&u_2&\cdots&u_n\\
\big|&\big|&&\big|
\end{bmatrix}
$$

```latex
\begin{bmatrix}
\big|&\big|&&\big|\\
u_1&u_2&\cdots&u_n\\
\big|&\big|&&\big|
\end{bmatrix}
```

Larger bars `\Big|`, `\bigg|`, `\Bigg|` work the same way; delimiter sizing is
documented in [delimiters](../delimiters/), and `\cdots` in
[dots](../dots/).

## Row vectors

$$
\begin{bmatrix}
\hspace{2em}\, v_1^T\, \hspace{2em}\\[4pt]
\hspace{2em}\, v_2^T\, \hspace{2em}\\[4pt]
\vdots\\[4pt]
\hspace{2em}\, v_n^T\, \hspace{2em}
\end{bmatrix}
$$

```latex
\begin{bmatrix}
\hspace{2em}\, v_1^T\, \hspace{2em}\\[4pt]
\hspace{2em}\, v_2^T\, \hspace{2em}\\[4pt]
\vdots\\[4pt]
\hspace{2em}\, v_n^T\, \hspace{2em}
\end{bmatrix}
```
