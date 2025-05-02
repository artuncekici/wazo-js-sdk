import moment from 'moment';
import newFrom from '../utils/new-from';

export const RECORDING_STATE = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PAUSED: 'paused',
} as const;

export type RecordingStateType = typeof RECORDING_STATE [keyof typeof RECORDING_STATE];

export type CallResponse = {
  call_id: string;
  sip_call_id: string;
  caller_id_name: string;
  caller_id_number: string;
  peer_caller_id_name: string;
  peer_caller_id_number: string;
  dialed_extension: string;
  status: string;
  is_caller: boolean;
  is_video?: boolean;
  line_id: number | null | undefined;
  creation_time: string;
  answer_time: string;
  hangup_time: string;
  on_hold: boolean;
  muted: boolean;
  talking_to: Record<string, any>;
  record_state: RecordingStateType;
};
type CallArguments = {
  id: string;
  sipCallId: string;
  isCaller: boolean;
  isVideo?: boolean;
  callerName: string;
  callerNumber: string;
  calleeName: string;
  calleeNumber: string;
  dialedExtension: string;
  lineId: number | null | undefined;
  onHold: boolean;
  muted: boolean;
  status: string;
  startingTime: Date;
  answerTime: Date;
  hangupTime: Date;
  talkingToIds: string[];
  recording: boolean;
  recordingPaused: boolean;
  recordingState: RecordingStateType;
};
export default class Call {
  type: string;

  id: string;

  sipCallId: string;

  callerName: string;

  callerNumber: string;

  calleeName: string;

  calleeNumber: string;

  dialedExtension: string;

  lineId: number | null | undefined;

  isCaller: boolean;

  isVideo: boolean;

  onHold: boolean;

  muted: boolean;

  status: string;

  startingTime: Date;

  answerTime: Date;

  hangupTime: Date;

  talkingToIds: string[];

  recording: boolean;

  recordingPaused?: boolean;

  recordingState?: RecordingStateType;

  static parseMany(plain: Array<CallResponse>): Array<Call> {
    if (!plain) {
      return [];
    }

    return plain.map((plainCall: CallResponse) => Call.parse(plainCall));
  }

  static parse(plain: CallResponse): Call {
    return new Call({
      id: plain.call_id,
      sipCallId: plain.sip_call_id,
      callerName: plain.caller_id_name,
      callerNumber: plain.caller_id_number,
      calleeName: plain.peer_caller_id_name,
      calleeNumber: plain.peer_caller_id_number,
      dialedExtension: plain.dialed_extension,
      isCaller: plain.is_caller,
      isVideo: plain.is_video,
      muted: plain.muted,
      onHold: plain.on_hold,
      status: plain.status,
      lineId: plain.line_id,
      startingTime: moment(plain.creation_time).toDate(),
      answerTime: moment(plain.answer_time).toDate(),
      hangupTime: moment(plain.hangup_time).toDate(),
      talkingToIds: Object.keys(plain.talking_to || {}),
      recording: plain.record_state === RECORDING_STATE.ACTIVE,
      recordingPaused: plain.record_state === RECORDING_STATE.PAUSED,
      recordingState: plain.record_state,
    });
  }

  static newFrom(call: Call) {
    return newFrom(call, Call);
  }

  constructor({
    id,
    sipCallId,
    callerName,
    callerNumber,
    calleeName,
    calleeNumber,
    dialedExtension,
    isCaller,
    isVideo,
    lineId,
    muted,
    onHold,
    status,
    startingTime,
    answerTime,
    hangupTime,
    talkingToIds,
    recording,
    recordingPaused,
    recordingState,
  }: CallArguments) {
    this.id = id;
    this.sipCallId = sipCallId;
    this.callerName = callerName;
    this.callerNumber = callerNumber;
    this.calleeName = calleeName;
    this.calleeNumber = calleeNumber;
    this.dialedExtension = dialedExtension;
    this.muted = muted;
    this.onHold = onHold;
    this.isCaller = isCaller;
    this.lineId = lineId;
    this.status = status;
    this.startingTime = startingTime;
    this.answerTime = answerTime;
    this.hangupTime = hangupTime;
    this.talkingToIds = talkingToIds || [];
    this.recording = recording;
    this.recordingPaused = recordingPaused;
    this.recordingState = recordingState || RECORDING_STATE.INACTIVE;
    this.isVideo = !!isVideo;
    // Useful to compare instead of instanceof with minified code
    this.type = 'Call';
  }

  getElapsedTimeInSeconds(): number {
    const now = Date.now();
    return (now - +this.startingTime) / 1000;
  }

  separateCalleeName(): {
    firstName: string;
    lastName: string;
  } {
    const names = this.calleeName.split(' ');
    const firstName = names[0];
    const lastName = names.slice(1).join(' ');
    return {
      firstName,
      lastName,
    };
  }

  is(other: Call | null | undefined): boolean {
    return !!other && this.id === other.id;
  }

  hasACalleeName(): boolean {
    return this.calleeName.length > 0;
  }

  hasNumber(number: string): boolean {
    return this.calleeNumber === number;
  }

  isUp(): boolean {
    return this.status === 'Up';
  }

  isDown(): boolean {
    return this.status === 'Down';
  }

  isRinging(): boolean {
    return this.isRingingIncoming() || this.isRingingOutgoing();
  }

  isRingingIncoming(): boolean {
    return this.status === 'Ringing';
  }

  isRingingOutgoing(): boolean {
    return this.status === 'Ring';
  }

  isFromTransfer(): boolean {
    return this.status === 'Down' || this.status === 'Ringing';
  }

  isOnHold(): boolean {
    return this.onHold;
  }

  putOnHold(): void {
    this.onHold = true;
  }

  resume(): void {
    this.onHold = false;
  }

  isRecording(): boolean {
    return this.recording;
  }

  isRecordingPaused(): boolean {
    return !!this.recordingPaused;
  }

}
