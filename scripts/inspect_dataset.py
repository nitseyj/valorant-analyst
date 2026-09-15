#!/usr/bin/env python3
"""
inspect_dataset.py — Data Foundation step (V0.1) for Valorant Analyst

Walks a downloaded/extracted dataset directory (e.g. the Ryan Luong
"VCT 2021-2026 Data" Kaggle export), profiles every CSV it finds, and
writes a single markdown report describing:

  - every table (file) discovered, grouped by year/category folder
  - row count, column count
  - each column's inferred dtype, null %, and a few sample values
  - a flat "all columns seen, and where" index at the end, useful for
    spotting the same concept spelled differently across years
    (e.g. "Team" vs "team_abbr")

Usage:
    python inspect_dataset.py /path/to/extracted/dataset [--out report.md]

Notes:
  - Does not assume a fixed folder layout. It recurses and treats any
    *.csv it finds as a table, using the relative path as the table name.
  - Deliberately does NOT try to guess a schema or write any database
    code yet — this is read-only reconnaissance, per the project's
    "inspect the data before designing the schema" rule.
  - Uses only pandas (already a project dependency).
"""

import argparse
import sys
from pathlib import Path
from collections import defaultdict

import pandas as pd

SAMPLE_ROWS = 3
MAX_UNIQUE_SAMPLE = 5


def profile_csv(path: Path) -> dict:
    try:
        df = pd.read_csv(path, low_memory=False)
    except Exception as e:
        return {"error": str(e)}

    cols = []
    for col in df.columns:
        series = df[col]
        n = len(series)
        null_pct = round(100 * series.isna().sum() / n, 1) if n else 0.0
        dtype = str(series.dtype)
        non_null = series.dropna()
        samples = non_null.unique()[:MAX_UNIQUE_SAMPLE].tolist() if len(non_null) else []
        cols.append(
            {
                "name": col,
                "dtype": dtype,
                "null_pct": null_pct,
                "samples": samples,
            }
        )

    return {
        "rows": len(df),
        "n_cols": len(df.columns),
        "columns": cols,
        "head": df.head(SAMPLE_ROWS).to_dict(orient="records"),
    }


def format_sample(v):
    s = str(v)
    return s if len(s) <= 40 else s[:37] + "..."


def build_report(root: Path) -> str:
    csv_paths = sorted(root.rglob("*.csv"))
    if not csv_paths:
        return f"# Dataset Inspection Report\n\nNo CSV files found under `{root}`.\n"

    lines = [f"# Dataset Inspection Report\n", f"Root: `{root}`\n", f"Tables found: {len(csv_paths)}\n"]

    # index of column name -> list of tables it appears in, for the
    # cross-reference section at the end
    column_index = defaultdict(list)

    # group tables by top-level subfolder for readability (e.g. year)
    grouped = defaultdict(list)
    for p in csv_paths:
        rel = p.relative_to(root)
        top = rel.parts[0] if len(rel.parts) > 1 else "(root)"
        grouped[top].append(p)

    for group in sorted(grouped):
        lines.append(f"\n## {group}\n")
        for p in grouped[group]:
            rel = p.relative_to(root)
            lines.append(f"\n### `{rel}`\n")
            info = profile_csv(p)
            if "error" in info:
                lines.append(f"- **Could not read file:** {info['error']}\n")
                continue

            lines.append(f"- Rows: {info['rows']:,} | Columns: {info['n_cols']}\n")
            lines.append("\n| Column | Dtype | Null % | Sample values |")
            lines.append("|---|---|---|---|")
            for c in info["columns"]:
                column_index[c["name"]].append(str(rel))
                sample_str = ", ".join(format_sample(v) for v in c["samples"])
                lines.append(f"| {c['name']} | {c['dtype']} | {c['null_pct']}% | {sample_str} |")

    lines.append("\n\n## Column cross-reference (all tables)\n")
    lines.append("Columns appearing in more than one table, or with similar names across tables, "
                  "are worth checking for naming consistency before schema design.\n")
    lines.append("\n| Column name | Appears in |")
    lines.append("|---|---|")
    for col in sorted(column_index):
        tables = column_index[col]
        lines.append(f"| {col} | {', '.join(tables)} |")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Profile every CSV in a dataset directory.")
    parser.add_argument("root", type=str, help="Path to the extracted dataset directory")
    parser.add_argument("--out", type=str, default="dataset_report.md", help="Output markdown file")
    args = parser.parse_args()

    root = Path(args.root).expanduser().resolve()
    if not root.exists():
        print(f"Path does not exist: {root}", file=sys.stderr)
        sys.exit(1)

    report = build_report(root)
    out_path = Path(args.out)
    out_path.write_text(report, encoding="utf-8")
    print(f"Wrote report: {out_path.resolve()}  ({len(report.splitlines())} lines)")


if __name__ == "__main__":
    main()
