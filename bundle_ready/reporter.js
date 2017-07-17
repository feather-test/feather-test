var outputHistory = '';

function report (results, tab, options) {
    outputHistory = '';

    if (results.failed.length) {
        output('\nFailed tests:');
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

    if (options.reporterTargetElement) {
        var targets = document.querySelectorAll(options.reporterTargetElement);
        for (var i = 0, len = targets.length; i < len; i++) {
            targets[i].innerHTML = outputHistory.trim();
        }
    }
}

function output (message, indent) {
    var msg = message.replace(/\%\%/g, indent);
    console.log(msg);
    outputHistory += '\n' + msg;
}

module.exports = {
    output: output,
    report: report
};
