import { INSTRUCTION_SET } from "./Constants/InstructionSet";

export class Dissassembler {
    dissassemble(opcode) {
        //Get Instruction by making sure the opcode and mask match a pattern in the instruction set
        const instruction = INSTRUCTION_SET.find(instruction => (opcode & instruction.mask) === instruction.pattern); //Get the instruction

        const args = instruction.arguments.map(arg => (opcode & arg.mask) >> arg.shift); //Get the instruction arguments

        return {instruction, args}; //Return the instruction and its arguments
    }
}