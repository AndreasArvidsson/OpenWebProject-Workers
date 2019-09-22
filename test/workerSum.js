this.onmessage = (e) => {
    const list = e.data;
    let sum = 0;
    for (let i = 0; i < list.length; ++i) {
        sum += list[i];
    }
    postMessage(sum);
};