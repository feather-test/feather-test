var outputHistory = '';

function loopTests(resultArr, tab, callback) {
    resultArr.forEach(function (item) {
        var indent = '';
        output('');
        item.labels.forEach(function (label) {
            output(indent + label);
            indent += tab;
        });
        if (callback && typeof callback === 'function') {
            callback(item, indent);
        }
    });
}

function report (results, tab, options) {
    options = options || {};
    tab = tab || '   ';
    outputHistory = '';

    if (results.failed.length) {
        output('\nFailed tests:');
        loopTests(results.failed, tab, function (failure) {
            failure.failedExpectations.forEach(function (reason, indent) {
                output(reason, indent);
            });
        })
        output('');
        var totalNumTests = results.passed.length + results.failed.length;
        output(results.failed.length + '/' + totalNumTests + ' tests failed!');
        if (options.exitProcessWhenFailing) {
            process.exit(1);
        }

    } else if (results.passed.length) {
        output('\nAll ' + results.passed.length + ' tests passed!');

    } else {
        output('\nNo tests ran.');
    }

    if (results.slow.length) {
        output('\n' + results.slow.length + ' slow tests:');
        loopTests(results.slow, tab);
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
