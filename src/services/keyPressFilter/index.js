export class KeyPressFilter {
    constructor (
        validKeyCodes = [8, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 110, 190],
        combCodes1 = [17, 91, 93],
        combCodes2 = [67, 86, 88]
    ){
        this.prevKeyCode = 0;
        // '0'-'9', '.' , 'Backspace' & 'c', 'v', 'x'
        this.validKeyCodes = validKeyCodes;
        // combination key press
        // ''ctrl, 'window/command left', 'window/command right'
        this.combCodes1 = combCodes1;
        this.combCodes2 = combCodes2;
        // specially key
        this.specKeys = ['ctrl'];
    }

    do (event){
        let {keyCode} = event;
        let result = true;
        result = this.validKeyCodes.includes(keyCode);
        if (!result){
            result = this.combCodes1.includes(this.prevKeyCode) && this.combCodes2.includes(keyCode);
            if (!result){
                this.specKeys.length && this.specKeys.forEach(key => {
                    if (event[key] && this.combCodes2.includes(keyCode)){
                        result = true;
                    }
                })
            }
        }
        !result && event.preventDefault();
        if (this.combCodes1.includes(keyCode)){
            this.prevKeyCode = keyCode;
        }
    }
}