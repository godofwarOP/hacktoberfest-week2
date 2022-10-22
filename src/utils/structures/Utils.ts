export class Utils {
  convertToPascalCase(word: string) {
    return word[0].toUpperCase() + word.slice(1, word.length);
  }

  timeoutRequest(): Promise<string> {
    return new Promise((res, rej) =>
      setTimeout(() => {
        res("Error :- Timeout");
      }, 10000)
    );
  }
}
