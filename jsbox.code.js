/*
 * @Author: tackchen
 * @Date: 2022-08-07 15:18:43
 * @Description: Coding something
 */
window.jsboxCode = {
  lib: 'https://cdn.jsdelivr.net/npm/idb-logger/idb-logger.min.js',
  lang: 'html',
  code: /* html */`<button id="write">write log</button>
<button id="download">download all log</button>
<script>
  var logger = new IDBLogger();

  var id = 0;

  $("#write").onclick = async function _log(){
    console.log((await logger.log('msg'+(id++), 'payload1', 'payload2')).add);
  }
  $("#download").onclick = function _download(){
    logger.download();
  }
</script>`
};
