import Cache from './cache';

const cache = new Cache();

function getMode(id:string){
  cache.get('/url',{id},res=>{
    for (let i = 0, len = res.js.length; i < len; i++) {
      const jsUrl = res.js[i];
      cache.loadJS(jsUrl)
    }
  })
}

const eduNodes = document.getElementsByTagName('edu-node');
for (let i = 0, len = eduNodes.length; i < len; i++) {
  const node = eduNodes[i];
  if (node instanceof HTMLElement) {
    const id = node.id;
    const data = node.dataset;

    // 根据id获取组件
    getMode(id)
  }
}
