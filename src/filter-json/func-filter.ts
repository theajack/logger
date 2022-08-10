/*
 * @Author: tackchen
 * @Date: 2022-07-30 19:43:09
 * @Description: Coding something
 */

export const FuncFilter = (() => {
  const PREFIX = '/*fn*/';

  return {
    transFunc (filter?: any) {
      if (typeof filter === 'function') {
        return '/*fn*/' + filter.toString();
      }
      return filter;
    },
    
    transBack (filter: any) {
      if (typeof filter === 'string') {
        return (new Function(`return (${filter})`))();
      }
      return filter;
    },
    isFuncString (str: string): boolean {
      return str.indexOf(PREFIX) === 0;
    }
  };
})();