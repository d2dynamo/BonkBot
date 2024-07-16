export default class {
  /* Phrases that will trigger the GamerWord */
  readonly phrases: string[];
  readonly cost: number;
  /* Response that will be sent when the GamerWord is triggered. */
  readonly response: string | undefined;
  readonly createdAt: Date | undefined;
  readonly updatedAt: Date | undefined;

  constructor(
    phrases: string[],
    cost: number = 5,
    optionals?: { response?: string; createdAt?: Date; updatedAt?: Date }
  ) {
    this.phrases = phrases;
    this.cost = cost;
    this.createdAt = optionals ? optionals.createdAt : undefined;
    this.updatedAt = optionals ? optionals.updatedAt : undefined;

    if (optionals?.response) {
      let parsedResponse = optionals.response.trim().replace(/\.$/, "");
      this.response = parsedResponse;
    }
  }
}
