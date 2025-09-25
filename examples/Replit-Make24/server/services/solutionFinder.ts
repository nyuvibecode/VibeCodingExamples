export interface Solution {
  expression: string;
  result: number;
}

export class SolutionFinder {
  private static readonly OPERATORS = ['+', '-', '*', '/'];
  private static readonly TARGET = 24;

  static findSolution(numbers: number[]): Solution | null {
    if (numbers.length !== 4) {
      throw new Error('SolutionFinder requires exactly 4 numbers');
    }

    // Try all permutations of numbers
    const permutations = this.getPermutations(numbers);
    
    for (const perm of permutations) {
      // Try all combinations of operators
      for (const op1 of this.OPERATORS) {
        for (const op2 of this.OPERATORS) {
          for (const op3 of this.OPERATORS) {
            // Try different parenthesization patterns
            const patterns = [
              `${perm[0]} ${op1} ${perm[1]} ${op2} ${perm[2]} ${op3} ${perm[3]}`, // a op b op c op d
              `(${perm[0]} ${op1} ${perm[1]}) ${op2} (${perm[2]} ${op3} ${perm[3]})`, // (a op b) op (c op d)
              `((${perm[0]} ${op1} ${perm[1]}) ${op2} ${perm[2]}) ${op3} ${perm[3]}`, // ((a op b) op c) op d
              `${perm[0]} ${op1} ((${perm[1]} ${op2} ${perm[2]}) ${op3} ${perm[3]})`, // a op ((b op c) op d)
              `(${perm[0]} ${op1} (${perm[1]} ${op2} ${perm[2]})) ${op3} ${perm[3]}`, // (a op (b op c)) op d
              `${perm[0]} ${op1} (${perm[1]} ${op2} (${perm[2]} ${op3} ${perm[3]}))`, // a op (b op (c op d))
            ];

            for (const pattern of patterns) {
              try {
                const result = this.evaluateExpression(pattern);
                if (result !== null && Math.abs(result - this.TARGET) < 0.0001) {
                  return {
                    expression: pattern,
                    result: this.TARGET
                  };
                }
              } catch {
                // Skip invalid expressions
                continue;
              }
            }
          }
        }
      }
    }

    return null; // No solution found
  }

  private static getPermutations(arr: number[]): number[][] {
    if (arr.length <= 1) return [arr];
    
    const result: number[][] = [];
    for (let i = 0; i < arr.length; i++) {
      const current = arr[i];
      const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
      const perms = this.getPermutations(remaining);
      
      for (const perm of perms) {
        result.push([current, ...perm]);
      }
    }
    
    return result;
  }

  private static evaluateExpression(expression: string): number | null {
    try {
      const func = new Function('return ' + expression);
      const result = func();
      
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        return result;
      }
      return null;
    } catch {
      return null;
    }
  }

  static generateNumbers(): number[] {
    // Generate 4 random numbers between 1 and 13 (like a deck of cards)
    const numbers: number[] = [];
    for (let i = 0; i < 4; i++) {
      numbers.push(Math.floor(Math.random() * 13) + 1);
    }
    
    // Ensure there's at least one solution by trying a few times
    for (let attempts = 0; attempts < 10; attempts++) {
      const solution = this.findSolution(numbers);
      if (solution) {
        return numbers;
      }
      
      // Generate new numbers if no solution found
      for (let i = 0; i < 4; i++) {
        numbers[i] = Math.floor(Math.random() * 13) + 1;
      }
    }
    
    // If still no solution, use a known solvable set
    return [6, 8, 2, 4]; // (8-6) * (4+2) = 24
  }
}
