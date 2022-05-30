/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Chip8": () => (/* binding */ Chip8)
/* harmony export */ });
/* harmony import */ var _Constants_CharSetConstants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony import */ var _Constants_DisplayConstants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var _Constants_MemoryConstants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4);
/* harmony import */ var _Constants_RegistersConstants__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5);
/* harmony import */ var _Display__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(6);
/* harmony import */ var _Dissassembler__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(7);
/* harmony import */ var _Keyboard__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(9);
/* harmony import */ var _Memory__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(11);
/* harmony import */ var _Registers__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(12);
/* harmony import */ var _SoundCard__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(13);











class Chip8 {
    //Constructor
    constructor(romBuffer) {
        //Attatch Memory
        this.memory = new _Memory__WEBPACK_IMPORTED_MODULE_7__.Memory();
        this.registers = new _Registers__WEBPACK_IMPORTED_MODULE_8__.Registers();

        //Load
        this.loadCharSet(); //Load Char Set into memory
        this.loadRom(romBuffer);

        //Attatch 
        this.keyboard = new _Keyboard__WEBPACK_IMPORTED_MODULE_6__.Keyboard();
        this.soundCard = new _SoundCard__WEBPACK_IMPORTED_MODULE_9__.soundCard();
        this.dissassembler = new _Dissassembler__WEBPACK_IMPORTED_MODULE_5__.Dissassembler();
        this.display = new _Display__WEBPACK_IMPORTED_MODULE_4__.Display(this.memory); //Give Display access to memory
    }

    //Sleep Function
    sleep(ms = _Constants_RegistersConstants__WEBPACK_IMPORTED_MODULE_3__.TIMER_60_HZ) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    //Load CharSet into memory
    loadCharSet() {
        this.memory.memory.set(_Constants_CharSetConstants__WEBPACK_IMPORTED_MODULE_0__.CHAR_SET, _Constants_MemoryConstants__WEBPACK_IMPORTED_MODULE_2__.CHAR_SET_ADDRESS); //Set memory.memory to charset, starting at charset address
    }
    //Loads the Rom into memory
    loadRom(romBuffer) {
        console.assert(romBuffer.length + _Constants_MemoryConstants__WEBPACK_IMPORTED_MODULE_2__.LOAD_PROGRAM_ADDRESS <= _Constants_MemoryConstants__WEBPACK_IMPORTED_MODULE_2__.MEMORY_SIZE, 'This rom is too large.');
        this.memory.memory.set(romBuffer, _Constants_MemoryConstants__WEBPACK_IMPORTED_MODULE_2__.LOAD_PROGRAM_ADDRESS);
        this.registers.PC = _Constants_MemoryConstants__WEBPACK_IMPORTED_MODULE_2__.LOAD_PROGRAM_ADDRESS; //Set counter to Program Loader Address
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
                this.registers.I = this.registers.V[args[0]] * _Constants_DisplayConstants__WEBPACK_IMPORTED_MODULE_1__.SPRITE_HIGHT;
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

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CHAR_SET": () => (/* binding */ CHAR_SET),
/* harmony export */   "CHAR_SET_WIDTH": () => (/* binding */ CHAR_SET_WIDTH)
/* harmony export */ });
const CHAR_SET_WIDTH = 8; //Max Width of the sprites

//Char Sets Array each 5 deep
const CHAR_SET = [
//0
0xF0,
0x90,
0x90,
0x90,
0xF0,
//1
0x20,
0x60,
0x20,
0x20,
0x70,
//2
0xF0,
0x10,
0xF0,
0x80,
0xF0,
//3
0xF0,
0x10,
0xF0,
0x10,
0xF0,
//4
0x90,
0x90,
0xF0,
0x10,
0x10,
//5
0xF0,
0x80,
0xF0,
0x10,
0xF0,
//6
0xF0,
0x80,
0xF0,
0x90,
0xF0,
///7
0xF0,
0x10,
0x20,
0x40,
0x40,
//8
0xF0,
0x90,
0xF0,
0x90,
0xF0,
//9
0xF0,
0x90,
0xF0,
0x10,
0xF0,
//A
0xF0,
0x90,
0xF0,
0x90,
0x90,
//B
0xE0,
0x90,
0xE0,
0x90,
0xE0,
//C
0xF0,
0x80,
0x80,
0x80,
0xF0,
//D
0xE0,
0x90,
0x90,
0x90,
0xE0,
//E
0xF0,
0x80,
0xF0,
0x80,
0xF0,
//F
0xF0,
0x80,
0xF0,
0x80,
0x80,
]

/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BG_COLOR": () => (/* binding */ BG_COLOR),
/* harmony export */   "COLOR": () => (/* binding */ COLOR),
/* harmony export */   "DISPLAY_HEIGHT": () => (/* binding */ DISPLAY_HEIGHT),
/* harmony export */   "DISPLAY_MULTIPLY": () => (/* binding */ DISPLAY_MULTIPLY),
/* harmony export */   "DISPLAY_WIDTH": () => (/* binding */ DISPLAY_WIDTH),
/* harmony export */   "SPRITE_HIGHT": () => (/* binding */ SPRITE_HIGHT)
/* harmony export */ });
const DISPLAY_WIDTH = 64; //Width
const DISPLAY_HEIGHT = 32; //Height
const DISPLAY_MULTIPLY = 10; //Screen Size Multiplier
const SPRITE_HIGHT = 5;
const BG_COLOR = "#000"; //Background
const COLOR = "#3f6"; //Foreground

/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CHAR_SET_ADDRESS": () => (/* binding */ CHAR_SET_ADDRESS),
/* harmony export */   "LOAD_PROGRAM_ADDRESS": () => (/* binding */ LOAD_PROGRAM_ADDRESS),
/* harmony export */   "MEMORY_SIZE": () => (/* binding */ MEMORY_SIZE)
/* harmony export */ });
const MEMORY_SIZE = 4095; //Max Memory Size
const LOAD_PROGRAM_ADDRESS = 0x200; //Program Address Start Location
const CHAR_SET_ADDRESS = 0x000; //Sprite Load Location

/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CLOCKS_PER_TIME_UNIT": () => (/* binding */ CLOCKS_PER_TIME_UNIT),
/* harmony export */   "NUMBER_OF_REGISTERS": () => (/* binding */ NUMBER_OF_REGISTERS),
/* harmony export */   "STACK_DEEP": () => (/* binding */ STACK_DEEP),
/* harmony export */   "TIMER_60_HZ": () => (/* binding */ TIMER_60_HZ)
/* harmony export */ });
const NUMBER_OF_REGISTERS = 16; //Number of different registers 8 bytes each
const STACK_DEEP = 16; //Stack Depth

const TIMER_60_HZ = 1000/60; //Timer 60 seconds
const CLOCKS_PER_TIME_UNIT = 9;

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Display": () => (/* binding */ Display)
/* harmony export */ });
/* harmony import */ var _Constants_CharSetConstants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony import */ var _Constants_DisplayConstants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);



class Display {
    //Constructor
    constructor(memory) {
        //Set memory to incomming memory
        this.memory = memory;
        //Set screen to the canvas on the html file
        this.screen = document.querySelector('canvas'); /*Grabs the screen from html*/

        /*Screen Height and Width*/
        this.screen.width = _Constants_DisplayConstants__WEBPACK_IMPORTED_MODULE_1__.DISPLAY_WIDTH * _Constants_DisplayConstants__WEBPACK_IMPORTED_MODULE_1__.DISPLAY_MULTIPLY;
        this.screen.height = _Constants_DisplayConstants__WEBPACK_IMPORTED_MODULE_1__.DISPLAY_HEIGHT * _Constants_DisplayConstants__WEBPACK_IMPORTED_MODULE_1__.DISPLAY_MULTIPLY;

        //Set Context to 2D from screen
        this.context = this.screen.getContext('2d'); /*Grabs screen context*/

        //Set Screen background color
        this.context.fillStyle = _Constants_DisplayConstants__WEBPACK_IMPORTED_MODULE_1__.BG_COLOR; /*Screen Background Color*/

        //Create a empty frame buffer
        this.frameBuffer = []; /*Create a frame buffer*/

        //Reset the Display
        this.reset(); /*Reset the display*/

        //this.draw();
    }

    //Reset Screen
    reset() {
        /*Loop through display height*/
        for (let i = 0; i < _Constants_DisplayConstants__WEBPACK_IMPORTED_MODULE_1__.DISPLAY_HEIGHT; i++) {
            //Create Push event
            this.frameBuffer.push([]);

            /*Loop through display width*/
            for (let j = 0; j < _Constants_DisplayConstants__WEBPACK_IMPORTED_MODULE_1__.DISPLAY_WIDTH; j++) {
                //Push all 0's to framebuffer
                this.frameBuffer[i].push(0);
            }
        }
        //Fill Background Rect of the screen
        this.context.fillRect(0, 0, this.screen.width, this.screen.height);
        //Draw the screen Buffer
        this.drawBuffer();
    }

    //Draw Screen Buffer
    drawBuffer() {

        //Loop through display height
        for (let h = 0; h < _Constants_DisplayConstants__WEBPACK_IMPORTED_MODULE_1__.DISPLAY_HEIGHT; h++) {
            //Loop through display width
            for (let w = 0; w < _Constants_DisplayConstants__WEBPACK_IMPORTED_MODULE_1__.DISPLAY_WIDTH; w++) {
                //draw pixel onto screen using h,w, and the value from the framebuffer location
                this.drawPixel(h, w, this.frameBuffer[h][w]);
            }
        }

    }

    //Draws Pixels to the screen
    drawPixel(h, w, value) {
        //Check if value is 1 or 0
        if (value) {
            //Pixel On
            this.context.fillStyle = _Constants_DisplayConstants__WEBPACK_IMPORTED_MODULE_1__.COLOR;
        }
        else {
            //Pixel Off
            this.context.fillStyle = _Constants_DisplayConstants__WEBPACK_IMPORTED_MODULE_1__.BG_COLOR;
        }

        //Fill Rectangle Screen
        this.context.fillRect(
            w * _Constants_DisplayConstants__WEBPACK_IMPORTED_MODULE_1__.DISPLAY_MULTIPLY,
            h * _Constants_DisplayConstants__WEBPACK_IMPORTED_MODULE_1__.DISPLAY_MULTIPLY,
            _Constants_DisplayConstants__WEBPACK_IMPORTED_MODULE_1__.DISPLAY_MULTIPLY,
            _Constants_DisplayConstants__WEBPACK_IMPORTED_MODULE_1__.DISPLAY_MULTIPLY);
    }

    //Draws Sprites to the screen
    drawSprite(h, w, spriteAddress, lineCount) {
        let pixelColision = 0;

        //Loop through sprites line height
        for (let lh = 0; lh < lineCount; lh++) {

            const line = this.memory.memory[spriteAddress + lh]; //Read Line

            //Loop through sprite line width
            for (let lw = 0; lw < _Constants_CharSetConstants__WEBPACK_IMPORTED_MODULE_0__.CHAR_SET_WIDTH; lw++) {


                const bitToCheck = (0b10000000 >> lw); //Shift to the right
                const value = line & bitToCheck; //Set value to line & bitToCheck Value
                if (value === 0) {
                    continue;
                }

                const ph = (h + lh) % _Constants_DisplayConstants__WEBPACK_IMPORTED_MODULE_1__.DISPLAY_HEIGHT; //pixel height
                const pw = (w + lw) % _Constants_DisplayConstants__WEBPACK_IMPORTED_MODULE_1__.DISPLAY_WIDTH; //pixel width

                if (this.frameBuffer[ph][pw] === 1) {
                    pixelColision = 1;
                }
                this.frameBuffer[ph][pw] ^= 1; //XOR Pixel collision
            }
        }
        this.drawBuffer();
        return pixelColision; //Return pixelCollision
    }
}

/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Dissassembler": () => (/* binding */ Dissassembler)
/* harmony export */ });
/* harmony import */ var _Constants_InstructionSet__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8);


class Dissassembler {
    dissassemble(opcode) {
        //Get Instruction by making sure the opcode and mask match a pattern in the instruction set
        const instruction = _Constants_InstructionSet__WEBPACK_IMPORTED_MODULE_0__.INSTRUCTION_SET.find(instruction => (opcode & instruction.mask) === instruction.pattern); //Get the instruction

        const args = instruction.arguments.map(arg => (opcode & arg.mask) >> arg.shift); //Get the instruction arguments

        return {instruction, args}; //Return the instruction and its arguments
    }
}

/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "INSTRUCTION_SET": () => (/* binding */ INSTRUCTION_SET),
/* harmony export */   "MASK_HIGHEST_AND_LOWEST_BYTE": () => (/* binding */ MASK_HIGHEST_AND_LOWEST_BYTE),
/* harmony export */   "MASK_HIGHEST_BYTE": () => (/* binding */ MASK_HIGHEST_BYTE),
/* harmony export */   "MASK_KK": () => (/* binding */ MASK_KK),
/* harmony export */   "MASK_N": () => (/* binding */ MASK_N),
/* harmony export */   "MASK_NNN": () => (/* binding */ MASK_NNN),
/* harmony export */   "MASK_X": () => (/* binding */ MASK_X),
/* harmony export */   "MASK_Y": () => (/* binding */ MASK_Y)
/* harmony export */ });
//MASK Constants to validate arguments
const MASK_NNN = { mask: 0x0fff }; //ADDRESS
const MASK_N = { mask: 0x000f }; //Lowest Byte
const MASK_X = { mask: 0x0f00, shift: 8 }; //Vx 
const MASK_Y = { mask: 0x00f0, shift: 4 };
const MASK_KK = { mask: 0x00ff }; //byte
const MASK_HIGHEST_BYTE = 0xf000; //Highest Byte
const MASK_HIGHEST_AND_LOWEST_BYTE = 0xf00f; //Highest and Lowest Byte

const INSTRUCTION_SET = [
    //Clears Display
    {
        key: 2,
        id: 'CLS',
        name: 'CLS',
        mask: 0xffff, //All 1's used for XOR bit operations
        pattern: 0x00e0,
        arguments: [],
    },
    //Return from subroutine
    {
        key: 3,
        id: 'RET',
        name: 'RET',
        mask: 0xffff, //All 1's used for XOR bit operations
        pattern: 0x00ee,
        arguments: [],
    },
    //Jump to location nnn
    {
        key: 4,
        id: 'JP_ADDRESS',
        name: 'JP',
        mask: MASK_HIGHEST_BYTE, 
        pattern: 0x1000,
        arguments: [MASK_NNN]
    },
    //Call Subrouting at nnn
    {
        key: 5,
        id: 'CALL_ADDRESS',
        name: 'CALL',
        mask: MASK_HIGHEST_BYTE, 
        pattern: 0x2000,
        arguments: [MASK_NNN]
    },
    //Skip next instruction if Vx = kk
    {
        key: 6,
        id: 'SE_VX_KK',
        name: 'SE',
        mask: MASK_HIGHEST_BYTE, 
        pattern: 0x3000,
        arguments: [MASK_X, MASK_KK]
    },
    //Skip next instruction if Vx != kk
    {
        key: 7,
        id: 'SNE_VX_KK',
        name: 'SNE',
        mask: MASK_HIGHEST_BYTE, 
        pattern: 0x4000,
        arguments: [MASK_X, MASK_KK]
    },
    //Skip next instruction if Vx = Vy
    {
        key: 8,
        id: 'SE_VX_VY',
        name: 'SE',
        mask: MASK_HIGHEST_AND_LOWEST_BYTE, 
        pattern: 0x5000,
        arguments: [MASK_X, MASK_Y]
    },
    //Set Vx = kk
    {
        key: 9,
        id: 'LD_VX_KK',
        name: 'LD',
        mask: MASK_HIGHEST_BYTE, 
        pattern: 0x6000,
        arguments: [MASK_X, MASK_KK]
    },
    //Set Vx = Vx + kk
    {
        key: 10,
        id: 'ADD_VX_KK',
        name: 'ADD',
        mask: MASK_HIGHEST_BYTE, 
        pattern: 0x7000,
        arguments: [MASK_X, MASK_KK]
    },
    ///Stores the value of Vy to Vx
    {
        key: 11,
        id: 'LD_Vx_Vy',
        name: 'LD',
        mask: MASK_HIGHEST_AND_LOWEST_BYTE, 
        pattern: 0x8000,
        arguments: [MASK_X, MASK_Y]
    },
    //Set Vx = Vx or Vy
    {
        key: 12,
        id: 'OR_VX_VY',
        name: 'OR',
        mask: MASK_HIGHEST_AND_LOWEST_BYTE,
        pattern: 0x8001,
        arguments: [MASK_X, MASK_Y],
      },
      //Set Vx = Vx and Vy
      {
        key: 13,
        id: 'AND_VX_VY',
        name: 'AND',
        mask: MASK_HIGHEST_AND_LOWEST_BYTE,
        pattern: 0x8002,
        arguments: [MASK_X, MASK_Y],
      },
      //Set Vx = Vx XOR Vy
      {
        key: 14,
        id: 'XOR_VX_VY',
        name: 'XOR',
        mask: MASK_HIGHEST_AND_LOWEST_BYTE,
        pattern: 0x8003,
        arguments: [MASK_X, MASK_Y],
      },
      //Set Vx = Vx + Vy, Set VF = carry
      {
        key: 15,
        id: 'ADD_VX_VY',
        name: 'ADD',
        mask: MASK_HIGHEST_AND_LOWEST_BYTE,
        pattern: 0x8004,
        arguments: [MASK_X, MASK_Y],
      },
      //Set Vx = Vx - Vy, set VF = NOT borrow.
      {
        key: 16,
        id: 'SUB_VX_VY',
        name: 'SUB',
        mask: MASK_HIGHEST_AND_LOWEST_BYTE,
        pattern: 0x8005,
        arguments: [MASK_X, MASK_Y],
      },
      //set Vx = Vx SHR 1
      {
        key: 17,
        id: 'SHR_VX_VY',
        name: 'SHR',
        mask: MASK_HIGHEST_AND_LOWEST_BYTE,
        pattern: 0x8006,
        arguments: [MASK_X, MASK_Y],
      },
      //Set Vx = Vy - Vx, set VF = NOT borrow
      {
        key: 18,
        id: 'SUBN_VX_VY',
        name: 'SUBN',
        mask: MASK_HIGHEST_AND_LOWEST_BYTE,
        pattern: 0x8007,
        arguments: [MASK_X, MASK_Y],
      },
      //Set Vx = Vx SHL 1
      {
        key: 19,
        id: 'SHL_VX_VY',
        name: 'SHL',
        mask: MASK_HIGHEST_AND_LOWEST_BYTE,
        pattern: 0x800e,
        arguments: [MASK_X, MASK_Y],
      },
      //Skip next instruction if Vx != Vy
      {
        key: 20,
        id: 'SNE_VX_VY',
        name: 'SNE',
        mask: MASK_HIGHEST_AND_LOWEST_BYTE,
        pattern: 0x9000,
        arguments: [MASK_X, MASK_Y],
      },
      //Set I = nnn
      {
        key: 21,
        id: 'LD_I_ADDR',
        name: 'LD',
        mask: MASK_HIGHEST_BYTE,
        pattern: 0xa000,
        arguments: [MASK_NNN],
      },
      //Jump to location nnn + V0
      {
        key: 22,
        id: 'JP_V0_ADDR',
        name: 'JP',
        mask: MASK_HIGHEST_BYTE,
        pattern: 0xb000,
        arguments: [MASK_NNN],
      },
      //Set Vx = random byte and kk
      {
        key: 23,
        id: 'RND_VX_KK',
        name: 'RND',
        mask: MASK_HIGHEST_BYTE,
        pattern: 0xc000,
        arguments: [MASK_X, MASK_KK],
      },
      //Display n-byte sprite starting at memory location I at (Vx,Vy), Set VF = collision
      {
        key: 24,
        id: 'DRW_VX_VY_N',
        name: 'DRW',
        mask: MASK_HIGHEST_BYTE,
        pattern: 0xd000,
        arguments: [MASK_X, MASK_Y, MASK_N],
      },
      //Skip next instruction if key with value Vx is pressed
      {
        key: 25,
        id: 'SKP_VX',
        name: 'SKP',
        mask: 0xf0ff,
        pattern: 0xe09e,
        arguments: [MASK_X],
      },
      //Skip nex instruction if key with value Vx is not pressed
      {
        key: 26,
        id: 'SKNP_VX',
        name: 'SKNP',
        mask: 0xf0ff,
        pattern: 0xe0a1,
        arguments: [MASK_X],
      },
      //set Vx = delay timer value
      {
        key: 27,
        id: 'LD_VX_DT',
        name: 'LD',
        mask: 0xf0ff,
        pattern: 0xf007,
        arguments: [MASK_X],
      },
      //Wait for key press, store value of key in Vx
      {
        key: 28,
        id: 'LD_VX_K',
        name: 'LD',
        mask: 0xf0ff,
        pattern: 0xf00a,
        arguments: [MASK_X],
      },
      //Set delay timer = Vx
      {
        key: 29,
        id: 'LD_DT_VX',
        name: 'LD',
        mask: 0xf0ff,
        pattern: 0xf015,
        arguments: [MASK_X],
      },
      //Set sount timer = Vx
      {
        key: 30,
        id: 'LD_ST_VX',
        name: 'LD',
        mask: 0xf0ff,
        pattern: 0xf018,
        arguments: [MASK_X],
      },
      //Set I = I + Vx
      {
        key: 31,
        id: 'ADD_I_VX',
        name: 'ADD',
        mask: 0xf0ff,
        pattern: 0xf01e,
        arguments: [MASK_X],
      },
      //Set I = location of sprite for digit Vx
      {
        key: 32,
        id: 'LD_F_VX',
        name: 'LD',
        mask: 0xf0ff,
        pattern: 0xf029,
        arguments: [MASK_X],
      },
      //Store BCD Representation of Vx in memory locations I, I+1, and I+2
      {
        key: 33,
        id: 'LD_B_VX',
        name: 'LD',
        mask: 0xf0ff,
        pattern: 0xf033,
        arguments: [MASK_X],
      },
      //Store registers V0 through Vx in memory starting at location I
      {
        key: 34,
        id: 'LD_I_VX',
        name: 'LD',
        mask: 0xf0ff,
        pattern: 0xf055,
        arguments: [MASK_X],
      },
      //Read registers V0 through Vx from memory starting at location I
      {
        key: 35,
        id: 'LD_VX_I',
        name: 'LD',
        mask: 0xf0ff,
        pattern: 0xf065,
        arguments: [MASK_X],
      }
]

/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Keyboard": () => (/* binding */ Keyboard)
/* harmony export */ });
/* harmony import */ var _Constants_KeyboardConstants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(10);


class Keyboard {
    //Constructor
    constructor() {
        //Set Keys array[number of keys] and fill it with false values
        this.keys = new Array(_Constants_KeyboardConstants__WEBPACK_IMPORTED_MODULE_0__.NUMBER_OF_KEYS).fill(false);

        //Add event listeners for keyup and keydown
        document.addEventListener('keydown', (event) => this.keydown(event.key));
        document.addEventListener('keyup', (event) => this.keyup(event.key));
    }

    //Capture Keydown
    keydown(key) {
        //Set keyIndex to a found index from KEYMAP
        const keyIndex = _Constants_KeyboardConstants__WEBPACK_IMPORTED_MODULE_0__.KEYMAP.findIndex((mapKey) => mapKey === key.toLowerCase());

        //Check that index is greater than -1
        if(keyIndex > -1) {
            //Set keys[index] to true
            this.keys[keyIndex] = true;
        }
    }

    //Capture keyup
    keyup(key) {
        //Set keyIndex to a found index from KEYMAP
        const keyIndex = _Constants_KeyboardConstants__WEBPACK_IMPORTED_MODULE_0__.KEYMAP.findIndex((mapKey) => mapKey === key.toLowerCase());

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

/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "KEYMAP": () => (/* binding */ KEYMAP),
/* harmony export */   "NUMBER_OF_KEYS": () => (/* binding */ NUMBER_OF_KEYS)
/* harmony export */ });
const NUMBER_OF_KEYS = 16; //Number of keyboard keys to control

//Custom Mapped Keyboard
const KEYMAP = [
    "1", "2","3",
    "q", "w", "e",
    "a", "s", "d",
    "x", "z", "c",
    "4", "r", "f",
    "v"
]


/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Memory": () => (/* binding */ Memory)
/* harmony export */ });
/* harmony import */ var _Constants_MemoryConstants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);


class Memory
{
    //Constructor
    constructor()
    {
        //Set Memory to new Uint8Array with the MemorySize
        this.memory = new Uint8Array(_Constants_MemoryConstants__WEBPACK_IMPORTED_MODULE_0__.MEMORY_SIZE);

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
        console.assert(index >= 0 && index < _Constants_MemoryConstants__WEBPACK_IMPORTED_MODULE_0__.MEMORY_SIZE, `Error trying to access memory at index ${index}`);
    }
}

/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Registers": () => (/* binding */ Registers)
/* harmony export */ });
/* harmony import */ var _Constants_MemoryConstants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);
/* harmony import */ var _Constants_RegistersConstants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5);



class Registers {
    //Constructor
    constructor() {
        this.V = new Uint8Array(_Constants_RegistersConstants__WEBPACK_IMPORTED_MODULE_1__.NUMBER_OF_REGISTERS); //Vx 8bit registers Array
        this.I = 0; //I 16bit register
        this.DT = 0; //Delay Timer
        this.ST = 0; //Sound Timer
        this.PC = _Constants_MemoryConstants__WEBPACK_IMPORTED_MODULE_0__.LOAD_PROGRAM_ADDRESS; //16bit Program Counter
        this.SP = -1; //Stack Pointer
        this.stack = new Uint16Array(_Constants_RegistersConstants__WEBPACK_IMPORTED_MODULE_1__.STACK_DEEP); //16bit Array to store address values

        //Reset the Registers
        this.reset();
    }
    
    //Reset Registers
    reset() {
        this.V.fill(0); //Fill the Array with 0's
        this.I = 0; //Set to 0
        this.DT = 0; //Set to 0
        this.ST = 0; //Set to 0
        this.PC = _Constants_MemoryConstants__WEBPACK_IMPORTED_MODULE_0__.LOAD_PROGRAM_ADDRESS; //Reset to Address Location to start
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
        console.assert(this.SP < _Constants_RegistersConstants__WEBPACK_IMPORTED_MODULE_1__.STACK_DEEP, 'Error stack Overflow')
    }

    //Verify the Stack is not Underflowed
    assertStackUnderflow() {
        //Assert the Stack Position is greater than or equal to -1
        console.assert(this.SP >= -1, 'Error stack underflow')
    }

    
}

/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "soundCard": () => (/* binding */ soundCard)
/* harmony export */ });
/* harmony import */ var _Constants_SoundCardConstants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(14);


class soundCard {
    constructor() {
        this.soundEnabled = false;
        if("AudioContext" in window || "webkitAudioContext" in window) {
            const audioContext = new (AudioContext || webkitAudioContext)(); //Create an audio Context
            const masterGain = new GainNode(audioContext); //Create a masterGain GainNode
            masterGain.gain.value = _Constants_SoundCardConstants__WEBPACK_IMPORTED_MODULE_0__.INITIAL_VOLUME; //Set masterGain gain value
            masterGain.connect(audioContext.destination); //connect the masterGain to the audio context

            //Variables soundEnabled and Oscillator
            let soundEnabled = false;
            let oscillator;
            //Create an object and define its properties
            Object.defineProperties(this, {
                //Sound Enabled Propert
                soundEnabled: {
                    //Getter
                    get: function() {
                        return soundEnabled;
                    },
                    //Setter
                    set: function(value) {
                        //if incomming value already is equal to soundEnabled exit function
                        if(value === soundEnabled) {
                            return
                        }
                        soundEnabled = value;
                        //Check soundEnabled true
                        if(soundEnabled) {
                            //Start Oscillator
                            oscillator = new OscillatorNode(audioContext, {type: "square"}); //Square Oscillator
                            oscillator.connect(masterGain);
                            oscillator.start();
                        } else {
                            //Stop Oscillator
                            oscillator.stop();
                        }
                    }
                }
            })
        }
    }

    //Enables the sound Card
    enableSound() {
        this.soundEnabled = true;
    }

    //Disables the sound Card
    disableSound() {
        this.soundEnabled = false;
    }
}

/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "INITIAL_VOLUME": () => (/* binding */ INITIAL_VOLUME)
/* harmony export */ });
const INITIAL_VOLUME = 0.3;

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Chip8__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _Constants_RegistersConstants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5);
/* harmony import */ var _Memory__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(11);




let loopId;
let soundCard;

async function runChip8() {
    //Change to FILE SELECT!!!
    const rom = await fetch('./roms/test_opcode.ch8');

    //Load the Rom
    const arrayBuffer = await rom.arrayBuffer();
    const romBuffer = new Uint8Array(arrayBuffer);
    const chip8 = new _Chip8__WEBPACK_IMPORTED_MODULE_0__.Chip8(romBuffer);


    while(1) {
        await chip8.sleep();

        
        for(let i = 0; i < 10; i++) {
            chip8.cycle();
            
        }

    }
    
}

runChip8();
})();

/******/ })()
;