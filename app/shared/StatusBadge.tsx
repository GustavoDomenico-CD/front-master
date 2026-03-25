import styled from "styled-components";

const Badge = styled.span<{status: string}>`
padding: 5px 10px;
border-radius: 999px;
font-size: 13px;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.5px;

${({ status }) => {
    switch (status) {
        case 'agendado':
            return `background: #d1fae5; color: #065f46;`;
        case 'concluído':
            return `background: #fef3c7; color: #92400e;      `;
        case 'cancelado':
            return `background: #fee2e2; color: #991b1b;`;
        default:
            return `background: #e5e7eb; color: #374151;`;
    }
}}
`

interface StatusBadgeProps {
    status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {

const statusClass ={
    'Atendido': 'sucess',
    'Cliente Chegou': 'sucess',
    'Confirmado': 'sucess',
    'Tratamento concluido': 'sucess',
    'Confirmar': 'warning',
    'Compromisso pessoal': 'warning',
    'Desmarcou': 'danger', 
    'Não compareceu': 'danger',

}[status] || 'default';

    return <Badge status={statusClass}>{status}</Badge>;
}