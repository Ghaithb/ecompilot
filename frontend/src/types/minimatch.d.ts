declare module 'minimatch' {
  namespace minimatch {
    interface IOptions {
      [key: string]: any;
    }
    function filter(pattern: string, options?: IOptions): (element: string) => boolean;
    function match(list: string[], pattern: string, options?: IOptions): string[];
  }

  function minimatch(target: string, pattern: string, options?: minimatch.IOptions): boolean;
  export = minimatch;
}