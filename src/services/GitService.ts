import { injectable } from 'inversify';
import { err, ok, Result } from 'neverthrow';
import { ShellFacade } from '../facades/ShellFacade';
import { PromptService } from './PromptService';

const LocalChangesAction = {
  abort: 'abort',
  gitStash: 'git stash',
  gitStashPop: 'git stash pop',
};

enum StashAction {
  abort = 'abort',
  gitStash = 'git stash',
  gitStashPop = 'git stash pop',
  none = 'none',
}

@injectable()
export class GitService {
  constructor(
    private readonly promptService: PromptService,
    private readonly processExecutor: ShellFacade,
  ) {}

  public async checkout(): Promise<Result<string | undefined, string>> {
    const isGitRepo = await this.isGitRepository();
    if (!isGitRepo) {
      return err('Not a Git repository.');
    }

    const stashResult = await this.handleStash();
    if (stashResult.isErr()) {
      return err('Failed to handle local changes.');
    }
    const localChangesAction = stashResult.value;
    if (localChangesAction === StashAction.abort) {
      return ok('Checkout aborted by user.');
    }

    const branchNamesResult = await this.getBranchNames();
    if (branchNamesResult.isErr()) {
      return err('Failed to retrieve branch names.');
    }

    const branchNames = branchNamesResult.value;
    if (branchNames.length === 0) {
      return ok('No branches found.');
    }
    if (branchNames.length === 1) {
      const singleBranch = branchNames[0];
      return ok(`Only one branch exists: ${singleBranch}. No need to select.`);
    }

    const userInput = await this.promptService.autoComplete(
      'Select branch (start typing or use arrow keys):',
      branchNames,
    );
    const checkoutCliOutputResult = await this.processExecutor.execute(`git checkout ${userInput}`);
    if (checkoutCliOutputResult.isErr()) {
      return err(`Failed to checkout branch: ${userInput}`);
    }
    const checkoutCliOutput = checkoutCliOutputResult.value;
    console.log(checkoutCliOutput);

    if (localChangesAction !== LocalChangesAction.gitStashPop) {
      return ok(undefined);
    }

    const stashPopOutputResult = await this.processExecutor.execute('git stash pop');
    if (stashPopOutputResult.isErr()) {
      return err('Failed to pop stashed changes.');
    }

    const stashPopOutput = stashPopOutputResult.value;
    console.log(stashPopOutput);
    return ok(stashPopOutputResult.value);
  }

  private async isGitRepository(): Promise<boolean> {
    try {
      await this.processExecutor.execute('git rev-parse --is-inside-work-tree', false);
      return true;
    } catch (_error) {
      return false;
    }
  }

  private async getBranchNames(): Promise<Result<string[], undefined>> {
    const pullResult = await this.processExecutor.execute('git pull');
    if (pullResult.isErr()) {
      return err(undefined);
    }

    const result = await this.processExecutor.execute('git branch -r');
    if (result.isErr()) {
      console.warn('Failed to retrieve remote branches.');
      return err(undefined);
    }

    const branchNames = result.value
      .split('\n')
      .map(line => line.trim())
      .filter(line => line?.startsWith('origin/'))
      .map(branch => branch.replace(/^origin\//, ''))
      .filter(line => line && !line.toLowerCase().includes('head'));

    return ok(branchNames);
  }

  private async handleStash(): Promise<Result<StashAction, undefined>> {
    const changesExistResult = await this.localChangesExists();
    if (changesExistResult.isErr()) {
      return err(undefined);
    }
    if (!changesExistResult.value) {
      return ok(StashAction.none);
    }

    const userDecision = await this.promptService.autoComplete('Local changes detected. How to handle them?', [
      LocalChangesAction.abort,
      LocalChangesAction.gitStash,
      LocalChangesAction.gitStashPop,
    ]);

    if (userDecision === LocalChangesAction.abort) {
      return ok(StashAction.abort);
    }
    //  test

    const stashResult = await this.processExecutor.execute('git stash');
    if (stashResult.isErr()) {
      return err(undefined);
    }
    const stashOutput = stashResult.value;
    console.log(stashOutput);

    if (userDecision === LocalChangesAction.gitStash) {
      return ok(StashAction.gitStash);
    }
    return ok(StashAction.gitStashPop);
  }

  private async localChangesExists(): Promise<Result<boolean, undefined>> {
    const gitStatusResult = await this.processExecutor.execute('git status');
    if (gitStatusResult.isErr()) {
      console.warn('Failed to retrieve git status.');
      return err(undefined);
    }

    const gitStatusIndicators = ['changes not staged for commit', 'changes to be committed'];
    const hasUnstagedChanges = gitStatusIndicators.some(indicator =>
      gitStatusResult.value.toLowerCase().includes(indicator),
    );
    return ok(hasUnstagedChanges);
  }
}
