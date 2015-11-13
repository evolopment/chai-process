chai-process
============

This plugin for the [Chai assertion library](http://chaijs.com/) allows to assert conditions on the execution of subprocesses.

Install
-------

```
npm install @evolopment/chai-process --save-dev
```


Examples
--------

As the result of execution is asynchronous, it's used along [Chai as promised](http://chaijs.com/plugins/chai-as-promised).

```
var chai = require('chai');
var chaiProcess = require('@evolopment/chai-process');
var chaiAsPromised = require('chai-as-promised);

chai.use(chaiProcess);
chai.use(chaiAsPromised);

var spawn = chaiProcess.spawn;  // convinience to use shorter lines

it('succeeds if the process exits with return code 0', function () {
    return expect(spawn('node', ['simple-ok.js'])).to.eventually.succeed;
});

it('succeeds if the process exits with return code other than 0', function () {
    return expect(spawn('node', ['simple-ko.js'])).to.eventually.fail;
});

it('property returns the exit code', function () {
    return expect(spawn('node', ['simple-ko-alt.js'])).to.eventually.exitCode.eql(2);
});

it('property returns the execution time', function () {
    this.timeout(3000);
    return expect(spawn('node', ['delay-2s.js'])).to.eventually.seconds.within(2, 2.5);
});

it('method returns the childout standard output (stdio[1])', function() {
    return expect(spawn('node', ['io-stdout-1.js'])).to.eventually.stdout().eql('abcdefgh.\"+-*?1234\n');
});

it('method returns the childout standard error (stdio[2]) with specified encoding (ascii)', function() {
    return expect(spawn('node', ['io-stderr-1.js'])).to.eventually.stderr('ascii').eql('abcdefgh.\"+-*?1234\n');
});


```

API
---

###spawn(command, arguments, options)

Executes a [spawn](https://nodejs.org/dist/v4.2.2/docs/api/child_process.html#child_process_child_process_spawn_command_args_options)
function to create a subprocess.

The `command` and `arguments` parameters are the same documented in spawn (command to be executed and arguments to the command).

The `options` optional parameter (an object) allows the following properties:

- *cwd*: Execution directory, passed directly to `spawn`.
- *env*: Environment variables, passed directly to `spawn`.
- *detached*: Detached (true if the new process must not be child of the parent), passed directly to `spawn`.
- *uid*: User id, to execute as another user, passed directly to `spawn`.
- *gid*: Group id, to execute as another group, passed directly to `spawn`.
- *ipc*: To active the built-in interprocess communication. If specified, an 'ipc' file descriptor will be created
  after 'stderr'.
  
The standard I/O property (I/O) can't be specified directly, as it's used to capture the standard output and error. 

The result value is a [Promise](https://promisesaplus.com/), so it requires that the Chai-As-Promised plugin is installed,
and the use of `eventually` in the assertion chain.
  
#### Example
```
return expect(spawn('node', ['delay-2s.js'])).to.eventually.seconds.within(2, 2.5);
```


### succeed

Asserts if a process has executed without errors (exit code 0).

Depends totally in the exit code, so if your subject under test fails with code 0, it won't work.

#### Example

```
return expect(spawn('node', ['simple-ok.js'])).to.eventually.succeed;
```


### fail

Asserts if a process has executed with some error (exit code >0).

Depends totally in the exit code, so if your subject under test fails with code 0, it won't work.

#### Example

```
return expect(spawn('node', ['simple-ko.js'])).to.eventually.fail;
```


### exitCode

Returns the exit code of the subprocess. It allows to check ranges.

#### Example

```
return expect(spawn('node', ['simple-ko-alt.js'])).to.eventually.exitCode.eql(2);
```


### exitWithCode(n)

Asserts if a process exists with a concrete code. It's syntactic sugar for exitCode.eql(n).

#### Example

```
return expect(spawn('node', ['simple-ko-alt.js'])).to.eventually.exitWithCode(2);
```


###seconds, milliseconds, microseconds, nanoseconds

Returns the execution time (as seen from the node.js engine of the parent).
The different properties return the value in each unit. The units are a commodity, not a specification of precision.
Although it uses the `process.hrtime()` function and has it's value available even in nanoseconds,
don't expect much accuracy.

#### Example

```
return expect(spawn('node', ['delay-2s.js'])).to.eventually.seconds.within(2, 2.5);
```


###stdout(), stdout(encoding)

Returns the standard output of the process, as a unique string.
A default encoding is used unless the encoding parameter is used.

#### Examples

```
return expect(spawn('node', ['io-stdout-1.js'])).to.eventually.stdout().eql('abcdefgh.\"+-*?1234\n');
return expect(spawn('node', ['io-stdout-utf8.js'])).to.eventually.stdout('utf8').eql('¿?ÑÇ');
```

###stderr(), stderr(encoding)

Returns the standard error of the process, as a unique string.
A default encoding is used unless the encoding parameter is used.

#### Examples

```
return expect(spawn('node', ['io-stderr-1.js'])).to.eventually.stderr().eql('abcdefgh.\"+-*?1234\n');
return expect(spawn('node', ['io-stderr-utf8.js'])).to.eventually.stderr('utf8').eql('¿?ÑÇ');
```
