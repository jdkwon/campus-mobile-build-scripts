var exec = require('child_process').exec;
var fs = require('fs');
var Orchestrator = require('orchestrator');
var orchestrator = new Orchestrator();

var PROJECT_NAME = 'bld';
var RC_BRANCH = 'v5.0-rc';
var CWD = process.cwd(); // current directory

// download repo from GitHub
var cmd = 'git clone https://github.com/UCSD/campus-mobile ' + PROJECT_NAME;

orchestrator.add('clone-repo', function(callback) {
    console.log("Cloning repository.");

    var child = exec(cmd, function(error, stdout, stderr) {
        if (error == null) {
            console.log("Clone successful.");
            callback(null); // continue with the build process
        } else {
            console.log('Error cloning repository.');
        }
    });
});

orchestrator.add('change-to-release-branch', ['clone-repo'], function(callback) {
    console.log("Checking out release branch.");

    process.chdir(CWD + '/' + PROJECT_NAME);

    var child = exec('git checkout ' + RC_BRANCH, function(error, stdout, stderr) {
        if (error == null) {
            console.log('Release branch check out successful.');
            callback(null);
        } else {
            console.log('Error checking out release branch.');
        }
    });
});

orchestrator.add('prepare-repo', ['change-to-release-branch'], function(callback) {
    console.log("Running npm install.");

    process.chdir(CWD + '/' + PROJECT_NAME);
    var child = exec('npm install', function(error, stdout, stderr) {
        if (error == null) {
            console.log('npm install successful.');
            callback(null);
        } else {
            console.log('Error running npm install.');
        }
    });
});

orchestrator.add('replace-key-strings', ['prepare-repo'], function(callback) {
    console.log("Replacing select key string values.");

    process.chdir(CWD + '/' + PROJECT_NAME);

    var child = exec('npm run-script insert-production-values', function(error, stdout, stderr) {
        if (error == null) {
            console.log('Replaced key strings successful.');
            callback(null);
        } else {
            console.log('Error replacing key strings.');
        }
    });
});

orchestrator.add('apply-fixes', ['replace-key-strings'], function(callback) {
    console.log("Applying fixes.");

    process.chdir(CWD + '/' + PROJECT_NAME);

    var child = exec('npm run-script apply-fixes', function(error, stdout, stderr) {
        if (error == null) {
            console.log('Applied fixes');
            callback(null);
        } else {
            console.log('Error applying fixes');
        }
    });
});

orchestrator.add('copy-keystore-to-project', ['apply-fixes'], function(callback) {
    console.log("Copying keystore to project.");

    process.chdir(CWD + '/' + PROJECT_NAME + '/android/app');

    var child = exec('cp ~/ucsd-release-key.keystore ./', function(error, stdout, stderr) {
        if (error == null) {
            console.log('Keystore copy successful.');
            callback(null);
        } else {
            console.log('Error copying keystore.');
        }
    });
});

orchestrator.add('generate-signed-apk', ['copy-keystore-to-project'], function(callback) {
    console.log("Generating signed APK.");

    process.chdir(CWD + '/' + PROJECT_NAME + '/android');

    var child = exec('./gradlew assembleRelease', function(error, stdout, stderr) {
        if (error == null) {
            console.log('Generate APK successful');
            callback(null);
        } else {
            console.log('Error generating APK ' + error);
        }
    });
});

orchestrator.start(
    'clone-repo',
    'change-to-release-branch',
    'prepare-repo',
    'replace-key-strings',
    'apply-fixes',
    'copy-keystore-to-project',
    'generate-signed-apk'
);
