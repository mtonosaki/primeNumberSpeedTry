const {Worker} = require('worker_threads')

function rootNth(val, k=2n, limit=-1) {
    let o = 0n; // old approx value
    let x = val;
    
    while(x**k!==k && x!==o && --limit) {
      o=x;
      x = ((k-1n)*x + val/x**(k-1n))/k;
      if(limit<0 && (x-o)**2n == 1n) break;
    }
    
    if ((val-(x-1n)**k)**2n < (val-x**k)**2n) x=x-1n;
    if ((val-(x+1n)**k)**2n < (val-x**k)**2n) x=x+1n;
    return x;
}

function calculationPrimeNumberTono3(number){
    console.time('あなたの処理時間は')
    const div = 12n
    const startNos = [11n]
    let n = 11n
    let max = rootNth(number)
    let span = max / div
    for(let i = 0; i < div - 1n; i++ ){
        n += span
        startNos.push(n)
    }
    for(let i = 1; i < startNos.length; i++ ){
        let n = startNos[i]
        let n2 = (n - 11n) / 330n
        n2 = n2 * 330n + 11n
        startNos[i] = n2
    }
    startNos.push(max)
    const tasks = []
    for(let i = startNos.length - 2; i !== -1 ; i -= 1){
        const worker = new Worker('./tono.js', { workerData: {start: startNos[i] + 2n, end: startNos[i + 1], number}})
        tasks.push(worker)
    }
    Promise.all(tasks.map((it, index) => new Promise(r => tasks[index].on('exit', r)))).then(() => console.timeEnd('あなたの処理時間は'))
}

function  processMeasure(calculationFunction, questionNumber) {
    calculationFunction(questionNumber)
}

// 1192000993n * 1192001071n
// processMeasure(calculationPrimeNumberTono3, 1420866460289063503n)
processMeasure(calculationPrimeNumberTono3, 19n * 1192000993n)

// 503 * 709 =  356627
//processMeasure(calculationPrimeNumberTono3, 356627n)

// 19 * 1192000993 = 22648018867
// processMeasure(calculationPrimeNumberTono3, 22648018867n)

