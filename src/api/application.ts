/* eslint-disable camelcase */
import ApiRequester from '../utils/api-requester';
import type { ListNodesResponse, ListCallNodesResponse } from '../domain/types';

export default ((client: ApiRequester, baseUrl: string) => ({
  bridgeCall(applicationUuid: string, callId: number, context: string, exten: string, autoanswer: string, displayed_caller_id_number: string | null | undefined): Promise<boolean> {
    const url = `${baseUrl}/${applicationUuid}/nodes`;
    const body = {
      calls: [{
        id: callId,
      }],
    };
    return client.post(url, body, null, (res: Record<string, any>) => res.json().then((response: Record<string, any>) => response.uuid)).then((nodeUuid: string) => client.post(`${url}/${nodeUuid}/calls`, {
      context,
      exten,
      autoanswer,
      displayed_caller_id_number,
    }).then((data: any) => ({
      nodeUuid,
      data,
    })));
  },

  answerCall: (applicationUuid: string, callId: number): Promise<boolean> => client.put(`${baseUrl}/${applicationUuid}/calls/${callId}/answer`, {}, null, ApiRequester.successResponseParser),

  calls: (applicationUuid: string): Promise<boolean> => client.get(`${baseUrl}/${applicationUuid}/calls`),

  hangupCall: (applicationUuid: string, callId: number): Promise<boolean> => client.delete(`${baseUrl}/${applicationUuid}/calls/${callId}`),

  startPlaybackCall: (applicationUuid: string, callId: number, language: string, uri: string): Promise<boolean> => client.post(`${baseUrl}/${applicationUuid}/calls/${callId}/playbacks`, {
    language,
    uri,
  }),

  stopPlaybackCall: (applicationUuid: string, playbackUuid: string): Promise<boolean> => client.delete(`${baseUrl}/${applicationUuid}/playbacks/${playbackUuid}`),

  startProgressCall: (applicationUuid: string, callId: number): Promise<boolean> => client.put(`${baseUrl}/${applicationUuid}/calls/${callId}/progress/start`, {}, null, ApiRequester.successResponseParser),

  stopProgressCall: (applicationUuid: string, callId: number): Promise<boolean> => client.put(`${baseUrl}/${applicationUuid}/calls/${callId}/progress/stop`, {}, null, ApiRequester.successResponseParser),

  startMohCall: (applicationUuid: string, callId: number, mohUuid: string): Promise<boolean> => client.put(`${baseUrl}/${applicationUuid}/calls/${callId}/moh/${mohUuid}/start`, {}, null, ApiRequester.successResponseParser),

  stopMohCall: (applicationUuid: string, callId: number): Promise<boolean> => client.put(`${baseUrl}/${applicationUuid}/calls/${callId}/moh/stop`, {}, null, ApiRequester.successResponseParser),

  startHoldCall: (applicationUuid: string, callId: number): Promise<boolean> => client.put(`${baseUrl}/${applicationUuid}/calls/${callId}/hold/start`, {}, null, ApiRequester.successResponseParser),

  stopHoldCall: (applicationUuid: string, callId: number): Promise<boolean> => client.put(`${baseUrl}/${applicationUuid}/calls/${callId}/hold/stop`, {}, null, ApiRequester.successResponseParser),

  startMuteCall: (applicationUuid: string, callId: number): Promise<boolean> => client.put(`${baseUrl}/${applicationUuid}/calls/${callId}/mute/start`, {}, null, ApiRequester.successResponseParser),

  stopMuteCall: (applicationUuid: string, callId: number): Promise<boolean> => client.put(`${baseUrl}/${applicationUuid}/calls/${callId}/mute/stop`, {}, null, ApiRequester.successResponseParser),

  sendDTMFCall: (applicationUuid: string, callId: number, digits: number): Promise<boolean> => client.put(`${baseUrl}/${applicationUuid}/calls/${callId}/dtmf`, {
    digits,
  }, null, ApiRequester.successResponseParser),

  addCallNodes: (applicationUuid: string, nodeUuid: string, callId: string): Promise<boolean> => client.put(`${baseUrl}/${applicationUuid}/nodes/${nodeUuid}/calls/${callId}`, {}, null, ApiRequester.successResponseParser),

  createNewNodeWithCall: (applicationUuid: string, calls: Array<Record<string, any>>): Promise<boolean> => client.post(`${baseUrl}/${applicationUuid}/nodes`, {
    calls,
  }),

  addNewCallNodes: (applicationUuid: string, nodeUuid: string, context: string, exten: string, autoanswer: string): Promise<boolean> => client.post(`${baseUrl}/${applicationUuid}/nodes/${nodeUuid}/calls`, {
    context,
    exten,
    autoanswer,
  }),

  listCallsNodes: (applicationUuid: string, nodeUuid: string): Promise<ListCallNodesResponse> => client.get(`${baseUrl}/${applicationUuid}/nodes/${nodeUuid}`),

  listNodes: (applicationUuid: string): Promise<ListNodesResponse> => client.get(`${baseUrl}/${applicationUuid}/nodes`),

  removeNode: (applicationUuid: string, nodeUuid: string): Promise<boolean> => client.delete(`${baseUrl}/${applicationUuid}/nodes/${nodeUuid}`),

  removeCallNodes: (applicationUuid: string, nodeUuid: string, callId: string): Promise<boolean> => client.delete(`${baseUrl}/${applicationUuid}/nodes/${nodeUuid}/calls/${callId}`),

  listSnoop: (applicationUuid: string): Promise<ListNodesResponse> => client.get(`${baseUrl}/${applicationUuid}/snoops`),

  removeSnoop: (applicationUuid: string, snoopUuid: string): Promise<boolean> => client.delete(`${baseUrl}/${applicationUuid}/snoops/${snoopUuid}`),

  viewSnoop: (applicationUuid: string, snoopUuid: string): Promise<ListNodesResponse> => client.get(`${baseUrl}/${applicationUuid}/snoops/${snoopUuid}`),

  createSnoop: (applicationUuid: string, callId: number, snoopingCallId: number, whisperMode: string): Promise<boolean> => client.post(`${baseUrl}/${applicationUuid}/calls/${callId}/snoops`, {
    snooping_call_id: snoopingCallId,
    whisper_mode: whisperMode,
  }),

  updateSnoop: (applicationUuid: string, snoopUuid: string, whisperMode: string): Promise<boolean> => client.put(`${baseUrl}/${applicationUuid}/snoops/${snoopUuid}`, {
    whisper_mode: whisperMode,
  }, null, ApiRequester.successResponseParser),
}));
