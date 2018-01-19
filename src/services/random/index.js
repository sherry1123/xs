export const randomBoolean = () => {
    let arr = [true, false];
    return arr[Math.floor(Math.random() * arr.length)];
};