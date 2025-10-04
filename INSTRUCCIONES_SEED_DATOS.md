# 📊 Guía para Poblar la Base de Datos con Órdenes Históricas

## 🎯 Objetivo
Generar órdenes históricas realistas desde 2023 hasta 2025 para tener un dashboard impresionante con datos reales.

---

## 📋 Pre-requisitos

✅ **Tener productos en la base de datos**
```sql
-- Verifica que tienes productos
SELECT COUNT(*) FROM productos;
```

Si no tienes productos, primero inserta algunos. Ejemplo:
```sql
INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url) VALUES
('Proteína Whey 2lb', 'Proteína de suero de leche', 350.00, 50, null),
('Creatina 300g', 'Monohidrato de creatina', 180.00, 30, null),
('Guantes de Gimnasio', 'Guantes profesionales', 85.00, 100, null),
('Shaker 600ml', 'Botella mezcladora', 45.00, 80, null),
('Pre-Workout', 'Energizante pre-entreno', 280.00, 40, null);
```

---

## 🚀 Pasos para Ejecutar el Script

### Opción A: Desde Supabase Dashboard (RECOMENDADO)

1. **Abre tu proyecto en Supabase**
   - Ve a: https://supabase.com/dashboard
   - Selecciona tu proyecto de Black Gym

2. **Abre el SQL Editor**
   - En el menú lateral: `SQL Editor`
   - Click en `New Query`

3. **Copia y pega el contenido completo** de `seed-ordenes-historicas.sql`

4. **Ajusta la cantidad** (línea 174):
   ```sql
   SELECT generar_ordenes_historicas(500);  -- Cambia 500 por el número que quieras
   ```

5. **Ejecuta el script** (botón Run o Ctrl+Enter)

6. **Espera a que termine** (verás mensajes de progreso)

### Opción B: Desde psql (Terminal)

```bash
# Si tienes PostgreSQL instalado localmente
psql -U postgres -d tu_base_datos -f seed-ordenes-historicas.sql
```

---

## 📊 Recomendaciones de Cantidad

| Cantidad | Uso Recomendado | Tiempo Aprox. | Espacio |
|----------|----------------|---------------|---------|
| **200** | Pruebas y desarrollo | ~10 seg | Mínimo |
| **500** | ✅ **Demo/Presentación** | ~30 seg | Bajo |
| **1000** | Dataset robusto | ~60 seg | Moderado |

**Para Supabase Free Tier:** 500 órdenes es perfecto 👌

---

## 🔍 Verificar que Funcionó

Después de ejecutar el script, verifica:

```sql
-- Ver total de órdenes generadas
SELECT COUNT(*) FROM ordenes;

-- Ver rango de fechas
SELECT 
    MIN(fecha)::date as primera_orden,
    MAX(fecha)::date as ultima_orden
FROM ordenes;

-- Ver ventas por año
SELECT 
    EXTRACT(YEAR FROM fecha) as año,
    COUNT(*) as ordenes,
    SUM(total) as ventas_totales
FROM ordenes
GROUP BY EXTRACT(YEAR FROM fecha)
ORDER BY año;

-- Ver distribución por mes (2024)
SELECT 
    TO_CHAR(fecha, 'Mon') as mes,
    COUNT(*) as ordenes,
    SUM(total) as ventas
FROM ordenes
WHERE fecha >= '2024-01-01' AND fecha < '2025-01-01'
GROUP BY TO_CHAR(fecha, 'Mon'), EXTRACT(MONTH FROM fecha)
ORDER BY EXTRACT(MONTH FROM fecha);
```

---

## 🎨 Características del Script

### ✅ Datos Generados

- **Fechas**: Distribuidas aleatoriamente entre enero 2023 - septiembre 2025
- **Clientes**: 40 nombres guatemaltecos realistas
- **Direcciones**: Municipios y calles reales de Guatemala
- **Teléfonos**: Formato guatemalteco (5XXXXXXX)
- **Estados**: 
  - 2023-2024: 90% completado, 8% cancelado, 2% enviado
  - 2025: Distribución más variada (pendiente, completado, enviado, cancelado)
- **Productos por orden**: 1-5 productos aleatorios
- **Cantidades**: 1-3 unidades por producto (realista)

### 🔒 Integridad de Datos

✅ Respeta foreign keys (producto_id, orden_id)
✅ Calcula totales correctamente (sum de precio × cantidad)
✅ No modifica stock de productos (las órdenes históricas ya fueron procesadas)
✅ Usa productos existentes en tu catálogo

---

## 🔄 Si Necesitas Regenerar Datos

### Limpiar todo y empezar de nuevo:

```sql
-- ⚠️ CUIDADO: Esto elimina TODAS las órdenes
TRUNCATE TABLE detalle_orden CASCADE;
TRUNCATE TABLE ordenes RESTART IDENTITY CASCADE;

-- Luego vuelve a ejecutar la función
SELECT generar_ordenes_historicas(500);
```

### Agregar MÁS órdenes (sin borrar):

```sql
-- Simplemente ejecuta la función otra vez
SELECT generar_ordenes_historicas(300);  -- Agrega 300 más
```

---

## 🐛 Solución de Problemas

### Error: "No hay productos en la base de datos"
**Solución:** Primero inserta productos (ver Pre-requisitos)

### Error: "Function already exists"
**Solución:** Normal, el script usa `CREATE OR REPLACE`, ignora este warning

### El dashboard no muestra datos
**Solución:** 
1. Verifica que las órdenes se crearon: `SELECT COUNT(*) FROM ordenes;`
2. Recarga el dashboard (Ctrl+Shift+R)
3. Verifica la consola del navegador (F12) por errores de API

### Supabase se queda "colgado"
**Solución:** 
- Reduce la cantidad a 200-300 órdenes
- Free tier tiene límites de CPU y memoria

---

## 📈 Resultado Esperado en el Dashboard

Después de ejecutar el script con 500 órdenes, verás:

- ✅ **KPIs poblados** con ventas reales de 2024-2025
- ✅ **Evolución Mensual** con datos de todo el año
- ✅ **Comparativa Anual** mostrando crecimiento 2024 vs 2025
- ✅ **Top Productos** con productos realmente vendidos
- ✅ **Análisis de Categorías** basado en ventas reales
- ✅ **Gráficas bonitas** con patrones realistas (más ventas en ciertos meses)

---

## 🎓 Notas Técnicas

### ¿Por qué no se modifica el stock?
Las órdenes históricas (2023-2024) ya fueron procesadas en el pasado. El stock actual refleja el estado actual del inventario. Si quisieras simular el stock consumido, necesitarías:
```sql
-- Reducir stock proporcionalmente (opcional, no recomendado)
UPDATE productos SET stock = stock - (cantidad_vendida_historica);
```

### ¿Cómo se distribuyen las fechas?
El script usa `random()` para distribuir fechas uniformemente entre 2023-01-01 y 2025-09-30. En un negocio real podrías tener picos estacionales (Navidad, Año Nuevo), pero para una demo esto funciona perfectamente.

---

## 📞 Soporte

Si tienes problemas:
1. Verifica que tu conexión a Supabase funciona
2. Revisa que tienes productos en la BD
3. Reduce la cantidad de órdenes a generar
4. Ejecuta las queries de verificación

---

**¡Listo para impresionar con tu dashboard! 🚀📊**
