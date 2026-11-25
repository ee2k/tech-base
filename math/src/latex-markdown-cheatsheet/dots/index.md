# LaTeX dots and ellipses

||||
|-|-|-|
| $\Large \ldots$ |&emsp;&emsp;| $\Large \verb!\ldots!$ (baseline dots) |
| $\Large \cdots$ || $\Large \verb!\cdots!$ (centred dots) |
| $\Large \vdots$ || $\Large \verb!\vdots!$ (vertical) |
| $\Large \ddots$ || $\Large \verb!\ddots!$ (diagonal) |
| $\Large \dots$ || $\Large \verb!\dots!$ (context-sensitive) |
| $\Large 1 \dotsc n$ || $\Large \verb!1 \dotsc n!$ (with commas) |
| $\Large a \dotsb b$ || $\Large \verb!a \dotsb b!$ (with binary ops) |
| $\Large A \dotsi B$ || $\Large \verb!A \dotsi B!$ (with integrals) |

`\dots` picks the right variant from context; the explicit forms are useful
when the context is ambiguous. `\cdots` is also used between matrix entries —
see [matrices-and-arrays](../matrices-and-arrays/).
