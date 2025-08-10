import { injectable } from 'inversify';
// @ts-ignore
import { AutoComplete, MultiSelect } from 'enquirer';

interface PromptObject {
  name: string;
  message: string;
  initial?: string;
  choices?: string[];
}

@injectable()
export class PromptService {
  public async autoComplete(message: string, choices: string[]): Promise<string> {
    const prompt: PromptObject = {
      name: 'value',
      message,
      choices,
    };
    const selectedAppQuery = new AutoComplete(prompt);

    return await selectedAppQuery.run();
  }

  public async multiSelect(message: string, choices: string[]) {
    const killSelection = new MultiSelect({
      name: 'value',
      message,
      limit: 7,
      choices,
    });

    return await killSelection.run();
  }
}
