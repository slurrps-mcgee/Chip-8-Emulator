import { LOAD_PROGRAM_ADDRESS } from "./Constants/MemoryConstants";
import { NUMBER_OF_REGISTERS, STACK_DEEP } from "./Constants/RegistersConstants";

export class Registers {
    //Constructor
    constructor() {
        this.V = new Uint8Array(NUMBER_OF_REGISTERS); //Vx 8bit registers Array
        this.I = 0; //I 16bit register
        this.DT = 0; //Delay Timer
        this.ST = 0; //Sound Timer
        this.PC = LOAD_PROGRAM_ADDRESS; //16bit Program Counter
        this.SP = -1; //Stack Pointer
        this.stack = new Uint16Array(STACK_DEEP); //16bit Array to store address values

        //Reset the Registers
        this.reset();
    }
    
    //Reset Registers
    reset() {
        this.V.fill(0); //Fill the Array with 0's
        this.I = 0; //Set to 0
        this.DT = 0; //Set to 0
        this.ST = 0; //Set to 0
        this.PC = LOAD_PROGRAM_ADDRESS; //Reset to Address Location to start
        this.SP = -1; //Set to -1
        this.stack.fill(0); //Fill the Array with 0's
    }

    //Push new value to stack
    stackPush(value) {
        //Increase the Stack Position
        this.SP++;
        //Assert the Stack is not Overflowing
        this.assertStackOverflow();
        //Push a value to the stack at index Stack Position
        this.stack[this.SP] = value
    }

    //Pop a new value from the stack
    stackPop() {
        //Set value to Stack index of Stack Position
        const value = this.stack[this.SP];
        //Decrease Stack Position
        this.SP--;
        //Assert the Stack is not Underflow
        this.assertStackUnderflow();
        //Return the value
        return value;
    }

    //Assert the Stack is not Overflowing
    assertStackOverflow() {
        //Assert the Stack is less than the Stack Depth
        console.assert(this.SP < STACK_DEEP, 'Error stack Overflow')
    }

    //Verify the Stack is not Underflowed
    assertStackUnderflow() {
        //Assert the Stack Position is greater than or equal to -1
        console.assert(this.SP >= -1, 'Error stack underflow')
    }

    
}