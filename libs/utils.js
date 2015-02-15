/**
 * Created by Rem on 16.02.2015.
 */


exports.dateFormat = function(date) {
    // TODO: format

    if (typeof date === 'undefined') {
        date = new Date();
    }

    return ('0' + date.getDate()).slice(-2) + '.'
           + ('0' + (date.getMonth() + 1)).slice(-2) + '.'
           + date.getFullYear() + ' '
           + ('0' + date.getHours()).slice(-2) + ':'
           + ('0' + date.getMinutes()).slice(-2) + ':'
           + ('0' + date.getSeconds()).slice(-2) + '.'
           + ('00' + date.getMilliseconds()).slice(-3);
};