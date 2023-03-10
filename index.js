const fs = require('fs');
var query = require('cli-interact').getChar;

const memory = new Array(256).fill(0);
// let pc = 550;
let pc = 0;
let startPrinting = false

const immediate = 0x1;
const referenceToValue = 0x2;
const referenceToPointer = 0x3;

const move = 0x1;
const jump = 0x2;
const add = 0x3;
const subtract = 0x4;
const skipIfLess = 0x5;

const readMemory = (addr) => {
    return memory[addr];
}

const writeMemory = (addr, value) => {
    memory[addr] = value;
}
const printMemory = (addr) => {
    return String.fromCharCode(memory[addr])
}

const readValue = (addr, mode) => {
    if (addr >= 255) {
       // const input = query()
       //  writeMemory(addr, input.codePointAt(0))
    }
    switch (mode) {
        case immediate:
            return addr;
        case referenceToValue:
            return readMemory(addr);
        case referenceToPointer:
            return readMemory(readMemory(addr));
        default:
            return 0;
    }



}

const writeValue = (addr, mode, value) => {
    value = takeBitsFromRight(value, 8)
    switch (mode) {
        case referenceToValue:
            writeMemory(addr, value);
            break;
        case referenceToPointer:
            writeMemory(readMemory(addr), value);
            break;
    }


    if (addr >= 255) {
        if (printMemory(addr) === '/') {
            console.log(pc)
            startPrinting = true
        }
        // if (startPrinting) {
            process.stdout.write(printMemory(addr))
        // }
    }
}

const processInstruction = (opcode, p1Mode, p2Mode, p1Value, p2Value) => {
    let nextPc = 0

    switch (opcode) {
        case move:
            const foo = readValue(p2Value, p2Mode)
            writeValue(p1Value, p1Mode, foo);
            nextPc++
            break;
        case jump:
            const semiCalculation = (p2Value << 8)
            pc = p1Value + semiCalculation;
            // pc++
            return
            break;
        case add:
            const newValue = p1Value + p2Value
            writeValue(p1Value, p1Mode, newValue);
            nextPc++
            break;
        case subtract:
            const diffValue = p1Value - p2Value;
            writeValue(p1Value, p1Mode, diffValue);
            nextPc++
            break;
        case skipIfLess:
            if (p1Value < p2Value) {
                nextPc += 2;
            }
            break;
    }

    pc += nextPc;
}

function takeBitsFromRight(byte, x, offset = 0) {
    const mask = (1 << x) - 1; // create bit mask with x ones
    return (byte >> offset) & mask// perform bitwise AND and left shift operations
}

// const data = fs.readFileSync('foo.bin')
const data = fs.readFileSync('mystery-dungeon-v1.0.bin')
    while(true) {
        const address = pc * 3
        // First byte - operations
        const opcode = takeBitsFromRight(data[address], 4);
        const p1Mode = takeBitsFromRight(data[address], 2, 4);
        const p2Mode = takeBitsFromRight(data[address], 2, 6)
        const p1Value = data[address + 1];
        const p2Value = data[address + 2];

        processInstruction(opcode, p1Mode, p2Mode, p1Value, p2Value);

        if (address >= data.length) {
            console.info(`address overflew with address ${address} and data length ${data.length}`)
            break;
        }
    }
