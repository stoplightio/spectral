import {Command, flags} from '@oclif/command'

export default class Lint extends Command {
  static description = 'lint a JSON/YAML object'

  static examples = [
    `$ spectral lint
linting ./openapi.yaml
`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({char: 'n', description: 'name to print'}),
    // flag with no value (-f, --force)
    force: flags.boolean({char: 'f'}),
  }

  static args = [{name: 'file'}]

  async run() {
    const {args, flags} = this.parse(Lint)

    const name = flags.name || 'world'
    this.log(`linting ${name} (./src/commands/lint.ts)`)
    if (args.file && flags.force) {
      this.log(`you input --force and --file: ${args.file}`)
    }
  }
}
