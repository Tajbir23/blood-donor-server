export interface ResponseEmailType {
    email: string;
    subject: string;
    templateType: string;
    templateData: string
}

export interface ResponseEmailMessage {
    success: boolean;
    message: string
}