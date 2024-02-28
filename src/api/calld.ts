/* eslint-disable camelcase */
import ApiRequester from '../utils/api-requester';
import type { UUID } from '../domain/types';
import Relocation, { RelocationResponse } from '../domain/Relocation';
import ChatMessage, { ChatMessageListResponse } from '../domain/ChatMessage';
import Voicemail from '../domain/Voicemail';
import Call, { CallResponse } from '../domain/Call';
import IndirectTransfer from '../domain/IndirectTransfer';
import MeetingStatus from '../domain/MeetingStatus';

type CallQuery = {
  from_mobile: boolean;
  extension: string;
  line_id?: number;
  all_lines?: boolean;
};

export interface CallD {
  updatePresence: (presence: string) => Promise<boolean>;
  listMessages: (participantUuid: UUID | null | undefined, limit?: number) => Promise<Array<ChatMessage>>;
  sendMessage: (alias: string, msg: string, toUserId: string) => Promise<boolean>;
  makeCall: (extension: string, fromMobile: boolean, lineId: number | null | undefined, allLines: boolean | null | undefined) => Promise<CallResponse>;
  cancelCall: (callId: string) => Promise<boolean>;
  listCalls: () => Promise<Array<Call>>;
  relocateCall: (callId: string, destination: string, lineId: number | null | undefined, contact?: string | null | undefined) => Promise<Relocation>;
  listVoicemails: () => Promise<Array<Voicemail>>;
  deleteVoicemail: (voicemailId: string) => Promise<boolean>;
  getVoicemailUrl: (voicemail: Voicemail) => string;
  fetchSwitchboardHeldCalls: (switchboardUuid: UUID) => Promise<any>; // @TODO: replace `any`
  holdSwitchboardCall: (switchboardUuid: UUID, callId: string) => Promise<boolean>;
  answerSwitchboardHeldCall: (switchboardUuid: UUID, callId: string, lineId: string | null | undefined) => Promise<void>;
  fetchSwitchboardQueuedCalls: (switchboardUuid: UUID) => Promise<any>; // @TODO: replace `any`
  answerSwitchboardQueuedCall: (switchboardUuid: UUID, callId: string, lineId: string | null | undefined) => Promise<any>; // @TODO: replace `any`
  sendFax: (extension: string, fax: string, callerId?: string) => Promise<void>;
  getConferenceParticipantsAsUser: (conferenceId: string) => Promise<Record<string, any>>; // @TODO: replace `any`
  getMeetingParticipantsAsUser: (meetingUuid: string) => Promise<Record<string, any>>; // @TODO: replace `any`
  banMeetingParticipant: (meetingUuid: string, participantUuid: string) => Promise<boolean>;
  listTrunks: () => Promise<any>;
  mute: (callId: string) => Promise<boolean>;
  unmute: (callId: string) => Promise<boolean>;
  hold: (callId: string) => Promise<boolean>;
  resume: (callId: string) => Promise<boolean>;
  // eslint-disable-next-line camelcase
  transferCall: (initiator_call: string, exten: string, flow: string) => Promise<IndirectTransfer>;
  confirmCallTransfer: (transferId: string) => Promise<boolean>;
  cancelCallTransfer: (transferId: string) => Promise<boolean>;
  sendDTMF: (callId: string, digits: string) => Promise<boolean>;
  // @deprecated: check for engine version >= 20.12 instead
  isAhHocConferenceAPIEnabled: () => Promise<boolean>;
  createAdHocConference: (hostCallId: string, participantCallIds: string[]) => Promise<any>; // @TODO: replace `any`
  addAdHocConferenceParticipant: (conferenceId: string, callId: string) => Promise<boolean>;
  removeAdHocConferenceParticipant: (conferenceId: string, participantCallId: string) => Promise<boolean>;
  deleteAdHocConference: (conferenceId: string) => Promise<boolean>;
  startRecording: (callId: string) => Promise<boolean>;
  stopRecording: (callId: string) => Promise<boolean>;
  pauseRecording: (callId: string) => Promise<boolean>;
  resumeRecording: (callId: string) => Promise<boolean>;
  guestGetMeetingStatus: (meetingUuid: string) => Promise<MeetingStatus>
}

export default ((client: ApiRequester, baseUrl: string): CallD => ({
  updatePresence: (presence: string): Promise<boolean> => client.put(`${baseUrl}/users/me/presences`, {
    presence,
  }, null, ApiRequester.successResponseParser),
  listMessages: (participantUuid: UUID | null | undefined, limit?: number): Promise<Array<ChatMessage>> => {
    const query: Record<string, any> = {};

    if (participantUuid) {
      query.participant_user_uuid = participantUuid;
    }

    if (limit) {
      query.limit = limit;
    }

    return client.get(`${baseUrl}/users/me/chats`, query).then((response: ChatMessageListResponse) => ChatMessage.parseMany(response));
  },
  sendMessage: (alias: string, msg: string, toUserId: string) => {
    const body = {
      alias,
      msg,
      to: toUserId,
    };
    return client.post(`${baseUrl}/users/me/chats`, body, null, ApiRequester.successResponseParser);
  },
  makeCall: (extension: string, fromMobile: boolean, lineId: number | null | undefined, allLines: boolean | null | undefined = false): Promise<CallResponse> => {
    const query: CallQuery = {
      from_mobile: fromMobile,
      extension,
    };

    if (lineId) {
      query.line_id = lineId;
    }

    if (allLines) {
      query.all_lines = true;
    }

    return client.post(`${baseUrl}/users/me/calls`, query);
  },
  cancelCall: (callId: string): Promise<boolean> => client.delete(`${baseUrl}/users/me/calls/${callId}`, null),
  listCalls: (): Promise<Array<Call>> => client.get(`${baseUrl}/users/me/calls`, null).then((response: any) => Call.parseMany(response.items)),

  relocateCall(callId: string, destination: string, lineId: number | null | undefined, contact?: string | null | undefined): Promise<Relocation> {
    const body: Record<string, any> = {
      completions: ['answer'],
      destination,
      initiator_call: callId,
      auto_answer: true,
    };

    if (lineId || contact) {
      body.location = {};
    }

    if (lineId) {
      body.location.line_id = lineId;
    }

    if (contact) {
      body.location.contact = contact;
    }

    return client.post(`${baseUrl}/users/me/relocates`, body).then((response: RelocationResponse) => Relocation.parse(response));
  },

  listVoicemails: (): Promise<Array<Voicemail>> => client.get(`${baseUrl}/users/me/voicemails`).then((response: any) => Voicemail.parseMany(response)),
  deleteVoicemail: (voicemailId: string): Promise<boolean> => client.delete(`${baseUrl}/users/me/voicemails/messages/${voicemailId}`),
  getVoicemailUrl: (voicemail: Voicemail): string => {
    const body = {
      token: client.token,
    };
    return client.computeUrl('get', `${baseUrl}/users/me/voicemails/messages/${voicemail.id}/recording`, body);
  },
  fetchSwitchboardHeldCalls: (switchboardUuid: UUID) => client.get(`${baseUrl}/switchboards/${switchboardUuid}/calls/held`),
  holdSwitchboardCall: (switchboardUuid: UUID, callId: string) => client.put(`${baseUrl}/switchboards/${switchboardUuid}/calls/held/${callId}`, null, null, ApiRequester.successResponseParser),
  answerSwitchboardHeldCall: (switchboardUuid: UUID, callId: string, lineId: string | null | undefined = null) => client.put(`${baseUrl}/switchboards/${switchboardUuid}/calls/held/${callId}/answer${lineId ? `?line_id=${lineId}` : ''}`),
  fetchSwitchboardQueuedCalls: (switchboardUuid: UUID) => client.get(`${baseUrl}/switchboards/${switchboardUuid}/calls/queued`),
  answerSwitchboardQueuedCall: (switchboardUuid: UUID, callId: string, lineId: string | null | undefined = null) => client.put(`${baseUrl}/switchboards/${switchboardUuid}/calls/queued/${callId}/answer${lineId ? `?line_id=${lineId}` : ''}`),
  sendFax: (extension: string, fax: string, callerId?: string) => {
    const headers = {
      'Content-type': 'application/pdf',
      'X-Auth-Token': client.token,
    };
    const params = ApiRequester.getQueryString({
      extension,
      caller_id: callerId,
    });
    return client.post(`${baseUrl}/users/me/faxes?${params}`, fax, headers);
  },
  getConferenceParticipantsAsUser: async (conferenceId: string): Promise<Record<string, any>> => client.get(`${baseUrl}/users/me/conferences/${conferenceId}/participants`),
  getMeetingParticipantsAsUser: async (meetingUuid: string): Promise<Record<string, any>> => client.get(`${baseUrl}/users/me/meetings/${meetingUuid}/participants`),
  banMeetingParticipant: (meetingUuid: string, participantUuid: string) => client.delete(`${baseUrl}/users/me/meetings/${meetingUuid}/participants/${participantUuid}`, null, null, ApiRequester.successResponseParser),
  listTrunks: () => client.get(`${baseUrl}/trunks`),
  mute: (callId: string) => client.put(`${baseUrl}/users/me/calls/${callId}/mute/start`, null, null, ApiRequester.successResponseParser),
  unmute: (callId: string) => client.put(`${baseUrl}/users/me/calls/${callId}/mute/stop`, null, null, ApiRequester.successResponseParser),
  hold: (callId: string) => client.put(`${baseUrl}/users/me/calls/${callId}/hold/start`, null, null, ApiRequester.successResponseParser),
  resume: (callId: string) => client.put(`${baseUrl}/users/me/calls/${callId}/hold/stop`, null, null, ApiRequester.successResponseParser),
  // eslint-disable-next-line camelcase
  transferCall: (initiator_call: string, exten: string, flow: string) => client.post(`${baseUrl}/users/me/transfers`, {
    initiator_call,
    exten,
    flow,
  }).then(IndirectTransfer.parseFromApi),
  confirmCallTransfer: (transferId: string): Promise<boolean> => client.put(`${baseUrl}/users/me/transfers/${transferId}/complete`, null, null, ApiRequester.successResponseParser),
  cancelCallTransfer: (transferId: string): Promise<boolean> => client.delete(`${baseUrl}/users/me/transfers/${transferId}`, null, null, ApiRequester.successResponseParser),
  sendDTMF: (callId: string, digits: string) => client.put(`${baseUrl}/users/me/calls/${callId}/dtmf?digits=${encodeURIComponent(digits)}`, null, null, ApiRequester.successResponseParser),
  // @deprecated: check for engine version >= 20.12 instead
  isAhHocConferenceAPIEnabled: () => client.head(`${baseUrl}/users/me/conferences/adhoc`, null, null, ApiRequester.successResponseParser),
  createAdHocConference: (hostCallId: string, participantCallIds: string[]) => client.post(`${baseUrl}/users/me/conferences/adhoc`, {
    host_call_id: hostCallId,
    participant_call_ids: participantCallIds,
  }),
  addAdHocConferenceParticipant: (conferenceId: string, callId: string) => client.put(`${baseUrl}/users/me/conferences/adhoc/${conferenceId}/participants/${callId}`, null, null, ApiRequester.successResponseParser),
  removeAdHocConferenceParticipant: (conferenceId: string, participantCallId: string) => client.delete(`${baseUrl}/users/me/conferences/adhoc/${conferenceId}/participants/${participantCallId}`, null, null, ApiRequester.successResponseParser),
  deleteAdHocConference: (conferenceId: string) => client.delete(`${baseUrl}/users/me/conferences/adhoc/${conferenceId}`, null, null, ApiRequester.successResponseParser),
  startRecording: (callId: string) => client.put(`${baseUrl}/users/me/calls/${callId}/record/start`, null, null, ApiRequester.successResponseParser),
  stopRecording: (callId: string) => client.put(`${baseUrl}/users/me/calls/${callId}/record/stop`, null, null, ApiRequester.successResponseParser),
  pauseRecording: (callId: string) => client.put(`${baseUrl}/users/me/calls/${callId}/record/pause`, null, null, ApiRequester.successResponseParser),
  resumeRecording: (callId: string) => client.put(`${baseUrl}/users/me/calls/${callId}/record/resume`, null, null, ApiRequester.successResponseParser),
  guestGetMeetingStatus: (meetingUuid: string): Promise<MeetingStatus> => client.get(`${baseUrl}/guests/me/meetings/${meetingUuid}/status`).then(MeetingStatus.parse),
}));
