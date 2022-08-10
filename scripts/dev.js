/*
 * @Author: tackchen
 * @Date: 2022-08-03 20:37:59
 * @Description: Coding something
 */
const babel = require('esbuild-plugin-babel');
const {build} = require('esbuild');
const {yamlPlugin} = require('esbuild-plugin-yaml');
const {dtsPlugin} = require('esbuild-plugin-d.ts');
const {resolveRootPath} = require('./build/utils');
const {wrapWorkerCode} = require('./common');


function buildWorker () {
  buildBase({
    entry: 'src/worker/index.ts',
    output: 'src/worker/dist/worker.min.ts',
    sourcemap: false,
    plugins: [babel()],
    async onFinish (isRebuild) {
      await wrapWorkerCode();
      if (!isRebuild) {
        buildMain();
      }
    }
  });
}

function buildMain (watch = true) {
  buildBase({
    entry: 'scripts/dev/index.ts',
    output: 'scripts/dev/bundle.js',
    sourcemap: true,
    watch,
  });
}

function main () {
  buildWorker();
}

function buildBase ({
  entry,
  output,
  onFinish = () => {},
  sourcemap = true,
  plugins = [],
  watch = true,
}) {
  const config = {
    entryPoints: [resolveRootPath(entry)],
    outfile: resolveRootPath(output),
    bundle: true,
    sourcemap,
    format: 'cjs',
    globalName: 'LernaDemo',
    platform: 'browser',
    // plugins:
    //   format === 'cjs' || pkg.buildOptions?.enableNonBrowserBranches
    //     ? [nodePolyfills.default()]
    //     : undefined,
    // define: {
    //   __COMMIT__: '"dev"',
    //   __VERSION__: `"${pkg.version}"`,
    // },
    plugins: [
      ...plugins,
      yamlPlugin(),
      dtsPlugin(),
    ],
  };
  if (watch) {
    config.watch =  {
      onRebuild (error) {
        if (!error) console.log(`rebuilt: ${output}`);
        onFinish(true);
      },
    };
  }
  build(config).then(() => {
    console.log(`watching: ${output}`);
    onFinish(false);
  });
}

main();

 