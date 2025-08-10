import { ExecException, exec } from 'child_process';
import { injectable } from 'inversify';
import { err, ok, Result } from 'neverthrow';

interface CommandExecutionResult {
  err?: ExecException;
  stdout: string;
  stderr: string;
}

@injectable()
export class ShellFacade {
  public async execute(command: string, printError = true): Promise<Result<string, undefined>> {
    try {
      const result = await this.doExecute(command);
      if (result.err === undefined) {
        return ok(result.stdout);
      }

      if (printError) {
        console.error(`Failed to execute command: ${command}`);
        console.error(result.stderr);
      }
      return err(undefined);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to execute command`, { command, error: errorMessage });
      return err(undefined);
    }
  }

  private async doExecute(command: string): Promise<CommandExecutionResult> {
    return new Promise(resolve => {
      exec(command, (err: ExecException | null, stdout: string, stderr: string) => {
        resolve({ err: err ?? undefined, stdout, stderr });
      });
    });
  }
}
