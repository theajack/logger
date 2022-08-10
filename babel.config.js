/*
 * @Author: tackchen
 * @Date: 2022-08-09 17:58:01
 * @Description: Coding something
 */
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'entry',
        targets: {
          esmodules: true,
          ie: 11,
        },
      },
    ],
    '@babel/preset-typescript',
  ],
};
 
