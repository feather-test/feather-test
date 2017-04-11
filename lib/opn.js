/**
 * Modified from https://github.com/sindresorhus/opn
 */

'use strict';
var path = require('path');
var childProcess = require('child_process');

module.exports = function (target, opts) {
	opts = opts || {};

	var cmd;
	var appArgs = [];
	var args = [];
	var cpOpts = {};

	if (Array.isArray(opts.app)) {
		appArgs = opts.app.slice(1);
		opts.app = opts.app[0];
	}

	if (process.platform === 'darwin') {
		cmd = 'open';

		if (opts.wait) {
			args.push('-W');
		}

		if (opts.app) {
			args.push('-a', opts.app);
		}
	} else if (process.platform === 'win32') {
		cmd = 'cmd';
		args.push('/c', 'start', '""');
		target = target.replace(/&/g, '^&');

		if (opts.wait) {
			args.push('/wait');
		}

		if (opts.app) {
			args.push(opts.app);
		}

		if (appArgs.length > 0) {
			args = args.concat(appArgs);
		}
	} else {
		if (opts.app) {
			cmd = opts.app;
		} else {
			cmd = path.join(__dirname, 'xdg-open');
		}

		if (appArgs.length > 0) {
			args = args.concat(appArgs);
		}

		if (!opts.wait) {
			// xdg-open will block the process unless
			// stdio is ignored even if it's unref'd
			cpOpts.stdio = 'ignore';
		}
	}

	args.push(target);

	if (process.platform === 'darwin' && appArgs.length > 0) {
		args.push('--args');
		args = args.concat(appArgs);
	}

    args.push('-n');
	args.push('--args');
	args.push('--user-data-dir=' + (opts.tmp || '/tmp/feather_test_browser'));
	args.push('--no-default-browser-check');
	args.push('--no-first-run');
	args.push('--disable-default-apps');
	args.push('--disable-popup-blocking');
	args.push('--disable-translate');
	args.push('--disable-background-timer-throttling');
	args.push('--disable-device-discovery-notifications');
	args.push('--auto-open-devtools-for-tabs');
	args.push('--incognito');


	return childProcess.spawn(cmd, args, cpOpts);
};
