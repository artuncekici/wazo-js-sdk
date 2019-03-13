/* @flow */
import ApiRequester from '../utils/api-requester';
import type { UUID, Token } from '../domain/types';
import Profile from '../domain/Profile';

type PresenceResponse = {
  lines: Array<{ id: number, state: string }>,
  sessions: Array<{ mobile: boolean, uuid: string }>,
  state: string,
  status: string,
  user_uuid: string
};

export default (client: ApiRequester, baseUrl: string) => ({
  updatePresence: (token: Token, contactUuid: UUID, state: string): Promise<Boolean> =>
    client.put(`${baseUrl}/users/${contactUuid}/presences`, { state }, token, ApiRequester.successResponseParser),

  getPresence: async (token: Token, contactUuid: UUID): Promise<string> =>
    client
      .get(`${baseUrl}/users/${contactUuid}/presences`, null, token)
      .then((response: PresenceResponse) => response.state),

  getContactStatusInfo: async (token: Token, contactUuid: UUID): Promise<PresenceResponse> =>
    client.get(`${baseUrl}/users/${contactUuid}/presences`, null, token).then((response: PresenceResponse) => response),

  getLineState: async (token: Token, contactUuid: UUID): Promise<string> =>
    client
      .get(`${baseUrl}/users/${contactUuid}/presences`, null, token)
      .then((response: PresenceResponse) => Profile.getLinesState(response.lines))
});
