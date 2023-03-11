const fs = require('fs');
const prompt = require('prompt-sync')();
// var query = require('cli-interact').getChar;

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
       const input = prompt();
        writeMemory(addr, input.codePointAt(0))
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
    switch (opcode) {
        case move:
            const foo = readValue(p2Value, p2Mode)
            writeValue(p1Value, p1Mode, foo);
            break;
        case jump:
            const semiCalculation = (readValue(p2Value, p2Mode) << 8)
            pc = takeBitsFromRight((readValue(p1Value, p1Mode) + semiCalculation) * 3, 16)
            return
        case add:
            const newValue = readValue(p1Value, p1Mode) + readValue(p2Value, p2Mode)
            writeValue(p1Value, p1Mode, newValue);
            break;
        case subtract:
            const diffValue = readValue(p1Value, p1Mode) - readValue(p2Value, p2Mode)
            writeValue(p1Value, p1Mode, diffValue);
            break;
        case skipIfLess:
            const skipP1 = readValue(p1Value, p1Mode)
            const skipP2 = readValue(p2Value, p2Mode)
            if (skipP1 < skipP2) {
                pc += 3;
            }
            break;
    }
}

function takeBitsFromRight(byte, x, offset = 0) {
    const mask = (1 << x) - 1; // create bit mask with x ones
    return (byte >> offset) & mask// perform bitwise AND and left shift operations
}


// const data = fs.readFileSync('foo.bin')
const data = fs.readFileSync('mystery-dungeon-v1.0.bin')


function readByte() {
    const address = pc++
    return data[takeBitsFromRight(address, 16)];
}

    while(true) {
        // First byte - operations
        const firstByte = readByte()
        const secondByte = readByte()
        const thirdByte = readByte()

        const opcode = takeBitsFromRight(firstByte, 4);
        const p1Mode = takeBitsFromRight(firstByte, 2, 4);
        const p2Mode = takeBitsFromRight(firstByte, 2, 6)

        const p1Value = secondByte;
        const p2Value = thirdByte;

        processInstruction(opcode, p1Mode, p2Mode, p1Value, p2Value);

        if (pc >= data.length) {
            console.info(`address overflew with address ${pc} and data length ${data.length}`)
            break;
        }
    }
