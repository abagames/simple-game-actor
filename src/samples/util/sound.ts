// @ts-ignore
import { transpose, scale, Scale } from "tonal";
// @ts-ignore
import * as Soundfont from "soundfont-player";
import { range } from "./math";

const win: any = window;
win.AudioContext = win.AudioContext || win.webkitAudioContext;
const audioContext = new AudioContext();
let instruments: { [s: string]: any } = {};

export function loadInstrument(name: string) {
  Soundfont.instrument(audioContext, name, {
    soundfont: "FluidR3_GM"
  }).then((inst: any) => {
    instruments[name] = inst;
  });
}

export function getNotes(
  _scale: string,
  baseNote: string,
  octaveFrom: number,
  octaveTo: number
) {
  return Array.prototype.concat.apply(
    [],
    range(octaveTo - octaveFrom + 1).map(oi =>
      scale(_scale)
        .map(transpose(`${baseNote}${octaveFrom + oi}`))
        .filter((_: any, i: number) => i % 2 === 0)
    )
  );
}

export function play(
  instrumentName: string,
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
