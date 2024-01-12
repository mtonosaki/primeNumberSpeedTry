# USAGE
```shell
node primeNumber.js
```

# 総当りで遅いプログラム
```js
function calculationPrimeNumber(number) {
    for(i = 2n; i <= number; i++) {
        if( number % i == 0) {
            return [number/i, i]
        }
    }
}

function processMeasure(calculationFunction, questionNumber) {
    const startTime = performance.now()
    const arr = calculationFunction(questionNumber)
    const endTime = performance.now()

    const processTime = Math.floor((endTime - startTime)/1000)

    console.log(arr);
    console.log(`あなたの処理時間は${processTime}秒でした。`);
}

const questionPrimeNumber1 = 1192000993n
const questionPrimeNumber2 = 1192001071n
const questionSemiPrimeNumber = 1420866460289063503n

processMeasure(calculationPrimeNumber, questionSemiPrimeNumber)
```

# Speed up Try1
## 着眼点：３の倍数 計算スキップ
```js
// 16秒
const ppset = [2n,4n,2n,4n,6n,2n,6n,4n]
function calculationPrimeNumberTono(number) {
 let pp = -1
    for(let i = 11n; i <= number; i += ppset[pp]) {
        pp += 1
        if(pp === 8) pp = 0
        if( number % i == 0) {
            return [number/i, i]
        }
    }
}
```
エラトステネスのふるいを 横10の表にして、2と5の倍数を除くと、11の行以降30毎に、3の倍数は一定のパターンで現れる。
このパターンを 上記ソースコードの ppsetで表現し、3の倍数は計算・判定の対象からスキップ

![digtono 2024-01-12 at 17 29 14](https://github.com/mtonosaki/primeNumberSpeedTry/assets/34669114/ffdcda68-c2d8-4e32-9257-10d479b9005a)
![digtono 2024-01-12 at 17 29 38](https://github.com/mtonosaki/primeNumberSpeedTry/assets/34669114/8959599c-b38e-41ec-8d9b-7f9f7363c9bb)

# Speed up Try2
## 着眼点：11の倍数もスキップ、全スレッド活用
本当は 7の倍数をスキップしたかった。。。むずい  

```js:tono.ts
// tono.ts
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

// ワーカースレッド対応
function heavyMethod() {
    calculationPrimeNumberTono2s(workerData.start, workerData.end, workerData.number)
}

heavyMethod()
```

```js:primeNumbger.ts
// primeNumbger.ts
const {Worker} = require('worker_threads')

function rootNth(val, k=2n, limit=-1) {  // BigIntの平方根関数
    let o = 0n;
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
    const div = 12n  // スレッド分割数
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
        n2 = n2 * 330n + 11n  // 11始まり330個を1ブロックとするため、ブロックの開始点を求める
        startNos[i] = n2
    }
    startNos.push(max)
    const tasks = []
    for(let i = 0; i < startNos.length - 1; i += 1){
        const worker = new Worker('./tono.js', { workerData: {start: startNos[i] + 2n, end: startNos[i + 1], number}})
        tasks.push(worker)
    }
    Promise.all(tasks.map((it, index) => new Promise(r => tasks[index].on('exit', r)))).then(() => console.timeEnd('あなたの処理時間は'))
}

function  processMeasure(calculationFunction, questionNumber) {
    calculationFunction(questionNumber)
}

// 1192000993n * 1192001071n
processMeasure(calculationPrimeNumberTono3, 1420866460289063503n)
```
※同様に11の倍数も、11〜339を1ブロックとしてパターン化しているのが分かる。1ブロック112個中16個が11の倍数なので、10％程度改善する可能性に着目。（16秒→14秒）  

![digtono 2024-01-12 at 17 32 57](https://github.com/mtonosaki/primeNumberSpeedTry/assets/34669114/f9afc305-56af-4994-a863-8416a413cce7)

# いずれにしても
このロジックを
世界中のクラウドサーバー 7千万台で1年間計算しても、｛10^570乗｝分の1しか進まない
→ 結論：解読不能。
10の570乗 年は ほぼ永遠。

ロジックを公開しても、運用でほぼ100%回避！というセキュリティが 美しい。隠すべきのもを 少なくする考え方が良い。（全部隠して、だから安全、という考え方は、あまり美しくない）






