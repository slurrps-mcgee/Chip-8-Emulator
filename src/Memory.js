import{MEMORY_SIZE} from './Constants/MemoryConstants'

export class Memory
{
    //Constructor
    constructor()
    {
        //Set Memory to new Uint8Array with the MemorySize
        this.memory = new Uint8Array(MEMORY_SIZE);

        //Reset Memory
        this.reset();
    }

    //Reset Memory filling with 0
    reset()
    {
        //Fill Array with 0
        this.memory.fill(0);
    }

    //Set memory locations value
    setMemory(index, value)
    {
        //Check Memory is inside bounds
        this.assertMemory(index);
        //Set memory[index]
        this.memory[index] = value;
    }

    //Get memory from location
    getMemory(index)
    {
        //Check Memory is inside bounds
        this.assertMemory(index);
        //Return memory[index]
        return this.memory[index];
    }

    getOpcode(index) {
        //Get the high and low byte of the index, index + 1
        const highByte = this.getMemory(index);
        const lowByte = this.getMemory(index + 1);

        //Return
        return (highByte << 8) | lowByte; //Return highByte shift 8 bits BitOR operation lowByte
    }

    /*Verifies memory is not out of range of the index*/
    assertMemory(index)
    {
        //Assert a given index is greater than 0 and less than the memory size
        console.assert(index >= 0 && index < MEMORY_SIZE, `Error trying to access memory at index ${index}`);
    }
}