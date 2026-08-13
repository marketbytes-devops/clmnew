# Team Collaboration Workflow

To ensure that the team can push and pull code without facing merge conflicts and overwriting each other's work, please follow this structure:

## 1. Never work directly on `main`
The `main` branch should always contain stable, production-ready code. Do not push directly to it.

## 2. Use Feature Branches
When starting new work, create a new branch from `main`:
```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

## 3. Keep Your Branch Updated
If your work takes a few days, others might push to `main` in the meantime. Frequently pull those updates into your branch to handle conflicts early:
```bash
git fetch origin
git rebase origin/main
```
*(If you face conflicts here, resolve them, `git add` the files, and run `git rebase --continue`)*

## 4. Push and Create a Pull Request (PR)
When you are done with your feature:
```bash
git push origin feature/your-feature-name
```
Then, go to your Git hosting platform (GitHub, GitLab, etc.) and open a Pull Request against `main`. 
Your team members can review your code and merge it cleanly.

## 5. Helpful Git Config
We recommend configuring Git to always rebase when you pull, which prevents messy merge commits when pulling someone else's work on the same branch:
```bash
git config pull.rebase true
```
