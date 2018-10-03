// @flow

type MessageResponse = {
  caller_id_name: string,
  caller_id_num: string,
  duration: number,
  id: string,
  folder: Object,
  timestamp: number
};

type Response = {
  id: string,
  name: string,
  number: string,
  folders: Array<{
    id: string,
    name: string,
    type: string,
    messages: Array<MessageResponse>
  }>
};

type VoicemailArguments = {
  id?: string,
  date?: Date,
  duration?: number,
  caller: {
    name: string,
    number: string
  },
  unread?: ?boolean
};

export default class Voicemail {
  id: ?string;
  date: ?Date;
  duration: ?number;
  unread: ?boolean;
  caller: {
    name: string,
    number: string
  };

  static parse(plain: MessageResponse): Voicemail {
    return new Voicemail({
      id: plain.id,
      date: new Date(plain.timestamp),
      duration: plain.duration * 1000,
      caller: {
        name: plain.caller_id_name,
        number: plain.caller_id_num
      },
      unread: plain.folder ? plain.folder.type === 'new' : null
    });
  }

  static parseMany(plain: Response): Array<Voicemail> {
    const plainUnread = plain.folders.filter(folder => folder.type === 'new')[0].messages;
    const plainRead = plain.folders.filter(folder => folder.type === 'old')[0].messages;

    const unread = plainUnread.map(message => Voicemail.parse(message)).map(voicemail => voicemail.makeAsUnRead());
    const read = plainRead.map(message => Voicemail.parse(message)).map(voicemail => voicemail.acknowledge());

    return [...unread, ...read];
  }

  constructor({ id, date, duration, caller }: VoicemailArguments = {}) {
    this.id = id;
    this.date = date;
    this.duration = duration;
    this.caller = caller;
  }

  is(other: Voicemail): boolean {
    return other && this.id === other.id;
  }

  acknowledge() {
    this.unread = false;

    return this;
  }

  makeAsUnRead() {
    this.unread = true;

    return this;
  }

  contains(query: string): boolean {
    if (!query) {
      return true;
    }

    return this.caller.name.toUpperCase().includes(query.toUpperCase()) || this.caller.number.includes(query);
  }
}
