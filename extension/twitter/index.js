/* jshint -W106 */
'use strict';

var path = require('path');
var app = require('express')();
var jEmoji = require('emoji');
var TwitterStream = require('twitter-stream-api');

module.exports = function(nodecg) {
    if (!nodecg.bundleConfig) {
        nodecg.log.error('cfg/agdq16-layouts.json was not found. Twitter integration will be disabled.');
        return;
    } else if (typeof nodecg.bundleConfig.twitter === 'undefined') {
        nodecg.log.error('"twitter" is not defined in cfg/agdq16-layouts.json! ' +
            'Twitter integration will be disabled.');
        return;
    }

    var TARGET_USER_ID = nodecg.bundleConfig.twitter.userId;

    // Create a route to serve the emoji lib
    app.get('/agdq16-layouts/emoji.png', function(req, res) {
        var emojiPNGPath = path.resolve(__dirname, '../../node_modules/emoji/lib/emoji.png');
        res.sendFile(emojiPNGPath);
    });
    app.get('/agdq16-layouts/emoji.css', function(req, res) {
        var emojiCSSPath = path.resolve(__dirname, '../../node_modules/emoji/lib/emoji.css');
        res.sendFile(emojiCSSPath);
    });
    app.get('/agdq16-layouts/twitter/shared.css', function(req, res) {
        var sharedCSSPath = path.resolve(__dirname, 'shared.css');
        res.sendFile(sharedCSSPath);
    });
    nodecg.mount(app);

    var tweets = nodecg.Replicant('tweets', {defaultValue: []});

    var userStream = new TwitterStream({
        consumer_key: nodecg.bundleConfig.twitter.consumerKey,
        consumer_secret: nodecg.bundleConfig.twitter.consumerSecret,
        token: nodecg.bundleConfig.twitter.accessTokenKey,
        token_secret: nodecg.bundleConfig.twitter.accessTokenSecret
    });

    userStream.on('data', function (data) {
        // We discard quoted statuses because we can't show them.
        if (data.quoted_status) return;

        if (data.event) {
            switch (data.event) {
                case 'favorite':
                    handleFavorite(data);
                    break;
                case 'unfavorite':
                    handleUnfavorite(data);
                    break;
            }
        }

        else if (data.delete) {
            handleDelete(data);
        }

        else if (data.retweeted_status) {
            handleRetweet(data);
        }

        else if (data.text) {
            handleStatus(data);
        }
    });

    function handleStatus(status) {
        if (status.user.id_str !== TARGET_USER_ID) return;

        // Filter out @ replies
        if (status.text.charAt(0) === '@') return;
        addTweet(status);
    }

    function handleRetweet(retweet) {
        if (retweet.user.id_str !== TARGET_USER_ID) return;
        var retweetedStatus = retweet.retweeted_status;
        retweetedStatus.gdqRetweetId = retweet.id_str;
        addTweet(retweetedStatus);
    }

    function handleDelete(event) {
        removeTweetById(event.delete.status.id_str);
    }

    function handleFavorite(favorite) {
        if (favorite.source.id_str !== TARGET_USER_ID) return;
        addTweet(favorite.target_object);
    }

    function handleUnfavorite(unfavorite) {
        if (unfavorite.source.id_str !== TARGET_USER_ID) return;
        removeTweetById(unfavorite.target_object.id_str);
    }

    userStream.on('error', function (error) {
        nodecg.log.error('[twitter]', error.stack);
    });

    userStream.on('connection success', function () {
        nodecg.log.info('[twitter] Connection success.');
    });

    userStream.on('connection aborted', function () {
        nodecg.log.error('[twitter] Connection aborted!');
    });

    userStream.on('connection error network', function (error) {
        nodecg.log.error('[twitter] Connection error network:', error.stack);
    });

    userStream.on('connection error stall', function () {
        nodecg.log.error('[twitter] Connection error stall!');
    });

    userStream.on('connection error http', function (httpStatusCode) {
        nodecg.log.error('[twitter] Connection error HTTP:', httpStatusCode);
    });

    userStream.on('connection rate limit', function (httpStatusCode) {
        nodecg.log.error('[twitter] Connection rate limit:', httpStatusCode);
    });

    userStream.on('connection error unknown', function (error) {
        nodecg.log.error('[twitter] Connection error unknown:', error.stack);
        userStream.close();
    });

    userStream.stream('user', {thisObjectCantBeNull: true});

    nodecg.listenFor('acceptTweet', function(tweet) {
        removeTweetById(tweet.id_str);
        nodecg.sendMessage('showTweet', tweet);
    });

    nodecg.listenFor('rejectTweet', removeTweetById);

    function addTweet(tweet) {
        // Parse pictures and add them to the tweet object as a simply array of URL strings.
        var imageUrls = [];
        if (tweet.extended_entities) {
            tweet.extended_entities.media.forEach(function(medium) {
                if (medium.type === 'photo') {
                    imageUrls.push(medium.media_url + ':large');
                    tweet.text = tweet.text.split(medium.url).join('');
                }
            });
            tweet.text.trim();

        }
        tweet.imageUrls = imageUrls;

        // Highlight the #AGDQ2016 hashtag
        var HASHTAG = '#AGDQ2016';
        tweet.text = tweet.text.split(HASHTAG).join('<span class="agdqHashtag">' + HASHTAG + '</span>');

        // Parse emoji in tweet body
        tweet.text = jEmoji.unifiedToHTML(tweet.text);

        // Add the tweet to the list
        tweets.value.push(tweet);
    }

    function removeTweetById(idToRemove) {
        if (typeof idToRemove !== 'string') {
            throw new Error('[twitter] Must provide a string ID when removing a tweet. ID provided was: ', idToRemove);
        }

        var removedTweet;
        tweets.value.some(function(tweet, index) {
            if (tweet.id_str === idToRemove || tweet.gdqRetweetId === idToRemove) {
                tweets.value.splice(index, 1);
                removedTweet = true;
                return true;
            }
        });
        return removedTweet;
    }

    /*nodecg.listenFor('getTweet', function(url) {
        var id = url.split('/').pop();
        twitter.get('statuses/show', {id: id, include_my_retweet: false}, function(error, tw){
            if (error) {
                nodecg.log.error('Couldn\'t get tweet:', error[0].message);
                return;
            }

            tweet.value = tw;
        });
    });*/
};
