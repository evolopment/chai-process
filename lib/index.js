/*
 * Copyright (c) 2015, Jaime Blazquez del Hierro
 * Licensed under BSD 2-Clause license
 * See LICENSE.md file for details
 */

var child_process = require('child_process');
var Q = require('q');

function ChildResult(code, signal, finishTime, stdout, stderr, err) {
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
            if(obj instanceof ChildResult) {
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
            if(obj instanceof ChildResult) {
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
            if(obj instanceof ChildResult) {
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
            if(obj instanceof ChildResult) {
                this._obj = this._obj.code;
            } else {
                _super.call(this);
            }
        };
    });

    Assertion.overwriteProperty('seconds', function(_super) {
        return function() {
            var obj = this._obj;
            if(obj instanceof ChildResult) {
                this._obj = this._obj.finishTime / 1e9;
            } else {
                _super.call(this);
            }
        };
    });

    Assertion.overwriteProperty('milliseconds', function(_super) {
        return function() {
            var obj = this._obj;
            if(obj instanceof ChildResult) {
                this._obj = this._obj.finishTime / 1e6;
            } else {
                _super.call(this);
            }
        };
    });

    Assertion.overwriteProperty('microseconds', function(_super) {
        return function() {
            var obj = this._obj;
            if(obj instanceof ChildResult) {
                this._obj = this._obj.finishTime / 1000;
            } else {
                _super.call(this);
            }
        };
    });

    Assertion.overwriteProperty('nanoseconds', function(_super) {
        return function() {
            var obj = this._obj;
            if(obj instanceof ChildResult) {
                this._obj = this._obj.finishTime;
            } else {
                _super.call(this);
            }
        };
    });

    Assertion.overwriteMethod('stdout', function(_super) {
        return function(encoding) {
            var obj = this._obj;
            if(obj instanceof ChildResult) {
                this._obj = this._obj.stdout.toString(encoding);
            } else {
                _super.call(this);
            }
        };
    });

    Assertion.overwriteMethod('stderr', function(_super) {
        return function(encoding) {
            var obj = this._obj;
            if(obj instanceof ChildResult) {
                this._obj = this._obj.stderr.toString(encoding);
            } else {
                _super.call(this);
            }
        };
    });

};

function stopTimer(startTime) {
    var endTime = process.hrtime();
    return (endTime[0]*1e9 + endTime[1]) - (startTime[0]*1e9 + startTime[1]);
}

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



    var startTime = process.hrtime();

    var child = child_process.spawn(command, args, options);

    var childOut = [];
    var childErr = [];

    var dfd = Q.defer();

    child.on('error', function(err) {
        dfd.reject(err);
    });

    child.on('exit', function(code, signal) {
        dfd.resolve(new ChildResult(code, signal, stopTimer(startTime), Buffer.concat(childOut), Buffer.concat(childErr)));
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

cp.exec = function(command, options) {

    var dfd = Q.defer();

    var startTime = process.hrtime();

    try {
        var child = child_process.exec(command, options, function(error, stdout, stderr) {
            if(error) {
                dfd.resolve(new ChildResult(error.code, error.signal, stopTimer(startTime), stdout, stderr));
            } else {
                dfd.resolve(new ChildResult(0, null, stopTimer(startTime), stdout, stderr))
            }
        });
    } catch(err) {
        dfd.reject(err);
    }

    return dfd.promise;

};

cp.execFile = function(file, args, options) {

}

module.exports = cp;