# Hand-curated series

One CSV per asset listed with `source: "manual"` in `src/universe.ts`. Columns:

```
month,price,income
1999-11,25.00,0
1999-12,16.06,0
```

- `price`: month-end close per share in the asset's currency (as declared in the universe).
- `income`: dividend per share paid that month, same currency. Omit or 0 if none.
- Lines starting with `#` are comments. Put the source of the numbers at the top of the file.
- The build cuts the series at the `end.month` from the universe and fills gaps of up to two months
  with the previous price.

## Prefixing a Yahoo series

A manual file may also exist for an asset whose `source` is `"yahoo"`. Its rows are used for
the months before Yahoo's data starts (Nestlé before 1990, Mercedes, BMW and Siemens before
late 1996). Prices must be on the same share basis as Yahoo's split-adjusted series, so include
Yahoo's first month as an overlap row: the build compares it and fails if the two differ by
more than 5 percent.
