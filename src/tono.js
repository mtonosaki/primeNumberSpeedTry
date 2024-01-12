const {workerData} = require('worker_threads')

function calculationPrimeNumberTono2s(start, end, number){
    const ppset = [4n,2n,4n,6n,2n,6n,4n,2n,4n,2n,4n,6n,2n,6n,4n,2n,6n,4n,6n,2n,6n,4n,2n,4n,2n,4n,6n,8n,4n,2n,4n,2n,10n,2n,6n,4n,2n,4n,2n,4n,6n,2n,10n,2n,4n,2n,4n,8n,6n,4n,2n,4n,2n,4n,6n,2n,6n,4n,6n,2n,4n,6n,2n,6n,4n,2n,4n,2n,4n,6n,2n,6n,4n,2n,4n,6n,6n,2n,6n,6n,]
    let pp = -1

    for(let i = start; i < end; i += ppset[pp]) {
        pp += 1
        if(pp === 80) pp = 0 

        if( number % i == 0) {
            const ret = [number/i, i]
            console.log(ret)
            return ret
        }
    }
    return undefined
}

function heavyMethod() {
    calculationPrimeNumberTono2s(workerData.start, workerData.end, workerData.number)
}


heavyMethod()