/**
 * Helper functions for medical specialties
 */

export const SPECIALTY_NAMES: Record<string, string> = {
  'clinica-medica': 'Clínica Médica',
  'medicina-interna': 'Medicina Interna',
  'cardiologia': 'Cardiología',
  'pediatria': 'Pediatría',
  'dermatologia': 'Dermatología',
  'ginecologia': 'Ginecología',
  'obstetricia': 'Obstetricia',
  'odontologia': 'Odontología',
  'cirugia-oral': 'Cirugía Oral',
  'traumatologia': 'Traumatología',
  'ortopedia': 'Ortopedia',
  'psiquiatria': 'Psiquiatría',
  'neurologia': 'Neurología',
  'oftalmologia': 'Oftalmología',
  'otorrinolaringologia': 'Otorrinolaringología',
  'urologia': 'Urología',
  'gastroenterologia': 'Gastroenterología',
  'endocrinologia': 'Endocrinología',
  'nefrologia': 'Nefrología',
  'neumologia': 'Neumología',
  'reumatologia': 'Reumatología',
  'hematologia': 'Hematología',
  'oncologia': 'Oncología',
  'infectologia': 'Infectología',
  'cirugia-general': 'Cirugía General',
  'anestesiologia': 'Anestesiología',
  'medicina-familiar': 'Medicina Familiar',
  'medicina-general': 'Medicina General'
};

/**
 * Get the display name for a specialty
 * @param specialty - Specialty ID or code
 * @returns Display name for the specialty
 */
export const getSpecialtyName = (specialty: string | undefined | null): string => {
  if (!specialty) return 'Sin especialidad';
  return SPECIALTY_NAMES[specialty] || specialty;
};

/**
 * Get all available specialties as options for select inputs
 */
export const getSpecialtyOptions = () => {
  return Object.entries(SPECIALTY_NAMES).map(([value, label]) => ({
    value,
    label
  }));
};
