/* global MediaStream, RTCPeerConnection */
import { parseCandidate } from '../../utils/webrtc';
import isMobile from '../../utils/isMobile';

const checkIsIPV4 = (ip: string) => {
  const blocks = ip.split('.');

  if (blocks.length !== 4) {
    return false;
  }

  return blocks.every(block => parseInt(block, 10) >= 0 && parseInt(block, 10) <= 255);
};

export default {
  name: 'Non IP v4 ice',
  check: (server: string, session: any, externalAppConfig: Record<string, any>) => new Promise((resolve, reject) => {
    if (typeof MediaStream === 'undefined') {
      resolve('Skipped on node');
      return;
    }

    const mobile = isMobile();
    const offerOptions = {
      offerToReceiveAudio: 1,
    };
    const ips: string[] = [];
    const config: RTCConfiguration = {
      iceServers: [{
        urls: 'stun:stun1.l.google.com:19302',
      }, {
        urls: 'stun:stun2.l.google.com:19302',
      }],
    };
    let hasSrflxOrRelay = false;

    if (externalAppConfig && externalAppConfig.stun_servers) {
      config.iceServers = { ...externalAppConfig.stun_servers.split(',').map((url: string) => ({
        urls: url,
      })),
      ...config.iceServers,
      };
    }

    if (externalAppConfig && externalAppConfig.turn_servers) {
      config.iceServers = [...JSON.parse(externalAppConfig.turn_servers), ...(config.iceServers || [])];
      // Force to use TURN when defined in config
      config.iceTransportPolicy = 'relay';
    }

    const pc = new RTCPeerConnection(config);
    pc.createDataChannel('wazo-check-ipv4');

    pc.onicecandidate = e => {
      if (e.candidate) {
        const rawCandidate = e.candidate.candidate;

        if (rawCandidate.indexOf('srflx') !== -1 || rawCandidate.indexOf('relay') !== -1) {
          hasSrflxOrRelay = true;
          const candidate = parseCandidate(e.candidate.candidate);
          ips.push(candidate.ip);
        }
      } else if (!e.candidate) {
        if (!hasSrflxOrRelay) {
          return reject(new Error('No `srflx` or `relay` found in candidate. Please consider using a TURN server.'));
        }

        if (ips.every(checkIsIPV4)) {
          resolve(null);
        } else {
          const nonIPV4 = ips.find(ip => !checkIsIPV4(ip));
          reject(new Error(`Non IPv4 ice candidate found : ${nonIPV4}.`));
        }
      }
    };

    // @ts-ignore
    pc.createOffer(offerOptions).then(offer => pc.setLocalDescription(offer)).then(description => (mobile ? pc.createOffer(offerOptions) : description)).then(sessionDescription => (mobile ? pc.setLocalDescription(sessionDescription) : sessionDescription));
  }),
};
