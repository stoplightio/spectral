import {Command, flags} from '@oclif/command'
import {existsSync, readFile} from 'fs'
import * as fetch from 'node-fetch'
import {parseWithPointers} from '@stoplight/yaml'
import {Spectral} from '../../../../src/spectral'
import {inspect, promisify} from 'util'
import {resolve as resolver} from 'oas-resolver'

const { oas2Functions, oas2Rules } = require('../../../../src/rulesets/oas2')
const { oas3Functions, oas3Rules } = require('../../../../src/rulesets/oas3')

function lint(name:string, flags:any, oclif:any) {
  return new Promise(async function(resolve, reject) {
  oclif.log(`linting ${name}`)
  let text:string, obj:any;
  if (name.startsWith('http')) {
    const res = await fetch(name)
    text = await res.text()
  }
  else if (existsSync(name)) {
    const readFileAsync = promisify(readFile)
    try {
      text = await readFileAsync(name, flags.encoding)
    }
    catch (ex) {
      reject(new Error(`Could not read ${name}: ${ex.message}`))
    }
  }
  else {
    reject(oclif.error(`${name} does not exist`))
    return false
  }
  try {
    obj = parseWithPointers(text)
  }
  catch (ex) {
    reject(oclif.error(`Could not parse ${name}: ${ex.message}`))
    return false
  }

  if (flags.resolve) {
    try {
      const resolverOutput = await resolver(obj.data, name, {verbose: flags.verbose})
      obj.data = resolverOutput.openapi
    }
    catch (ex) {
      reject(oclif.error(`Error resolving ${name}: ${ex.message}`))
      return false
    }
  }

  const spectral = new Spectral()
    if (obj.data.swagger && obj.data.swagger === '2.0') {
      oclif.log('Swagger/OpenAPI 2.0 detected')
      spectral.addFunctions(oas2Functions())
      spectral.addRules(oas2Rules())
    }
    else if (obj.data.openapi && typeof obj.data.openapi === 'string' && obj.data.openapi.startsWith('3.')) {
      oclif.log('OpenAPI 3.x detected')
      spectral.addFunctions(oas3Functions())
      spectral.addRules(oas3Rules())
    }
    else {
      oclif.error('Input document type could not be determined')
    }
    try {
      const output = spectral.run(obj.data)
      if (output.results.length === 0) {
        oclif.log('No errors or warnings found!')
      }
      else {
        process.exitCode = 1;
        const warnings = (flags.maxWarn ? output.results.slice(0, flags.maxWarn) : output.results);
        for (let issue of warnings) {
          oclif.warn(inspect(issue,{depth: null, colors: true}))
        }
      }
    }
    catch (ex) {
      process.exitCode = 2;
      oclif.error(ex)
    }
  });
}

export default class Lint extends Command {
  static description = 'lint a JSON/YAML document from a file or URL'

  static examples = [
    `$ spectral lint .openapi.yaml
linting ./openapi.yaml
`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    encoding: flags.string({char: 'e', default: 'utf8', description: 'text encoding to use'}),
    maxWarn: flags.integer({char: 'm', description: '[default: all] maximum warnings to show'}),
    resolve: flags.boolean({char: 'r', description: 'resolve external $refs'}),
    verbose: flags.boolean({char: 'v', description: 'increase verbosity'})
  }

  static args = [{name: 'source'}]

  async run() {
    const {args, flags} = this.parse(Lint)

    if (args.source) {
      try {
        const results = await lint(args.source, flags, this)
      }
      catch (ex) {
        this.error(ex.message)
      }
    }
    else {
      this.error('You must specify a document to lint');
    }
  }
}
