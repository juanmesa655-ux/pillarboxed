export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password: string;
  carrera: string;
  semestre: number;
  fechaRegistro: Date;
}