/* eslint-disable no-underscore-dangle */

/* eslint-disable no-useless-escape */

/* eslint-disable no-console */
import IssueReporter from '../IssueReporter';
import { realFetch } from '../../utils/api-requester';

jest.mock('../../utils/api-requester');
let oldLog: any;
let oldError: any;

class MyError extends Error {}

describe('IssueReporter', () => {
  beforeAll(() => {
    oldLog = console.log;
    oldError = console.error;

    console.log = () => {};

    console.error = () => {};

    IssueReporter.enable();
  });
  beforeEach(() => {
    jest.resetAllMocks();
    (realFetch as any).mockImplementation(() => () => ({
      catch: () => {},
    }));
  });
  afterAll(() => {
    console.log = oldLog;
    console.error = oldError;
  });
  it('should compute level order', () => {
    expect(IssueReporter._isLevelAbove('info', 'trace')).toBeTruthy();
    expect(IssueReporter._isLevelAbove('trace', 'warn')).toBeFalsy();
    expect(IssueReporter._isLevelAbove('error', 'warn')).toBeTruthy();
    expect(IssueReporter._isLevelAbove('info', 'warn')).toBeFalsy();
    expect(IssueReporter._isLevelAbove('trace', 'trace')).toBeFalsy();
    expect(IssueReporter._isLevelAbove('trace', 'something')).toBeFalsy();
    expect(IssueReporter._isLevelAbove('something', 'trace')).toBeFalsy();
  });
  it('should send if verbosity is higher than required', () => {
    // Same level
    IssueReporter.configureRemoteClient({
      level: 'trace',
    });

    IssueReporter._sendToRemoteLogger('info');

    expect(realFetch).toHaveBeenCalled();
  });
  it('should send if verbosity is equal than required', () => {
    // Same level
    IssueReporter.configureRemoteClient({
      level: 'trace',
    });

    IssueReporter._sendToRemoteLogger('trace');

    expect(realFetch).toHaveBeenCalled();
  });
  it('should not send if verbosity is lower than required', () => {
    // Lower level
    IssueReporter.configureRemoteClient({
      level: 'info',
    });

    IssueReporter._sendToRemoteLogger('trace');

    expect(realFetch).not.toHaveBeenCalled();
  });
  it('should log extra data', () => {
    jest.spyOn(IssueReporter, '_sendToRemoteLogger').mockImplementation(() => {});
    IssueReporter.log('log', 'logger-category=http', 'my message', {
      status: 200,
    });
    expect(IssueReporter._sendToRemoteLogger).toHaveBeenCalledWith('log', {
      date: expect.anything(),
      message: 'my message',
      category: 'http',
      status: 200,
    });
  });
  it('should log an error', () => {
    jest.spyOn(IssueReporter, '_sendToRemoteLogger').mockImplementation(() => {});
    IssueReporter.log('error', 'logger-category=http', 'my message', new MyError('nope'));
    expect(IssueReporter._sendToRemoteLogger).toHaveBeenCalledWith('error', {
      date: expect.anything(),
      message: 'my message',
      category: 'http',
      errorMessage: 'nope',
      errorStack: expect.anything(),
      errorType: 'MyError',
    });
  });
  it('remove slashes', () => {
    expect(IssueReporter.removeSlashes('\\')).toBe('');
    expect(IssueReporter.removeSlashes('\\"')).toBe("'");
    expect(IssueReporter.removeSlashes('\"')).toBe("'");
    expect(IssueReporter.removeSlashes('\\\"')).toBe("'");
  });
  it('Add retry count', () => {
    expect(IssueReporter._writeRetryCount('', 1)).toBe('');
    expect(IssueReporter._writeRetryCount('{}', 1)).toBe('{}');
    expect(IssueReporter._writeRetryCount({}, 1)).toEqual({
      _retry: 1,
    });
  });

  it('retry delay', () => {
    expect(IssueReporter._computeRetryDelay(0, 1000, 50000)).toBe(1000);
    expect(IssueReporter._computeRetryDelay(1, 1000, 50000)).toBeGreaterThanOrEqual(1000);
    const samples = [];
    for (let i = 0; i <= 10; i++) {
      samples.push(IssueReporter._computeRetryDelay(i, 1000, 50000));
    }
    const min = Math.min(...samples);
    expect(min).toBe(1000);
    const max = Math.max(...samples);
    expect(max).toBeLessThanOrEqual(50000);
  });

});
