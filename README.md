# OpenWebProject Workers

**Multithreaded worker pool**

## Installation
`npm install owp.workers --save`

## Usage
```javascript
import Workers from "owp.workers";

//Create new workers instance. Ie a new worker pool.

//Pool size defaults to number of logical cores.
const workers = new Workers();

//OR manually specify pool size.
const workers = new Workers(4);
```

### Add new work

**Format**
```
workers.add(file:string||constructor, message:any, transfer:array) => Promise
```

**Example echo**
* Runs worker in file `"workerEcho.js"`.
    - File parameter can be the workers file name or the constructor for the worker. 
    - Import constructor and then pass is used with webpack.
* Passes message `"Hello World"` to worker.
    - Message could be any data you want to pass not just a string.
    - Message is optional.
```javascript
workers.add("workerEcho.js", "Hello World")
    .then(console.log) => "Hello world"
```

**Example sum**    
* The buffer in TypedArrays like Int32Array cant be transfered to the worker thread using pass by reference instead of value, but the reference is remove from the original/calling thread.

```javascript
const list = new Int32Array(3);
list[0] = 25;
list[1] = 666;
list[2] = 19;

workers.add("workerSum.js", list, [list.buffer])
    .then(console.log) => 710
```

### Worker js format

* `onmessage(event)` callback is triggered when worker starts. This contains an `event.data` field to get message.    
* Worker calls `postMessage(data)` to give result and terminate worker.

**workerEcho.js**
```javascript
onmessage = (e) => {
    postMessage(e.data);
};
```

**workerSum.js**
```javascript
onmessage = (e) => {
    const list = e.data;
    let sum = 0;
    for (let i = 0; i < list.length; ++i) {
        sum += list[i];
    }
    postMessage(sum);
};
```