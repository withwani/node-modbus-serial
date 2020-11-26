/* eslint-disable no-console, no-unused-vars, spaced-comment */

// create an empty modbus client
var ModbusRTU = require("../index");


const arr1 = new Uint8Array(30);
for (let i = 0; i < 30; i++) {
    arr1[i] = i;
}

const arr2 = new Uint16Array(15);
arr2[0] = 1;
arr2[1] = 2;
arr2[2] = 3;
arr2[3] = 4;
arr2[4] = 5;
arr2[5] = 6;
arr2[6] = 7;
arr2[7] = 8;
arr2[8] = 9;
arr2[9] = 10;
arr2[10] = 0;
arr2[11] = 0;
arr2[12] = 0;
arr2[13] = 0;
arr2[14] = 11;

const coils = Buffer.from(arr1.buffer);
const registers = Buffer.from(arr2.buffer);
console.log(`coils`, coils);
console.log(`registers`, registers);

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
            let ret = coils.readUInt8(addr);
            console.log(`coils`, ret);
            return ret;
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
        if (unitID === unitId && addr >= minAddress && addr < maxAddress) {
            // let ret = registers.readUInt16LE(addr);
            let ret = registers.readUInt16BE(addr * 2);
            console.log(`registers`, ret);
            return ret;
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