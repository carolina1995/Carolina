# Carolina.js

<img src="https://cloud.githubusercontent.com/assets/23419176/25229312/688d9f9c-25d8-11e7-8939-bc95584dce2c.png" align="right" />
> Easily convert speech voice to text!

[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badge/)

Library Support
---------------
Android-Browser: We Support Chrome, Firefox, Default Android Browser.
Android-Cordova: Fully Supported
IOS-Browser: Not Supported
IOS-Cordova: Fully Supported


Library Introduction
---------------
Very tiny library only 10KB!.

This lib will make your life easy when we speaking about the new hot topic for today voice recognition,

with only simple callback we will delivery full lifecycle of user interaction with voice recognition.

This is an open source library an any one can fork it use it or add a issue and we will fix.


Getting Started
---------------

The easiest way to get started is to clone the repository:

```bash
# Get the latest snapshot
git clone --depth=1 https://github.com/sayeko/Carolina.git myproject

# Change directory
cd myproject

# Install NPM dependencies
npm install

# Install gulp globally
npm i gulp -g

# Then simply start your app with the automation tool gulp
gulp
```

How to initialize the library
---------------
```
    <script>
        Carolina.init({
            lang: 'en-GB',
            logLevel: 2, // 0 is NO_LOGS , 1 INFO_MODE, 2 DEBUG_MODE, 3 ULTRA_DEBUG_MODE.
            continuous: false,
            interimResults: false,
            maxAlternatives: 1,
            quality: 1, // 0 is BAD QUALITY result capture and 1 is GOOD QUALITY result capture.
            // The callbacks are the lifecycle of the carolina voice recognition service and thier name is very explnatory so there is no point to describe each of them.
            callbacks: {
                context: this,
                onStart: function (args) { console.log('ON_START:: Callback => ', args); },
                onError: function (args) { console.log('ON_ERRPR:: Callback => ', args); },
                onEnd: function (args) { console.log('ON_END:: Callback => ', args); },
                onLiveStream: function (args) { console.log('ON_LIVE_STREAM:: Callback => ', args); },
                onChunkStream: function (args) { console.log('ON_CHUNK_STREAM:: Callback => ', args); },
                onInterimTranscript: function(args) { console.log('ON_INTERIM_TRANSCRIPT:: Callback => ', args) },
                onSoundStart: function (args) { console.log('ON_SOUND_START:: Callback => ', args); },
                onNoMatch: function (args) { console.log('ON_NO_MATCH:: Callback => ', args); },
                onSoundEnd: function (args) { console.log('ON_SOUND_END:: Callback => ', args); },
                onSpeechStart: function (args) { console.log('ON_SPEECH_START:: Callback => ', args); },
                onSpeechEnd: function (args) { console.log('ON_SPEECH_END:: Callback => ', args); },
                onBadQuality: function (args) { console.log('ON_BAD_QUALITY:: Callback => ', args); }
            }
        });

        Carolina.fn('start');
    </script>

    <script>
    // API!
    // Start the service the browser will ask for the right premission.
    Carolina.fn('start');


    // Stop the service and call the onEnd event.
    Carolina.fn('stop');


    // Abort same as the stop behavior , stop the service and kill the webkit chrome instance for speech recognition.
    Carolina.fn('abort');


    // A flag that represent when the service is active and listening to user.
    Carolina.fn('isListening');


    // This function represent the status of our library if it health contion, qulity of the service and configuration watch.
    Carolina.fn('doctor');
    </script>
```

Test & Coverage
---------------

Soon.