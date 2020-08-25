// @flow
import Line from '../Line';
import CallSession from '../CallSession';

export type PhoneEventCallbacks = {
  onCallIncoming?: (number: string) => {},
  onCallOutgoing?: (number: string) => {},
  onCallRinging?: () => void,
  onCallAccepted?: () => void,
  onCallHeld?: () => void,
  onCallResumed?: () => void,
  onCallMuted?: () => void,
  onCallUnmuted?: () => void,
  onCallEnded?: () => {},
  onCallFailed?: (message: string) => {},
};

type PhoneVoid = Promise<void> | void;

export type AvailablePhoneOptions = {
  accept: boolean,
  addParticipant: boolean,
  decline: boolean,
  hold: boolean,
  merge: boolean,
  mute: boolean,
  record: boolean,
  sendKey: boolean,
  transfer: boolean,
};

export interface Phone {
  accept(callSession: CallSession, enableVideo: boolean): Promise<string | null>;

  addToConference(participants: CallSession[]): PhoneVoid;

  changeAudioDevice(id: string): PhoneVoid;

  changeRingDevice(id: string): PhoneVoid;

  changeAudioVolume(volume: number): PhoneVoid;

  changeRingVolume(volume: number): PhoneVoid;

  changeAudioInputDevice(id: string): ?Promise<?MediaStream>;

  changeVideoInputDevice(id: string): ?Promise<?MediaStream>;

  onConnectionMade(): PhoneVoid;

  close(): PhoneVoid;

  disableRinging(): PhoneVoid;

  enableRinging(): PhoneVoid;

  endCurrentCall(CallSession: CallSession): PhoneVoid;

  getLocalStreamForCall(callSession: CallSession): boolean;

  getOptions(): AvailablePhoneOptions;

  getRemoteStreamForCall(callSession: CallSession): boolean;

  ignore(callSession: CallSession): PhoneVoid;

  hangup(callSession: CallSession): PhoneVoid;

  hangupConference(participants: CallSession[]): PhoneVoid;

  hasAnActiveCall(): boolean;

  hold(callSession: CallSession): PhoneVoid;

  holdConference(participants: CallSession[]): PhoneVoid;

  indirectTransfer(source: CallSession, destination: CallSession): PhoneVoid;

  initiateCTIIndirectTransfer(callSession: CallSession, number: string): PhoneVoid;

  cancelCTIIndirectTransfer(transferId: string): PhoneVoid;

  confirmCTIIndirectTransfer(transferId: string): PhoneVoid;

  isCallUsingVideo(callSession: CallSession): boolean;

  isWebRTC(): boolean;

  getUserAgent(): string;

  makeCall(number: string, line: Line, enableVideo?: boolean): ?CallSession | Promise<?CallSession>;

  mute(callSession: CallSession): PhoneVoid;

  muteConference(participants: CallSession[]): PhoneVoid;

  reject(callSession: CallSession): PhoneVoid;

  removeFromConference(participants: CallSession[]): PhoneVoid;

  resume(callSession: CallSession): PhoneVoid;

  resumeConference(participants: CallSession[]): PhoneVoid;

  sendKey(callSession: CallSession, tone: string): PhoneVoid;

  startConference(participants: CallSession[]): PhoneVoid;

  transfer(callSession: CallSession, target: string): PhoneVoid;

  turnCameraOff(callSession: CallSession): PhoneVoid;

  turnCameraOn(callSession: CallSession): PhoneVoid;

  unmute(callSession: CallSession): PhoneVoid;

  setActiveSipSession(callSession: CallSession): PhoneVoid;

  unmuteConference(participants: CallSession[]): PhoneVoid;

  isRegistered(): boolean;

  hasIncomingCallSession(): boolean;
}
