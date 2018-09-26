import { Rules } from '..';

export class Rule extends Rules.AbstractRule {
  /* tslint:disable:object-literal-sort-keys */
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'align',
    description: 'Enforces vertical alignment.',
    hasFix: true,
    rationale: Lint.Utils.dedent`
            Helps maintain a readable, consistent style in your codebase.
            Consistent alignment for code statements helps keep code readable and clear.
            Statements misaligned from the standard can be harder to read and understand.`,
    optionsDescription: Lint.Utils.dedent`
            Five arguments may be optionally provided:
            * \`"${OPTION_PARAMETERS}"\` checks alignment of function parameters.
            * \`"${OPTION_ARGUMENTS}"\` checks alignment of function call arguments.
            * \`"${OPTION_STATEMENTS}"\` checks alignment of statements.
            * \`"${OPTION_MEMBERS}"\` checks alignment of members of classes, interfaces, type literal, object literals and
            object destructuring.
            * \`"${OPTION_ELEMENTS}"\` checks alignment of elements of array iterals, array destructuring and tuple types.`,
    options: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          OPTION_ARGUMENTS,
          OPTION_ELEMENTS,
          OPTION_MEMBERS,
          OPTION_PARAMETERS,
          OPTION_STATEMENTS,
        ],
      },
      minLength: 1,
      maxLength: 5,
    },
    optionExamples: [[true, 'parameters', 'statements']],
    type: 'style',
    typescriptOnly: false,
  };
  /* tslint:enable:object-literal-sort-keys */

  public static FAILURE_STRING_SUFFIX = ' are not aligned';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
      new AlignWalker(sourceFile, this.ruleName, {
        arguments: this.ruleArguments.indexOf(OPTION_ARGUMENTS) !== -1,
        elements: this.ruleArguments.indexOf(OPTION_ELEMENTS) !== -1,
        members: this.ruleArguments.indexOf(OPTION_MEMBERS) !== -1,
        parameters: this.ruleArguments.indexOf(OPTION_PARAMETERS) !== -1,
        statements: this.ruleArguments.indexOf(OPTION_STATEMENTS) !== -1,
      })
    );
  }
}
