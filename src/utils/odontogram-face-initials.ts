/**
 * Etiquetas de cara(s) para tablas de prestaciones a partir del sector guardado y/o sectores del diente.
 */
export function getOdontogramProcedureFaceInitials(
  toothNumber: number,
  sector: string | undefined,
  allSectors: any[]
): string {
  if (allSectors && allSectors.length > 0) {
    const hasR = (s: string) => allSectors.some((ts) => ts.sector === s && ts.hasRestoration);
    const order: string[] = ['topUpper', 'topLower', 'bottom', 'left', 'right', 'center'];
    const initials = Array.from(
      new Set(
        order
          .filter((s) => {
            if (s === 'center') {
              return hasR('center') || hasR('centerMesial') || hasR('centerDistal');
            }
            return hasR(s);
          })
          .map((s) => {
            const num = toothNumber;
            const isUpper = (num >= 11 && num <= 28) || (num >= 51 && num <= 65);
            const lastDigit = num % 10;
            const isAnterior = [1, 2, 3].includes(lastDigit) || [61, 62, 63, 71, 72, 73].includes(num);

            switch (s) {
              case 'left':
                return 'M';
              case 'right':
                return 'D';
              case 'top':
              case 'topUpper':
              case 'topLower':
                return 'V';
              case 'bottom':
                return isUpper ? 'P' : 'L';
              case 'center':
                return isAnterior ? 'I' : 'O';
              default:
                return '';
            }
          })
          .filter(Boolean)
      )
    );
    return initials.join(' - ');
  }
  if (sector) {
    const num = toothNumber;
    const isUpper = (num >= 11 && num <= 28) || (num >= 51 && num <= 65);
    const lastDigit = num % 10;
    const isAnterior = [1, 2, 3].includes(lastDigit) || [61, 62, 63, 71, 72, 73].includes(num);

    switch (sector) {
      case 'left':
        return 'M';
      case 'right':
        return 'D';
      case 'top':
      case 'topUpper':
      case 'topLower':
        return 'V';
      case 'bottom':
        return isUpper ? 'P' : 'L';
      case 'centerMesial':
      case 'centerDistal':
      case 'center':
        return isAnterior ? 'I' : 'O';
      default:
        return sector;
    }
  }
  return '';
}
