/**
 * Created by hoangminhtri on 27/05/2017.
 */
var Raspi = require("raspi-io");
var WatchJS = require("watchjs");
var watch = WatchJS.watch;
var five = require("johnny-five"),
    board = new five.Board({
        io: new Raspi()
    });
var flag = 0;
var last_time = "u";
var result = "rurrddldldrdruuuurullldluuu";
//di thang: u, lui lai: d, re trai: l, re phai: r
var map_dich = {
    0: {x: 'rr', y: 'u'},
    1: {x: 'dd', y: 'u'},
    2: {x: 'uu', y: 'u'},
    3: {x: 'll', y: 'u'},
    4: {x: 'ru', y: 'l'},
    5: {x: 'rd', y: 'r'},
    6: {x: 'rl', y: 'd'},
    7: {x: 'du', y: 'd'},
    8: {x: 'dr', y: 'l'},
    9: {x: 'dl', y: 'r'},
    10: {x: 'lu', y: 'r'},
    11: {x: 'lr', y: 'd'},
    12: {x: 'ld', y: 'l'},
    13: {x: 'ur', y: 'r'},
    14: {x: 'ud', y: 'd'},
    15: {x: 'ul', y: 'l'}
};

function MoveSokoban() {
    var move = [];
    move.push(result[0]);
    console.log(move);
    for (var i=0; i < result.length-1; i++){
        var go = result[i]+result[i+1];
        for (var j in map_dich){
            if(go == map_dich[j].x){
                move.push(map_dich[j].y);
            }
        }
    }
    return move;
}

var move = [ 'r', 'l', 'l' ];
console.log(move);

function GoStraightLine(motors) {
    motors.reverse(60);
}
function GoBack(motors) {
    motors.forward(200);
}
function TurnRight(motors) {
    motors[0].forward(235);
    motors[1].reverse(50);
}

function TurnRightMore(motors) {
    motors[0].forward(135);
    motors[1].reverse(150);
}

function TurnLeft(motors) {
    motors[0].reverse(50);
    motors[1].forward(235);
}

function TurnLeftMore(motors) {
    motors[0].reverse(150);
    motors[1].forward(135);
}

function RotateRight(sensor0, sensor1, sensor2, sensor3, sensor4, sensor5, motors) {
    if (sensor0 == 0 && sensor5 == 0) {
        GoBack(motors);
        last_time = "r";
        while (sensor0 != 0 && sensor1 != 0 && sensor2 != 1 && sensor3 != 1 && sensor4 != 0 && sensor5 != 0) {
            motors[0].forward(135);
            motors[1].reverse(150);
            console.log('RotateRight WHILE');
        }
        flag = 1;
    }
}
function RotateLeft(sensor0, sensor1, sensor2, sensor3, sensor4, sensor5, motors) {
    if (sensor0 == 0 && sensor5 == 0){
        GoBack(motors);
        last_time = "l";
        while (sensor0 != 0 && sensor1 != 0 && sensor2 != 1 && sensor3 != 1 && sensor4 != 0 && sensor5 != 0){
            motors[0].reverse(150);
            motors[1].forward(135);
            console.log('RotateLeft WHILE');
        }
        flag = 1;
    }
}

function Line(sensor0, sensor1, sensor2, sensor3, sensor4, sensor5, motors) {
    if (sensor0 == 0 && sensor1 == 0 && sensor2 == 1 && sensor3 == 1 && sensor4 == 0 && sensor5 == 0){
        GoStraightLine(motors);
        flag = 1;
    } else if (sensor3 == 0 && sensor4 == 0 && sensor5 == 0 && sensor0 == 0 && sensor1 == 0 && sensor2 == 1){
        TurnLeft(motors);
        flag = 1;
    } else if (sensor0 == 0 && sensor1 == 0 && sensor2 == 0 && sensor3 == 1 && sensor4 == 0 && sensor5 == 0){
        TurnRight(motors);
        flag = 1;
    } else if (sensor3 == 0 && sensor4 == 0 && sensor5 == 0 && sensor0 == 0 && sensor1 == 1 && sensor2 == 1){
        TurnLeftMore(motors);
        flag = 1;
    } else if (sensor0 == 0 && sensor1 == 0 && sensor2 == 0 && sensor3 == 1 && sensor4 == 1 && sensor5 == 0){
        TurnRightMore(motors);
        flag = 1;
    } else if (sensor0 == 1 && sensor1 == 1 && sensor2 == 1 && sensor3 == 1 && sensor4 == 1 && sensor5 == 1) {
        flag = 2;
    } else if (sensor0 == 1 && sensor1 == 1 && sensor2 == 1 && sensor3 == 0 && sensor4 == 0 && sensor5 == 0) {
        flag = 2;
    } else if (sensor0 == 0 && sensor1 == 0 && sensor2 == 0 && sensor3 == 1 && sensor4 == 1 && sensor5 == 1) {
        flag = 2;
    } else if (sensor0 == 0 && sensor1 == 0 && sensor2 == 0 && sensor3 == 0 && sensor4 == 0 && sensor5 == 0 && last_time == "r"){
        motors[0].forward(135);
        motors[1].reverse(150);
    } else if (sensor0 == 0 && sensor1 == 0 && sensor2 == 0 && sensor3 == 0 && sensor4 == 0 && sensor5 == 0 && last_time == "l"){
        motors[0].reverse(150);
        motors[1].forward(135);
    }
}

function MovePoint(sensor0, sensor1, sensor2, sensor3, sensor4, sensor5, motors) {
    var go = move[0];
    move.shift();
    switch (go) {
        case 'u':
            console.log('GoStraightLine');
            GoStraightLine(motors);
            break;
        case 'l':
            console.log('RotateLeft');
            RotateLeft(sensor0, sensor1, sensor2, sensor3, sensor4, sensor5, motors);
            break;
        case 'r':
            console.log('RotateRight');
            RotateRight(sensor0, sensor1, sensor2, sensor3, sensor4, sensor5, motors);
            break;
        case 'd':
            GoBack(motors);
            console.log('d');
            break;
    }
}

function Point(sensor0, sensor1, sensor2, sensor3, sensor4, sensor5, motors) {
    flag = 2;
    if ((sensor0 == 1 && sensor5 == 1) || (sensor0 == 1 && sensor5 == 0) || (sensor0 == 0 && sensor5 == 1)){
        GoStraightLine(motors);
    }
    if (sensor0 == 0 && sensor5 == 0){
        MovePoint(sensor0, sensor1, sensor2, sensor3, sensor4, sensor5, motors);
    }
}

function Start(sensor0, sensor2, sensor3, sensor5) {
    flag = 0;
    if (sensor0 == 0 && (sensor2 == 1 || sensor3 == 1) && sensor5 == 0){
        flag=1;
    }
}
board.on("ready", function() {
    var motors = new five.Motors([
        { pins: { dir: 21, pwm: 23 }, invertPWM: true },
        { pins: { dir: 22, pwm: 26}, invertPWM: true }
    ]);
    motors.reverse(50);
    // Nhan tin hieu sensor
    var sensor = [];
    var value = {
        sensor0:0,
        sensor1:0,
        sensor2:0,
        sensor3:0,
        sensor4:0,
        sensor5:0
    };
    sensor[0] = new five.Sensor.Digital(7);
    sensor[1] = new five.Sensor.Digital(0);
    sensor[2] = new five.Sensor.Digital(2);
    sensor[3] = new five.Sensor.Digital(3);
    sensor[4] = new five.Sensor.Digital(12);
    sensor[5] = new five.Sensor.Digital(13);
    watch(value, function(){
        // console.log("sensor0: " + value.sensor0);
        // console.log("sensor1: " + value.sensor1);
        // console.log("sensor2: " + value.sensor2);
        // console.log("sensor3: " + value.sensor3);
        // console.log("sensor4: " + value.sensor4);
        // console.log("sensor5: " + value.sensor5);
        if (flag == 0){
            Start(value.sensor0, value.sensor2, value.sensor3, value.sensor5);
            console.log("start");
        }
        if (flag == 1){
            Line(value.sensor0, value.sensor1, value.sensor2, value.sensor3, value.sensor4, value.sensor5, motors);
            console.log("line");
        }
        if (flag == 2){
            Point(value.sensor0, value.sensor1, value.sensor2, value.sensor3, value.sensor4, value.sensor5, motors);
            console.log("point");
        }
    });
    sensor[0].on("change",function () {
        value.sensor0 = sensor[0].value;
    });
    sensor[1].on("change",function () {
        value.sensor1 = sensor[1].value;
    });
    sensor[2].on("change",function () {
        value.sensor2 = sensor[2].value;
    });
    sensor[3].on("change",function () {
        value.sensor3 = sensor[3].value;
    });
    sensor[4].on("change",function () {
        value.sensor4 = sensor[4].value;
    });
    sensor[5].on("change",function () {
        value.sensor5 = sensor[5].value;
    });
});

