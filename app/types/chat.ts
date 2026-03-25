// types/chat.ts
export interface MessageOptions {
    type?: string;
    suggestions?: string[];
    showCheckbox?: boolean;
    hasButton?: boolean;
    buttonText?: string;
    buttonAction?: () => void;
    showButtons?: boolean;
    buttons?: { label: string; value: string }[];
    showPaymentButton?: boolean;
    paymentValue?: number;
    preferenceId?: string;
    showPaymentBrick?: boolean;
    showStatusScreen?: boolean;
    paymentId?: string;
    show_button?: string;
    ajuste_tom?: string;
}

export interface ChatHistoryItem {
    text: string;
    isUser: boolean;
    timestamp: Date;
    options: MessageOptions;
}

export interface ApiResponse {
    status: string;
    resposta: string;
    session_id?: string;
    eh_saudacao?: boolean;
    em_agendamento?: boolean;
    iniciar_agendamento?: boolean;
    mostrar_botao?: string;
    tipo_processo?: string;
    show_buttons?: boolean;
    buttons?: { label: string; value: string }[];
    show_payment_button?: boolean;
    payment_value?: number;
    ajuste_tom?: string;
    show_button?: string;
    preference_id?: string;
    show_checkbox?: boolean;
}