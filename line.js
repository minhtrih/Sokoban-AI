/**
 * Created by hoangminhtri on 06/06/2017.
 */
var Raspi = require("raspi-io");
var WatchJS = require("watchjs");
var watch = WatchJS.watch;
var five = require("johnny-five"),
    board = new five.Board({
        io: new Raspi()
    });

function GoStraighLine(motors) {
    motors.reverse(60);
}
function TurnRight(motors) {
    motors[0].forward(235);
    motors[1].reverse(50);
}
function TurnRightMore(motors) {
    motors[0].forward(215);
    motors[1].reverse(50);
}
function TurnLeft(motors) {
    motors[0].reverse(50);
    motors[1].forward(235);
}
function TurnLeftMore(motors) {
    motors[0].reverse(50);
    motors[1].forward(215);
}
function RotateRight(motors) {
    motors[0].forward(135);
    motors[1].reverse(150);
}
function RotateLeft(motors) {
    motors[0].reverse(150);
    motors[1].forward(135);
}

function StopMove(motors) {
    motors.reverse(0);
}

function Go(sensor0, sensor1, sensor2, sensor3, sensor4, sensor5, motors) {
    if (sensor0 == 0 && sensor1 == 0 && sensor2 == 0 && sensor3 == 0 && sensor4 == 0 && sensor5 == 0){
        motors.reverse(0);
    } else if (sensor0 == 0 && sensor1 == 0 && sensor2 == 0 && sensor3 && 1 && sensor4 == 0 && sensor5 == 0){
        TurnRight(motors);
    } else if (sensor3 == 0 && sensor4 == 0 && sensor5 == 0 && sensor0 == 0 && sensor1 == 0 && sensor2 == 1){
        TurnLeft(motors);
    } else if (sensor0 == 0 && sensor1 == 0 && sensor2 == 0 && sensor3 && 1 && sensor4 == 1 && sensor5 == 0){
        TurnRightMore(motors);
    } else if (sensor3 == 0 && sensor4 == 0 && sensor5 == 0 && sensor0 == 0 && sensor1 == 1 && sensor2 == 1){
        TurnLeftMore(motors);
    } else {
        GoStraighLine(motors);
    }
}

board.on("ready", function() {
    var flag = 0;
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
        console.log("sensor0: " + value.sensor0);
        console.log("sensor1: " + value.sensor1);
        console.log("sensor2: " + value.sensor2);
        console.log("sensor3: " + value.sensor3);
        console.log("sensor4: " + value.sensor4);
        console.log("sensor5: " + value.sensor5);
        if (flag == 0 && value.sensor0 == 0 && value.sensor5 == 0){
            Go(value.sensor0, value.sensor1, value.sensor2, value.sensor3, value.sensor4, value.sensor5, motors);
            flag++;
        }
        if (flag == 1 && value.sensor0 == 1 && value.sensor5 == 1){
            Go(value.sensor0, value.sensor1, value.sensor2, value.sensor3, value.sensor4, value.sensor5, motors);
            flag++;
        }
        if (flag == 2 && value.sensor0 == 0 && value.sensor5 == 0){
            Go(value.sensor0, value.sensor1, value.sensor2, value.sensor3, value.sensor4, value.sensor5, motors);
            flag++;
        }
        if (flag == 3 && value.sensor0 == 1 && value.sensor5 == 1){
            Go(value.sensor0, value.sensor1, value.sensor2, value.sensor3, value.sensor4, value.sensor5, motors);
            flag++;
        }
        if (flag == 4 && value.sensor0 == 0 && value.sensor5 == 0){
            StopMove(motors);
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

