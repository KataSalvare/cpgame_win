export type ClientSystemSettings = { pushToTalkShortcut: string; screenRecordingPath: string; roomRecordingPath: string; inputDevice: string; outputDevice: string; microphoneVolume: number; speakerVolume: number }
export const defaultSystemSettings: ClientSystemSettings = {
  pushToTalkShortcut: 'F2',
  inputDevice: 'default-input',
  outputDevice: 'default-output',
  microphoneVolume: 80,
  speakerVolume: 60,
  screenRecordingPath: 'C:\\Users\\Player\\Videos\\超速电竞',
  roomRecordingPath: 'C:\\Users\\Player\\Music\\超速电竞',
}

export const inputDevices = [
  { id: 'default-input', name: '系统默认输入设备' },
  { id: 'headset-mic', name: '耳麦麦克风（USB Headset）' },
  { id: 'built-in-mic', name: '内置麦克风（Realtek Audio）' },
]
export const outputDevices = [
  { id: 'default-output', name: '系统默认输出设备' },
  { id: 'headset-speaker', name: '耳机（USB Headset）' },
  { id: 'built-in-speaker', name: '扬声器（Realtek Audio）' },
]
