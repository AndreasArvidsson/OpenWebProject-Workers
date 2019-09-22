import Workers from "../index.js";

const workers = new Workers();

console.log("test.js")

workers.add("test/workerEcho.js", "Hello World")
    .then(console.log)
    .catch(console.error);

const list = new Int32Array(3);
list[0] = 25;
list[1] = 666;
list[2] = 19;

// console.log(Workers.getDefaultMaxThreads(), workers.getMaxThreads())

workers.add("test/workerSum.js", list, [list.buffer])
    .then(console.log)
    .catch(console.error);