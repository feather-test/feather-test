
function report (results, tab) {
    if (results.failed.length) {
        output('');
        output('Failed tests:');
        results.failed.forEach(function (failure) {
            var indent = '';
            output('');
            failure.labels.forEach(function (label) {
                output(indent + label);
                indent += tab;
            });
            failure.failedExpectations.forEach(function (reason) {
                output(reason, indent);
            });
        });
        output('');
        output(results.failed.length + ' tests failed!');

    } else if (results.passed.length) {
        output('\nAll ' + results.passed.length + ' tests passed!');

    } else {
        output('\nNo tests ran.');
    }

    if (results.skipped.length) {
        output('\n(' + results.skipped.length + ' tests skipped)');
    }
}

function output (msg, indent) {
    console.log(msg.replace(/\%\%/g, indent));
}

module.exports = {
    output: output,
    report: report
};
