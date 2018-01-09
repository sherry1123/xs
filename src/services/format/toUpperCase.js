export const allUpperCase = str => str.toUpperCase();
export const someUpperCase = (str, target) => {
    if (!target){
        target = [0];
    }
    if (!Array.isArray(target)){
        target = [target];
    }
    str = str.split('');
    for (let i of target){
        if (str[i]){
            str[i] = str[i].toUpperCase();
        }
    }
    return str.join('');
};