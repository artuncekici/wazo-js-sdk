import SipLine from '../SipLine';

describe('SipLine domain', () => {
  describe('Endpoint (20.13 and higher)', () => {
    it('can tell if we have videoConference capabilities', () => {
      const getSipLine = (endpointSectionOptions: any) => new SipLine({
        endpointSectionOptions,
      } as any);

      expect(getSipLine([['max_audio_streams', '1'], ['max_video_streams', '2']]).hasVideoConference()).toBe(true);
      expect(getSipLine([['max_audio_streams', '1'], ['max_video_streams', '1']]).hasVideoConference()).toBe(false);
      expect(getSipLine([['max_audio_streams', '2']]).hasVideoConference()).toBe(false);
      expect(getSipLine([['max_video_streams', '2']]).hasVideoConference()).toBe(false);
      expect(getSipLine([['max_audio_streams', '2'], ['max_video_streams', '2']]).hasVideoConference()).toBe(true);
    });
  });
  describe('Old Endpoint', () => {
    it('can tell if we have videoConference capabilities', () => {
      const getSipLine = (options: any) => new SipLine({
        options,
      } as any);

      expect(getSipLine([['max_audio_streams', '1'], ['max_video_streams', '2']]).hasVideoConference()).toBe(true);
      expect(getSipLine([['max_audio_streams', '1'], ['max_video_streams', '1']]).hasVideoConference()).toBe(false);
      expect(getSipLine([['max_audio_streams', '2']]).hasVideoConference()).toBe(false);
      expect(getSipLine([['max_video_streams', '2']]).hasVideoConference()).toBe(false);
      expect(getSipLine([['max_audio_streams', '2'], ['max_video_streams', '2']]).hasVideoConference()).toBe(true);
    });
  });
});
