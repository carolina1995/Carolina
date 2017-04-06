# Carolina Voice Recognition Facade.

[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badge/)


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
            callbacks: {
                context: this,
                onStart: function (args) { console.log('ON_START:: Callback => ', args); },
                onError: function (args) { console.log('ON_ERRPR:: Callback => ', args); },
                onEnd: function (args) { console.log('ON_END:: Callback => ', args); },
                onLiveStream: function (args) { console.log('ON_LIVE_STREAM:: Callback => ', args); },
                onChunkStream: function (args) { console.log('ON_CHUNK_STREAM:: Callback => ', args); },
                onInterimTranscript: function(args) { console.log('ON_INTERIM_TRANSCRIPT:: Callback => ', args) }
            }
        });

        Carolina.fn('start');
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