class MapWithDeadLine {
    constructor(duration){
        this.duration = duration * 1000;
        this.map = new Map();
        this.loopId = setInterval(this.loop, 2000, this);
    }
    set(k, v){
        let t = new Date();
        this.map.set(k, {'value': v, 't': t});
    }
    
    get(k){
        const item = this.map.get(k)
        if(!item){
            return undefined
        }
        return item.value ;
    }

    del(k){
        this.map.delete(k);
    }

    loop(instance){
        let now = new Date();
        instance.map.forEach((v, k) => {
            let d = now - v.t;
            if(d > instance.duration){
                instance.map.delete(k)
                console.log('delete expired item, key=', k)
            }
        })
    }

    destroy(){
        if(this.loopId){
            clearInterval(this.loopId);
        }
    }
}

module.exports = {
    MapWithDeadLine
}


