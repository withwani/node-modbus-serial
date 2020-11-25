/* eslint-disable no-console, no-unused-vars, spaced-comment */

// create an empty modbus client
//var ModbusRTU = require("modbus-serial");
var ModbusRTU = require("../index");

// var coils = Buffer.alloc(160008, 0); // coils and discrete inputs
// var registers = Buffer.alloc(160008, 0); // input and holding registers
let coils = Buffer.alloc(30 + 52 * 20, 0); // 1070
let registers = Buffer.alloc(30 + 52 * 20, 0); // 1070

let getVal = (val) => {
    return (val == 0) ? 0 : (val % 100 == 0) ? parseInt(val / 100) : parseInt(val % 100);
}
for (let i = 0; i < registers.length; i++) {
    // let ret = getVal(i);
    // console.log(`ret(${i})`, ret);
    coils.writeUInt8(getVal(i), i);
    // if (i != registers.length - 1) registers.writeInt16BE(getVal(i), i);
    if (i != registers.length - 1 && i % 2 == 0) registers.writeUInt16BE(getVal(i), i);
}
console.log(`coils`, coils);
console.log(`registers`, registers);

var abCoils = coils.buffer.slice(coils.byteOffset, coils.byteOffset + coils.byteLength);
var abRegisters = registers.buffer.slice(registers.byteOffset, registers.byteOffset + registers.byteLength);
let vCoils = new DataView(abCoils);
let vRegisters = new DataView(abRegisters);


let abRegs = new ArrayBuffer(1070);
// TODO : Dummy buffer 만들기


var unitId = 1;
var minAddress = 0;
var maxInputAddress = 10001;
var maxAddress = 20001;
var bufferFactor = 8;

//     1...10000*  address - 1      Coils (outputs)    0   Read/Write
// 10001...20000*  address - 10001  Discrete Inputs    01  Read
// 30001...40000*  address - 30001  Input Registers    04  Read
// 40001...50000*  address - 40001  Holding Registers  03  Read/Write

var vector = {
    getCoil: function (addr, unitID) {
        console.log(`getCoil(${unitID}), addr =`, addr);
        if (unitID === unitId && addr >= minAddress && addr < maxAddress) {
            // let ret = coils.readUInt8(addr * bufferFactor);
            let ret = vCoils.getUint8(addr);
            console.log(`coils`, ret);
            return ret;
            // return coils.readUInt8(addr * bufferFactor);
        }
    },
    getInputRegister: function (addr, unitID) {
        console.log(`getInputRegister(${unitID}), addr =`, addr);
        if (unitID === unitId && addr >= minAddress && addr < maxInputAddress) {
            return registers.readUInt16BE(addr * bufferFactor);
        }
    },
    getHoldingRegister: function (addr, unitID) {
        console.log(`getHoldingRegister(${unitID}), addr =`, addr);
        // if (unitID === unitId && addr >= maxInputAddress && addr < maxAddress) {
        if (unitID === unitId && addr >= minAddress && addr < maxAddress) {
            // let ret = registers.readUInt16BE(addr * bufferFactor);
            let ret = vRegisters.getUint16(addr);
            console.log(`registers`, ret);
            return ret;
            // return registers.readUInt16BE(addr * bufferFactor);
        }
    },

    setCoil: function (addr, value, unitID) {
        console.log(`setCoil(${unitID}), value(${value}), addr =`, addr);
        if (unitID === unitId && addr >= minAddress && addr < maxAddress) {
            coils.writeUInt8(value, addr * bufferFactor);
        }
    },
    setRegister: function (addr, value, unitID) {
        console.log(`setRegister(${unitID}), value(${value}), addr =`, addr);
        if (unitID === unitId && addr >= minAddress && addr < maxAddress) {
            registers.writeUInt16BE(value, addr * bufferFactor);
        }
    }
};

// set the server to answer for modbus requests
console.log("ModbusTCP listening on modbus://0.0.0.0:502");
var serverTCP = new ModbusRTU.ServerTCP(vector, {
    host: "0.0.0.0",
    port: 502,
    debug: true,
    unitID: 1
});

serverTCP.on("socketError", function (err) {
    console.error(err);
    serverTCP.close(closed);
});

function closed() {
    console.log("server closed");
}