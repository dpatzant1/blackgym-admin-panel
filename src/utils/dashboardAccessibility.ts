/**
 * Utilidades para mejorar la accesibilidad en el dashboard
 */

/**
 * Verifica el contraste entre dos colores usando la fórmula WCAG 2.0
 * @param foreground Color del texto en formato hexadecimal
 * @param background Color del fondo en formato hexadecimal
 * @returns Ratio de contraste (mínimo recomendado es 4.5:1 para texto normal, 3:1 para texto grande)
 */
export const checkContrast = (foreground: string, background: string): number => {
  // Convertir colores hex a rgb
  const hexToRgb = (hex: string): number[] => {
    const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return [r, g, b];
  };
  
  // Calcular luminancia relativa
  const getLuminance = (rgb: number[]): number => {
    const [r, g, b] = rgb.map(c => {
      const value = c / 255;
      return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const rgbFore = hexToRgb(foreground);
  const rgbBack = hexToRgb(background);
  
  const lumFore = getLuminance(rgbFore);
  const lumBack = getLuminance(rgbBack);
  
  const brighter = Math.max(lumFore, lumBack);
  const darker = Math.min(lumFore, lumBack);
  
  return (brighter + 0.05) / (darker + 0.05);
};

/**
 * Genera una variación de un color para mejorar el contraste
 * @param color Color original en formato hexadecimal
 * @param background Color de fondo contra el que se quiere contrastar
 * @param targetRatio Ratio de contraste objetivo (mínimo 4.5:1 para texto normal)
 * @returns Color ajustado para mejorar el contraste
 */
export const improveContrast = (color: string, background: string, targetRatio = 4.5): string => {
  const hexToRgb = (hex: string): number[] => {
    const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return [r, g, b];
  };
  
  const rgbToHex = (r: number, g: number, b: number): string => {
    return `#${[r, g, b].map(c => {
      const hex = Math.round(c).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('')}`;
  };
  
  // Verificar si ya cumple con el ratio
  const currentRatio = checkContrast(color, background);
  if (currentRatio >= targetRatio) {
    return color;
  }
  
  // Obtener colores RGB
  const rgbColor = hexToRgb(color);
  const rgbBg = hexToRgb(background);
  
  // Determinar si debemos oscurecer o aclarar el color
  const bgLuminance = 0.299 * rgbBg[0] + 0.587 * rgbBg[1] + 0.114 * rgbBg[2];
  
  // Dirección de ajuste (oscurecer o aclarar)
  const adjustDirection = bgLuminance > 128 ? -1 : 1;
  
  // Ajustar el color hasta alcanzar el ratio deseado
  let adjustedColor = [...rgbColor];
  
  for (let i = 0; i < 100; i++) {  // Máximo 100 iteraciones
    adjustedColor = adjustedColor.map(c => {
      // Ajustar manteniendo en el rango [0, 255]
      return Math.min(255, Math.max(0, c + adjustDirection * 5));
    });
    
    const newColor = rgbToHex(adjustedColor[0], adjustedColor[1], adjustedColor[2]);
    const newRatio = checkContrast(newColor, background);
    
    if (newRatio >= targetRatio) {
      return newColor;
    }
  }
  
  // Si no alcanzamos el ratio deseado, devolver el mejor resultado que pudimos obtener
  return rgbToHex(adjustedColor[0], adjustedColor[1], adjustedColor[2]);
};

/**
 * Agrega atributos ARIA a un elemento DOM
 * @param element Elemento DOM al que se le añadirán los atributos
 * @param attributes Objeto con los atributos ARIA a añadir
 */
export const addAriaAttributes = (element: HTMLElement, attributes: Record<string, string>): void => {
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(`aria-${key}`, value);
  });
};

/**
 * Agrega etiquetas ARIA a los elementos gráficos del dashboard para mejorar la accesibilidad
 * Se debe llamar una vez que el dashboard esté renderizado
 */
export const enhanceDashboardAccessibility = (): void => {
  // Añadir roles y etiquetas a gráficos
  document.querySelectorAll('.recharts-wrapper').forEach((chart, index) => {
    chart.setAttribute('role', 'img');
    chart.setAttribute('tabindex', '0');
    
    // Identificar el tipo de gráfico según su contexto
    const cardHeader = chart.closest('.card')?.querySelector('.card-header');
    const chartTitle = cardHeader?.textContent || `Gráfico ${index + 1}`;
    
    chart.setAttribute('aria-label', `${chartTitle}. Gráfico interactivo. Use las teclas de flecha para navegar y Espacio para obtener detalles.`);
  });
  
  // Mejorar contraste de textos
  document.querySelectorAll('.recharts-text').forEach(textEl => {
    const computedStyle = window.getComputedStyle(textEl as Element);
    const parentBg = window.getComputedStyle(textEl.parentElement as Element).backgroundColor || '#23282d';
    
    const textColor = computedStyle.fill || computedStyle.color;
    
    // Solo mejorar si el color está en formato hex
    if (textColor.startsWith('#')) {
      const newColor = improveContrast(textColor, parentBg);
      (textEl as SVGElement).style.fill = newColor;
    }
  });
};

/**
 * Agrega listeners de teclado para navegación accesible en los gráficos
 */
export const setupKeyboardNavigation = (): void => {
  document.querySelectorAll('.recharts-wrapper').forEach(chart => {
    chart.addEventListener('keydown', (e: Event) => {
      const keyEvent = e as KeyboardEvent;
      
      // Detectar elementos interactivos dentro del gráfico
      const interactiveElements = Array.from(chart.querySelectorAll('.recharts-bar, .recharts-dot, .recharts-sector, .recharts-rectangle'));
      
      if (interactiveElements.length === 0) return;
      
      // Índice actual
      let currentIndex = -1;
      const focusedElement = document.activeElement;
      
      interactiveElements.forEach((el, idx) => {
        if (el === focusedElement) {
          currentIndex = idx;
        }
      });
      
      // Navegar con las flechas
      switch (keyEvent.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          currentIndex = (currentIndex + 1) % interactiveElements.length;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          currentIndex = (currentIndex - 1 + interactiveElements.length) % interactiveElements.length;
          break;
        case 'Enter':
        case ' ':
          // Simular hover para mostrar tooltip
          const element = interactiveElements[currentIndex] as HTMLElement;
          const mouseoverEvent = new MouseEvent('mouseover', { bubbles: true });
          element.dispatchEvent(mouseoverEvent);
          break;
        default:
          return;
      }
      
      // Enfocar el nuevo elemento
      (interactiveElements[currentIndex] as HTMLElement).focus();
      e.preventDefault();
    });
  });
};

export default {
  checkContrast,
  improveContrast,
  addAriaAttributes,
  enhanceDashboardAccessibility,
  setupKeyboardNavigation
};