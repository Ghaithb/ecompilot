export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface IWhatsAppProvider {
  sendTextMessage(to: string, message: string): Promise<WhatsAppSendResult>;
  sendTemplateMessage(
    to: string,
    templateName: string,
    params: Record<string, string>,
  ): Promise<WhatsAppSendResult>;
  isConfigured(): boolean;
  getBusinessNumber(): string;
  getWhatsAppChatUrl(message?: string): string;
}
