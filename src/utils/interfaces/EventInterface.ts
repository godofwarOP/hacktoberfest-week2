export interface EventInterface {
  name: string;
  execute: (...args: any) => any;
}
