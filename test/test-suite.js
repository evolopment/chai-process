/*
 * Copyright (c) 2015, Jaime Blazquez del Hierro
 * Licensed under BSD 2-Clause license
 * See LICENSE.md file for details
 */

var path = require('path');

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var chaiProcess = require('../lib/index.js');

chai.use(chaiProcess);
chai.use(chaiAsPromised);

var spawn = chaiProcess.spawn;

var expect = chai.expect;

before(function() {
    process.chdir(path.dirname(module.filename));
});

describe('Assertions', function() {

    describe('Exit code', function() {

        describe('"succeed"', function() {

            it('succeeds if the process exits with return code 0', function () {
                return expect(spawn('node', ['simple-ok.js'])).to.eventually.succeed;
            });

            it('fails if the process exits with return code other than 0', function () {
                return expect(spawn('node', ['simple-ko.js'])).not.to.eventually.succeed;
            });

        });

        describe('"fail"', function() {

            it('succeeds if the process exits with return code other than 0', function () {
                return expect(spawn('node', ['simple-ko.js'])).to.eventually.fail;
            });

            it('fails if the process exits with return code 0', function () {
                return expect(spawn('node', ['simple-ok.js'])).not.to.eventually.fail;
            });

        });

        describe('"exitWithCode"', function() {

            it('succeeds if the process exits with return code indicated', function () {
                return expect(spawn('node', ['simple-ko-alt.js'])).to.eventually.exitWithCode(2);
            });

            it('fails if the process exits with return code other than indicated', function () {
                return expect(spawn('node', ['simple-ko.js'])).not.to.eventually.exitWithCode(2);
            });

        });

        describe('"exitCode"', function() {

            it('property returns the exit code (0)', function () {
                return expect(spawn('node', ['simple-ok.js'])).to.eventually.exitCode.eql(0);
            });

            it('property returns the exit code (1)', function () {
                return expect(spawn('node', ['simple-ok.js'])).to.eventually.exitCode.eql(0);
            });

            it('property returns the exit code (2)', function () {
                return expect(spawn('node', ['simple-ko-alt.js'])).to.eventually.exitCode.eql(2);
            });

        });

    });

    describe('Execution time', function() {

        describe('"seconds"', function() {

            it('property returns the execution time (0)', function () {
                return expect(spawn('node', ['simple-ok.js'])).to.eventually.seconds.within(0, 0.5);
            });

            it('property returns the execution time (1)', function () {
                return expect(spawn('node', ['delay-1s.js'])).to.eventually.seconds.within(1, 1.5);
            });

            it('property returns the execution time (2)', function () {
                this.timeout(3000);
                return expect(spawn('node', ['delay-2s.js'])).to.eventually.seconds.within(2, 2.5);
            });

        });

        describe('"milliseconds"', function() {

            it('property returns the execution time (0)', function () {
                return expect(spawn('node', ['simple-ok.js'])).to.eventually.milliseconds.within(0, 500);
            });

            it('property returns the execution time (1)', function () {
                return expect(spawn('node', ['delay-1s.js'])).to.eventually.milliseconds.within(1000, 1500);
            });

            it('property returns the execution time (2)', function () {
                this.timeout(3000);
                return expect(spawn('node', ['delay-2s.js'])).to.eventually.milliseconds.within(2000, 2500);
            });

        });

        describe('"microseconds"', function() {

            it('property returns the execution time (0)', function () {
                return expect(spawn('node', ['simple-ok.js'])).to.eventually.microseconds.within(0, 0.5e6);
            });

            it('property returns the execution time (1)', function () {
                return expect(spawn('node', ['delay-1s.js'])).to.eventually.microseconds.within(1e6, 1.5e6);
            });

            it('property returns the execution time (2)', function () {
                this.timeout(3000);
                return expect(spawn('node', ['delay-2s.js'])).to.eventually.microseconds.within(2e6, 2.5e6);
            });

        });

        describe('"nanoseconds"', function() {

            it('property returns the execution time (0)', function () {
                return expect(spawn('node', ['simple-ok.js'])).to.eventually.nanoseconds.within(0, 0.5e9);
            });

            it('property returns the execution time (1)', function () {
                return expect(spawn('node', ['delay-1s.js'])).to.eventually.nanoseconds.within(1e9, 1.5e9);
            });

            it('property returns the execution time (2)', function () {
                this.timeout(3000);
                return expect(spawn('node', ['delay-2s.js'])).to.eventually.nanoseconds.within(2e9, 2.5e9);
            });

        });

    });

    describe('I/O', function() {

        describe('"stdout"', function() {

            it('method returns the childout standard output (stdio[1])', function() {
                return expect(spawn('node', ['io-stdout-1.js'])).to.eventually.stdout().eql('abcdefgh.\"+-*?1234\n');
            });

            it('method returns the childout standard output (stdio[1]) with specified encoding (ascii)', function() {
                return expect(spawn('node', ['io-stdout-1.js'])).to.eventually.stdout('ascii').eql('abcdefgh.\"+-*?1234\n');
            });

            it('method returns the childout standard output (stdio[1]) with specified encoding (UTF8)', function() {
                return expect(spawn('node', ['io-stdout-utf8.js'])).to.eventually.stdout('utf8').eql('¿?ÑÇ');
            });

        });

        describe('"stderr"', function() {

            it('method returns the childout standard error (stdio[2])', function() {
                return expect(spawn('node', ['io-stderr-1.js'])).to.eventually.stderr().eql('abcdefgh.\"+-*?1234\n');
            });

            it('method returns the childout standard error (stdio[2]) with specified encoding (ascii)', function() {
                return expect(spawn('node', ['io-stderr-1.js'])).to.eventually.stderr('ascii').eql('abcdefgh.\"+-*?1234\n');
            });

            it('method returns the childout standard error (stdio[2]) with specified encoding (UTF8)', function() {
                return expect(spawn('node', ['io-stderr-utf8.js'])).to.eventually.stderr('utf8').eql('¿?ÑÇ');
            });

        });


    });


});