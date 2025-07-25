declare module 'lodash.debounce' {
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait?: number,
    options?: {
      leading?: boolean
      trailing?: boolean
      maxWait?: number
    },
  ): T
  export default debounce
}
