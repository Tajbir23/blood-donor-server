export interface ResponseEmailType {
    email: string;
    subject: string;
    templateType: string;
    templateData: {
        [key: string]: string
    }
}

export interface ResponseEmailMessage {
    success: boolean;
    message: string
}