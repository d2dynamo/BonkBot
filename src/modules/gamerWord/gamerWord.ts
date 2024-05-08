export default class {
  /* Phrases that will trigger the GamerWord */
  readonly phrases: string[];
  readonly cost: number;
  /* Response that will be sent when the GamerWord is triggered. Do not put period at the end. */
  readonly response: string | undefined;

  constructor(
    phrases: string[],
    optionals?: { response?: string; cost?: number }
  ) {
    this.phrases = phrases;

    if (optionals) {
      this.response = optionals.response;
      this.cost = optionals.cost ?? 5;
    } else {
      //temp thing ignore this.
      this.cost = 5;
    }
  }
}
