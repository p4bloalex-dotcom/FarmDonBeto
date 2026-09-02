import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cellFormat',
  pure: false,
  standalone: true,
})
export class CellFormatPipe implements PipeTransform {
  transform(value: any, field: string): string {

    if (field === 'status') {

      if (value === 'E') return 'Activo';
      if (value === 'D') return 'Desactivado';
      if (value == '2') return 'Retorno';
      if (value == '8') return 'Sin retorno';
      if (value == '9') return 'Sin retorno';
      if (value == true) return 'SI'
      if (value == false) return 'NO'
      return value?.toString() ?? '';
    }

    if (field === 'holderType') {
      if (value == '1') return 'Estacion';
      if (value == '2') return 'Interno';
      if (value == '3') return 'Externo';
      return value?.toString() ?? 'Estacion';
    }

    if (field === 'recurrence') {
      if (value == '0') return 'Unico';
      else if (value == '1') return 'Dias';
      else if (value == '2') return 'Ciclico';
      else if (value == '3') return 'Semanal';
      else if (value == '6') return 'Cumplimiento';
      return value?.toString() ?? 'Ninguno';
    }


    if (typeof value === 'boolean') {
      return value ? 'SI' : 'NO';
    }



    // if (typeof value === 'string' && !isNaN(Date.parse(value))) {
    //   const date = new Date(value);
    //   return date.toLocaleString('es-ES', {
    //     day: '2-digit',
    //     month: 'long',
    //     year: 'numeric',
    //     hour: '2-digit',
    //     minute: '2-digit',
    //     second: '2-digit',
    //   });
    // }



    if (typeof value === 'string' && !isNaN(Date.parse(value))) {

      // if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      //   const [year, month, day] = value.split('-').map(Number);
      //   const date = new Date(year, month - 1, day);
      //   return date.toLocaleDateString('es-ES', {
      //     day: '2-digit',
      //     month: '2-digit',
      //     year: 'numeric',
      //   })
      // }
      // else {
      //   const date = new Date(value);
      //   return date.toLocaleString('es-ES', {
      //     day: '2-digit',
      //     month: '2-digit',
      //     year: 'numeric',
      //     hour: '2-digit',
      //     minute: '2-digit',
      //     hour12: false, 
      //   });
      // }

      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-').map(Number);
        const date = new Date(year, month - 1, day);

        return date.toLocaleDateString('es-GT', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      }

      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}.*Z?$/.test(value)) {

        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleString('es-GT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'America/Guatemala'
          });
        }
      }
    }

    return value?.toString() ?? '';
  }
}
