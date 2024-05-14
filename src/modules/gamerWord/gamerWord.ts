export default class {
  /* Phrases that will trigger the GamerWord */
  readonly phrases: string[];
  readonly cost: number;
  /* Response that will be sent when the GamerWord is triggered. */
  readonly response: string | undefined;

  constructor(
    phrases: string[],
    cost: number = 5,
    optionals?: { response?: string }
  ) {
    this.phrases = phrases;
    this.cost = cost;

    if (optionals?.response) {
      let parsedResponse = optionals.response.trim().replace(/\.$/, "");
      this.response = parsedResponse;
    }
  }
}
