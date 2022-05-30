import { CHAR_SET } from './Constants/CharSetConstants';
import { SPRITE_HIGHT } from './Constants/DisplayConstants';
import { CHAR_SET_ADDRESS, LOAD_PROGRAM_ADDRESS, MEMORY_SIZE } from './Constants/MemoryConstants';
import { TIMER_60_HZ } from './Constants/RegistersConstants';
import { Display } from './Display';
import { Dissassembler } from './Dissassembler';
import { Keyboard } from './Keyboard';
import { Memory } from './Memory';
import { Registers } from './Registers';
import { soundCard } from './SoundCard';

export class Chip8 {
    //Constructor
    constructor(romBuffer) {
        //Attatch Memory
        this.memory = new Memory();
        this.registers = new Registers();

        //Load
        this.loadCharSet(); //Load Char Set into memory
        this.loadRom(romBuffer);

        //Attatch 
        this.keyboard = new Keyboard();
        this.soundCard = new soundCard();
        this.dissassembler = new Dissassembler();
        this.display = new Display(this.memory); //Give Display access to memory
    }

    //Sleep Function
    sleep(ms = TIMER_60_HZ) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    //Load CharSet into memory
    loadCharSet() {
        this.memory.memory.set(CHAR_SET, CHAR_SET_ADDRESS); //Set memory.memory to charset, starting at charset address
    }
    //Loads the Rom into memory
    loadRom(romBuffer) {
        console.assert(romBuffer.length + LOAD_PROGRAM_ADDRESS <= MEMORY_SIZE, 'This rom is too large.');
        this.memory.memory.set(romBuffer, LOAD_PROGRAM_ADDRESS);
        this.registers.PC = LOAD_PROGRAM_ADDRESS; //Set counter to Program Loader Address
    }

    async updateTimers() {
        if (this.registers.DT > 0) {
            await sleep();
            this.registers.DT--;
        }
        //Loop through the SoundTimer
        //Sound On
        if (this.registers.ST > 0) {
            this.soundCard.enableSound();
            await sleep();
            this.registers.ST--;
        }
        //Sound Off
        if (this.registers.ST === 0) {
            this.soundCard.disableSound();
        }
    }

    cycle() {
        let opcode = this.memory.getOpcode(this.registers.PC);
        this.execute(opcode);

        this.display.drawBuffer();

        this.updateTimers();
    }

    //Executes instructions
    //This is where the instructions actually execute
    async execute(opcode) {

        const { instruction, args } = this.dissassembler.dissassemble(opcode);
        const { id } = instruction;

        this.registers.PC += 2;


        //TEST
        console.log('i', instruction);
        console.log('a', args);
        console.log('id', id);

        switch (id) {
            //Clears the Display
            case 'CLS':
                this.display.reset(); //Call display reset function
                break;

            //Sets Program Counter to address at top of the stack and removes 1 from the stack pointer
            case 'RET':
                this.registers.PC = this.registers.stackPop(); //Set PC to return from stackPop function
                break;

            //Sets Program Counter to NNN
            case 'JP_ADDRESS':
                this.registers.PC = args[0]; //Set PC to first value of array args
                break;

            //Increments Stack Pointer then puts PC on top of the stack then set PC to NNN
            case 'CALL_ADDRESS':
                this.registers.stackPush(this.registers.PC); //Push PC to top of the stack
                this.registers.PC = args[0] //Set PC to the first value of the array args
                break;

            //Compare register Vx to kk and if equal increment PC by 2
            case 'SE_VX_KK':
                //Check if registers v[args[0]] equals args[1]
                if (this.registers.V[args[0]] === args[1]) {
                    this.registers.PC += 2; //Increment PC by 2
                }
                break;

            //Compare register Vx to kk and if not equal increment PC by 2
            case 'SNE_VX_KK':
                //Check if registers v[args[0]] does not equal args[1]
                if (this.registers.V[args[0]] !== args[1]) {
                    this.registers.PC += 2; //Increment PC by 2
                }
                break;

            //Compare register Vx to Vy and if equal increment PC by 2
            case 'SE_VX_VY':
                //Check if registers v[args[0]] equals v[args[1]]
                if (this.registers.V[args[0]] === this.registers.V[args[1]]) {
                    this.registers.PC += 2; //Increment PC by 2
                }
                break;

            //Set Vx to kk
            case 'LD_VX_KK':
                this.registers.V[args[0]] = args[1]; //Set V[args[0]] to args[1]
                break;

            //Add kk to Vx and store inside Vx
            case 'ADD_VX_KK':
                this.registers.V[args[0]] += args[1]; //Add kk to Vx
                break;

            //Store Vy into Vx
            case 'LD_Vx_Vy':
                this.registers.V[args[0]] = this.registers.V[args[1]]; //Set Vy to Vx
                break;

            //Set Vx = Vx OR Vy
            case 'OR_VX_VY':
                //Compares each bit using OR Operation and stores the result
                //EX: 1:0 = 1, 0:0 = 0
                this.registers.V[args[0]] |= this.registers.V[args[1]];
                break;

            //Set Vx = Vx and Vy
            case 'AND_VX_VY':
                //Compares each bit using And operation and stores the result
                //EX: 1:1 = 1, 1:0 = 0
                this.registers.V[args[0]] &= this.registers.V[args[1]];
                break;

            //Set Vx = Vx XOR Vy
            case 'XOR_VX_VY':
                ///Compares each bit using XOR operation and stores the result
                //EX 1:1 = 0, 0:1 = 1
                this.registers.V[args[0]] ^= this.registers.V[args[1]];
                break;

            //Add Vx and Vy and store the excess in VF by setting it to 1 if no excess set to 0
            case 'ADD_VX_VY':
                //Set VF to 1 or 0 if V[args[0]] + V[args[1]] > 255
                this.registers.V[0x0f] = (this.registers.V[args[0]] + this.registers.V[args[1]] > 0xff);

                //Add V[args[1]] to V[args[0]]
                this.registers.V[args[0]] += this.registers.V[args[1]];
                break;

            //If Vx > Vy set VF to 1 otherwise 0, Subtract Vy from Vx and set to Vx
            case 'SUB_VX_VY':
                //Set VF = 1 if Vx > Vy otherwise set to 0
                this.registers.V[0x0f] = (this.registers.V[args[0]] > this.registers.V[args[1]]);

                //Subtract Vy from Vx and set to Vx
                this.registers.V[args[0]] -= this.registers.V[args[1]];
                break;

            //If least-significant bit of Vx is 1 set VF to 1 otherwise 0. Divide Vx by 2
            case 'SHR_VX_VY':
                //Check the last bit in V[args[0]] set bool return to VF
                this.registers.V[0x0f] = this.registers.V[args[0]] & 0x01; //0b00000001

                //Shift the Vx bit value right one spot
                this.registers.V[args[0]] >>= 1;
                break;

            //If Vy > Vx set VF to 1 otherwise 0, Subtract Vy from Vx and set to Vx
            case 'SUBN_VX_VY':
                //Set VF = 1 if Vy > Vx otherwise set to 0
                this.registers.V[0x0f] = (this.registers.V[args[1]] > this.registers.V[args[0]]);

                //Subtract Vx from Vy and set to Vx
                this.registers.V[args[0]] = this.registers.V[args[1]] - this.registers.V[args[0]];
                break;

            //If Most-significant bit of Vx is 1 set VF to 1 otherwise 0. Vx is multiplied by 2
            case 'SHL_VX_VY':
                //Check the first bit in V[args[0]] set bool return to VF
                this.registers.V[0x0f] = this.registers.V[args[0]] & 0x80; //0b10000000

                //Shift the Vx bit value left one spot
                this.registers.V[args[0]] <<= 1;
                break;

            //Skip next instruction if Vx != Vy
            case 'SNE_VX_VY':
                //Check if Vx == Vy
                if (this.registers.V[args[0]] !== this.registers.V[args[1]]) {
                    this.registers.PC += 2; //Increase PC by 2
                }
                break;

            //Set I = nnn
            case 'LD_I_ADDR':
                //Set I = args[0]
                this.registers.I = args[0];
                break;

            //Jump to location nnn + V0
            case 'JP_V0_ADDR':
                //Set PC to V[0] + args[0]
                this.registers.PC = this.registers.V[0] + args[0];
                break;

            //Set Vx = random byte and kk
            case 'RND_VX_KK':
                //Create random byte
                const random = Math.floor(Math.random() * 0xff);

                //Set Vx = bitwise And operation of random & args[1]
                this.registers.V[args[0]] = random & args[1];
                break;

            //Display n-byte sprite starting at memory location I at Vx, Vy set VF = 1 if collision occurs
            case 'DRW_VX_VY_N':
                //Set Colision to return of drawSprite
                const colision = this.display.drawSprite(
                    this.registers.V[args[0]], //Height
                    this.registers.V[args[1]], //Width
                    this.registers.I, //Sprite Address
                    args[2] //number of pixels to draw
                );

                //Set VF to colision
                this.registers.V[0x0f] = colision;
                break;

            //Skip next instruction if key with value of Vx is pressed
            case 'SKP_VX':
                //Check the V[args[0]] if it is a key that is pressed down
                if (this.keyboard.isKeyDown(this.registers.V[args[0]])) {
                    this.registers.PC += 2; //Incrememnt the PC by 2
                }
                break;

            //Skip next instruction if the value of Vx is a key currently in the up position
            case 'SKNP_VX':
                //Check the V[args[0]] if it is a key that is not down
                if (!this.keyboard.isKeyDown(this.registers.V[args[0]])) {
                    this.registers.PC += 2; //Increment PC by 2
                }
                break;

            //Set the value of Vx to DelayTimer
            case 'LD_VX_DT':
                //Set Vx to DelayTimer
                this.registers.V[args[0]] = this.registers.DT;
                break;

            //Store keypress into Vx
            case 'LD_VX_K':
                //Set bool for keyPressed to -1
                let keyPressed = -1

                //Loop while keyPressed is -1
                while (keyPressed === -1) {
                    //Set to return of hasKeyDown
                    keyPressed = this.keyboard.hasKeyDown();
                    //Call Sleep
                    await this.sleep();
                }

                //Set key to V[args[0]]
                this.registers.V[args[0]] = keyPressed;
                break;

            //Set DT to Vx value
            case 'LD_DT_VX':
                //Set Delay Timer to Vx
                this.registers.DT = this.registers.V[args[0]];
                break;

            //Set SoundTimer to Vx
            case 'LD_ST_VX':
                //Set ST to Vx
                this.registers.ST = this.registers.V[args[0]];
                break;

            //Set I to Vx + I
            case 'ADD_I_VX':
                //Add Vx to I
                this.registers.I += this.registers.V[args[0]];
                break;

            //Set I to location of sprite for Vx
            case 'LD_F_VX':
                //Set I to Vx * Sprite Height
                this.registers.I = this.registers.V[args[0]] * SPRITE_HIGHT;
                break;

            //Grab Vx value and save hundreds, tens, and ones in I, I+1, I+2 respectively
            case 'LD_B_VX':
                //Grab Vx
                let x = this.registers.V[args[0]];
                //Get Hundreds Value
                const hundreds = Math.floor(x / 100);
                x = x - hundreds * 100;
                //Get Tens Value
                const tens = Math.floor(x / 10);
                //Get Ones Value
                const ones = x - tens * 10;

                //Set I locations
                this.memory.memory[this.registers.I] = hundreds;
                this.memory.memory[this.registers.I + 1] = tens;
                this.memory.memory[this.registers.I + 2] = ones;
                break;

            //Store Registers V0 through Vx in memory starting at I
            case 'LD_I_VX':
                for (let i = 0; i <= args[0]; i++) {
                    this.memory.memory[this.registers.I + i] = this.registers.V[i];
                }
                break;

            //Read Registers V0 through Vx from memory starting at I
            case 'LD_VX_I':
                for (let i = 0; i <= args[0]; i++) {
                    this.registers.V[i] = this.memory.memory[this.registers.I + i];
                }
                break;

            //Error Not Found
            default:
                console.error(`Instruction with id ${id} not found`, instruction, args);
        }
    }
}