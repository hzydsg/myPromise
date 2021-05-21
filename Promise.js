function Promise(executor){
    this.promiseState="pending";
    this.promiseResult=undefined;
    //this.callback={};
    //let time=0;
    this.callback=[];
    //resolve函数
    let resolve=(data)=>{
        if(this.promiseState!=="pending"){
            return;
        }
        // if(time>0){
        //     return;
        // }
        this.promiseState="resolve";
        this.promiseResult=data;
        // time++;
        for(let i=0;i<this.callback.length;i++){
            if(this.callback[i].onResolve){
                this.callback[i].onResolve(data);
            }
            
        }
        delete this.callback;
    }

    //reject函数
    let reject=(data)=>{
        if(this.promiseState!=="pending"){
            return;
        }
        // if(time>0){
        //     return;
        // }
        this.promiseState="rejected";
        this.promiseResult=data;
        //console.error(data);
        // time++;
        for(let j=0;j<this.callback.length;j++){
            if(this.callback[j].onReject){
                this.callback[j].onReject(data);
            }
          
        }
        delete this.callback;
    }
    
    /*
    像上面那样写可以实现对象状态只能修改一次,不过有个很大的缺点,那就是很耗费
    内存
    */
    //同步执行执行者函数
    try{
        executor(resolve,reject);
    }
    catch(e){
        reject(e);
    }
  
}
Promise.prototype.then=function(onResolve,onReject){
    let that=this;
    if(typeof onReject!="function"){
        onReject=function(reason){
            throw reason;
        }
    }
    if(typeof onResolve!="function"){
        onResolve=function(success){
            return success;
        }
    }
    return new Promise(function(resolve,reject){
        if(that.promiseState=="resolve"){
            try{
                let result1=onResolve(that.promiseResult);
                if(result1 instanceof Promise){
                    if(result1.promiseState=="resolve"){
                        resolve(result1.promiseResult);
                    }
                    else if(result1.promiseState=="pending"){
                        
                    }
                    else{
                        reject(result1.promiseResult);
                    }
                }
                else{
                    resolve(result1);
                }
            }
           catch(e){
                reject(e);
           }
        }
    
        if(that.promiseState=="rejected"){
            let result2=onReject(that.promiseResult);
            try{
                if(result2 instanceof Promise){
                    if(result2.promiseState=="resolve"){
                        resolve(result2.promiseResult);
                    }
                    else if(result2.promiseState=="pending"){
                       
                    }
                    else{
                        reject(result2.promiseResult);
                    }
                }
                else{
                    resolve(result2);
                }
            }
            catch(e){
                reject(e);
            }
           
        }
        if(that.promiseState=="pending"){
                that.callback.push({
                    onResolve:function(){
                        try{
                            let result3=onResolve(that.promiseResult);
                            if(result3 instanceof Promise){
                                 if(result3.promiseState=="resolve"){
                                     resolve(result3.promiseResult);
                                 }
                                 else if(result3.promiseState=="pending"){
     
                                 }
                                 else{
                                     reject(result3.promiseResult);
                                 }
                            }
                            else{
                                 resolve(result3);
                            }

                            }
                            catch(e){
                                reject(e);
                            }
                    },
                    onReject:function(){
                        try{
                            let result4=onReject(that.promiseResult);
                            if(result4 instanceof Promise){
                                if(result4.promiseState=="resolve"){
                                    resolve(result4.promiseResult);
                                }
                                else if(result4.promiseState=="pending"){
    
                                }
                                else{
                                    reject(result4.promiseResult);
                                }
                           }
                           else{
                                resolve(result4);
                           }
                        }
                     catch(e){
                         reject(e);
                     }
                }
            })
        }
    })
   
    /*
    这样写存在一个问题,执行一个promise对象的多个then函数时,只会执行最后一个
    then函数,不会执行全部then函数,因为最后的then函数都把前面的覆盖了。这是不符合
    原生promise的原理的。

    所以callback应该为一个数组,用来存放多个then函数。
    */
}

Promise.prototype.catch=function(onReject){
    let that=this;
    return new Promise((resolve,reject)=>{
        try{
            if(that.promiseState=="rejected"){
                let result1=onReject(that.promiseResult);
                if(result1 instanceof Promise){
                    if(result1.promiseState=="resolve"){
                        resolve(result1.promiseResult)
                    }
                    else if(result1.promiseState=="rejected"){
                        reject(result1.promiseResult);
                    }
                    else{

                    }
                }
                else{
                    resolve(result1)
                }
                
            }
    
            if(that.promiseState=="pending"){
                    that.callback.push({
                        onReject:function(){
                            try{
                                let result1=onReject(that.promiseResult);
                                if(result1 instanceof Promise){
                                    if(result1.promiseState=="resolve"){
                                        resolve(result1.promiseResult)
                                    }
                                    else if(result1.promiseState=="rejected"){
                                        reject(result1.promiseResult);
                                    }
                                    else{
                
                                    }
                                }
                                else{
                                    resolve(result1);
                                }
                            }
                            catch(e){
                                reject(e);
                            }
                        }
                    })
            }
        }
        catch(e){
            reject(e);
        }
    })
}


/*
promise类resolve方法的实现
*/

Promise.resolve=function(data){
   
    return new Promise((resolve,reject)=>{
        try{
            if(data instanceof Promise){
              
                if(data.promiseState=="pending"){
                        data.then((success)=>{
                            resolve(success);
                        },(fail)=>{
                            reject(fail);
                        })
                }
                else if(data.promiseState=="resolve"){
                    resolve(data.promiseResult);
                }
                else{
                    reject(data.promiseResult);
                }
            }
            else{
                resolve(data);
            }
        }
        catch(e){
            reject(e);
        }
    })
    
}

/*
下面是promise类reject的方法的实现
*/

Promise.reject=function(data){
    return new Promise((resolve,reject)=>{
        try{
            if(data instanceof Promise){
              
                if(data.promiseState=="pending"){
                        data.then((success)=>{
                            reject(data);
                        },(fail)=>{
                            reject(data);
                        })
                }
                else if(data.promiseState=="resolve"){
                    reject(data);
                }
                else{
                    reject(data);
                }
            }
            else{
                reject(data);
            }
        }
        catch(e){
            reject(e);
        }
    })
}

/*
下面编写promise的all方法
*/

Promise.all=function(arr){
    let newArr=[];
    return new Promise((resolve,reject)=>{
        for(let i=0;i<arr.length;i++){
            arr[i].then((success)=>{
                newArr.push(success);
                if(newArr.length==arr.length){
                    resolve(newArr);
                }
            },(fail)=>{
                reject(fail);
            })
        }
     
    })
}

/*
下面进行promise的allsettled方法的编写
*/
Promise.allSettled=function(arr){
    let newArr=[];
    return new Promise((resolve,reject)=>{
        for(let i=0;i<arr.length;i++){
            arr[i].then((success)=>{
                newArr.push({status:"resolve",value:success});
                if(newArr.length==arr.length){
                    resolve(newArr);
                }
               
            },(fail)=>{
                newArr.push({status:"rejected",reason:fail});
                if(newArr.length==arr.length){
                    resolve(newArr);
                }
            })
           
        }
     
    })
}


/*
下面进行promise的race方法的编写
*/
Promise.race=function(arr){
    let flag=false;//代表是否有promise对象从pending转变其它状态
    return new Promise((resolve,reject)=>{
        for(let i=0;i<arr.length;i++){
            arr[i].then((success)=>{
                flag=true;
                if(flag){
                    resolve(success);
                }
            },(fail)=>{
                flag=true;
                if(flag){
                    reject(fail);
                }
            })
        }
    })
}
