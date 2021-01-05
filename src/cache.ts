function Cache(useCache:boolean = true) {
  this.openCache = useCache; // 采用缓存
  this.tempData = {}; // 为了加入缓存
  this.XHR = new XMLHttpRequest();
}

Cache.prototype = {
  get(url: string, data?: any, successCb?: Function, failureCb?: Function) {
    const _self = this;
    if (data && typeof data === 'object') {
      url = this.encodeGetData(url, data);
    }
    let sendCount = 0;
    const xhr: XMLHttpRequest = this.XHR;
    xhr.onreadystatechange = function () {
      if (this.readyState == 4) {
        if ((this.status >= 200 && this.status < 300) || this.status == 304) {
          const res = JSON.parse(this.responseText);
          if (typeof successCb === 'function') {
            successCb(res);
            // 记录缓存
            _self.tempData[url] = res;
          }
        } else {
          if(++sendCount < 3){
            // 重试请求
            this.open('get',url,true);
            this.send(null)
          }else {
            if(typeof failureCb === 'function'){
              failureCb();
            }
          }
        }
      }
    };
    if(this.openCache && this.tempData[url]){
      // 读取缓存
      successCb(this.tempData[url])
    }else{
      xhr.open('get',url,true)
      xhr.send(null)
    }
  },
  encodeGetData(urlStr: String, dataObject: Object): String {
    for (const prop in dataObject) {
      const encodeProp = encodeURIComponent(prop);
      const encodeValue = encodeURIComponent(dataObject[prop]);
      urlStr += urlStr.indexOf('?') == -1 ? '?' : '&';
      const dataStr = encodeProp + '=' + encodeValue;
      urlStr += dataStr;
    }
    return urlStr;
  },
  loadJS(url:string,callback:Function){
    if(this.tempData[url])return

    const script:any = document.createElement('script')
    script.type = 'text/javascript';
    if (script.readyState) {
      //IE
      script.onreadystatechange = function () {
        if (this.readyState === 'loaded' || this.readyState === 'complete') {
          this.onreadystatechange = null;
          this.tempData[url] = true
          if(typeof callback === 'function'){
            callback()
          }
        }
      };
    } else {
      //其他浏览器
      script.onload = function () {
        this.tempData[url] = true
        if(typeof callback === 'function'){
          callback()
        }
      };
    }
    script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);
  }
};

export default Cache
