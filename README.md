# Carolina Voice Recognition.

[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badge/)


Library Introduction
---------------
Tiny library only 4KB!


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

How to use this library
---------------
```
    <script>
        Carolina.init({
            lang: 'he',
            debug: true,
            continuous: false,
            interimResults: false,
            maxAlternatives: 1,
            quality: 1, // Should be 0 or 1, when 0 is the most poor quality and 1 is the heights.
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

    // Clean the current stream while the service on start in still activated most use case to use it, it when you use stream speaking.
    Carolina.fn('cleanStream');

    // A flag that represent when the service is active and listening to user.
    Carolina.fn('isListening');

    // This function represent the status of our library if it health contion, qulity of the service and configuration watch.
    Carolina.fn('doctor');
    </script>
```

Test & Coverage
---------------

A healthy application is a tested one ;),
For unit test with Mocha, Chai, Isparta(coverage)

```gulp
# Run in cmd or whatever tool your kick in gulp task
gulp coverage

This well create a coverage folder, and run all unit test in the test root folder.
```