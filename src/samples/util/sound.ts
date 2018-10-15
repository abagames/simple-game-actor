import { transpose, scale, Scale } from "tonal";
import * as Soundfont from "soundfont-player";
import { range } from "./math";

const win: any = window;
win.AudioContext = win.AudioContext || win.webkitAudioContext;
const audioContext = new AudioContext();
let instruments = {};

export function loadInstrument(name) {
  Soundfont.instrument(audioContext, name, {
    soundfont: "FluidR3_GM"
  }).then(inst => {
    instruments[name] = inst;
  });
}

export function getNotes(_scale, baseNote, octaveFrom, octaveTo) {
  return Array.prototype.concat.apply(
    [],
    range(octaveTo - octaveFrom + 1).map(oi =>
      scale(_scale)
        .map(transpose(`${baseNote}${octaveFrom + oi}`))
        .filter((_, i) => i % 2 === 0)
    )
  );
}

export function play(
  instrumentName,
  notes: string[],
  index: number,
  count = 1
) {
  if (audioContext == null) {
    return;
  }
  const inst = instruments[instrumentName];
  if (inst == null) {
    return;
  }
  range(count).forEach(i => {
    const ni = i + index;
    if (ni < 0 || ni >= notes.length) {
      return;
    }
    inst.play(notes[ni], audioContext.currentTime + 0.1);
  });
}

export function resumeAudioContext() {
  if (audioContext == null || audioContext.state !== "suspended") {
    return;
  }
  audioContext.resume();
}
