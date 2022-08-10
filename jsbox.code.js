/*
 * @Author: tackchen
 * @Date: 2022-08-07 15:18:43
 * @Description: Coding something
 */
window.jsboxCode = {
  lib: 'https://cdn.jsdelivr.net/npm/idb-logger/idb-logger.min.js',
  lang: 'html',
  code: /* html */`<button onclick="_log()">write log</button>
<button onclick="_download()">download all log</button>
<script>
  var logger = new IDBLogger();

  var id = 0;
  async function _log(){
    console.log((await logger.log('msg'+(id++), 'payload1', 'payload2')).add);
  }
  function _download(){
    logger.download();
  }
</script>`
};
