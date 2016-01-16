# agdq16-layouts
The on-stream graphics used during Awesome Games Done Quick 2016.

This is a [NodeCG](http://github.com/nodecg/nodecg) 0.7 bundle. You will need to have NodeCG 0.7 installed to run it.

## Installation
- Install to `nodecg/bundles/agdq16-layouts`.
- Start NodeCG once and let it fully boot. This will install `agdq16-layout`'s dependencies.
 - Alternatively, run `npm install` and `bower install` from `nodecg/bundles/agdq16-layouts` yourself.
- Run `node nodecg/bundles/agdq16-layouts/download_boxart.js` to populate the boxart.

## Usage
This bundle is not intended to be used verbatim. Many of the assets have been replaced with placeholders, and
most of the data sources are hardcoded. We are open-sourcing this bundle in hopes that people will use it as a
learning tool and base to build from, rather than just taking and using it wholesale in their own productions.

To reiterate, please don't just download and use this bundle as-is. Build something new from it.

## Configuration
To configure this bundle, create and edit `nodecg/cfg/agdq16-layouts.json`.  
Refer to [configschema.json][] for the structure of this file.
[configschema.json]: configschema.json

Example config:
```json
{
  "enableRestApi": true,
  "x32": {
    "address": "192.168.1.10",
    "gameAudioChannels": [
      {
        "sd": 17,
        "hd": 25
      },
      {
        "sd": 19,
        "hd": 27
      },
      {
        "sd": 21,
        "hd": null
      },
      {
        "sd": 23,
        "hd": null
      }
    ]
  },
  "twitter": {
    "userId": "1234",
    "consumerKey": "aaa",
    "consumerSecret": "bbb",
    "accessTokenKey": "ccc",
    "accessTokenSecret": "ddd"
  },
  "lastfm": {
    "apiKey": "eee",
    "secret": "fff",
    "targetAccount": "youraccount"
  },
  "debug": true
}
```

## Timer REST API
There is a REST API to integrate with the footpedal that [@TestRunnerSRL](https://github.com/TestRunnerSRL)
built for the runners to start and stop the timer themselves. 
This REST API is **completely unsecured** and **anyone will be able to manipulate the timers**. 
As such, it is **not safe to run on the public internet**. Only activate the REST API on a secure local network.

To activate the Timer REST API, create `nodecg/cfg/agdq16-layouts.json` with the following content:
```
{
    "enableRestApi": true
}
```

### GET /agdq16-layouts/stopwatches
Returns a JSON array containing all 4 stopwatches.

### PUT /agdq16-layouts/stopwatch/:index/start
Starts (or resumes, if paused/finished) one of the four stopwatches. Index is zero-based.
If index is 'all', starts all stopwatches. Responds with the current status of the affected stopwatch(es).

### PUT /agdq16-layouts/stopwatch/:index/pause
Pauses one of the four stopwatches. Index is zero-based.
If index is 'all', pauses all stopwatches. Paused stopwatches have a gray background in the layouts.
Responds with the current status of the affected stopwatch(es).

### PUT /agdq16-layouts/stopwatch/:index/finish
Finishes one of the four stopwatches. Index is zero-based.
If index is 'all', finishes all stopwatches. Finished stopwatches have a green background in the layouts.
Responds with the current status of the affected stopwatch(es).

### PUT /agdq16-layouts/stopwatch/:index/reset
Resets one of the four stopwatches to 00:00:00 and stops it. Index is zero-based.
If index is 'all', resets all stopwatches. Responds with the current status of the affected stopwatch(es).

### PUT /agdq16-layouts/stopwatch/:index/startfinish
If the stopwatch *is not* running, this starts it. If the stopwatch *is* running, this sets it to "finished".
Index is zero-based. If index is 'all', resets all stopwatches. 
Responds with the current status of the affected stopwatch(es).

## Fonts
agdq16-layouts relies on the following [TypeKit](https://typekit.com/) fonts and weights:

 - Proxima Nova
  - Semibold
  - Bold
  - Extrabold
  - Black

If you wish to access agdq16-layouts from anything other than `localhost`, 
you will need to make your own TypeKit with these fonts and whitelist the appropriate addresses.

## License
agdq16-layouts is provided under the Apache v2 license, which is available to read in the [LICENSE][] file.
[license]: LICENSE

### Credits
Developed by [Support Class](http://supportclass.net/)
 - [Alex "Lange" Van Camp](https://twitter.com/VanCamp/), developer  
 - [Chris Hanel](https://twitter.com/ChrisHanel), designer
