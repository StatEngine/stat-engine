export const initTippy = async () => {
  return (await import(/* webpackChunkName: "tippy" */ 'tippy.js')).default;
}