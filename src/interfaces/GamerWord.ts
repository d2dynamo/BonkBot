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
  public function CheckMessageForMatch(input: string[]) {
    for (let i = 0; i < input.length; i++) {
      for (let j = 0; j < this.phrases.length){
      let currPhrase = this.phrases[j];
      let wordsInPhrase = currPhrase.trim().split(/\s/).length;
        for (let w = 0; w < currPhrase.length; w+wordsInPhrase) {
         
    }
  }
  }
}
