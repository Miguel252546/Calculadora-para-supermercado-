// src/domain/errors.js
// Errores tipados del dominio. Las capas internas los lanzan;
// los Controllers los capturan para mostrar feedback en UI.

export class DomainError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DomainError';
  }
}

export class ValidationError extends DomainError {
  constructor(field, msg) {
    super(`${field}: ${msg}`);
    this.name = 'ValidationError';
    this.field = field;
  }
}