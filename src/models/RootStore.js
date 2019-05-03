/* global JitsiMeetJS */
import { types } from 'mobx-state-tree';
import ConnectionStore from './ConnectionStore';

export async function createEnvironment() {
  const env = {};
  env.jitsiMeet = JitsiMeetJS;
  env.connectionOptions = {
    hosts: {
      domain: 'meet.jit.si',

      muc: 'conference.meet.jit.si', // FIXME: use XEP-0030
      focus: 'focus.meet.jit.si'
    },
    disableSimulcast: false,
    enableRemb: false,
    enableTcc: true,
    resolution: 720,
    constraints: {
      video: {
        aspectRatio: 16 / 9,
        height: {
          ideal: 720,
          max: 720,
          min: 240
        }
      }
    },
    externalConnectUrl: '//meet.jit.si/http-pre-bind',
    analyticsScriptUrls: ['https://meet.jit.si/libs/analytics-ga.js'],
    googleAnalyticsTrackingId: 'UA-319188-14',
    p2pStunServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ],
    enableP2P: true, // flag to control P2P connections
    // New P2P options
    p2p: {
      enabled: true,
      preferH264: true,
      disableH264: true,
      useStunTurn: true, // use XEP-0215 to fetch STUN and TURN server for the P2P connection
      stunServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    },
    useStunTurn: true, // use XEP-0215 to fetch STUN and TURN server for the JVB connection
    useIPv6: false, // ipv6 support. use at your own risk
    useNicks: false,
    bosh: 'https://meet.jit.si/http-bind', // FIXME: use xep-0156 for that

    etherpad_base: 'https://meet.jit.si/etherpad/p/',
    clientNode: 'http://jitsi.org/jitsimeet', // The name of client node advertised in XEP-0115 'c' stanza
    // ! deprecated desktop sharing settings, included only because older version of jitsi-meet require them
    desktopSharing: 'ext', // Desktop sharing method. Can be set to 'ext', 'webrtc' or false to disable.
    chromeExtensionId: 'kglhbbefdnlheedjiejgomgmfplipfeb', // Id of desktop streamer Chrome extension
    desktopSharingSources: ['screen', 'window'],
    googleApiApplicationClientID:
      '39065779381-bbhnkrgibtf4p0j9ne5vsq7bm49t1tlf.apps.googleusercontent.com',
    microsoftApiApplicationClientID: '00000000-0000-0000-0000-000040240063',
    enableCalendarIntegration: true,
    // !new desktop sharing settings
    desktopSharingChromeExtId: 'kglhbbefdnlheedjiejgomgmfplipfeb', // Id of desktop streamer Chrome extension
    desktopSharingChromeDisabled: false,
    desktopSharingChromeSources: ['screen', 'window', 'tab'],
    desktopSharingChromeMinExtVersion: '0.2.6.2', // Required version of Chrome extension
    desktopSharingFirefoxExtId: '',
    desktopSharingFirefoxDisabled: false,
    desktopSharingFirefoxMaxVersionExtRequired: '0',
    desktopSharingFirefoxExtensionURL: '',
    useRoomAsSharedDocumentName: false,
    enableLipSync: false, // Disables lip-sync everywhere.
    disableRtx: false, // Enables RTX everywhere
    enableRtpStats: false, // Enables RTP stats processing
    enableStatsID: true,
    openBridgeChannel: 'websocket', // One of true, 'datachannel', or 'websocket'
    channelLastN: -1, // The default value of the channel attribute last-n.
    minHDHeight: 540,
    startBitrate: '800',
    disableAudioLevels: false,
    useRtcpMux: true,
    useBundle: true,
    disableSuspendVideo: true,
    stereo: false,
    forceJVB121Ratio: -1,
    enableTalkWhileMuted: true,

    enableClosePage: true,

    callStatsCustomScriptUrl:
      'https://api.callstats.io/static/callstats-ws.min.js',

    hiddenDomain: 'recorder.meet.jit.si',
    dropbox: {
      appKey: '3v5iyto7n7az02w'
    },
    transcribingEnabled: false,
    enableRecording: true,
    liveStreamingEnabled: true,
    fileRecordingsEnabled: true,
    fileRecordingsServiceEnabled: false,
    requireDisplayName: false,
    recordingType: 'jibri',
    enableWelcomePage: true,
    isBrand: false,
    logStats: false,
    // To enable sending statistics to callstats.io you should provide Applicaiton ID and Secret.
    callStatsID: '347489791', //Application ID for callstats.io API
    callStatsSecret: '169aw6v+hk9TbVuHN2SiDCgfkkU=', //Secret for callstats.io API
    dialInNumbersUrl: 'https://api.jitsi.net/phoneNumberList',
    dialInConfCodeUrl: 'https://api.jitsi.net/conferenceMapper',

    dialOutCodesUrl: 'https://api.jitsi.net/countrycodes',
    dialOutAuthUrl: 'https://api.jitsi.net/authorizephone',
    peopleSearchUrl: 'https://api.jitsi.net/directorySearch',
    inviteServiceUrl: 'https://api.jitsi.net/conferenceInvite',
    inviteServiceCallFlowsUrl:
      'https://api.jitsi.net/conferenceinvitecallflows',
    peopleSearchQueryTypes: ['user', 'conferenceRooms'],
    startAudioMuted: 9,
    startVideoMuted: 9,
    enableUserRolesBasedOnToken: false,
    atlassianAnalyticsEventUrl:
      'https://analytics.atlassian.com/analytics/event',
    atlassianAnalyticsEvent: {
      product: 'lib-jitsi-meet',
      subproduct: 'meet-jit-si',
      name: 'jitsi.page.load.failed',
      server: 'meet.jit.si'
    },
    deploymentInfo: {
      environment: 'meet-jit-si',
      envType: 'prod',
      releaseNumber: '24',
      shard: 'meet-jit-si-us-east-1a-s0',
      region: 'us-east-1',
      userRegion: 'us-east-1',
      crossRegion: !'us-east-1' || 'us-east-1' === 'us-east-1' ? 0 : 1
    },
    rttMonitor: {
      enabled: false,
      initialDelay: 30000,
      getStatsInterval: 10000,
      analyticsInterval: 60000,
      stunServers: {
        'us-east-1': 'all-us-east-1-turn.jitsi.net:443',
        'ap-se-2': 'all-ap-se-2-turn.jitsi.net:443',
        'ap-se-1': 'all-ap-se-1-turn.jitsi.net:443',
        'us-west-2': 'all-us-west-2-turn.jitsi.net:443',
        'eu-central-1': 'all-eu-central-1-turn.jitsi.net:443',
        'eu-west-1': 'all-eu-west-1-turn.jitsi.net:443'
      }
    },
    abTesting: {},
    testing: {
      octo: {
        probability: 1
      }
    }
  };

  env.conferenceOptions = {
    openBridgeChannel: true
  };

  env.jitsiMeet.init();
  env.jitsiMeet.setLogLevel(JitsiMeetJS.logLevels.ERROR);

  return env;
}

export const RootStore = types.model('RootStore').props({
  connectionStore: types.optional(ConnectionStore, {})
});

export async function setupRootStore() {
  const env = await createEnvironment();
  const rootStore = RootStore.create({}, env);
  return rootStore;
}
