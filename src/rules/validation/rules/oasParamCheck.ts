// import { IRuleMetadata, IRuleResult } from 'spectral/types';

// export class Rule extends AbstractRule {
//   public readonly metadata: IRuleMetadata = {
//     type: 'validation',
//     formats: ['oas2', 'oas3'],
//     objPath: '$.paths',
//     name: 'validate:oas-parameter-check',
//     description: 'Referenced parameters must have a corresponding definition.',
//   };

//   public static FAILURE_STRING_PREFIX = 'The parameter ';
//   public static FAILURE_STRING_SUFFIX = ' does not have a corresponding definition';
//   private static paramRe: RegExp = /(\{[a-z]+\})+/gm;

//   public apply(source: any): IRuleResult[] {
//     const results: IRuleResult[] = [];

//     for (const path of source) {
//       while (true) {
//         const match = Rule.paramRe.exec(path);
//         if (!match || match.length <= 0) {
//           break;
//         }

//         let found = false;
//         const paramName = match[0].replace(/[\{\}]/g, '');
//         const params = source[path]['params'];
//         if (params) {
//           for (const p in params) {
//             if (found) {
//               break;
//             }

//             const { name } = params[p];
//             if (!name) {
//               continue;
//             }

//             if (name === paramName) {
//               found = true;
//             }
//           }

//           // if (!found) {
//           //   results.push({
//           //     type: this.metadata.type,
//           //   });
//           // }
//         }
//       }
//     }

//     return results;
//   }
// }
