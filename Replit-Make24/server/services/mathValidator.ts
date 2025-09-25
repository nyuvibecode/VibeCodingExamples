export interface ValidationResult {
  isValid: boolean;
  result?: number;
  error?: string;
  numbersUsed?: number[];
}

export class MathValidator {
  static validateExpression(expression: string, requiredNumbers: number[]): ValidationResult {
    try {
      // Clean and normalize the expression
      const cleanExpression = expression.replace(/\s+/g, '');
      
      // Check for valid characters only
      if (!/^[\d+\-*/().]+$/.test(cleanExpression)) {
        return {
          isValid: false,
          error: "Expression contains invalid characters. Use only numbers, +, -, *, /, and parentheses."
        };
      }

      // Extract numbers from expression
      const numbersInExpression = this.extractNumbers(cleanExpression);
      
      // Check if all required numbers are used exactly once
      const numbersUsedCheck = this.checkNumbersUsed(numbersInExpression, requiredNumbers);
      if (!numbersUsedCheck.isValid) {
        return numbersUsedCheck;
      }

      // Evaluate the expression safely
      const result = this.evaluateExpression(cleanExpression);
      
      if (result === null) {
        return {
          isValid: false,
          error: "Invalid mathematical expression."
        };
      }

      // Check if result equals 24 (with small tolerance for floating point)
      const isCorrect = Math.abs(result - 24) < 0.0001;
      
      return {
        isValid: isCorrect,
        result,
        numbersUsed: numbersInExpression,
        error: isCorrect ? undefined : `Expression equals ${result}, but must equal 24.`
      };

    } catch (error) {
      return {
        isValid: false,
        error: "Invalid mathematical expression."
      };
    }
  }

  private static extractNumbers(expression: string): number[] {
    const numberMatches = expression.match(/\d+/g);
    return numberMatches ? numberMatches.map(num => parseInt(num, 10)) : [];
  }

  private static checkNumbersUsed(numbersUsed: number[], requiredNumbers: number[]): ValidationResult {
    // Sort both arrays for comparison
    const sortedUsed = [...numbersUsed].sort((a, b) => a - b);
    const sortedRequired = [...requiredNumbers].sort((a, b) => a - b);

    // Check if arrays have same length
    if (sortedUsed.length !== sortedRequired.length) {
      return {
        isValid: false,
        error: `You must use exactly ${requiredNumbers.length} numbers, but used ${numbersUsed.length}.`
      };
    }

    // Check if arrays contain same numbers
    for (let i = 0; i < sortedUsed.length; i++) {
      if (sortedUsed[i] !== sortedRequired[i]) {
        return {
          isValid: false,
          error: `You must use the numbers ${requiredNumbers.join(', ')} exactly once each.`
        };
      }
    }

    return { isValid: true };
  }

  private static evaluateExpression(expression: string): number | null {
    try {
      // Use Function constructor for safe evaluation (still safer than eval)
      // This is a simplified approach - in production, consider using a proper math parser
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
}
