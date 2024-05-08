/**
 * @param message string
 * @param expectedInput string - Example of expected input.
 *
 */
export class UserError extends Error {
  expectedInput: string | undefined;

  constructor(message: string, expectedInput?: string) {
    super(message);
    this.expectedInput = expectedInput;
  }
}
