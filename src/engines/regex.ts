import type { RegexTestResult } from '../types';

export function testRegex(pattern: string, input: string, flags = ''): RegexTestResult {
  try {
    const re = new RegExp(pattern, flags);
    const allMatches: RegexTestResult['matches'] = [];
    
    // Full match check
    const fullMatchRe = new RegExp(`^(?:${pattern})$`, flags);
    const fullMatch = fullMatchRe.test(input);

    // Find all matches
    const globalRe = new RegExp(pattern, 'g' + flags.replace('g', ''));
    let m;
    while ((m = globalRe.exec(input)) !== null) {
      allMatches.push({
        match: m[0],
        start: m.index,
        end: m.index + m[0].length,
        groups: m.slice(1),
      });
      if (!globalRe.flags.includes('g')) break;
    }

    return {
      pattern,
      input,
      isValid: true,
      matches: allMatches,
      fullMatch,
    };
  } catch (e: any) {
    return {
      pattern,
      input,
      isValid: false,
      matches: [],
      fullMatch: false,
      error: e.message,
    };
  }
}

export const REGEX_EXAMPLES = [
  { label: 'Strings over {a,b} ending in b', pattern: '(a|b)*b', description: 'All strings over {a,b} that end with b' },
  { label: 'Binary strings with even 0s', pattern: '1*(01*01*)*', description: 'Strings over {0,1} with an even number of 0s' },
  { label: 'Email address', pattern: '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}', description: 'Simple email validation' },
  { label: 'Identifier (programming)', pattern: '[a-zA-Z_][a-zA-Z0-9_]*', description: 'Valid programming identifier' },
  { label: 'Integer', pattern: '-?[0-9]+', description: 'Optional negative integer' },
  { label: 'Words with double letters', pattern: '[a-z]*(.)\\1[a-z]*', description: 'Words containing at least one doubled letter' },
];
