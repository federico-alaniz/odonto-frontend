import NewPatientForm from "./NewPatientForm";

export default function NewPatientPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="medical-card p-6 bg-gradient-to-r from-green-50 to-emerald-50">
        <h1 className="text-2xl font-bold text-green-900 mb-2">
          👤 Nuevo Paciente
        </h1>
        <p className="medical-text-secondary">
          Registrar un nuevo paciente en el sistema médico
        </p>
      </div>

      {/* Form */}
      <NewPatientForm />
    </div>
  );
}