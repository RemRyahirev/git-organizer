/**
 * Created by Rem on 15.02.2015.
 */

var Q = require('q'),
    chp = require('child_process'),
    path = require('path'),
    utils = require('./libs/utils');

//var repoPath = 'c:/Node/tagsaudio';
var repoPath = 'c:/Node/git-organizer/test/repo_client';

//var test = function() {
//    var deferred = Q.defer();
//
//    chp.exec('git -C "' + repoPath + '" status', function(err, stdout, stderr) {
//        console.log(err, stdout, stderr);
//        deferred.resolve();
//    });
//
//    return deferred.promise;
//};
//
//test();

var Git = require('./libs/git');

var git = new Git(repoPath);
git.status()
    .then(function(results) {
        console.log(results);
    })
    .then(function() {
        return git.lastFetch();
    })
    .then(function(lastFetch) {
        console.log('last fetch:', utils.dateFormat(lastFetch));
    })
    .then(function() {
        return git.remotes();
    })
    .then(function(remotes) {
        console.log('remotes:', remotes);

        return git.fetch(remotes[0].remote, remotes[0].branch);
    })
    .then(function() {
        console.log('---------------');
        console.log('Done!');
    })
    .fail(function(err) {
        console.log('Error:', err);
    })
    .done();