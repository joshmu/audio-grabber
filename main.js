// Imports modules.
const fs = require('fs'),
  path = require('path');
const AudioRecorder = require('node-audioRecorder');
// Constants.
const DIRECTORY = 'recordings';

// Options
// Options is an optional parameter for the constructor call.
// If an option is not given the default value, as seen below, will be used.
const options = {
  program: process.platform === 'win32' ? 'sox' : 'rec', // Which program to use, either `arecord`, `rec`, or `sox`.
  device: null,       // Recording device to use. (only for `arecord`)
  bits: 16,           // Sample size. (only for `rec` and `sox`)
  channels: 1,        // Channel count.
  encoding: `signed-integer`,  // Encoding type. (only for `rec` and `sox`)
  format: `S16_LE`,   // Encoding type. (only for `arecord`)
  rate: 16000,        // Sample rate.
  type: `wav`,        // Format type.

  // Following options only available when using `rec` or `sox`.
  silence: 2,         // Duration of silence in seconds before it stops recording.
  thresholdStart: 0.8,  // Silence threshold to start recording.
  thresholdStop: 0.1,   // Silence threshold to stop recording.
  keepSilence: false   // Keep the silence in the recording.
};

// Initialize recorder and file stream.
const audioRecorder = new AudioRecorder(options, console);

// Create path to write recordings to.
if (!fs.existsSync(DIRECTORY)){
  fs.mkdirSync(DIRECTORY);
}

const init = () => {

    const fileName = path.join(DIRECTORY, `${createTimestampName()}.wav`);
    console.log('Writing new recording file at: ', fileName);

    // Create write stream.
    const fileStream = fs.createWriteStream(fileName, { encoding: 'binary' });
    // Start and write to the file.
    audioRecorder.start().stream().pipe(fileStream);

    // Log information on the following events
    audioRecorder.stream().on('close', function(code) {
      console.warn('Recording closed. Exit code: ', code);
    });

    audioRecorder.stream().on('end', function() {
      console.warn('Recording ended.');
      init()
    });
    audioRecorder.stream().on('error', function() {
      console.warn('Recording error.');
    });

    // Write incoming data out the console.
    // TODO: how to detect volume change?
    audioRecorder.stream().on(`data`, function(chunk) {
      console.log(chunk);
    });

    // Keep process alive.
    process.stdin.resume();
    console.warn('Press ctrl+c to exit.');

}

init()

// Create file path with timestamp as name.
function createTimestampName() {
    const t = new Date()

    const hours = t.getHours();
    const mins = t.getMinutes();
    const secs = t.getSeconds();
    const day = t.getDate();
    const month = t.getMonth() + 1;
    const year = t.getFullYear();

    const format = `${hours}h${mins}m${secs}s (${day}-${month}-${year})`
    return format
}
