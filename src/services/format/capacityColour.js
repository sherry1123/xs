export const getCapacityColour =  (usage = 0) => {
    let rate = parseInt(usage.replace('%'), 10);
    if (rate >= 75){
        return '#f6787a';
    } else if (rate >= 50){
        return '#f79c70';
    } else if (rate >= 25){
        return '#fbda2b';
    } else {
        return '#40cd00';
    }
};