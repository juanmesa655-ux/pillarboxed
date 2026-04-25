import { Usuario } from '../models/usuario';

export const USUARIOS_MOCK: Usuario[] = [
  {
    id: 1,
    nombre: 'Samuel Pérez',
    email: 'samuel.sepulveda068@pascualbravo.edu.co',
    password: '1234',
    carrera: 'Ingeniería de Sistemas',
    semestre: 5,
    fechaRegistro: new Date('2026-01-10')
  },
  {
    id: 2,
    nombre: 'Juan Mesa',
    email: 'juan.mesa655@pascualbravo.edu.co',
    password: '1234',
    carrera: 'Ingeniería de Sistemas',
    semestre: 5,
    fechaRegistro: new Date('2026-01-10')
  },
  {
    id: 3,
    nombre: 'Omar Cardona',
    email: 'omar.cardona@pascualbravo.edu.co',
    password: 'admin',
    carrera: 'Docente',
    semestre: 0,
    fechaRegistro: new Date('2025-08-01')
  }
];