var outputHistory = '';

function report (results, tab, options) {
    options = options || {};
    tab = tab || '   ';
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
                outputError(reason, indent);
            });
        });
        output('');
        output(results.failed.length + ' tests failed!');
        if (options.exitProcessWhenFailing) {
            process.exit(1);
        }

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

function output (message, indent, _logger) {
    _logger = _logger || console.log;
    var msg = message.replace(/\%\%/g, indent);
    _logger(msg);
    outputHistory += '\n' + msg;
}

function outputError(message, indent) {
    output(message, indent, console.error);
}

module.exports = {
    output: output,
    report: report
};
