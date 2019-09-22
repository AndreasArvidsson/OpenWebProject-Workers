/**
* @author Andreas Arvidsson
* https://github.com/AndreasArvidsson/OpenWebProject-workers
*/

if (typeof Worker === "undefined") {
    throw new Error("Workers: Browser support for HTML5 web worker is missing.");
}

class Workers {

    static getDefaultMaxThreads() {
        //Use number of logical cores for the system.
        if (navigator.hardwareConcurrency) {
            return navigator.hardwareConcurrency;
        }
        //Default to 4.
        return 4;
    }

    constructor(maxThreads) {
        //Max threads is not given. 
        if (!maxThreads) {
            this._maxThreads = Workers.getDefaultMaxThreads();
        }
        else {
            this._maxThreads = maxThreads;
        }
        //Queue of new works to be done.
        this._waiting = [];
        //List of current worker threads.
        this._numRunning = 0;
    }

    getMaxThreads() {
        return this._maxThreads;
    }

    hasWorkWaiting() {
        return this._waiting.length > 0;
    }

    hasFreeThread() {
        return this._numRunning < this._maxThreads;
    }

    add(file, message, transfer) {
        return new Promise((resolve, reject) => {
            const options = { file, message, transfer, resolve, reject };
            //We have free threads. Process work directly.
            if (this.hasFreeThread()) {
                runWork(this, options);
            }
            //All threads are busy. Add work to queue.
            else {
                this._waiting.push(options);
            }
        });
    }

}
export default Workers;

/* ------------------- PRIVATE SUPPORT FUNCTIONS ------------------- */

//Process work in a nerw worker/thread.
const runWork = (instance, options) => {
    //Increment number of runners.
    instance._numRunning++;

    //Create a new dedicated worker.
    const worker = new Worker(options.file);

    //Define callback to receive result.
    worker.onmessage = (e) => {
        //Terminate worker.
        worker.terminate();

        //Decrement number of runners.
        instance._numRunning--;

        //Check the queue if there are more work to be processed.
        if (instance.hasWorkWaiting() && instance.hasFreeThread()) {
            //Remove first option in list and run it.
            runWork(instance, instance._waiting.shift());
        }

        //Resolve promise
        options.resolve(e.data);
    };

    //Reject promise on message error.
    worker.onmessageerror = options.reject;

    //Post data and start worker
    worker.postMessage(options.message, options.transfer);
}