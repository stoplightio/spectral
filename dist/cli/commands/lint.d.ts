import { Command, flags as flagHelpers } from '@oclif/command';
import { ILintConfig } from '../../types/config';
export default class Lint extends Command {
    static description: string;
    static examples: string[];
    private static defaultLintConfig;
    static flags: {
        help: import("@oclif/parser/lib/flags").IBooleanFlag<void>;
        encoding: flagHelpers.IOptionFlag<string | undefined>;
        format: flagHelpers.IOptionFlag<string | undefined>;
        output: flagHelpers.IOptionFlag<string | undefined>;
        ruleset: flagHelpers.IOptionFlag<string[]>;
        'skip-rule': flagHelpers.IOptionFlag<string[]>;
        verbose: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        quiet: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    protected quiet: boolean;
    static args: {
        name: string;
    }[];
    run(): Promise<void>;
    log(message?: string, ...args: any[]): void;
    print(message?: string, ...args: any[]): void;
}
export declare function writeOutput(outputStr: string, flags: ILintConfig, command: Lint): Promise<void>;
