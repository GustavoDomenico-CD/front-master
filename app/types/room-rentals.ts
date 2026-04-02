export type RoomBillingDisplay = 'daily' | 'monthly'

/** Preços cadastrados por sala (tabela de tarifas). */
export interface RoomDefinition {
  id: string
  name: string
  /** Preço por dia (R$). */
  priceDaily: number
  /** Preço por mês (R$). */
  priceMonthly: number
  /** Condições gerais (texto). */
  conditions: string
}

/** Locação de uma sala. */
export interface RoomLease {
  id: string
  roomId: string
  /** Quem alugou. */
  tenantName: string
  tenantEmail?: string
  tenantPhone?: string
  /** Se a cobrança foi pactuada como diária ou mensal. */
  billingPeriod: RoomBillingDisplay
  /** Valor acordado nesta locação (R$). */
  pricePaid: number
  /** Início da locação (YYYY-MM-DD). */
  startDate: string
  /** Fim da locação — até quando a sala está alugada (YYYY-MM-DD). */
  endDate: string
  /** Se a sala está em uso para atendimento no período atual. */
  inService: boolean
  notes?: string
}

export interface RoomRentalsPayload {
  rooms: RoomDefinition[]
  leases: RoomLease[]
}
