# seed/

Put `Jays-Marketing-Spend-Log.xlsx` here, then:

```bash
npm run seed -- --dry-run   # check the column mapping first
npm run seed                # import (safe to re-run)
```

Everything in this folder except this README is gitignored. The spreadsheet holds real
spend data and must never be committed.
