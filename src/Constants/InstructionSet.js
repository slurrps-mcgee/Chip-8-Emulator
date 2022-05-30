//MASK Constants to validate arguments
export const MASK_NNN = { mask: 0x0fff }; //ADDRESS
export const MASK_N = { mask: 0x000f }; //Lowest Byte
export const MASK_X = { mask: 0x0f00, shift: 8 }; //Vx 
export const MASK_Y = { mask: 0x00f0, shift: 4 };
export const MASK_KK = { mask: 0x00ff }; //byte
export const MASK_HIGHEST_BYTE = 0xf000; //Highest Byte
export const MASK_HIGHEST_AND_LOWEST_BYTE = 0xf00f; //Highest and Lowest Byte

export const INSTRUCTION_SET = [
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