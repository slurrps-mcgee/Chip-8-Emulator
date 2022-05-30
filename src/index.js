import { Chip8 } from './Chip8';
import { CLOCKS_PER_TIME_UNIT, TIMER_60_HZ } from './Constants/RegistersConstants';
import { Memory } from './Memory';

let loopId;
let soundCard;

async function runChip8() {
    //Change to FILE SELECT!!!
    const rom = await fetch('./roms/test_opcode.ch8');

    //Load the Rom
    const arrayBuffer = await rom.arrayBuffer();
    const romBuffer = new Uint8Array(arrayBuffer);
    const chip8 = new Chip8(romBuffer);


    while(1) {
        await chip8.sleep();

        
        for(let i = 0; i < 10; i++) {
            chip8.cycle();
            
        }

    }
    
}

runChip8();