import authMethods, { AuthD } from './api/auth';
import applicationMethods, { ApplicationD } from './api/application';
import confdMethods, { ConfD } from './api/confd';
import ctidNgMethods, { CtidNg } from './api/ctid-ng';
import dirdMethods, { DirD } from './api/dird';
import callLogdMethods, { CallLogD } from './api/call-logd';
import chatdMethods, { ChatD } from './api/chatd';
import calldMethods, { CallD } from './api/calld';
import agentdMethods, { AgentD } from './api/agentd';
import webhookdMethods, { WebhookD } from './api/webhookd';
import amidMethods, { AmiD } from './api/amid';
import ApiRequester from './utils/api-requester';
import IssueReporter from './service/IssueReporter';

type ConstructorParams = {
  server: string;
  agent?: Record<string, any> | null | undefined;
  clientId?: string;
  refreshToken?: string | null | undefined;
  isMobile?: boolean | null | undefined;
  fetchOptions?: Record<string, any>;
};
const AUTH_VERSION = '0.1';
const APPLICATION_VERSION = '1.0';
const CONFD_VERSION = '1.1';
const CTIDNG_VERSION = '1.0';
const DIRD_VERSION = '0.1';
const CALL_LOGD_VERSION = '1.0';
const CHATD_VERSION = '1.0';
const CALLD_VERSION = '1.0';
const AGENTD_VERSION = '1.0';
const WEBHOOKD_VERSION = '1.0';
const AMID_VERSION = '1.0';
const logger = IssueReporter ? IssueReporter.loggerFor('api') : console;
export default class ApiClient {
  client: ApiRequester;

  auth: AuthD;

  application: ApplicationD;

  confd: ConfD;

  ctidNg: CtidNg;

  dird: DirD;

  callLogd: CallLogD;

  chatd: ChatD;

  calld: CallD;

  agentd: AgentD;

  webhookd: WebhookD;

  amid: AmiD;

  refreshToken: string | null | undefined;

  onRefreshToken: ((...args: Array<any>) => any) | null | undefined;

  onRefreshTokenError: ((...args: Array<any>) => any) | null | undefined;

  refreshExpiration: number | null | undefined;

  refreshBackend: string | null | undefined;

  refreshTenantId: string | null | undefined;

  refreshDomainName: string | null | undefined;

  isMobile: boolean;

  fetchOptions: Record<string, any>;

  // @see https://github.com/facebook/flow/issues/183#issuecomment-358607052
  constructor({
    server,
    agent = null,
    refreshToken,
    clientId,
    isMobile = false,
    fetchOptions,
  }: ConstructorParams) {
    this.updateParameters({
      server,
      agent,
      clientId,
      fetchOptions,
    });
    this.refreshToken = refreshToken;
    this.isMobile = isMobile || false;
  }

  initializeEndpoints(): void {
    this.auth = authMethods(this.client, `auth/${AUTH_VERSION}`);
    this.application = applicationMethods(this.client, `calld/${APPLICATION_VERSION}/applications`);
    this.confd = confdMethods(this.client, `confd/${CONFD_VERSION}`);
    this.ctidNg = ctidNgMethods(this.client, `ctid-ng/${CTIDNG_VERSION}`);
    this.dird = dirdMethods(this.client, `dird/${DIRD_VERSION}`);
    this.callLogd = callLogdMethods(this.client, `call-logd/${CALL_LOGD_VERSION}`);
    this.chatd = chatdMethods(this.client, `chatd/${CHATD_VERSION}`);
    this.calld = calldMethods(this.client, `calld/${CALLD_VERSION}`);
    this.agentd = agentdMethods(this.client, `agentd/${AGENTD_VERSION}`);
    this.webhookd = webhookdMethods(this.client, `webhookd/${WEBHOOKD_VERSION}`);
    this.amid = amidMethods(this.client, `amid/${AMID_VERSION}`);
  }

  updateParameters({
    server,
    agent,
    clientId,
    fetchOptions,
  }: Record<string, any>) {
    const refreshTokenCallback = this.refreshTokenCallback.bind(this);
    this.client = new ApiRequester({
      server,
      agent,
      refreshTokenCallback,
      clientId,
      fetchOptions,
    });
    this.initializeEndpoints();
  }

  async forceRefreshToken(): Promise<string | null> {
    logger.info('forcing refresh token, calling callback');
    return this.refreshTokenCallback();
  }

  async refreshTokenCallback(): Promise<string | null> {
    logger.info('refresh token callback called', {
      refreshToken: this.refreshToken,
      refreshBackend: this.refreshBackend,
      refreshTenantId: this.refreshTenantId,
      refreshDomainName: this.refreshDomainName,
      refreshExpiration: this.refreshExpiration,
      isMobile: this.isMobile,
    });

    if (!this.refreshToken) {
      return null;
    }

    try {
      const session = await this.auth.refreshToken(this.refreshToken, this.refreshBackend as string, this.refreshExpiration as number, this.isMobile, this.refreshTenantId as string, this.refreshDomainName as string);
      if (!session) {
        return null;
      }

      logger.info('token refreshed', {
        token: session.token,
      });

      if (this.onRefreshToken) {
        this.onRefreshToken(session.token, session);
      }

      this.setToken(session.token);
      return session.token;
    } catch (error: any) {
      logger.error('token refresh, error', error);

      if (this.onRefreshTokenError) {
        this.onRefreshTokenError(error);
      }
    }

    return null;
  }

  setToken(token: string) {
    this.client.setToken(token);
  }

  setTenant(tenant: string) {
    this.client.setTenant(tenant);
  }

  setRefreshToken(refreshToken: string | null | undefined) {
    this.refreshToken = refreshToken;
  }

  setRequestTimeout(requestTimeout: number) {
    this.client.setRequestTimeout(requestTimeout);
  }

  setClientId(clientId: string | null | undefined) {
    this.client.clientId = clientId;
  }

  setOnRefreshToken(onRefreshToken: (...args: Array<any>) => any) {
    this.onRefreshToken = onRefreshToken;
  }

  setOnRefreshTokenError(callback: (...args: Array<any>) => any) {
    this.onRefreshTokenError = callback;
  }

  setRefreshExpiration(refreshExpiration: number) {
    this.refreshExpiration = refreshExpiration;
  }

  setRefreshBackend(refreshBackend: string) {
    this.refreshBackend = refreshBackend;
  }

  setRefreshTenantId(tenantId: string | null | undefined) {
    console.warn('Use of `setRefreshTenantId` is deprecated, use `setRefreshDomainName` instead');
    this.refreshTenantId = tenantId;
  }

  setRefreshDomainName(domainName: string | null | undefined) {
    this.refreshDomainName = domainName;
  }

  setIsMobile(isMobile: boolean) {
    this.isMobile = isMobile;
  }

  setFetchOptions(fetchOptions: Record<string, any>) {
    this.fetchOptions = fetchOptions;
    this.client.setFetchOptions(fetchOptions);
  }

  disableErrorLogging() {
    this.client.disableErrorLogging();
  }

}
