# agdq16-layouts
The on-stream graphics used during Awesome Games Done Quick 2016.

This is a [NodeCG](http://github.com/nodecg/nodecg) 0.7 bundle. You will need to have NodeCG 0.7 installed to run it.

## Video Walkthrough
[A ten-part video series explaining the structure and function of this NodeCG bundle.](https://www.youtube.com/playlist?list=PL1EO2PfU4nFnB4c40SzUpulvYvVmPxeTx)

## Installation
- Install to `nodecg/bundles/agdq16-layouts`.
- Install `bower` if you have not already (`npm install -g bower`)
- **WINDOWS**: Follow [these instructions](https://github.com/nodejs/node-gyp/issues/629#issuecomment-153196245) to set up a build chain to compile `agdq16-layouts`' dependencies.
- **LINUX**: Install `build-essential` and Python 2.7, which are needed to compile `agdq16-layouts`' dependencies.
- `cd nodecg/bundles/agdq16-layouts` and run `npm install`, then `bower install`
- Run `node ./download_boxart.js` to populate the boxart.
- Create the configuration file (see the [configuration][id] section below for more details)
- Run the nodecg server: `nodecg start` (or `node index.js` if you don't have nodecg-cli) from the `nodecg` root directory.
- Run the electron window:
  - For Windows:
    - Create a shortcut in the `bundles/agdq16-layouts` folder with the location set to
      `C:\path\to\nodecg\bundles\agdq16-layouts\node_modules\electron-prebuilt\dist\electron.exe` called Electron.
    - Next, edit the properties of the link you created, add ` electron.js --remote-debugging-port=9222` to the end of
      the `Target` value, and change the `Start in` folder to be `C:\path\to\nodecg\bundles\agdq16-layouts\`.
  - For Linux/Mac:
    - `cd` to the `bundles/agdq16-bundles` directory, then run `./node_modules/electron-prebuild/dist/electron electron.js --remote-debugging-port=9222`

Please note that you **must manually run `npm install` for this bundle**. NodeCG currently cannot reliably 
compile this bundle's npm dependencies. This is an issue we hope to address in the future.

## Usage
This bundle is not intended to be used verbatim. Many of the assets have been replaced with placeholders, and
most of the data sources are hardcoded. We are open-sourcing this bundle in hopes that people will use it as a
learning tool and base to build from, rather than just taking and using it wholesale in their own productions.

To reiterate, please don't just download and use this bundle as-is. Build something new from it.

[id]: configuration
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
