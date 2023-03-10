class Processor {
    constructor() {
        this.memory = new Uint8Array(256);
        this.pc = 0;
    }

    loadProgram(program) {
        this.instructions = program;
    }

    run() {
        while (this.pc < this.instructions.length) {
            const instruction = this.instructions[this.pc];
            const opcode = instruction >> 4;
            const mode1 = (instruction >> 2) & 0b11;
            const mode2 = instruction & 0b11;
            const param1 = this.getOperand(mode1);
            const param2 = this.getOperand(mode2);
            this.execute(opcode, param1, param2);
            if (opcode !== 0b010) { // if not jmp
                this.pc++;
            }
        }
    }

    getOperand(mode) {
        switch (mode) {
            case 0b00: // immediate
                return this.readByte();
            case 0b01: // reference to constant
                return this.memory[this.readByte()];
            case 0b10: // reference to pointer
                return this.memory[this.memory[this.readByte()]];
            default:
                throw new Error(`Invalid addressing mode: ${mode}`);
        }
    }

    readByte() {
        const value = this.memory[this.pc + 1];
        if (value === undefined) {
            throw new Error(`Invalid read from memory address ${this.pc + 1}`);
        }
        return value;
    }

    execute(opcode, param1, param2) {
        switch (opcode) {
            case 0b000: // mov
                this.memory[param1] = param2;
                break;
            case 0b001: // jmp
                this.pc = param1 + (param2 << 8);
                break;
            case 0b010: // jz
                if (this.memory[255] === 0) {
                    this.pc = param1 + (param2 << 8);
                } else {
                    this.pc += 3;
                }
                break;
            case 0b011: // add
                this.memory[param1] += param2;
                break;
            case 0b100: // sub
                this.memory[param1] -= param2;
                break;
            case 0b101: // skl
                if (param1 < param2) {
                    this.pc++;
                } else {
                    this.pc += 3;
                }
                break;
            default:
                throw new Error(`Invalid opcode: ${opcode}`);
        }
    }
}


module.exports = { Processor };