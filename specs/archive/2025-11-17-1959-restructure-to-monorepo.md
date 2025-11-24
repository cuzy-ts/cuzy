# Restructure to monorepo

Given what we've learned during development, we need to restructure our repo into a monorepo.
This should utilize Bun APIs as much as possible and should align with the laravel implemenation and spirit as much as possible.

Currently we have:
```
.
├── example              # Fizz demo app
├── scripts
├── src                  # Fizz source
└── tests                # Fizz tests
```

Which feel awkward now that we've realized we want to include another package, Sip, in this repo.
We should restrucuture the demo to the following:
```
.
├── apps
│   └── demo             # Fizz demo app
├── packages
│   ├── sip             # Sip source
│   └── fizz           # Fizz source
└── scripts
```

We've started a rough-cut of Sip in `example/src/lib/useFizz.ts` which should be replaced by.
We want to migrate that and improve upon it based on these influential sources:
- `~/personal/_clones/laravel/sip`
- `~/personal/_clones/stephenjason89/bun-pulse`


## Reference
- Read `.claude/skills/bun`
- Use `rg` to navigate `.claude/skills/bun/references/llms-full.txt` since it's a _very_ large file

