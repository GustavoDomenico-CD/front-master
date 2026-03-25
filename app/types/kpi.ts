export interface KPI{
    label: string;
    total_appointments: number;
    total_revenue: number;
    pending_revenue: number;
    conversion_rate: number;
    emails_send: number;
    showOffRate: number;
    medium_ticket_value: number;
    cancellations: number;
}

export interface ChartData{
    service_distribution: { label: string; value: number }[];
    time_evolution: { label: string; value: number }[];
    revenue_service: { label: string; value: number }[];
    tips_confirmation: { label: string; value: number }[];
    hours_scheduling: { label: string; value: number }[];
    heatmap: { label: string; value: number }[];
}

export interface KpisResponse{
    /** API em PT costuma usar `sucesso`; em EN `success`. */
    status: 'success' | 'error' | 'sucesso' | 'erro';
    kpis: KPI;
    charts?: ChartData | null;
}

export interface UseKPIsReturn{
    kpis: KPI | null;
    charts: ChartData | null;
    loading: boolean;
    error: string | null;
    fetchKPIs: () => Promise<void>;
}