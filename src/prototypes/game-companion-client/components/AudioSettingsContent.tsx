import { useEffect, useState } from 'react'
import { Mic } from 'lucide-react'
import { inputDevices, outputDevices, type ClientSystemSettings } from '../data/systemSettingsMockData'

export function AudioSettingsContent({ settings, onChange }: { settings: ClientSystemSettings; onChange: (settings: ClientSystemSettings) => void }) {
  const [testing, setTesting] = useState(false)
  const [sample, setSample] = useState(0)
  useEffect(() => {
    if (!testing) return
    const timer = window.setInterval(() => setSample(value => (value + 1) % 8), 180)
    return () => window.clearInterval(timer)
  }, [testing])
  const level = testing ? Math.round([0.25, 0.5, 0.85, 0.65, 0.4, 0.75, 0.95, 0.35][sample] * settings.microphoneVolume) : 0
  return <section className="client-card system-settings-card">
    <h2><Mic size={18} />音频设置</h2>
    <div className="system-settings-row"><label htmlFor="audio-input-device">输入设备</label><select id="audio-input-device" value={settings.inputDevice} onChange={event => { setTesting(false); onChange({ ...settings, inputDevice: event.target.value }) }}>{inputDevices.map(device => <option key={device.id} value={device.id}>{device.name}</option>)}</select></div>
    <div className="system-settings-row"><label htmlFor="audio-output-device">输出设备</label><select id="audio-output-device" value={settings.outputDevice} onChange={event => onChange({ ...settings, outputDevice: event.target.value })}>{outputDevices.map(device => <option key={device.id} value={device.id}>{device.name}</option>)}</select></div>
    <div className="system-settings-row"><label htmlFor="microphone-volume">麦克风音量</label><div className="system-audio-volume"><input id="microphone-volume" type="range" min="0" max="100" value={settings.microphoneVolume} onChange={event => onChange({ ...settings, microphoneVolume: Number(event.target.value) })} /><output htmlFor="microphone-volume">{settings.microphoneVolume}%</output></div></div>
    <div className="system-settings-row"><label htmlFor="speaker-volume">扬声器音量</label><div className="system-audio-volume"><input id="speaker-volume" type="range" min="0" max="100" value={settings.speakerVolume} onChange={event => onChange({ ...settings, speakerVolume: Number(event.target.value) })} /><output htmlFor="speaker-volume">{settings.speakerVolume}%</output></div></div>
    <div className="system-settings-row"><span>试麦</span><div className="system-mic-test"><button type="button" className="client-button client-button--secondary" aria-pressed={testing} onClick={() => { setSample(0); setTesting(value => !value) }}>{testing ? '停止试麦' : '开始试麦'}</button><div className="system-mic-meter" role="meter" aria-label="模拟麦克风输入电平" aria-valuemin={0} aria-valuemax={100} aria-valuenow={level}>{Array.from({ length: 20 }, (_, index) => <span key={index} className={level > index * 5 ? 'is-active' : ''} />)}</div><span role="status">{testing ? settings.microphoneVolume === 0 ? '麦克风已静音' : '试麦中' : '未开始'}</span></div></div>
  </section>
}
