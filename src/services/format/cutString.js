export const cutString = (raw, retain = 40) => {
    let placeholder = '...';
    if (raw.length < (retain + placeholder.length)){
        return raw;
    } else {
        return raw.substring(0, retain) + placeholder;
    }
};