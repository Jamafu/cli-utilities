import { container } from '../../container/inversify.config';
import { GitService } from '../../services/GitService';

const gitService = container.get<GitService>(GitService);

gitService
  .checkout()
  .then(executionResult => {
    if (executionResult.isErr()) {
      throw new Error(executionResult.error);
    }
    if (executionResult.value !== undefined) {
      console.log(executionResult.value);
    }
  })
  .catch((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`An error occurred while running the script: ${errorMessage}`);
  });
