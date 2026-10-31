// Preloaded into every suite. A suite whose awaited work never settles lets the
// event loop drain and Node exit normally; this keeps that exit a failure.
// Suites set exitCode to 0 only once their main promise resolves.
process.exitCode = 1;
