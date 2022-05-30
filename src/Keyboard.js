import { KEYMAP, NUMBER_OF_KEYS } from "./Constants/KeyboardConstants";

export class Keyboard {
    //Constructor
    constructor() {
        //Set Keys array[number of keys] and fill it with false values
        this.keys = new Array(NUMBER_OF_KEYS).fill(false);

        //Add event listeners for keyup and keydown
        document.addEventListener('keydown', (event) => this.keydown(event.key));
        document.addEventListener('keyup', (event) => this.keyup(event.key));
    }

    //Capture Keydown
    keydown(key) {
        //Set keyIndex to a found index from KEYMAP
        const keyIndex = KEYMAP.findIndex((mapKey) => mapKey === key.toLowerCase());

        //Check that index is greater than -1
        if(keyIndex > -1) {
            //Set keys[index] to true
            this.keys[keyIndex] = true;
        }
    }

    //Capture keyup
    keyup(key) {
        //Set keyIndex to a found index from KEYMAP
        const keyIndex = KEYMAP.findIndex((mapKey) => mapKey === key.toLowerCase());

        //Check that index is greater than -1
        if(keyIndex > -1) {
            //Set keys[index] to false
            this.keys[keyIndex] = false;
        }
    }

    //Check if key is pressed
    isKeyDown(keyIndex) {
        //Return keys[index] value
        return this.keys[keyIndex];
    }

    //Check if any key is down
    hasKeyDown(){
        //Return key
        return this.keys.findIndex((key) => key) != -1;
    }
}