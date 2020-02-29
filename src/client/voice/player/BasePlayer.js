'use strict';

const EventEmitter = require('events');
const { Readable: ReadableStream } = require('stream');
const prism = require('prism-media');
const StreamDispatcher = require('../dispatcher/StreamDispatcher');

const FFMPEG_ARGUMENTS = {
  DEFAULT: [
    '-analyzeduration', '0',
    '-loglevel', '0',
    '-f', 's16le',
    '-ar', '48000',
    '-ac', '2',
  ],
  OGGOPUS: bitrate => [
    '-analyzeduration', '0',
    '-loglevel', '0',
    '-acodec', 'libopus',
    '-b:a', `${bitrate}K`,
    '-f', 'opus',
    '-ar', '48000',
    '-ac', '2',
  ],
};

/**
 * An Audio Player for a Voice Connection.
 * @private
 * @extends {EventEmitter}
 */
class BasePlayer extends EventEmitter {
  constructor() {
    super();

    this.dispatcher = null;

    this.streamingData = {
      channels: 2,
      sequence: 0,
      timestamp: 0,
    };
  }

  destroy() {
    this.destroyDispatcher();
  }

  destroyDispatcher() {
    if (this.dispatcher) {
      this.dispatcher.destroy();
      this.dispatcher = null;
    }
  }

  playUnknown(input, options) {
    this.destroyDispatcher();

    const isStream = input instanceof ReadableStream;
    const isFFmpegOpus = options.volume === false && prism.FFmpeg.load().info.includes('--enable-libopus');

    let bitrate;
    if (options.bitrate) {
      bitrate = options.bitrate;
    } else if (this.voiceConnection && this.voiceConnection.channel) {
      bitrate = this.voiceConnection.channel.bitrate / 1000;
    }

    let args = isFFmpegOpus ? FFMPEG_ARGUMENTS.OGGOPUS(bitrate || 48).slice() : FFMPEG_ARGUMENTS.DEFAULT.slice();

    if (!isStream) args.unshift('-i', input);

    if (options.seek) args.unshift('-ss', String(options.seek));

    const ffmpeg = new prism.FFmpeg({ args });
    const streams = { ffmpeg };
    if (isStream) {
      streams.input = input;
      input.pipe(ffmpeg);
    }

    if (isFFmpegOpus) {
      return this.playOpusStream(ffmpeg.pipe(new prism.opus.OggDemuxer()), options, streams);
    } else {
      return this.playPCMStream(ffmpeg, options, streams);
    }
  }

  playPCMStream(stream, options, streams = {}) {
    this.destroyDispatcher();
    const opus = (streams.opus = new prism.opus.Encoder({ channels: 2, rate: 48000, frameSize: 960 }));
    if (options && options.volume === false) {
      stream.pipe(opus);
      return this.playOpusStream(opus, options, streams);
    }
    streams.volume = new prism.VolumeTransformer({ type: 's16le', volume: options ? options.volume : 1 });
    stream.pipe(streams.volume).pipe(opus);
    return this.playOpusStream(opus, options, streams);
  }

  playOpusStream(stream, options, streams = {}) {
    this.destroyDispatcher();
    streams.opus = stream;
    if (options.volume !== false && !streams.input) {
      streams.input = stream;
      const decoder = new prism.opus.Decoder({ channels: 2, rate: 48000, frameSize: 960 });
      streams.volume = new prism.VolumeTransformer({ type: 's16le', volume: options ? options.volume : 1 });
      streams.opus = stream
        .pipe(decoder)
        .pipe(streams.volume)
        .pipe(new prism.opus.Encoder({ channels: 2, rate: 48000, frameSize: 960 }));
    }
    const dispatcher = this.createDispatcher(options, streams);
    streams.opus.pipe(dispatcher);
    return dispatcher;
  }

  createDispatcher(options, streams, broadcast) {
    this.destroyDispatcher();
    const dispatcher = (this.dispatcher = new StreamDispatcher(this, options, streams, broadcast));
    return dispatcher;
  }
}

module.exports = BasePlayer;
