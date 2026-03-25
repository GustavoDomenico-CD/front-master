import React from "react";
import styled from "styled-components";
import { Appointment } from "../types/Appoiments";
import StatusBadge from "./StatusBadge";
import { theme } from "../styles/theme";

const TableContainer = styled.div`
  background: white;
  border-radius: ${theme.radius.md};
  box-shadow: ${theme.shadow.md};
  overflow: hidden;
  margin-top: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th {
    background: ${theme.colors.dark};
    color: white;
    padding: 16px 12px;
    text-align: left;
    font-weight: 600;
  }

  td {
    padding: 14px 12px;
    border-bottom: 1px solid ${theme.colors.border};
    vertical-align: middle;
  }

  tr:hover {
    background: #f8fafc;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;

  button {
    width: 34px;
    height: 34px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &.edit-btn {
      background: #dbeafe;
      color: #1e40af;
      &:hover { background: #bfdbfe; }
    }

    &.delete-btn {
      background: #fee2e2;
      color: #b91c1c;
      &:hover { background: #fecaca; }
    }
  }`
;

interface AppoimentsTableProps {
  agendamentos: Appointment[];
  onEdit: (agendamento: Appointment) => void;
  onDelete: (id: string) => void;
}

export const AppoimentsTable: React.FC<AppoimentsTableProps> = ({ agendamentos, onEdit, onDelete }) => { 
    return (
    <TableContainer>
        <Table>
            <thead>
          <tr>
            <th>ID</th>
            <th>Data</th>
            <th>Cliente</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Serviço</th>
            <th>Profissional</th>
            <th>Local</th>
            <th>Tipo</th>
            <th>Situação</th>
            <th>Horário</th>
            <th>Duração</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {agendamentos.map((agendamento) => (
            <tr key={agendamento.id}>
              <td>{agendamento.id}</td>
              <td>{agendamento.date}</td>
              <td>{agendamento.username}</td>
              <td>{agendamento.email}</td>
              <td>{agendamento.telephone}</td>
              <td>{agendamento.service}</td>
              <td>{agendamento.professional}</td>
              <td>{agendamento.local}</td>
              <td>{agendamento.typeOfService}</td>
              <td>
                <StatusBadge status={agendamento.status || ''} />
              </td>
              <td>{agendamento.hour}</td>
              <td>{agendamento.duration}</td>
              <td>
                <ActionButtons>
                  <button className="edit-btn" onClick={() => onEdit(agendamento)}>
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => onDelete(agendamento.id)}>
                    Delete
                  </button>
                </ActionButtons>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableContainer>
    );
}