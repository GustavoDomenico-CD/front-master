import { redirect } from 'next/navigation'

/** Rota legada: mesmo conteúdo que `/paciente`. */
export default function PatientsLegacyRedirect() {
  redirect('/paciente')
}
