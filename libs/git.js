/**
 * Created by Rem on 16.02.2015.
 */

var Q = require('q'),
    chp = require('child_process'),
    path = require('path'),
    fs = require('fs');

var Git = function(repoPath) {
    this.repoPath = repoPath;

    this.remoteStatuses = [
        'up-to-date',
        'ahead',
        'behind'
    ];
};

Git.prototype.command = function(repoPath, command) {
    var deferred = Q.defer();

    repoPath = path.resolve(repoPath);

    console.log('Try to exec command "git -C "' + repoPath + '" ' + command + '"'); // fixme

    chp.exec('git -C "' + repoPath + '" ' + command, function(err, stdout, stderr) {
        if (!err) {
            deferred.resolve([stdout, stderr]);
        }
    });

    return deferred.promise;
};

Git.prototype.status = function() {
    var deferred = Q.defer();
    var self = this;

    self.command(self.repoPath, 'status')
        .spread(function(stdout) {
            var outArr = stdout.split(/\r?\n/);
            var result = {};

            // TODO: cache last update timestamp

            // TODO: detached head
            result.currentBranch = outArr[0].replace(/^On branch (.*)$/i, '$1');

            // TODO: ahead/behind
            result.remoteBranch = outArr[1].replace(/^.*with '(.*)'.*$/i, '$1');
            result.remoteBranchStatus = self.remoteStatuses.indexOf(outArr[1].replace(/^Your branch is (.*) with.*$/i, '$1'));
            if (result.remoteBranchStatus === -1) {
                result.remoteBranchStatus = null;
            }

            var regExpTest = /^\s*new file:.*$/;
            var regExpReplace = /^\s*new file:\s*(.*)$/;
            result.newFiles = outArr
                .filter(function(el) {
                    return regExpTest.test(el);
                })
                .map(function(el) {
                    return el.replace(regExpReplace, '$1');
                });

            regExpTest = /^\s*modified:.*$/;
            regExpReplace = /^\s*modified:\s*(.*)$/;
            result.modifiedFiles = outArr
                .filter(function(el) {
                    return regExpTest.test(el);
                })
                .map(function(el) {
                    return el.replace(regExpReplace, '$1');
                });

            regExpReplace = /^\s+|\s+$/;
            result.untrackedFiles = stdout
                .replace(/^[\w\W]*Untracked files:[\w\W]*?\)\s*([\w\W]*)$/, '$1')
                .split(/\r?\n/)
                .map(function(el) {
                    return el.replace(regExpReplace, '');
                })
                .filter(function(el) {
                    return el.length > 0;
                });

            deferred.resolve(result);
        })
        .done();

    return deferred.promise;
};

Git.prototype.lastFetch = function() {
    var deferred = Q.defer();
    var self = this;

    fs.stat(path.resolve(self.repoPath, '.git/FETCH_HEAD'), function(err, stat) {
        if (!err) {
            deferred.resolve(stat.mtime);
        }
    });

    return deferred.promise;
};

Git.prototype.remotes = function() {
    var deferred = Q.defer();
    var self = this;

    self.command(self.repoPath, 'remote')
        .spread(function(stdout) {
            var regExpReplace = /^\s+|\s+$/;
            var result = stdout
                .split(/\r?\n/)
                .map(function(el) {
                    return el.replace(regExpReplace, '');
                })
                .filter(function(el) {
                    return el.length > 0;
                });

            Q
                .all(result.map(function(el) {
                    return self.command(self.repoPath, 'remote show ' + el);
                }))
                .then(function(remotes) {
                    remotes = remotes.map(function(remote) {
                        var outArr = remote[0].split(/\r?\n/);
                        var result = {};

                        result.remote = outArr[0].replace(/^.*remote (.*)$/, '$1');
                        result.url = outArr[1].replace(/^.*Fetch URL:\s*(.*)$/i, '$1');
                        result.branch = outArr[3].replace(/^.*HEAD branch:\s*(.*)$/i, '$1');

                        return result;
                    });

                    deferred.resolve(remotes);
                })
                .done();
        })
        .done();

    return deferred.promise;
};


Git.prototype.fetch = function(remote, branch) {
    var deferred = Q.defer();
    var self = this;

    self.command(self.repoPath, 'fetch ' + remote + ' ' + branch)
        .spread(function(stdout, stderr) {
            // data in stderr
            deferred.resolve();
        })
        .done();

    return deferred.promise;
};

module.exports = Git;