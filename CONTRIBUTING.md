### Contributing Code
- Pick the rule name you will be working on and add the `tsr` prefix. For example, `tsr-detect-buffer-noassert`.
  This is to avoid future name collision.
- Create a branch with the rule name, e.g. `tsr-detect-buffer-noassert`.
- If you haven't, run `npm install` to download the project dependencies.
- Create your rule tests at `./test/rules` and your rule in `./src/rules` 

### Commit conventions
Each commit should follow the following convention:

```
[feat] added tsr-detect-buffer-noassert rule (closes #1)
Other commit messages include
```

- `[bug] fixed tsr-detect-buffer-noassert rule (closes #2)`
- `[docs] improved README.md file (closes #3)`
- `[perf] improved tsr-detect-buffer-noassert rule (closes #4)`