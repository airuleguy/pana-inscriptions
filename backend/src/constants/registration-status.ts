export enum RegistrationStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED', 
  REGISTERED = 'REGISTERED'
}

export const RegistrationStatusDescriptions = {
  [RegistrationStatus.PENDING]: 'Registration created but not yet submitted',
  [RegistrationStatus.SUBMITTED]: 'Registration submitted for review',
  [RegistrationStatus.REGISTERED]: 'Registration approved and confirmed'
}; 