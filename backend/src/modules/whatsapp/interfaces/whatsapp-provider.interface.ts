export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface IWhatsAppProvider {
  sendTextMessage(to: string, message: string, config?: any): Promise<WhatsAppSendResult>;
  sendTemplateMessage(
    to: string,
    templateName: string,
    params: Record<string, string>,
    config?: any,
  ): Promise<WhatsAppSendResult>;
  isConfigured(config?: any): boolean;
  getBusinessNumber(config?: any): string;
  getWhatsAppChatUrl(message?: string, config?: any): string;
}
