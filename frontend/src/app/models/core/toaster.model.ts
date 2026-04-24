export interface ToasterModel {
    message: string;
    type: 'success' | 'danger' | 'warning' | 'info' | 'primary';
    delay: number;
}