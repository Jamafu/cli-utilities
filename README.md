# Jamafu's CLI Utilities

CLI utilities for improved developer experience.

## Scripts

### Git Checkout Utility

- Detects local changes before checkout
    - In case of changes: prompts user for actions (abort, stash, stash pop)
- Lists remote branches for selection
- Executes Git commands via a process executor

## Structure

- Functionality is written in TypeScript and exist in `./src`
- Each script should have its own shell script in `./scripts` (easier to use in dotfiles)

## Getting Started 

1. **Clone the repository:**
   ```sh
   git clone git@github.com:Jamafu/git-utilities.git
   cd git-utilities
    ```
2. Add scripts to dotfiles (e.g.`.functions`):
   4. Example: 
      - Add the following to your `.bashrc` or `.zshrc`:
        ```sh
        function gc() {
           bash <path>/_dist/scripts/git-checkout.sh;
        }
        ```
3. In git repository, run:
   ```sh
   gc
   ```

## Technologies

- TypeScript
- Node.js
- Inquirer.js for interactive prompts