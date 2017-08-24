var outputHistory = '';

function report (results, tab, options) {
    options = options || {};
    tab = tab || '   ';
    outputHistory = '';

    if (results.failed.length) {
        sendToOutput('\nFailed tests:');
        results.failed.forEach(function (failure) {
            var indent = '';
            sendToOutput('');
            failure.labels.forEach(function (label) {
                sendToOutput(indent + label);
                indent += tab;
            });
            failure.failedExpectations.forEach(function (reason) {
                sendToOutput(reason, indent);
            });
        });
        sendToOutput('');
        sendToOutput(results.failed.length + ' tests failed!');
        if (options.exitProcessWhenFailing) {
            process.exit(1);
        }

    } else if (results.passed.length) {
        sendToOutput('\nAll ' + results.passed.length + ' tests passed!');

    } else {
        sendToOutput('\nNo tests ran.');
    }

    if (results.skipped.length) {
        sendToOutput('\n(' + results.skipped.length + ' tests skipped)');
    }

    if (options.reporterTargetElement) {
        var targets = document.querySelectorAll(options.reporterTargetElement);
        for (var i = 0, len = targets.length; i < len; i++) {
            targets[i].innerHTML = outputHistory.trim();
        }
    }
}

function sendToOutput (message, indent) {
    var msg = message.replace(/\%\%/g, indent);
    outputHistory += '\n' + msg;
    output(msg);
}

function output (message) {
    console.log(message);
}

module.exports = {
    output: output,
    report: report
};
