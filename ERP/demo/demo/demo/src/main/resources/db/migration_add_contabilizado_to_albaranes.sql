-- Añadir columna contabilizado a la tabla ventas_albaranes
ALTER TABLE ventas_albaranes 
ADD COLUMN contabilizado BOOLEAN NOT NULL DEFAULT FALSE;

-- Comentario para documentar el cambio
COMMENT ON COLUMN ventas_albaranes.contabilizado IS 'Indica si el albarán ha sido contabilizado (stock restado)';
