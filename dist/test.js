/*
 * @Author: tackchen
 * @Date: 2022-07-31 13:27:05
 * @Description: Coding something
 */
async function test(){
    const time = Date.now()
    for(let i=0;i<1000;i++){
        await lg.log('s'+i);
    }
    console.warn('耗时：', Date.now()-time);
}

async function test2(){
    const time = Date.now()
    console.log(await lg.getAll());
    console.warn('耗时：', Date.now()-time);
}
async function test3(){
    const time = Date.now()
    console.log(await lg.filter(d=>d.msg.includes('s1')));
    console.warn('耗时：', Date.now()-time);
}

async function test4(){
    const time = Date.now()
    console.log(await lg.download(d=>d.msg.includes('s1')));
    console.warn('耗时：', Date.now()-time);
}
async function test5(){
    const time = Date.now()
    console.log(await lg.download());
    console.warn('耗时：', Date.now()-time);
}
async function test6(){
    const time = Date.now()
    console.log(await lg.store.destory());
    console.warn('耗时：', Date.now()-time);
}

