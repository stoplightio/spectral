import { serveAssets } from '@stoplight/spectral-test-utils';
import * as path from 'path';
import * as fs from 'fs';
import { fetch } from '@stoplight/spectral-runtime';
import { bundleAndLoadRuleset } from '../node';
import { IO } from '../../types';
import { DiagnosticSeverity } from '@stoplight/types';

describe('bundleAndLoadRuleset node', () => {
  let io: IO;

  beforeEach(() => {
    io = {
      fs,
      fetch,
    };

    serveAssets({
      'https://cdn.skypack.dev/lodash.lowercase': `export * from '/-/lodash.lowercase@v4.3.0-wnZEyQC0Ez8mSkImRcvK/dist=es2020,mode=imports/optimized/lodash.lowercase.js';
export {default} from '/-/lodash.lowercase@v4.3.0-wnZEyQC0Ez8mSkImRcvK/dist=es2020,mode=imports/optimized/lodash.lowercase.js';`,
      'https://cdn.skypack.dev/lodash.uppercase': `export * from '/-/lodash.uppercase@v4.3.0-Ghj8UDzvgbRFVHwnUM53/dist=es2020,mode=imports/optimized/lodash.uppercase.js';
export {default} from '/-/lodash.uppercase@v4.3.0-Ghj8UDzvgbRFVHwnUM53/dist=es2020,mode=imports/optimized/lodash.uppercase.js';`,

      'https://cdn.skypack.dev/-/lodash.lowercase@v4.3.0-wnZEyQC0Ez8mSkImRcvK/dist=es2020,mode=imports/optimized/lodash.lowercase.js':
        'var n=typeof globalThis!="undefined"?globalThis:typeof window!="undefined"?window:typeof global!="undefined"?global:typeof self!="undefined"?self:{},w=1/0,I="[object Symbol]",T=/[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g,z=/[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g,t="\\\ud800-\\\udfff",Z="\\\u0300-\\\u036f\\\ufe20-\\\ufe23",M="\\\u20d0-\\\u20f0",a="\\\u2700-\\\u27bf",c="a-z\\\xdf-\\\xf6\\\xf8-\\\xff",N="\\\xac\\\xb1\\\xd7\\\xf7",W="\\\x00-\\\x2f\\\x3a-\\\x40\\\x5b-\\\x60\\\x7b-\\\xbf",k="\\\u2000-\\\u206f",D=" \\\\t\\\x0b\\\\f\\\xa0\\\ufeff\\\\n\\\\r\\\u2028\\\u2029\\\u1680\\\u180e\\\u2000\\\u2001\\\u2002\\\u2003\\\u2004\\\u2005\\\u2006\\\u2007\\\u2008\\\u2009\\\u200a\\\u202f\\\u205f\\\u3000",s="A-Z\\\xc0-\\\xd6\\\xd8-\\\xde",G="\\\ufe0e\\\ufe0f",i=N+W+k+D,x="[\'\u2019]",b="["+i+"]",l="["+Z+M+"]",p="\\\\d+",P="["+a+"]",g="["+c+"]",O="[^"+t+i+p+a+c+s+"]",J="\\\ud83c[\\\udffb-\\\udfff]",Y="(?:"+l+"|"+J+")",F="[^"+t+"]",y="(?:\\\ud83c[\\\udde6-\\\uddff]){2}",A="[\\\ud800-\\\udbff][\\\udc00-\\\udfff]",f="["+s+"]",H="\\\u200d",R="(?:"+g+"|"+O+")",V="(?:"+f+"|"+O+")",j="(?:"+x+"(?:d|ll|m|re|s|t|ve))?",S="(?:"+x+"(?:D|LL|M|RE|S|T|VE))?",m=Y+"?",h="["+G+"]?",B="(?:"+H+"(?:"+[F,y,A].join("|")+")"+h+m+")*",$=h+m+B,q="(?:"+[P,y,A].join("|")+")"+$,K=RegExp(x,"g"),_=RegExp(l,"g"),Q=RegExp([f+"?"+g+"+"+j+"(?="+[b,f,"$"].join("|")+")",V+"+"+S+"(?="+[b,f+R,"$"].join("|")+")",f+"?"+R+"+"+j,f+"+"+S,p,q].join("|"),"g"),X=/[a-z][A-Z]|[A-Z]{2,}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/,u0={\u00C0:"A",\u00C1:"A",\u00C2:"A",\u00C3:"A",\u00C4:"A",\u00C5:"A",\u00E0:"a",\u00E1:"a",\u00E2:"a",\u00E3:"a",\u00E4:"a",\u00E5:"a",\u00C7:"C",\u00E7:"c",\u00D0:"D",\u00F0:"d",\u00C8:"E",\u00C9:"E",\u00CA:"E",\u00CB:"E",\u00E8:"e",\u00E9:"e",\u00EA:"e",\u00EB:"e",\u00CC:"I",\u00CD:"I",\u00CE:"I",\u00CF:"I",\u00EC:"i",\u00ED:"i",\u00EE:"i",\u00EF:"i",\u00D1:"N",\u00F1:"n",\u00D2:"O",\u00D3:"O",\u00D4:"O",\u00D5:"O",\u00D6:"O",\u00D8:"O",\u00F2:"o",\u00F3:"o",\u00F4:"o",\u00F5:"o",\u00F6:"o",\u00F8:"o",\u00D9:"U",\u00DA:"U",\u00DB:"U",\u00DC:"U",\u00F9:"u",\u00FA:"u",\u00FB:"u",\u00FC:"u",\u00DD:"Y",\u00FD:"y",\u00FF:"y",\u00C6:"Ae",\u00E6:"ae",\u00DE:"Th",\u00FE:"th",\u00DF:"ss",\u0100:"A",\u0102:"A",\u0104:"A",\u0101:"a",\u0103:"a",\u0105:"a",\u0106:"C",\u0108:"C",\u010A:"C",\u010C:"C",\u0107:"c",\u0109:"c",\u010B:"c",\u010D:"c",\u010E:"D",\u0110:"D",\u010F:"d",\u0111:"d",\u0112:"E",\u0114:"E",\u0116:"E",\u0118:"E",\u011A:"E",\u0113:"e",\u0115:"e",\u0117:"e",\u0119:"e",\u011B:"e",\u011C:"G",\u011E:"G",\u0120:"G",\u0122:"G",\u011D:"g",\u011F:"g",\u0121:"g",\u0123:"g",\u0124:"H",\u0126:"H",\u0125:"h",\u0127:"h",\u0128:"I",\u012A:"I",\u012C:"I",\u012E:"I",\u0130:"I",\u0129:"i",\u012B:"i",\u012D:"i",\u012F:"i",\u0131:"i",\u0134:"J",\u0135:"j",\u0136:"K",\u0137:"k",\u0138:"k",\u0139:"L",\u013B:"L",\u013D:"L",\u013F:"L",\u0141:"L",\u013A:"l",\u013C:"l",\u013E:"l",\u0140:"l",\u0142:"l",\u0143:"N",\u0145:"N",\u0147:"N",\u014A:"N",\u0144:"n",\u0146:"n",\u0148:"n",\u014B:"n",\u014C:"O",\u014E:"O",\u0150:"O",\u014D:"o",\u014F:"o",\u0151:"o",\u0154:"R",\u0156:"R",\u0158:"R",\u0155:"r",\u0157:"r",\u0159:"r",\u015A:"S",\u015C:"S",\u015E:"S",\u0160:"S",\u015B:"s",\u015D:"s",\u015F:"s",\u0161:"s",\u0162:"T",\u0164:"T",\u0166:"T",\u0163:"t",\u0165:"t",\u0167:"t",\u0168:"U",\u016A:"U",\u016C:"U",\u016E:"U",\u0170:"U",\u0172:"U",\u0169:"u",\u016B:"u",\u016D:"u",\u016F:"u",\u0171:"u",\u0173:"u",\u0174:"W",\u0175:"w",\u0176:"Y",\u0177:"y",\u0178:"Y",\u0179:"Z",\u017B:"Z",\u017D:"Z",\u017A:"z",\u017C:"z",\u017E:"z",\u0132:"IJ",\u0133:"ij",\u0152:"Oe",\u0153:"oe",\u0149:"\'n",\u017F:"ss"},e0=typeof n=="object"&&n&&n.Object===Object&&n,r0=typeof self=="object"&&self&&self.Object===Object&&self,f0=e0||r0||Function("return this")();function o0(u,e,r,E){var o=-1,d=u?u.length:0;for(E&&d&&(r=u[++o]);++o<d;)r=e(r,u[o],o,u);return r}function n0(u){return u.match(T)||[]}function x0(u){return function(e){return u==null?void 0:u[e]}}var d0=x0(u0);function t0(u){return X.test(u)}function a0(u){return u.match(Q)||[]}var c0=Object.prototype,s0=c0.toString,v=f0.Symbol,U=v?v.prototype:void 0,L=U?U.toString:void 0;function i0(u){if(typeof u=="string")return u;if(p0(u))return L?L.call(u):"";var e=u+"";return e=="0"&&1/u==-w?"-0":e}function b0(u){return function(e){return o0(y0(g0(e).replace(K,"")),u,"")}}function l0(u){return !!u&&typeof u=="object"}function p0(u){return typeof u=="symbol"||l0(u)&&s0.call(u)==I}function C(u){return u==null?"":i0(u)}function g0(u){return u=C(u),u&&u.replace(z,d0).replace(_,"")}var O0=b0(function(u,e,r){return u+(r?" ":"")+e.toLowerCase()});function y0(u,e,r){return u=C(u),e=r?void 0:e,e===void 0?t0(u)?a0(u):n0(u):u.match(e)||[]}var A0=O0;export default A0;',
      'https://cdn.skypack.dev/-/lodash.uppercase@v4.3.0-Ghj8UDzvgbRFVHwnUM53/dist=es2020,mode=imports/optimized/lodash.uppercase.js':
        'var n=typeof globalThis!="undefined"?globalThis:typeof window!="undefined"?window:typeof global!="undefined"?global:typeof self!="undefined"?self:{},I=1/0,T="[object Symbol]",w=/[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g,z=/[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g,t="\\\ud800-\\\udfff",Z="\\\u0300-\\\u036f\\\ufe20-\\\ufe23",M="\\\u20d0-\\\u20f0",a="\\\u2700-\\\u27bf",c="a-z\\\xdf-\\\xf6\\\xf8-\\\xff",N="\\\xac\\\xb1\\\xd7\\\xf7",W="\\\x00-\\\x2f\\\x3a-\\\x40\\\x5b-\\\x60\\\x7b-\\\xbf",k="\\\u2000-\\\u206f",D=" \\\\t\\\x0b\\\\f\\\xa0\\\ufeff\\\\n\\\\r\\\u2028\\\u2029\\\u1680\\\u180e\\\u2000\\\u2001\\\u2002\\\u2003\\\u2004\\\u2005\\\u2006\\\u2007\\\u2008\\\u2009\\\u200a\\\u202f\\\u205f\\\u3000",s="A-Z\\\xc0-\\\xd6\\\xd8-\\\xde",G="\\\ufe0e\\\ufe0f",i=N+W+k+D,x="[\'\u2019]",b="["+i+"]",l="["+Z+M+"]",p="\\\\d+",P="["+a+"]",g="["+c+"]",O="[^"+t+i+p+a+c+s+"]",J="\\\ud83c[\\\udffb-\\\udfff]",Y="(?:"+l+"|"+J+")",F="[^"+t+"]",y="(?:\\\ud83c[\\\udde6-\\\uddff]){2}",A="[\\\ud800-\\\udbff][\\\udc00-\\\udfff]",f="["+s+"]",H="\\\u200d",R="(?:"+g+"|"+O+")",V="(?:"+f+"|"+O+")",j="(?:"+x+"(?:d|ll|m|re|s|t|ve))?",S="(?:"+x+"(?:D|LL|M|RE|S|T|VE))?",m=Y+"?",U="["+G+"]?",B="(?:"+H+"(?:"+[F,y,A].join("|")+")"+U+m+")*",$=U+m+B,q="(?:"+[P,y,A].join("|")+")"+$,K=RegExp(x,"g"),_=RegExp(l,"g"),Q=RegExp([f+"?"+g+"+"+j+"(?="+[b,f,"$"].join("|")+")",V+"+"+S+"(?="+[b,f+R,"$"].join("|")+")",f+"?"+R+"+"+j,f+"+"+S,p,q].join("|"),"g"),X=/[a-z][A-Z]|[A-Z]{2,}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/,u0={\u00C0:"A",\u00C1:"A",\u00C2:"A",\u00C3:"A",\u00C4:"A",\u00C5:"A",\u00E0:"a",\u00E1:"a",\u00E2:"a",\u00E3:"a",\u00E4:"a",\u00E5:"a",\u00C7:"C",\u00E7:"c",\u00D0:"D",\u00F0:"d",\u00C8:"E",\u00C9:"E",\u00CA:"E",\u00CB:"E",\u00E8:"e",\u00E9:"e",\u00EA:"e",\u00EB:"e",\u00CC:"I",\u00CD:"I",\u00CE:"I",\u00CF:"I",\u00EC:"i",\u00ED:"i",\u00EE:"i",\u00EF:"i",\u00D1:"N",\u00F1:"n",\u00D2:"O",\u00D3:"O",\u00D4:"O",\u00D5:"O",\u00D6:"O",\u00D8:"O",\u00F2:"o",\u00F3:"o",\u00F4:"o",\u00F5:"o",\u00F6:"o",\u00F8:"o",\u00D9:"U",\u00DA:"U",\u00DB:"U",\u00DC:"U",\u00F9:"u",\u00FA:"u",\u00FB:"u",\u00FC:"u",\u00DD:"Y",\u00FD:"y",\u00FF:"y",\u00C6:"Ae",\u00E6:"ae",\u00DE:"Th",\u00FE:"th",\u00DF:"ss",\u0100:"A",\u0102:"A",\u0104:"A",\u0101:"a",\u0103:"a",\u0105:"a",\u0106:"C",\u0108:"C",\u010A:"C",\u010C:"C",\u0107:"c",\u0109:"c",\u010B:"c",\u010D:"c",\u010E:"D",\u0110:"D",\u010F:"d",\u0111:"d",\u0112:"E",\u0114:"E",\u0116:"E",\u0118:"E",\u011A:"E",\u0113:"e",\u0115:"e",\u0117:"e",\u0119:"e",\u011B:"e",\u011C:"G",\u011E:"G",\u0120:"G",\u0122:"G",\u011D:"g",\u011F:"g",\u0121:"g",\u0123:"g",\u0124:"H",\u0126:"H",\u0125:"h",\u0127:"h",\u0128:"I",\u012A:"I",\u012C:"I",\u012E:"I",\u0130:"I",\u0129:"i",\u012B:"i",\u012D:"i",\u012F:"i",\u0131:"i",\u0134:"J",\u0135:"j",\u0136:"K",\u0137:"k",\u0138:"k",\u0139:"L",\u013B:"L",\u013D:"L",\u013F:"L",\u0141:"L",\u013A:"l",\u013C:"l",\u013E:"l",\u0140:"l",\u0142:"l",\u0143:"N",\u0145:"N",\u0147:"N",\u014A:"N",\u0144:"n",\u0146:"n",\u0148:"n",\u014B:"n",\u014C:"O",\u014E:"O",\u0150:"O",\u014D:"o",\u014F:"o",\u0151:"o",\u0154:"R",\u0156:"R",\u0158:"R",\u0155:"r",\u0157:"r",\u0159:"r",\u015A:"S",\u015C:"S",\u015E:"S",\u0160:"S",\u015B:"s",\u015D:"s",\u015F:"s",\u0161:"s",\u0162:"T",\u0164:"T",\u0166:"T",\u0163:"t",\u0165:"t",\u0167:"t",\u0168:"U",\u016A:"U",\u016C:"U",\u016E:"U",\u0170:"U",\u0172:"U",\u0169:"u",\u016B:"u",\u016D:"u",\u016F:"u",\u0171:"u",\u0173:"u",\u0174:"W",\u0175:"w",\u0176:"Y",\u0177:"y",\u0178:"Y",\u0179:"Z",\u017B:"Z",\u017D:"Z",\u017A:"z",\u017C:"z",\u017E:"z",\u0132:"IJ",\u0133:"ij",\u0152:"Oe",\u0153:"oe",\u0149:"\'n",\u017F:"ss"},e0=typeof n=="object"&&n&&n.Object===Object&&n,r0=typeof self=="object"&&self&&self.Object===Object&&self,f0=e0||r0||Function("return this")();function o0(u,e,r,L){var o=-1,d=u?u.length:0;for(L&&d&&(r=u[++o]);++o<d;)r=e(r,u[o],o,u);return r}function n0(u){return u.match(w)||[]}function x0(u){return function(e){return u==null?void 0:u[e]}}var d0=x0(u0);function t0(u){return X.test(u)}function a0(u){return u.match(Q)||[]}var c0=Object.prototype,s0=c0.toString,h=f0.Symbol,v=h?h.prototype:void 0,C=v?v.toString:void 0;function i0(u){if(typeof u=="string")return u;if(p0(u))return C?C.call(u):"";var e=u+"";return e=="0"&&1/u==-I?"-0":e}function b0(u){return function(e){return o0(y0(g0(e).replace(K,"")),u,"")}}function l0(u){return !!u&&typeof u=="object"}function p0(u){return typeof u=="symbol"||l0(u)&&s0.call(u)==T}function E(u){return u==null?"":i0(u)}function g0(u){return u=E(u),u&&u.replace(z,d0).replace(_,"")}var O0=b0(function(u,e,r){return u+(r?" ":"")+e.toUpperCase()});function y0(u,e,r){return u=E(u),e=r?void 0:e,e===void 0?t0(u)?a0(u):n0(u):u.match(e)||[]}var A0=O0;export default A0;',
    });
  });

  it('should be able to load JS ruleset', async () => {
    const ruleset = await bundleAndLoadRuleset(path.join(__dirname, '__fixtures__/spectral.js'), io);

    expect(JSON.parse(JSON.stringify(ruleset))).toStrictEqual({
      aliases: null,
      extends: null,
      formats: null,
      id: expect.any(Number),
      overrides: null,
      parserOptions: {
        duplicateKeys: DiagnosticSeverity.Error,
        incompatibleValues: DiagnosticSeverity.Error,
      },
      rules: {
        'lower-case-rule': {
          description: null,
          documentationUrl: null,
          enabled: true,
          formats: null,
          given: ['$'],
          message: null,
          name: 'lower-case-rule',
          owner: expect.any(Number),
          recommended: true,
          resolved: true,
          severity: DiagnosticSeverity.Warning,
          then: [
            {
              function: 'lowerCase',
            },
          ],
        },
        'odd-rule': {
          description: null,
          documentationUrl: null,
          enabled: true,
          formats: null,
          given: ['$'],
          message: null,
          name: 'odd-rule',
          owner: expect.any(Number),
          recommended: true,
          resolved: true,
          severity: DiagnosticSeverity.Warning,
          then: [
            {
              function: 'myFn',
            },
          ],
        },
        'upper-case-rule': {
          description: null,
          documentationUrl: null,
          enabled: true,
          formats: null,
          given: ['$'],
          message: null,
          name: 'upper-case-rule',
          owner: expect.any(Number),
          recommended: true,
          resolved: true,
          severity: DiagnosticSeverity.Warning,
          then: [
            {
              function: 'upperCase',
            },
          ],
        },
      },
      source: path.join(__dirname, '__fixtures__/spectral.js'),
    });
  });

  it('should be able to load JSON/YAML ruleset', async () => {
    const ruleset = await bundleAndLoadRuleset(path.join(__dirname, '__fixtures__/spectral.json'), io);

    expect(JSON.parse(JSON.stringify(ruleset))).toStrictEqual({
      aliases: null,
      extends: null,
      formats: null,
      id: expect.any(Number),
      overrides: null,
      parserOptions: {
        duplicateKeys: 0,
        incompatibleValues: 0,
      },
      rules: {
        'lower-case-rule': {
          description: null,
          documentationUrl: null,
          enabled: true,
          formats: null,
          given: ['$'],
          message: null,
          name: 'lower-case-rule',
          owner: expect.any(Number),
          recommended: true,
          resolved: true,
          severity: DiagnosticSeverity.Warning,
          then: [
            {
              function: 'lowercase',
            },
          ],
        },
        'odd-rule': {
          description: null,
          documentationUrl: null,
          enabled: true,
          formats: null,
          given: ['$'],
          message: null,
          name: 'odd-rule',
          owner: expect.any(Number),
          recommended: true,
          resolved: true,
          severity: DiagnosticSeverity.Warning,
          then: [
            {
              function: 'myfn',
            },
          ],
        },
        'upper-case-rule': {
          description: null,
          documentationUrl: null,
          enabled: true,
          formats: null,
          given: ['$'],
          message: null,
          name: 'upper-case-rule',
          owner: expect.any(Number),
          recommended: true,
          resolved: true,
          severity: DiagnosticSeverity.Warning,
          then: [
            {
              function: 'uppercase',
            },
          ],
        },
      },
      source: path.join(__dirname, '__fixtures__/spectral.json'),
    });
  });
});
