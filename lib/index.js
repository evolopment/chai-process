/*
 * Copyright (c) 2015, Jaime Blazquez del Hierro
 * Licensed under BSD 2-Clause license
 * See LICENSE.md file for details
 */

var spawn = require('child_process').spawn;
var Q = require('q');

function SpawnResult(code, signal, finishTime, stdout, stderr, err) {
    this.code = code;
    this.signal = signal;
    this.finishTime = finishTime;
    this.stdout = stdout;
    this.stderr = stderr;
    this.err = err;
}

var cp = function(chai, utils) {

    var Assertion = chai.Assertion;

    Assertion.overwriteProperty('succeed', function(_super) {
        return function() {
            var obj = this._obj;
            if(obj instanceof SpawnResult) {
                this.assert(
                    obj.code == 0,
                    'expected #{this} to succeed (exit value == 0) but got #{act}',
                    'expected #{this} to fail (exit value != 0) but got #{act}',
                    0,
                    obj.code

                );

            } else {
                _super.call(this);
            }
        };
    });

    Assertion.overwriteProperty('fail', function(_super) {
        return function() {
            var obj = this._obj;
            if(obj instanceof SpawnResult) {
                this.assert(
                    obj.code != 0,
                    'expected #{this} to fail (exit value != 0) but got #{act}',
                    'expected #{this} to succeed (exit value == 0) but got #{act}',
                    0,
                    obj.code
                );

            } else {
                _super.call(this);
            }
        };
    });

    Assertion.overwriteMethod('exitWithCode', function(_super) {
        return function(code) {
            var obj = this._obj;
            if(obj instanceof SpawnResult) {
                this.assert(
                    obj.code == code,
                    'expected #{this} to exit with code #{exp} but got #{act}',
                    'expected #{this} not to exit with code #{exp} but got #{act}',
                    code,
                    obj.code
                );

            } else {
                _super.call(this);
            }
        };
    });

    Assertion.overwriteProperty('exitCode', function(_super) {
        return function() {
            var obj = this._obj;
            if(obj instanceof SpawnResult) {
                this._obj = this._obj.code;
            } else {
                _super.call(this);
            }
        };
    });

    Assertion.overwriteProperty('seconds', function(_super) {
        return function() {
            var obj = this._obj;
            if(obj instanceof SpawnResult) {
                this._obj = this._obj.finishTime / 1e9;
            } else {
                _super.call(this);
            }
        };
    });

    Assertion.overwriteProperty('milliseconds', function(_super) {
        return function() {
            var obj = this._obj;
            if(obj instanceof SpawnResult) {
                this._obj = this._obj.finishTime / 1e6;
            } else {
                _super.call(this);
            }
        };
    });

    Assertion.overwriteProperty('microseconds', function(_super) {
        return function() {
            var obj = this._obj;
            if(obj instanceof SpawnResult) {
                this._obj = this._obj.finishTime / 1000;
            } else {
                _super.call(this);
            }
        };
    });

    Assertion.overwriteProperty('nanoseconds', function(_super) {
        return function() {
            var obj = this._obj;
            if(obj instanceof SpawnResult) {
                this._obj = this._obj.finishTime;
            } else {
                _super.call(this);
            }
        };
    });

    Assertion.overwriteMethod('stdout', function(_super) {
        return function(encoding) {
            var obj = this._obj;
            if(obj instanceof SpawnResult) {
                this._obj = this._obj.stdout.toString(encoding);
            } else {
                _super.call(this);
            }
        };
    });

    Assertion.overwriteMethod('stderr', function(_super) {
        return function(encoding) {
            var obj = this._obj;
            if(obj instanceof SpawnResult) {
                this._obj = this._obj.stderr.toString(encoding);
            } else {
                _super.call(this);
            }
        };
    });

};

cp.spawn = function(command, args, _options) {

    var options = {
        stdio: ['pipe', 'pipe', 'pipe']
    };

    if(_options) {
        if (_options.cwd !== undefined) options.cwd = _options.cwd;
        if (_options.env !== undefined) options.env = _options.env;
        if (_options.detached !== undefined) options.detached = _options.detached;
        if (_options.uid !== undefined) options.uid = _options.uid;
        if (_options.gid !== undefined) options.gid = _options.gid;
        if (_options.ipc) { options.stdio.push('ipc'); }
    }

    var childOut = [];
    var childErr = [];
    var startTime = process.hrtime();

    var child = spawn(command, args, options);

    var dfd = Q.defer();

    child.on('error', function(err) {
        console.dir(err);
        dfd.reject(err);
    });

    child.on('exit', function(code, signal) {
        var endTime = process.hrtime();
        var finishTime = (endTime[0]*1e9 + endTime[1]) - (startTime[0]*1e9 + startTime[1]);
        dfd.resolve(new SpawnResult(code, signal, finishTime, Buffer.concat(childOut), Buffer.concat(childErr)));

    });

    child.on('close', function() {
    });

    child.on('disconnect', function() {
    });

    child.on('message', function(msg) {
    });

    child.stdout.on('data', function(data) {
        childOut.push(data);
    });

    child.stderr.on('data', function(data) {
        childErr.push(data);
    });

    return dfd.promise;

};

module.exports = cp;