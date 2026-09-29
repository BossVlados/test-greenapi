// ============ Credentials ============
export interface Credentials {
  idInstance: string;
  apiTokenInstance: string;
  phone?: string;
}

export interface Chat {
  id: string;
  phone: string;
  title: string;
  messages: ChatMessage[];
  unreadCount: number;
  createdAt: number;
  lastActivityAt: number;
}

// ============ Chat message (внутренняя модель UI) ============
export type MessageDirection = 'incoming' | 'outgoing';

export interface ChatMessage {
  id: string;
  serverId?: string;
  text: string;
  sender: string;
  chatId: string;
  timestamp: number;
  direction: MessageDirection;
  failed?: boolean;
  pending?: boolean;
  deliveryStatus?: 'sent' | 'delivered' | 'read';
}

// ============ Green-API: SendMessage ============
export interface SendMessageRequest {
  chatId: string;
  message: string;
}

export interface SendMessageResponse {
  idMessage: string;
}

// ============ Green-API: ReceiveNotification ============
export type WebhookType =
  | 'incomingMessageReceived'
  | 'outgoingMessageStatus'
  | 'stateInstanceChanged'
  | 'incomingCall';

export type MessageType =
  | 'textMessage'
  | 'imageMessage'
  | 'videoMessage'
  | 'documentMessage'
  | 'audioMessage'
  | 'locationMessage'
  | 'contactMessage'
  | 'extendedTextMessage'
  | 'quotedMessage';

export interface SenderData {
  chatId: string;
  chatName: string;
  sender: string;
  senderName: string;
  senderPhoneNumber?: string | number;
}

export interface TextMessageData {
  textMessage: string;
}

export interface ExtendedTextMessageData {
  text: string;
}

export interface MessageData {
  typeMessage: MessageType;
  textMessageData?: TextMessageData;
  extendedTextMessageData?: ExtendedTextMessageData;
}

export interface IncomingMessageWebhook {
  typeWebhook: 'incomingMessageReceived';
  instanceData: {
    idInstance: number;
    wid: string;
    typeInstance: string;
  };
  timestamp: number;
  idMessage: string;
  senderData: SenderData;
  messageData: MessageData;
}

export interface OutgoingMessageStatusWebhook {
  typeWebhook: 'outgoingMessageStatus';
  timestamp: number;
  idMessage: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface StateInstanceChangedWebhook {
  typeWebhook: 'stateInstanceChanged';
  timestamp: number;
  stateInstance: 'authorized' | 'notAuthorized' | 'blocked' | 'starting';
}

export type WebhookBody =
  | IncomingMessageWebhook
  | OutgoingMessageStatusWebhook
  | StateInstanceChangedWebhook;

export interface Notification {
  receiptId: number;
  body: WebhookBody;
}

// ============ Green-API: DeleteNotification ============
export interface DeleteNotificationResponse {
  result: boolean;
}

// ============ Green-API: GetSettings ============
export interface GetSettingsResponse {
  wid: string;
  countryInstance: string;
  typeAccount: string;
  webhookUrl: string;
  webhookUrlToken: string;
  delaySendMessagesMilliseconds: number;
  markIncomingMessagesReaded: string;
  outgoingWebhook: string;
  stateWebhook: string;
  incomingWebhook: string;
  deviceWebhook: string;
}

// ============ API Error ============
export interface ApiErrorBody {
  code: number;
  message: string;
}