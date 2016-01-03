/* jshint -W106 */
(function () {
    'use strict';

    var tweetsContainer = document.getElementById('tweets');
    var tweets = nodecg.Replicant('tweets');
    var disabledCover = document.getElementById('cover');
    var empty = document.getElementById('empty');
    var layoutName = disabledCover.querySelector('.layoutName');

    tweets.on('change', function (oldVal, newVal) {
        empty.style.display = newVal.length > 0 ? 'none' : 'flex';

        // Remove existing tweets from div
        while (tweetsContainer.firstChild) {
            tweetsContainer.removeChild(tweetsContainer.firstChild);
        }

        var sortedTweets = newVal.slice(0);
        sortedTweets.sort(function (a, b) {
            return new Date(b.created_at) - new Date(a.created_at);
        });

        sortedTweets.forEach(function(tweet) {
            var tweetItem = document.createElement('tweet-item');
            tweetItem.value = tweet;
            tweetsContainer.appendChild(tweetItem);
        });
    });

    var layoutState = nodecg.Replicant('layoutState');
    layoutState.on('change', function (oldVal, newVal) {
        if (newVal.page === 'open') {
            layoutName.innerHTML = newVal.currentLayout;
            switch (newVal.currentLayout) {
                case '4x3_4':
                    layoutName.innerHTML = '3x2_4, 4x3_4';
                /* falls through */
                case 'ds':
                    disabledCover.reason = 'badLayout';
                    break;
                default:
                    disabledCover.reason = null;
            }
        }

        else {
            disabledCover.reason = newVal.page;
        }
    });
})();
