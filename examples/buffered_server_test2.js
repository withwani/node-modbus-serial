/* eslint-disable no-console, no-unused-vars, spaced-comment */

// create an empty modbus client
var ModbusRTU = require("../index");


const arr1 = new Uint8Array(30);
for (let i = 0; i < 30; i++) {
    arr1[i] = i;
}

let randomScalingFactor = function (val, offset) { // random range: val + (offset * 0~1)
    return Math.round(Math.random() * offset + val);
};

const arr2 = new Uint16Array(130);
arr2[0] = 100; // 0, 2bytes, 목표전력
arr2[1] = 80; // 2, 2bytes, 예측전력
arr2[2] = 50; // 4, 2bytes, 기준전력
arr2[3] = randomScalingFactor(60, 10); // 6, 2bytes, 진행전력
arr2[4] = randomScalingFactor(40, 30); // 8, 2bytes, 현재부하
arr2[5] = (!arr2[5]) ? 1 : (arr2[5] > arr2[3]) ? arr2[5] : arr2[3]; // 10, 2bytes, 직전최대
arr2[6] = randomScalingFactor(40, 30); // 12, 2bytes, 기타부하
arr2[7] = arr2[0] - arr2[3]; // 14, 2bytes, 여유전력
arr2[8] = Date.now(); // 16, 2bytes, 수요시간
arr2[9] = randomScalingFactor(60, 10); // 18, 2bytes, 용해전력
arr2[10] = 0;
arr2[11] = 0;
arr2[12] = 0;
arr2[13] = 0;
arr2[14] = randomScalingFactor(0, 2); // 28, 2bytes, 0: NONE, 1: PEAK!!, 제어신호

arr2[100] = 100; // 100, 2bytes, 0: Analog, 1: Digital
arr2[101] = 80; // 102, 2bytes, input
arr2[102] = 50; // 104, 2bytes, output
arr2[103] = 0;
arr2[104] = 0;
arr2[105] = randomScalingFactor(60, 10); // 110, 2bytes, 용탕중량
arr2[106] = randomScalingFactor(40, 30); // 112, 2bytes, 사용전력
arr2[107] = randomScalingFactor(40, 30); // 114, 2bytes, 누적전력
arr2[108] = 0;
arr2[109] = 0;
arr2[110] = Date.now(); // 120, 10bytes, 시작시간
arr2[111] = 0;
arr2[112] = 0;
arr2[113] = 0;
arr2[114] = 0;
arr2[115] = Date.now(); // 130, 2bytes, 작업시간
arr2[116] = 0;
arr2[117] = 0;
arr2[118] = 0;
arr2[119] = 0;
arr2[120] = Date.now(); // 140, 10bytes, 종료시간
arr2[121] = 0;
arr2[122] = 0;
arr2[123] = 0;
arr2[124] = 0;
arr2[125] = randomScalingFactor(0, 8); // 150, 2bytes, 0: standby, 1: melting, 2: output#1, 3: output#2 ..., 작업단계
arr2[126] = 0;
arr2[127] = 0;
arr2[128] = 0;
arr2[129] = 0;


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

            if (addr < 100) {
                arr2[3] = randomScalingFactor(60, 10); // 6, 2bytes, 진행전력
                arr2[4] = randomScalingFactor(40, 30); // 8, 2bytes, 현재부하
                arr2[5] = (!arr2[5]) ? 1 : (arr2[5] > arr2[3]) ? arr2[5] : arr2[3]; // 10, 2bytes, 직전최대
                arr2[6] = randomScalingFactor(40, 30); // 12, 2bytes, 기타부하
                arr2[7] = arr2[0] - arr2[3]; // 14, 2bytes, 여유전력
                arr2[9] = randomScalingFactor(60, 10); // 18, 2bytes, 용해전력
            } else {
                arr2[105] = randomScalingFactor(60, 10); // 110, 2bytes, 용탕중량
                arr2[106] = randomScalingFactor(40, 30); // 112, 2bytes, 사용전력
                arr2[107] = randomScalingFactor(40, 30); // 114, 2bytes, 누적전력
                arr2[125] = randomScalingFactor(0, 8); // 150, 2bytes, 0: standby, 1: melting, 2: output#1, 3: output#2 ..., 작업단계
            }

            // let ret = registers.readUInt16LE(addr);
            let ret = registers.readUInt16BE(addr * 2);
            console.log(`registers`, ret);
            return ret;
        }
    },
    /* getHoldingRegister: function (addr, unitID) {
        console.log(`getHoldingRegister(${unitID}), addr =`, addr);
        if (unitID === unitId && addr >= minAddress && addr < maxAddress) {
            // let ret = registers.readUInt16LE(addr);
            let ret = registers.readUInt16BE(addr * 2);
            console.log(`registers`, ret);
            return ret;
        }
    }, */

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