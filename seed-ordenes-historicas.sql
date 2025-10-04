-- =====================================================
-- SCRIPT PARA GENERAR ÓRDENES HISTÓRICAS - BLACK GYM
-- =====================================================
-- Este script genera órdenes históricas realistas con:
-- - Fechas desde enero 2021 hasta septiembre 2025
-- - Productos aleatorios de tu catálogo existente
-- - Detalles de orden con cantidades realistas
-- - Estados apropiados según la fecha
-- - Clientes y direcciones de Guatemala
-- =====================================================

-- PASO 1: Crear función para generar órdenes históricas
CREATE OR REPLACE FUNCTION generar_ordenes_historicas(num_ordenes INT DEFAULT 500)
RETURNS void AS $$
DECLARE
    i INT;
    orden_id INT;
    num_productos INT;
    productos_en_orden INT;
    producto_random_id INT;
    cantidad_random INT;
    precio_producto NUMERIC;
    total_orden NUMERIC;
    fecha_random TIMESTAMP;
    estado_random TEXT;
    
    -- Arrays de datos realistas para Guatemala
    clientes TEXT[] := ARRAY[
        'Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Luis Rodríguez',
        'Sofia Hernández', 'Miguel Ángel González', 'Laura Ramírez', 'José Antonio Morales',
        'Patricia Flores', 'Roberto Castillo', 'Carmen Ortiz', 'Fernando Díaz', 'Gabriela Ruiz',
        'Diego Sánchez', 'Mónica Torres', 'Alejandro Vargas', 'Isabel Mendoza', 'Ricardo Jiménez',
        'Andrea Castro', 'Pedro Gutiérrez', 'Verónica Ramos', 'Javier Medina', 'Claudia Reyes',
        'Sergio Domínguez', 'Daniela Cruz', 'Raúl Guerrero', 'Silvia Moreno', 'Gustavo Rivera',
        'Paola Romero', 'Andrés Muñoz', 'Natalia Álvarez', 'Hugo Navarro', 'Karla Herrera',
        'Oscar Peña', 'Mariana Ríos', 'Pablo Aguilar', 'Adriana Silva', 'Ernesto Campos'
    ];
    
    municipios TEXT[] := ARRAY[
        'Guatemala', 'Mixco', 'Villa Nueva', 'San Miguel Petapa', 'Amatitlán',
        'Antigua Guatemala', 'Quetzaltenango', 'Escuintla', 'Chimaltenango', 'Cobán',
        'Huehuetenango', 'San Marcos', 'Jalapa', 'Jutiapa', 'Santa Rosa',
        'Sololá', 'Totonicapán', 'Retalhuleu', 'Mazatenango', 'Puerto Barrios',
        'San Martin Jilotepeque', 'Chichicastenango', 'Panajachel', 'San Lucas Sacatepéquez',
        'Santiago Atitlán', 'Tecpán', 'Patzún', 'Comalapa', 'Santa Lucía Cotzumalguapa'
    ];
    
    calles TEXT[] := ARRAY[
        'Avenida Las Américas', 'Calle Real', 'Boulevard Los Próceres', 'Calzada Roosevelt',
        'Avenida La Reforma', 'Zona 1', 'Zona 10', 'Zona 11', 'Zona 12', 'Colonia El Centro',
        'Colonia La Florida', 'Residenciales San Cristóbal', 'Alameda', 'Calzada San Juan',
        'Avenida Petapa', 'Boulevard Vista Hermosa', 'Calzada Aguilar Batres', 'Zona 7',
        'Colonia Lourdes', 'Avenida Bolívar', 'Calle Principal', 'Boulevard Liberación'
    ];
    
    estados TEXT[] := ARRAY['pendiente', 'completado', 'cancelado', 'enviado'];
    
BEGIN
    -- Obtener el número de productos disponibles
    SELECT COUNT(*) INTO num_productos FROM productos;
    
    -- Verificar que hay productos
    IF num_productos = 0 THEN
        RAISE EXCEPTION 'No hay productos en la base de datos. Primero inserta productos.';
    END IF;
    
    RAISE NOTICE 'Iniciando generación de % órdenes históricas...', num_ordenes;
    RAISE NOTICE 'Productos disponibles: %', num_productos;
    
    -- Generar órdenes
    FOR i IN 1..num_ordenes LOOP
        -- Generar fecha aleatoria entre 2021-01-01 y 2025-09-30
        fecha_random := '2021-01-01'::timestamp + 
                       (random() * (('2025-09-30'::timestamp - '2021-01-01'::timestamp)));
        
        -- Asignar estado según la fecha
        IF fecha_random < '2025-01-01'::timestamp THEN
            -- Órdenes de 2021-2024: 90% completadas, 8% canceladas, 2% enviadas
            estado_random := CASE 
                WHEN random() < 0.90 THEN 'completado'
                WHEN random() < 0.98 THEN 'cancelado'
                ELSE 'enviado'
            END;
        ELSE
            -- Órdenes de 2025: más variedad
            estado_random := estados[1 + floor(random() * array_length(estados, 1))];
        END IF;
        
        -- Insertar orden
        INSERT INTO ordenes (cliente, telefono, direccion, total, fecha, estado)
        VALUES (
            clientes[1 + floor(random() * array_length(clientes, 1))],
            '5' || LPAD(floor(random() * 10000000)::text, 7, '0'), -- Teléfono guatemalteco
            calles[1 + floor(random() * array_length(calles, 1))] || ', ' || 
            municipios[1 + floor(random() * array_length(municipios, 1))],
            0, -- Total temporal, se calculará después
            fecha_random,
            estado_random
        )
        RETURNING id INTO orden_id;
        
        -- Inicializar total
        total_orden := 0;
        
        -- Generar entre 1 y 5 productos por orden
        productos_en_orden := 1 + floor(random() * 5);
        
        FOR j IN 1..productos_en_orden LOOP
            -- Seleccionar producto aleatorio
            SELECT id, precio INTO producto_random_id, precio_producto
            FROM productos
            ORDER BY random()
            LIMIT 1;
            
            -- Cantidad aleatoria entre 1 y 3 (más realista para un gimnasio)
            cantidad_random := 1 + floor(random() * 3);
            
            -- Insertar detalle de orden
            INSERT INTO detalle_orden (orden_id, producto_id, cantidad, precio_unitario)
            VALUES (orden_id, producto_random_id, cantidad_random, precio_producto);
            
            -- Acumular total
            total_orden := total_orden + (precio_producto * cantidad_random);
        END LOOP;
        
        -- Actualizar total de la orden
        UPDATE ordenes SET total = total_orden WHERE id = orden_id;
        
        -- Mostrar progreso cada 100 órdenes
        IF i % 100 = 0 THEN
            RAISE NOTICE 'Progreso: % de % órdenes generadas', i, num_ordenes;
        END IF;
    END LOOP;
    
    RAISE NOTICE '✅ ¡Completado! Se generaron % órdenes históricas exitosamente.', num_ordenes;
    
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PASO 2: EJECUTAR LA FUNCIÓN
-- =====================================================
-- Puedes cambiar el número según necesites:
-- - 500 órdenes = Dataset moderado (recomendado para free tier)
-- - 1000 órdenes = Dataset robusto
-- - 200 órdenes = Dataset pequeño para pruebas

SELECT generar_ordenes_historicas(500);

-- =====================================================
-- PASO 3: VERIFICAR LOS DATOS GENERADOS
-- =====================================================

-- Ver estadísticas generales
SELECT 
    COUNT(*) as total_ordenes,
    MIN(fecha) as primera_orden,
    MAX(fecha) as ultima_orden,
    SUM(total) as ventas_totales,
    AVG(total) as ticket_promedio
FROM ordenes;

-- Ver distribución por estado
SELECT estado, COUNT(*) as cantidad, SUM(total) as ventas_estado
FROM ordenes
GROUP BY estado
ORDER BY cantidad DESC;

-- Ver distribución por año-mes
SELECT 
    TO_CHAR(fecha, 'YYYY-MM') as periodo,
    COUNT(*) as ordenes,
    SUM(total) as ventas
FROM ordenes
GROUP BY TO_CHAR(fecha, 'YYYY-MM')
ORDER BY periodo;

-- Ver total de productos vendidos
SELECT COUNT(*) as total_items_vendidos
FROM detalle_orden;

-- =====================================================
-- OPCIONAL: LIMPIAR DATOS SI NECESITAS REGENERAR
-- =====================================================
-- CUIDADO: Esto eliminará TODAS las órdenes y sus detalles
-- Descomenta solo si estás seguro

/*
TRUNCATE TABLE detalle_orden CASCADE;
TRUNCATE TABLE ordenes RESTART IDENTITY CASCADE;
*/

-- =====================================================
-- PASO 4: ELIMINAR LA FUNCIÓN (OPCIONAL)
-- =====================================================
-- Una vez que hayas generado los datos, puedes eliminar la función

-- DROP FUNCTION IF EXISTS generar_ordenes_historicas(INT);
