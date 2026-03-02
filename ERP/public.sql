/*
 Navicat Premium Dump SQL

 Source Server         : doscar core
 Source Server Type    : PostgreSQL
 Source Server Version : 140020 (140020)
 Source Host           : localhost:5432
 Source Catalog        : mi_db
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 140020 (140020)
 File Encoding         : 65001

 Date: 26/02/2026 16:22:32
*/


-- ----------------------------
-- Sequence structure for agrupaciones_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."agrupaciones_id_seq";
CREATE SEQUENCE "public"."agrupaciones_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for albaran_lineas_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."albaran_lineas_id_seq";
CREATE SEQUENCE "public"."albaran_lineas_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for albaran_lineas_id_seq1
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."albaran_lineas_id_seq1";
CREATE SEQUENCE "public"."albaran_lineas_id_seq1" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for albaranes_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."albaranes_id_seq";
CREATE SEQUENCE "public"."albaranes_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for almacenes_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."almacenes_id_seq";
CREATE SEQUENCE "public"."almacenes_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for archivos_empresa_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."archivos_empresa_id_seq";
CREATE SEQUENCE "public"."archivos_empresa_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for archivos_empresa_id_seq1
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."archivos_empresa_id_seq1";
CREATE SEQUENCE "public"."archivos_empresa_id_seq1" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for clientes_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."clientes_id_seq";
CREATE SEQUENCE "public"."clientes_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for codigo_barra_campos_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."codigo_barra_campos_id_seq";
CREATE SEQUENCE "public"."codigo_barra_campos_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for codigo_barra_campos_id_seq1
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."codigo_barra_campos_id_seq1";
CREATE SEQUENCE "public"."codigo_barra_campos_id_seq1" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for codigo_barra_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."codigo_barra_id_seq";
CREATE SEQUENCE "public"."codigo_barra_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for codigo_barra_id_seq1
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."codigo_barra_id_seq1";
CREATE SEQUENCE "public"."codigo_barra_id_seq1" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for compras_albaran_lineas_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."compras_albaran_lineas_id_seq";
CREATE SEQUENCE "public"."compras_albaran_lineas_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for compras_albaranes_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."compras_albaranes_id_seq";
CREATE SEQUENCE "public"."compras_albaranes_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for compras_factura_lineas_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."compras_factura_lineas_id_seq";
CREATE SEQUENCE "public"."compras_factura_lineas_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for compras_facturas_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."compras_facturas_id_seq";
CREATE SEQUENCE "public"."compras_facturas_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for compras_pedidos_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."compras_pedidos_id_seq";
CREATE SEQUENCE "public"."compras_pedidos_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for compras_pedidos_lineas_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."compras_pedidos_lineas_id_seq";
CREATE SEQUENCE "public"."compras_pedidos_lineas_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for condiciones_comerciales_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."condiciones_comerciales_id_seq";
CREATE SEQUENCE "public"."condiciones_comerciales_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for condiciones_comerciales_proveedor_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."condiciones_comerciales_proveedor_id_seq";
CREATE SEQUENCE "public"."condiciones_comerciales_proveedor_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for configuracion_ventas_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."configuracion_ventas_id_seq";
CREATE SEQUENCE "public"."configuracion_ventas_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for direcciones_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."direcciones_id_seq";
CREATE SEQUENCE "public"."direcciones_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for documento_transformaciones_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."documento_transformaciones_id_seq";
CREATE SEQUENCE "public"."documento_transformaciones_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for empresa_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."empresa_id_seq";
CREATE SEQUENCE "public"."empresa_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for empresa_id_seq1
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."empresa_id_seq1";
CREATE SEQUENCE "public"."empresa_id_seq1" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for fabricantes_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."fabricantes_id_seq";
CREATE SEQUENCE "public"."fabricantes_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for fabricantes_id_seq1
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."fabricantes_id_seq1";
CREATE SEQUENCE "public"."fabricantes_id_seq1" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for factura_lineas_id_seq1
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."factura_lineas_id_seq1";
CREATE SEQUENCE "public"."factura_lineas_id_seq1" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for familias_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."familias_id_seq";
CREATE SEQUENCE "public"."familias_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for familias_id_seq1
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."familias_id_seq1";
CREATE SEQUENCE "public"."familias_id_seq1" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for movimientos_stock_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."movimientos_stock_id_seq";
CREATE SEQUENCE "public"."movimientos_stock_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for plantilla_pdf_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."plantilla_pdf_id_seq";
CREATE SEQUENCE "public"."plantilla_pdf_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for preferencias_series_usuario_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."preferencias_series_usuario_id_seq";
CREATE SEQUENCE "public"."preferencias_series_usuario_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for producto_almacen_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."producto_almacen_id_seq";
CREATE SEQUENCE "public"."producto_almacen_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for producto_codigo_barra_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."producto_codigo_barra_id_seq";
CREATE SEQUENCE "public"."producto_codigo_barra_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for producto_referencias_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."producto_referencias_id_seq";
CREATE SEQUENCE "public"."producto_referencias_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for productos_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."productos_id_seq";
CREATE SEQUENCE "public"."productos_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for productos_id_seq1
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."productos_id_seq1";
CREATE SEQUENCE "public"."productos_id_seq1" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for proveedores_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."proveedores_id_seq";
CREATE SEQUENCE "public"."proveedores_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for proveedores_id_seq1
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."proveedores_id_seq1";
CREATE SEQUENCE "public"."proveedores_id_seq1" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for series_documento_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."series_documento_id_seq";
CREATE SEQUENCE "public"."series_documento_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for series_secuencia_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."series_secuencia_id_seq";
CREATE SEQUENCE "public"."series_secuencia_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for subfamilias_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."subfamilias_id_seq";
CREATE SEQUENCE "public"."subfamilias_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for tarifa_productos_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."tarifa_productos_id_seq";
CREATE SEQUENCE "public"."tarifa_productos_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for tarifas_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."tarifas_id_seq";
CREATE SEQUENCE "public"."tarifas_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for tipos_iva_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."tipos_iva_id_seq";
CREATE SEQUENCE "public"."tipos_iva_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for tpv_configuracion_tickets_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."tpv_configuracion_tickets_id_seq";
CREATE SEQUENCE "public"."tpv_configuracion_tickets_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for usuario_inicio_panel_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."usuario_inicio_panel_id_seq";
CREATE SEQUENCE "public"."usuario_inicio_panel_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for usuarios_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."usuarios_id_seq";
CREATE SEQUENCE "public"."usuarios_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for usuarios_id_seq1
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."usuarios_id_seq1";
CREATE SEQUENCE "public"."usuarios_id_seq1" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for ventas_factura_lineas_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."ventas_factura_lineas_id_seq";
CREATE SEQUENCE "public"."ventas_factura_lineas_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for ventas_factura_proforma_lineas_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."ventas_factura_proforma_lineas_id_seq";
CREATE SEQUENCE "public"."ventas_factura_proforma_lineas_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for ventas_factura_rectificativa_lineas_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."ventas_factura_rectificativa_lineas_id_seq";
CREATE SEQUENCE "public"."ventas_factura_rectificativa_lineas_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for ventas_facturas_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."ventas_facturas_id_seq";
CREATE SEQUENCE "public"."ventas_facturas_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for ventas_facturas_proforma_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."ventas_facturas_proforma_id_seq";
CREATE SEQUENCE "public"."ventas_facturas_proforma_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for ventas_facturas_rectificativas_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."ventas_facturas_rectificativas_id_seq";
CREATE SEQUENCE "public"."ventas_facturas_rectificativas_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for ventas_facturas_simplificadas_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."ventas_facturas_simplificadas_id_seq";
CREATE SEQUENCE "public"."ventas_facturas_simplificadas_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for ventas_facturas_simplificadas_lineas_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."ventas_facturas_simplificadas_lineas_id_seq";
CREATE SEQUENCE "public"."ventas_facturas_simplificadas_lineas_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for ventas_pedido_lineas_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."ventas_pedido_lineas_id_seq";
CREATE SEQUENCE "public"."ventas_pedido_lineas_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for ventas_pedidos_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."ventas_pedidos_id_seq";
CREATE SEQUENCE "public"."ventas_pedidos_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for ventas_presupuesto_lineas_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."ventas_presupuesto_lineas_id_seq";
CREATE SEQUENCE "public"."ventas_presupuesto_lineas_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for ventas_presupuestos_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."ventas_presupuestos_id_seq";
CREATE SEQUENCE "public"."ventas_presupuestos_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Table structure for agrupaciones
-- ----------------------------
DROP TABLE IF EXISTS "public"."agrupaciones";
CREATE TABLE "public"."agrupaciones" (
  "id" int8 NOT NULL DEFAULT nextval('agrupaciones_id_seq'::regclass),
  "nombre" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "descripcion" text COLLATE "pg_catalog"."default",
  "descuento_general" float8 DEFAULT 0,
  "activa" bool DEFAULT true,
  "observaciones" text COLLATE "pg_catalog"."default"
)
;
COMMENT ON TABLE "public"."agrupaciones" IS 'Agrupaciones de terceros (clientes) para aplicar condiciones comerciales especiales';

-- ----------------------------
-- Records of agrupaciones
-- ----------------------------
INSERT INTO "public"."agrupaciones" VALUES (1, 'MERCADONA', 'Grupo Mercadona', 15, 't', NULL);
INSERT INTO "public"."agrupaciones" VALUES (2, 'Carrefour', 'Pertenecen a carrefour', 2, 't', 'Descuento bajito');
INSERT INTO "public"."agrupaciones" VALUES (3, 'lll', ',', 99, 't', '.');

-- ----------------------------
-- Table structure for almacenes
-- ----------------------------
DROP TABLE IF EXISTS "public"."almacenes";
CREATE TABLE "public"."almacenes" (
  "id" int8 NOT NULL GENERATED BY DEFAULT AS IDENTITY (
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1
),
  "activo" bool NOT NULL,
  "created_at" timestamp(6),
  "descripcion" text COLLATE "pg_catalog"."default",
  "direccion" text COLLATE "pg_catalog"."default",
  "nombre" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "updated_at" timestamp(6)
)
;

-- ----------------------------
-- Records of almacenes
-- ----------------------------
INSERT INTO "public"."almacenes" VALUES (1, 't', '2026-01-12 15:13:36.102489', 'Almacen de la palma', 'cacacacacaraca', 'Almacen Central', '2026-01-12 15:13:36.102504');
INSERT INTO "public"."almacenes" VALUES (3, 't', NULL, 'Almacén principal de la empresa', NULL, 'Almacén Principal', NULL);

-- ----------------------------
-- Table structure for archivos_empresa
-- ----------------------------
DROP TABLE IF EXISTS "public"."archivos_empresa";
CREATE TABLE "public"."archivos_empresa" (
  "id" int8 NOT NULL GENERATED BY DEFAULT AS IDENTITY (
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1
),
  "es_carpeta" bool NOT NULL,
  "fecha_creacion" timestamp(6) NOT NULL,
  "fecha_modificacion" timestamp(6) NOT NULL,
  "nombre" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "nombre_archivo_sistema" varchar(255) COLLATE "pg_catalog"."default",
  "ruta_carpeta" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "tamano_bytes" int8,
  "tipo_mime" varchar(255) COLLATE "pg_catalog"."default",
  "documento_origen" varchar(255) COLLATE "pg_catalog"."default",
  "documento_origen_id" int8
)
;

-- ----------------------------
-- Records of archivos_empresa
-- ----------------------------
INSERT INTO "public"."archivos_empresa" VALUES (10, 'f', '2025-12-19 12:01:01.188549', '2025-12-19 12:02:20.932501', 'logo-empresa5', '2fa874c1-9a6c-43a3-b6c0-b04829eeafc3.png', '/', 18418, 'image/png', NULL, NULL);
INSERT INTO "public"."archivos_empresa" VALUES (20, 't', '2025-12-30 08:58:43.327532', '2025-12-30 08:58:43.327538', 'ventas', '079da065-805b-4ce4-a330-874d3c139d75', '/', NULL, NULL, NULL, NULL);
INSERT INTO "public"."archivos_empresa" VALUES (21, 't', '2025-12-30 08:58:43.384718', '2025-12-30 08:58:43.384722', 'albaranes', 'b47f4980-35bb-4fc6-b8dc-a529e18ebc26', '/ventas', NULL, NULL, NULL, NULL);
INSERT INTO "public"."archivos_empresa" VALUES (22, 't', '2025-12-30 08:58:43.432541', '2025-12-30 08:58:43.432543', 'adjuntos', '4c3fd37b-693a-4a4e-ac24-f4e45965823a', '/ventas/albaranes', NULL, NULL, NULL, NULL);
INSERT INTO "public"."archivos_empresa" VALUES (26, 'f', '2025-12-30 10:24:58.617979', '2025-12-30 10:24:58.617982', 'ALB-001_presupuesto_PRE-002.pdf', 'f97ab1a7-339a-46c4-b3e5-98e0cef89a6b.pdf', '/ventas/albaranes/adjuntos', 1789, 'application/pdf', 'ALBARAN', 11061);
INSERT INTO "public"."archivos_empresa" VALUES (27, 'f', '2025-12-30 12:04:24.471558', '2025-12-30 12:04:24.471561', 'ALB-002_VF25_2483_TECNOEKA IBÉRICA SL.pdf', '8bb47457-99bf-4397-9c3f-dfeb834ebba4.pdf', '/ventas/albaranes/adjuntos', 105632, 'application/pdf', NULL, NULL);
INSERT INTO "public"."archivos_empresa" VALUES (28, 'f', '2026-01-08 12:24:26.106781', '2026-01-08 12:24:26.106784', 'AB-01_639033759080653675.jfif', 'c4340e3d-d8d7-40f7-8c79-d8a180f26e4a.jfif', '/ventas/albaranes/adjuntos', 8292, 'image/jpeg', 'ALBARAN', 11065);
INSERT INTO "public"."archivos_empresa" VALUES (29, 'f', '2026-01-08 14:45:27.807945', '2026-01-08 14:45:27.807953', 'AB-02_doscar.png', '3eebb024-f55a-4473-8985-b092a8da3bfb.png', '/ventas/albaranes/adjuntos', 2499, 'image/png', 'ALBARAN', 11066);
INSERT INTO "public"."archivos_empresa" VALUES (30, 't', '2026-01-14 23:49:23.264147', '2026-01-14 23:49:23.264152', 'carpeta fotos especiales', '76a3dd8b-b027-4362-a832-7138d370ebda', '/', NULL, NULL, NULL, NULL);
INSERT INTO "public"."archivos_empresa" VALUES (31, 'f', '2026-01-14 23:49:31.676844', '2026-01-14 23:49:31.67685', 'Tema 6. Género publicitario.pdf', '702b17d0-423b-478a-b888-a7fec625e7fb.pdf', '/carpeta fotos especiales', 1903577, 'application/pdf', NULL, NULL);
INSERT INTO "public"."archivos_empresa" VALUES (32, 'f', '2026-02-09 10:01:50.511201', '2026-02-09 10:01:50.511203', 'SIN-NUMERO_-1.14-windows.xml', '5f6bfb9c-ca3c-462a-8729-ad264f304d03.xml', '/ventas/albaranes/adjuntos', 6579, 'text/xml', NULL, NULL);
INSERT INTO "public"."archivos_empresa" VALUES (33, 'f', '2026-02-19 11:06:51.848858', '2026-02-19 11:06:51.84886', 'AV26-00028_Captura de pantalla 2026-02-19 090750.png', '2b0c0908-33ed-4b1d-aec1-04d152eaa5ab.png', '/ventas/albaranes/adjuntos', 58913, 'image/png', 'ALBARAN', 11095);
INSERT INTO "public"."archivos_empresa" VALUES (34, 'f', '2026-02-19 11:24:16.184365', '2026-02-19 11:24:16.184386', 'Captura de pantalla 2026-02-19 090750.png', '553ecc98-e665-45de-aa66-77aeebd7836d.png', '/', 58913, 'image/png', NULL, NULL);
INSERT INTO "public"."archivos_empresa" VALUES (35, 'f', '2026-02-19 11:25:04.182793', '2026-02-19 11:25:04.182798', 'Captura de pantalla 2026-02-19 094128.png', 'd41f5946-e7ce-4b8a-aee7-669c07531b5d.png', '/', 121230, 'image/png', NULL, NULL);
INSERT INTO "public"."archivos_empresa" VALUES (37, 'f', '2026-02-19 12:00:21.561458', '2026-02-19 12:00:21.562016', 'Captura de pantalla 2026-02-19 090750.png', 'd976610e-dd09-405e-8868-6ad9ee9619c4.png', '/', 58913, 'image/png', NULL, NULL);
INSERT INTO "public"."archivos_empresa" VALUES (38, 'f', '2026-02-20 08:03:59.118153', '2026-02-20 08:03:59.118158', 'Captura de pantalla 2026-02-19 090750.png', 'e1ae6cb1-45c9-4d35-9bae-298023f6537f.png', '/', 58913, 'image/png', NULL, NULL);
INSERT INTO "public"."archivos_empresa" VALUES (50, 'f', '2026-02-20 10:08:05.187938', '2026-02-20 10:08:05.187942', 'Captura de pantalla 2026-02-19 094128.png', '4b1bc40d-5af6-4bbf-b038-2828afcf3827.png', '/', 121230, 'image/png', 'FACTURA', 9);
INSERT INTO "public"."archivos_empresa" VALUES (39, 'f', '2026-02-20 08:06:53.363144', '2026-02-20 08:06:53.36315', 'Captura de pantalla 2026-02-19 090750.png', 'e7b87f44-ca4a-49c1-8952-2bd8e712991b.png', '/', 58913, 'image/png', NULL, NULL);
INSERT INTO "public"."archivos_empresa" VALUES (51, 'f', '2026-02-20 11:35:25.448246', '2026-02-20 11:35:25.448251', 'Captura de pantalla 2026-02-20 111533.png', '43357ddb-2830-4161-b3d3-86192586fc4a.png', '/', 34375, 'image/png', 'ALBARAN', 11097);
INSERT INTO "public"."archivos_empresa" VALUES (40, 'f', '2026-02-20 08:07:26.491592', '2026-02-20 08:07:26.491597', 'Captura de pantalla 2026-02-19 090750.png', 'b3b45a1d-d2b6-486e-beee-b79b3db54f2b.png', '/', 58913, 'image/png', NULL, NULL);
INSERT INTO "public"."archivos_empresa" VALUES (52, 'f', '2026-02-20 14:14:58.729835', '2026-02-20 14:14:58.729843', 'Captura de pantalla 2025-05-12 135503.png', '96de327e-bc94-4a0c-b415-f45d71c3d124.png', '/', 241602, 'image/png', 'FACTURA_PROFORMA', 4);
INSERT INTO "public"."archivos_empresa" VALUES (41, 'f', '2026-02-20 08:07:45.056691', '2026-02-20 08:07:45.056697', 'Captura de pantalla 2026-02-19 174130.png', '9873e849-29ad-4070-83b4-dafbe69a82f2.png', '/', 26259, 'image/png', NULL, NULL);
INSERT INTO "public"."archivos_empresa" VALUES (42, 'f', '2026-02-20 08:09:34.403155', '2026-02-20 08:09:34.403159', 'Captura de pantalla 2026-02-19 090750.png', '5e2a143a-9880-4afd-8bd9-98e56c35aba0.png', '/', 58913, 'image/png', NULL, NULL);
INSERT INTO "public"."archivos_empresa" VALUES (43, 'f', '2026-02-20 08:11:54.160465', '2026-02-20 08:11:54.160471', 'Captura de pantalla 2026-02-19 174130.png', '34506bbb-b8b8-46e7-a0d8-4255437a0c03.png', '/', 26259, 'image/png', NULL, NULL);
INSERT INTO "public"."archivos_empresa" VALUES (44, 'f', '2026-02-20 08:13:33.890405', '2026-02-20 08:13:33.890411', 'Captura de pantalla 2026-02-19 174130.png', 'bcbf76c0-0182-476c-94e8-664d6c390024.png', '/', 26259, 'image/png', NULL, NULL);
INSERT INTO "public"."archivos_empresa" VALUES (45, 'f', '2026-02-20 08:17:04.09652', '2026-02-20 08:17:04.096525', 'Captura de pantalla 2026-02-19 174130.png', '39b3deb4-1069-41b9-8d3e-ab7d4b4850ec.png', '/', 26259, 'image/png', NULL, NULL);
INSERT INTO "public"."archivos_empresa" VALUES (53, 'f', '2026-02-24 09:18:54.914665', '2026-02-24 09:18:54.914673', 'Captura de pantalla 2026-02-24 091639.png', 'eacdcb69-cfe9-4c97-8200-2eb5eebf43ba.png', '/', 3846, 'image/png', 'FACTURA_PROFORMA', 8);
INSERT INTO "public"."archivos_empresa" VALUES (54, 'f', '2026-02-24 10:21:02.486118', '2026-02-24 10:21:02.486126', 'Captura de pantalla 2026-02-24 093841.png', 'f1b7f05d-e4c4-4d2f-b40f-d53beddda636.png', '/', 21963, 'image/png', 'ALBARAN', 11099);
INSERT INTO "public"."archivos_empresa" VALUES (46, 'f', '2026-02-20 08:17:22.748092', '2026-02-20 08:17:22.748097', 'Captura de pantalla 2026-02-19 173807.png', '6f4d850d-dac3-4095-bf86-511541398b3a.png', '/', 36211, 'image/png', NULL, NULL);
INSERT INTO "public"."archivos_empresa" VALUES (48, 'f', '2026-02-20 09:16:48.800156', '2026-02-20 09:16:48.800163', 'Captura de pantalla 2026-02-19 121422.png', '3f3da5e7-561e-4b25-9ad9-e9e525557909.png', '/', 11630, 'image/png', NULL, NULL);
INSERT INTO "public"."archivos_empresa" VALUES (47, 'f', '2026-02-20 09:12:16.267378', '2026-02-20 09:12:16.267383', 'Captura de pantalla 2026-02-19 150040.png', 'dc7e5848-3968-4e67-921d-a44f57a9e515.png', '/', 7337, 'image/png', 'FACTURA_RECTIFICATIVA', 12);
INSERT INTO "public"."archivos_empresa" VALUES (49, 'f', '2026-02-20 10:04:49.231599', '2026-02-20 10:04:49.231603', 'Captura de pantalla 2026-02-19 150040.png', '6f768e5c-2e0d-48a5-8239-42db67ef3bb2.png', '/', 7337, 'image/png', NULL, NULL);

-- ----------------------------
-- Table structure for clientes
-- ----------------------------
DROP TABLE IF EXISTS "public"."clientes";
CREATE TABLE "public"."clientes" (
  "id" int8 NOT NULL DEFAULT nextval('clientes_id_seq'::regclass),
  "nombre_comercial" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "nombre_fiscal" varchar(255) COLLATE "pg_catalog"."default",
  "nif_cif" varchar(255) COLLATE "pg_catalog"."default",
  "email" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "web" varchar(255) COLLATE "pg_catalog"."default",
  "observaciones" text COLLATE "pg_catalog"."default",
  "telefono_fijo" varchar(255) COLLATE "pg_catalog"."default",
  "telefono_movil" varchar(255) COLLATE "pg_catalog"."default",
  "fax" varchar(255) COLLATE "pg_catalog"."default",
  "fecha_nacimiento" date,
  "tarifa" varchar(255) COLLATE "pg_catalog"."default" DEFAULT 'Normal'::character varying,
  "descuento" float8 DEFAULT 0,
  "forma_pago" varchar(255) COLLATE "pg_catalog"."default" DEFAULT 'CONTADO'::character varying,
  "dias_pago_1" int4 DEFAULT 0,
  "dias_pago_2" int4 DEFAULT 0,
  "riesgo_autorizado" float8 DEFAULT 0,
  "bloquear_ventas" bool DEFAULT false,
  "nombre_entidad_bancaria" varchar(255) COLLATE "pg_catalog"."default",
  "cuenta_ccc_entidad" varchar(255) COLLATE "pg_catalog"."default",
  "cuenta_ccc_oficina" varchar(255) COLLATE "pg_catalog"."default",
  "cuenta_ccc_dc" varchar(255) COLLATE "pg_catalog"."default",
  "cuenta_ccc_numero" varchar(255) COLLATE "pg_catalog"."default",
  "cuenta_iban" varchar(255) COLLATE "pg_catalog"."default",
  "cuenta_iban_pais" varchar(255) COLLATE "pg_catalog"."default" DEFAULT 'ES'::character varying,
  "modo_impuesto" varchar(255) COLLATE "pg_catalog"."default" DEFAULT 'Normal'::character varying,
  "retencion" varchar(255) COLLATE "pg_catalog"."default" DEFAULT 'Exento 0%'::character varying,
  "agrupacion_id" int8,
  "recargo_equivalencia" bool NOT NULL DEFAULT false,
  "tarifa_id" int8
)
;
COMMENT ON COLUMN "public"."clientes"."tarifa_id" IS 'Tarifa asignada al cliente (NULL = usar tarifa general)';

-- ----------------------------
-- Records of clientes
-- ----------------------------
INSERT INTO "public"."clientes" VALUES (2, 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '', '', '+34 930 202 020', '+34 600 202 020', '', NULL, 'Normal', 0, 'CONTADO', 0, 0, 500, 'f', '25', '', '', '', '', '', 'ES', 'Normal', 'Exento 0%', 2, 't', NULL);
INSERT INTO "public"."clientes" VALUES (1, 'Cliente Uno', 'Cliente Uno S.L.2', '45968199P', 'cliente1@demo.local', 'https://www.google.es/', 'Cliente preferente', '+34 910 101 010', '+34 600 101 010', '600 101 010', '2000-12-28', 'Normal', 2, 'TRANSFERENCIA', 30, 2, 1500, 'f', 'Banco Demo', 'enti', 'ofic', 'dc', 'ncue', 'ES9121000418450200051332', 'ES', 'Normal', 'Exento 0%', 3, 'f', NULL);
INSERT INTO "public"."clientes" VALUES (16, 'asd', 'asd', '20715455E', 'web@doscar.com', '', '', '924229230', '', '', '2000-06-14', 'Normal', 0, 'CONTADO', 0, 0, 0, 'f', '', '', '', '', '', '', '', 'Normal', 'Exento 0%', NULL, 'f', NULL);

-- ----------------------------
-- Table structure for codigo_barra
-- ----------------------------
DROP TABLE IF EXISTS "public"."codigo_barra";
CREATE TABLE "public"."codigo_barra" (
  "id" int8 NOT NULL GENERATED BY DEFAULT AS IDENTITY (
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1
),
  "descripcion" text COLLATE "pg_catalog"."default",
  "nombre" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "tipo" varchar(20) COLLATE "pg_catalog"."default",
  "es_estandar" bool DEFAULT false,
  "longitud_fija" int4
)
;
COMMENT ON COLUMN "public"."codigo_barra"."tipo" IS 'Tipo de código: EAN13, EAN8, CODE128, BALANZA_CUSTOM';
COMMENT ON COLUMN "public"."codigo_barra"."es_estandar" IS 'Indica si es un formato estándar (EAN13/EAN8/CODE128) o personalizado (balanza)';
COMMENT ON COLUMN "public"."codigo_barra"."longitud_fija" IS 'Longitud fija del código si aplica (13 para EAN13, 8 para EAN8)';

-- ----------------------------
-- Records of codigo_barra
-- ----------------------------
INSERT INTO "public"."codigo_barra" VALUES (3, 'Código de barras EAN-13 estándar (13 dígitos)', 'EAN13', 'EAN13', 't', 13);
INSERT INTO "public"."codigo_barra" VALUES (4, 'Código de barras EAN-8 estándar (8 dígitos)', 'EAN8', 'EAN8', 't', 8);
INSERT INTO "public"."codigo_barra" VALUES (5, 'Código de barras CODE-128 alfanumérico', 'CODE128', 'CODE128', 't', NULL);
INSERT INTO "public"."codigo_barra" VALUES (1, 'EAN13 con campos internos para peso/lote', 'EAN13-Peso', 'BALANZA_CUSTOM', 'f', NULL);
INSERT INTO "public"."codigo_barra" VALUES (6, '', 'EAN-13 PRUEBA', NULL, 'f', NULL);

-- ----------------------------
-- Table structure for codigo_barra_campos
-- ----------------------------
DROP TABLE IF EXISTS "public"."codigo_barra_campos";
CREATE TABLE "public"."codigo_barra_campos" (
  "id" int8 NOT NULL GENERATED BY DEFAULT AS IDENTITY (
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1
),
  "longitud" int4 NOT NULL,
  "nombre" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "orden" int4 NOT NULL,
  "codigo_barra_id" int8,
  "decimales" int4 NOT NULL
)
;

-- ----------------------------
-- Records of codigo_barra_campos
-- ----------------------------
INSERT INTO "public"."codigo_barra_campos" VALUES (10, 13, 'nada', 1, 6, 0);
INSERT INTO "public"."codigo_barra_campos" VALUES (11, 4, 'lote', 1, 1, 0);
INSERT INTO "public"."codigo_barra_campos" VALUES (12, 3, 'producto', 2, 1, 0);
INSERT INTO "public"."codigo_barra_campos" VALUES (13, 6, 'peso', 3, 1, 3);

-- ----------------------------
-- Table structure for compras_albaranes
-- ----------------------------
DROP TABLE IF EXISTS "public"."compras_albaranes";
CREATE TABLE "public"."compras_albaranes" (
  "id" int8 NOT NULL DEFAULT nextval('compras_albaranes_id_seq'::regclass),
  "numero" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "fecha" timestamp(6) NOT NULL,
  "proveedor_id" int8,
  "factura_compra_id" int8,
  "observaciones" text COLLATE "pg_catalog"."default",
  "notas" text COLLATE "pg_catalog"."default",
  "estado" varchar(50) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'Pendiente'::character varying,
  "subtotal" float8 NOT NULL DEFAULT 0,
  "descuento_total" float8 NOT NULL DEFAULT 0,
  "total" float8 NOT NULL DEFAULT 0,
  "descuento_agrupacion" float8 NOT NULL DEFAULT 0,
  "almacen_id" int8,
  "compra_multialmacen" bool NOT NULL DEFAULT false,
  "tarifa_id" int8,
  "serie_id" int8,
  "anio_documento" int4,
  "numero_secuencial" int8,
  "codigo_documento" varchar(255) COLLATE "pg_catalog"."default",
  "contabilizado" bool NOT NULL DEFAULT false,
  "proveedor_nombre_comercial" varchar(255) COLLATE "pg_catalog"."default",
  "proveedor_nombre_fiscal" varchar(255) COLLATE "pg_catalog"."default",
  "proveedor_nif_cif" varchar(50) COLLATE "pg_catalog"."default",
  "proveedor_email" varchar(255) COLLATE "pg_catalog"."default",
  "proveedor_telefono" varchar(50) COLLATE "pg_catalog"."default",
  "direccion_facturacion_pais" varchar(100) COLLATE "pg_catalog"."default",
  "direccion_facturacion_codigo_postal" varchar(20) COLLATE "pg_catalog"."default",
  "direccion_facturacion_provincia" varchar(100) COLLATE "pg_catalog"."default",
  "direccion_facturacion_poblacion" varchar(100) COLLATE "pg_catalog"."default",
  "direccion_facturacion_direccion" text COLLATE "pg_catalog"."default",
  "direccion_envio_pais" varchar(100) COLLATE "pg_catalog"."default",
  "direccion_envio_codigo_postal" varchar(20) COLLATE "pg_catalog"."default",
  "direccion_envio_provincia" varchar(100) COLLATE "pg_catalog"."default",
  "direccion_envio_poblacion" varchar(100) COLLATE "pg_catalog"."default",
  "direccion_envio_direccion" text COLLATE "pg_catalog"."default",
  "direccion_id" int8,
  "recargo_equivalencia" bool NOT NULL DEFAULT false,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
COMMENT ON COLUMN "public"."compras_albaranes"."compra_multialmacen" IS 'Indica si el albarán permite productos de diferentes almacenes';
COMMENT ON COLUMN "public"."compras_albaranes"."contabilizado" IS 'Indica si el albarán ha sido contabilizado';
COMMENT ON COLUMN "public"."compras_albaranes"."recargo_equivalencia" IS 'Indica si se aplica recargo de equivalencia';
COMMENT ON TABLE "public"."compras_albaranes" IS 'Albaranes de compra a proveedores';

-- ----------------------------
-- Records of compras_albaranes
-- ----------------------------

-- ----------------------------
-- Table structure for compras_albaranes_lineas
-- ----------------------------
DROP TABLE IF EXISTS "public"."compras_albaranes_lineas";
CREATE TABLE "public"."compras_albaranes_lineas" (
  "id" int8 NOT NULL DEFAULT nextval('compras_albaran_lineas_id_seq'::regclass),
  "albaran_compra_id" int8 NOT NULL,
  "producto_id" int8,
  "nombre_producto" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "referencia" varchar(100) COLLATE "pg_catalog"."default",
  "cantidad" int4 NOT NULL DEFAULT 0,
  "precio_unitario" float8 NOT NULL DEFAULT 0,
  "descuento" float8 NOT NULL DEFAULT 0,
  "observaciones" text COLLATE "pg_catalog"."default",
  "tipo_iva_id" int8,
  "porcentaje_iva" float8 NOT NULL DEFAULT 0,
  "porcentaje_recargo" float8 NOT NULL DEFAULT 0,
  "importe_iva" float8 NOT NULL DEFAULT 0,
  "importe_recargo" float8 NOT NULL DEFAULT 0,
  "almacen_id" int8,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
COMMENT ON TABLE "public"."compras_albaranes_lineas" IS 'Líneas de detalle de albaranes de compra';

-- ----------------------------
-- Records of compras_albaranes_lineas
-- ----------------------------

-- ----------------------------
-- Table structure for compras_facturas
-- ----------------------------
DROP TABLE IF EXISTS "public"."compras_facturas";
CREATE TABLE "public"."compras_facturas" (
  "id" int8 NOT NULL DEFAULT nextval('compras_facturas_id_seq'::regclass),
  "numero" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "fecha" timestamp(6) NOT NULL,
  "proveedor_id" int8,
  "pedido_compra_id" int8,
  "albaran_compra_id" int8,
  "observaciones" text COLLATE "pg_catalog"."default",
  "notas" text COLLATE "pg_catalog"."default",
  "estado" varchar(50) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'Pendiente'::character varying,
  "subtotal" float8 NOT NULL DEFAULT 0,
  "descuento_total" float8 NOT NULL DEFAULT 0,
  "total" float8 NOT NULL DEFAULT 0,
  "descuento_agrupacion" float8 NOT NULL DEFAULT 0,
  "almacen_id" int8,
  "compra_multialmacen" bool NOT NULL DEFAULT false,
  "tarifa_id" int8,
  "serie_id" int8,
  "anio_documento" int4,
  "numero_secuencial" int8,
  "codigo_documento" varchar(255) COLLATE "pg_catalog"."default",
  "contabilizado" bool NOT NULL DEFAULT false,
  "proveedor_nombre_comercial" varchar(255) COLLATE "pg_catalog"."default",
  "proveedor_nombre_fiscal" varchar(255) COLLATE "pg_catalog"."default",
  "proveedor_nif_cif" varchar(50) COLLATE "pg_catalog"."default",
  "proveedor_email" varchar(255) COLLATE "pg_catalog"."default",
  "proveedor_telefono" varchar(50) COLLATE "pg_catalog"."default",
  "direccion_facturacion_pais" varchar(100) COLLATE "pg_catalog"."default",
  "direccion_facturacion_codigo_postal" varchar(20) COLLATE "pg_catalog"."default",
  "direccion_facturacion_provincia" varchar(100) COLLATE "pg_catalog"."default",
  "direccion_facturacion_poblacion" varchar(100) COLLATE "pg_catalog"."default",
  "direccion_facturacion_direccion" text COLLATE "pg_catalog"."default",
  "direccion_envio_pais" varchar(100) COLLATE "pg_catalog"."default",
  "direccion_envio_codigo_postal" varchar(20) COLLATE "pg_catalog"."default",
  "direccion_envio_provincia" varchar(100) COLLATE "pg_catalog"."default",
  "direccion_envio_poblacion" varchar(100) COLLATE "pg_catalog"."default",
  "direccion_envio_direccion" text COLLATE "pg_catalog"."default",
  "direccion_id" int8,
  "recargo_equivalencia" bool NOT NULL DEFAULT false,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
COMMENT ON COLUMN "public"."compras_facturas"."compra_multialmacen" IS 'Indica si la factura permite productos de diferentes almacenes';
COMMENT ON COLUMN "public"."compras_facturas"."contabilizado" IS 'Indica si la factura ha sido contabilizada';
COMMENT ON COLUMN "public"."compras_facturas"."recargo_equivalencia" IS 'Indica si se aplica recargo de equivalencia';
COMMENT ON TABLE "public"."compras_facturas" IS 'Facturas de compra a proveedores';

-- ----------------------------
-- Records of compras_facturas
-- ----------------------------

-- ----------------------------
-- Table structure for compras_facturas_lineas
-- ----------------------------
DROP TABLE IF EXISTS "public"."compras_facturas_lineas";
CREATE TABLE "public"."compras_facturas_lineas" (
  "id" int8 NOT NULL DEFAULT nextval('compras_factura_lineas_id_seq'::regclass),
  "factura_compra_id" int8 NOT NULL,
  "producto_id" int8,
  "nombre_producto" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "referencia" varchar(100) COLLATE "pg_catalog"."default",
  "cantidad" int4 NOT NULL DEFAULT 0,
  "precio_unitario" float8 NOT NULL DEFAULT 0,
  "descuento" float8 NOT NULL DEFAULT 0,
  "observaciones" text COLLATE "pg_catalog"."default",
  "tipo_iva_id" int8,
  "porcentaje_iva" float8 NOT NULL DEFAULT 0,
  "porcentaje_recargo" float8 NOT NULL DEFAULT 0,
  "importe_iva" float8 NOT NULL DEFAULT 0,
  "importe_recargo" float8 NOT NULL DEFAULT 0,
  "almacen_id" int8,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
COMMENT ON TABLE "public"."compras_facturas_lineas" IS 'Líneas de detalle de facturas de compra';

-- ----------------------------
-- Records of compras_facturas_lineas
-- ----------------------------

-- ----------------------------
-- Table structure for compras_pedidos
-- ----------------------------
DROP TABLE IF EXISTS "public"."compras_pedidos";
CREATE TABLE "public"."compras_pedidos" (
  "id" int8 NOT NULL DEFAULT nextval('compras_pedidos_id_seq'::regclass),
  "numero" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "fecha" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "proveedor_id" int8,
  "observaciones" text COLLATE "pg_catalog"."default",
  "estado" varchar(50) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'Pendiente'::character varying,
  "subtotal" float8 NOT NULL DEFAULT 0,
  "descuento_total" float8 NOT NULL DEFAULT 0,
  "total" float8 NOT NULL DEFAULT 0,
  "descuento_agrupacion" float8 NOT NULL DEFAULT 0,
  "notas" text COLLATE "pg_catalog"."default",
  "serie_id" int8,
  "almacen_id" int8,
  "tarifa_id" int8,
  "anio_documento" int4,
  "numero_secuencial" int8,
  "codigo_documento" varchar(255) COLLATE "pg_catalog"."default",
  "proveedor_nombre_comercial" varchar(255) COLLATE "pg_catalog"."default",
  "proveedor_nombre_fiscal" varchar(255) COLLATE "pg_catalog"."default",
  "proveedor_nif_cif" varchar(50) COLLATE "pg_catalog"."default",
  "proveedor_email" varchar(255) COLLATE "pg_catalog"."default",
  "proveedor_telefono" varchar(50) COLLATE "pg_catalog"."default",
  "direccion_facturacion_pais" varchar(100) COLLATE "pg_catalog"."default",
  "direccion_facturacion_codigo_postal" varchar(20) COLLATE "pg_catalog"."default",
  "direccion_facturacion_provincia" varchar(100) COLLATE "pg_catalog"."default",
  "direccion_facturacion_poblacion" varchar(100) COLLATE "pg_catalog"."default",
  "direccion_facturacion_direccion" text COLLATE "pg_catalog"."default",
  "direccion_envio_pais" varchar(100) COLLATE "pg_catalog"."default",
  "direccion_envio_codigo_postal" varchar(20) COLLATE "pg_catalog"."default",
  "direccion_envio_provincia" varchar(100) COLLATE "pg_catalog"."default",
  "direccion_envio_poblacion" varchar(100) COLLATE "pg_catalog"."default",
  "direccion_envio_direccion" text COLLATE "pg_catalog"."default",
  "created_at" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "compra_multialmacen" bool NOT NULL DEFAULT false,
  "direccion_pais" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_codigo_postal" varchar(20) COLLATE "pg_catalog"."default",
  "direccion_provincia" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_poblacion" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_direccion" text COLLATE "pg_catalog"."default",
  "direccion_id" int8,
  "recargo_equivalencia" bool DEFAULT false
)
;
COMMENT ON COLUMN "public"."compras_pedidos"."direccion_facturacion_pais" IS 'Snapshot del país de la dirección de facturación';
COMMENT ON COLUMN "public"."compras_pedidos"."direccion_envio_pais" IS 'Snapshot del país de la dirección de envío';
COMMENT ON COLUMN "public"."compras_pedidos"."direccion_id" IS 'ID de la dirección de envío seleccionada del proveedor';
COMMENT ON COLUMN "public"."compras_pedidos"."recargo_equivalencia" IS 'Indica si se aplica recargo de equivalencia en este pedido';

-- ----------------------------
-- Records of compras_pedidos
-- ----------------------------
INSERT INTO "public"."compras_pedidos" VALUES (1, 'PC-00001', '2026-02-24 00:00:00', 112, 'asd', 'Pendiente', 112, 0, 132.58960000000002, 5, 'asd', NULL, NULL, NULL, NULL, NULL, NULL, 'proveedor 1 ejemplo', 'proveedor 1 ejemplo', 'Z3239792V', 'web@doscar.com', '924229230', 'España', '06011', 'BADAJOZ', 'BADAJOZ', 'Servando González Becerra 5, Entreplanta Oficinas H-J', 'España', '06010', 'BADAJOZ', 'BADAJOZ', 'Carretera de Valverde KM 2', '2026-02-24 17:54:44.261558', '2026-02-25 09:43:19.884522', 'f', NULL, NULL, NULL, NULL, NULL, 51, 'f');
INSERT INTO "public"."compras_pedidos" VALUES (3, 'PC-00005', '2026-02-25 00:00:00', 112, '', 'Pendiente', 0, 0, 0, 15, '', 10, 1, NULL, 2026, 5, 'PC-00005', 'proveedor 1 ejemplo', 'proveedor 1 ejemplo', 'Z3239792V', 'web@doscar.com', '924229230', 'España', '06011', 'BADAJOZ', 'BADAJOZ', 'Servando González Becerra 5, Entreplanta Oficinas H-J', 'España', '06010', 'BADAJOZ', 'BADAJOZ', 'Carretera de Valverde KM 2', '2026-02-25 10:29:55.291562', '2026-02-25 10:29:55.291563', 'f', NULL, NULL, NULL, NULL, NULL, NULL, 'f');
INSERT INTO "public"."compras_pedidos" VALUES (4, 'PC-00006', '2026-02-26 12:48:21.647235', 112, 'asd', 'Pendiente', 12, 0, 10.658999999999999, 15, 'asd', 10, 1, 1, NULL, NULL, NULL, 'proveedor 1 ejemplo', 'proveedor 1 ejemplo', 'Z3239792V', 'web@doscar.com', '924229230', 'España', '06011', 'BADAJOZ', 'BADAJOZ', 'Servando González Becerra 5, Entreplanta Oficinas H-J', 'España', '06010', 'BADAJOZ', 'BADAJOZ', 'Carretera de Valverde KM 2', '2026-02-25 10:33:07.479739', '2026-02-26 12:48:21.64726', 'f', NULL, NULL, NULL, NULL, NULL, NULL, 'f');
INSERT INTO "public"."compras_pedidos" VALUES (5, 'PC-00007', '2026-02-26 13:33:14.39383', 112, '', 'Pendiente', 0, 0, 0, 15, '', 10, 1, 1, NULL, NULL, NULL, 'proveedor 1 ejemplo', 'proveedor 1 ejemplo', 'Z3239792V', 'web@doscar.com', '924229230', 'España', '06011', 'BADAJOZ', 'BADAJOZ', 'Servando González Becerra 5, Entreplanta Oficinas H-J', 'España', '06010', 'BADAJOZ', 'BADAJOZ', 'Carretera de Valverde KM 2', '2026-02-26 12:23:36.174485', '2026-02-26 13:36:13.288802', 'f', NULL, NULL, NULL, NULL, NULL, NULL, 'f');

-- ----------------------------
-- Table structure for compras_pedidos_lineas
-- ----------------------------
DROP TABLE IF EXISTS "public"."compras_pedidos_lineas";
CREATE TABLE "public"."compras_pedidos_lineas" (
  "id" int8 NOT NULL DEFAULT nextval('compras_pedidos_lineas_id_seq'::regclass),
  "pedido_compra_id" int8 NOT NULL,
  "producto_id" int8,
  "nombre_producto" varchar(500) COLLATE "pg_catalog"."default",
  "referencia" varchar(255) COLLATE "pg_catalog"."default",
  "cantidad" float8 NOT NULL DEFAULT 0,
  "precio_unitario" float8 NOT NULL DEFAULT 0,
  "descuento" float8 NOT NULL DEFAULT 0,
  "observaciones" text COLLATE "pg_catalog"."default",
  "tipo_iva_id" int8,
  "porcentaje_iva" float8 NOT NULL DEFAULT 0,
  "porcentaje_recargo" float8 NOT NULL DEFAULT 0,
  "importe_iva" float8 NOT NULL DEFAULT 0,
  "importe_recargo" float8 NOT NULL DEFAULT 0,
  "almacen_id" int8
)
;

-- ----------------------------
-- Records of compras_pedidos_lineas
-- ----------------------------
INSERT INTO "public"."compras_pedidos_lineas" VALUES (25, 1, NULL, 'Costillar BBQ iberico', 'REF1', 1, 100, 0, '', 1, 21, 5.2, 19.95, 4.94, NULL);
INSERT INTO "public"."compras_pedidos_lineas" VALUES (26, 1, NULL, 'Pollo teriyaki', 'REF2', 1, 12, 0, '', 2, 10, 1.4, 1.14, 0.15959999999999996, NULL);
INSERT INTO "public"."compras_pedidos_lineas" VALUES (39, 4, 4, 'Blanco Dulce Eva', 'REF4', 1, 12, 0, '', 3, 4, 0.5, 0.408, 0.051, NULL);

-- ----------------------------
-- Table structure for condiciones_comerciales
-- ----------------------------
DROP TABLE IF EXISTS "public"."condiciones_comerciales";
CREATE TABLE "public"."condiciones_comerciales" (
  "id" int8 NOT NULL DEFAULT nextval('condiciones_comerciales_id_seq'::regclass),
  "agrupacion_id" int8 NOT NULL,
  "producto_id" int8,
  "tipo_condicion" varchar(255) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'DESCUENTO_PORCENTAJE'::character varying,
  "valor" float8 DEFAULT 0,
  "precio_especial" float8,
  "cantidad_minima" int4 DEFAULT 0,
  "cantidad_maxima" int4,
  "activa" bool DEFAULT true,
  "descripcion" text COLLATE "pg_catalog"."default",
  "prioridad" int4 DEFAULT 0,
  "tarifa_id" int8
)
;
COMMENT ON COLUMN "public"."condiciones_comerciales"."tipo_condicion" IS 'Tipos: DESCUENTO_PORCENTAJE, DESCUENTO_FIJO, PRECIO_ESPECIAL, DESCUENTO_POR_CANTIDAD';
COMMENT ON COLUMN "public"."condiciones_comerciales"."valor" IS 'Valor del descuento (porcentaje o cantidad fija)';
COMMENT ON COLUMN "public"."condiciones_comerciales"."precio_especial" IS 'Precio especial para esta agrupación (opcional)';
COMMENT ON COLUMN "public"."condiciones_comerciales"."cantidad_minima" IS 'Cantidad mínima para aplicar la condición';
COMMENT ON COLUMN "public"."condiciones_comerciales"."cantidad_maxima" IS 'Cantidad máxima para aplicar la condición (NULL = sin límite)';
COMMENT ON COLUMN "public"."condiciones_comerciales"."prioridad" IS 'Prioridad de aplicación (mayor número = mayor prioridad)';
COMMENT ON COLUMN "public"."condiciones_comerciales"."tarifa_id" IS 'Tarifa específica a la que aplica esta condición (NULL = aplica a todas las tarifas)';
COMMENT ON TABLE "public"."condiciones_comerciales" IS 'Condiciones comerciales específicas por agrupación y producto (descuentos, precios especiales, etc.)';

-- ----------------------------
-- Records of condiciones_comerciales
-- ----------------------------
INSERT INTO "public"."condiciones_comerciales" VALUES (1, 1, 4, 'DESCUENTO_POR_CANTIDAD', 95, NULL, 10, 100, 't', NULL, 10, NULL);
INSERT INTO "public"."condiciones_comerciales" VALUES (2, 3, 1, 'PRECIO_ESPECIAL', 0, 120, 2, NULL, 't', NULL, 7, NULL);
INSERT INTO "public"."condiciones_comerciales" VALUES (3, 2, 1, 'DESCUENTO_POR_CANTIDAD', 21, NULL, 3, NULL, 't', NULL, 10, 35);

-- ----------------------------
-- Table structure for condiciones_comerciales_proveedor
-- ----------------------------
DROP TABLE IF EXISTS "public"."condiciones_comerciales_proveedor";
CREATE TABLE "public"."condiciones_comerciales_proveedor" (
  "id" int8 NOT NULL DEFAULT nextval('condiciones_comerciales_proveedor_id_seq'::regclass),
  "agrupacion_id" int8 NOT NULL,
  "producto_id" int8,
  "tarifa_id" int8,
  "tipo_condicion" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "valor" float8,
  "precio_especial" float8,
  "cantidad_minima" int4,
  "cantidad_maxima" int4,
  "activa" bool DEFAULT true,
  "descripcion" text COLLATE "pg_catalog"."default",
  "prioridad" int4 DEFAULT 0
)
;

-- ----------------------------
-- Records of condiciones_comerciales_proveedor
-- ----------------------------
INSERT INTO "public"."condiciones_comerciales_proveedor" VALUES (1, 1, 4, 1, 'PRECIO_ESPECIAL', 0, 1, 2, NULL, 't', NULL, 10);

-- ----------------------------
-- Table structure for configuracion_ventas
-- ----------------------------
DROP TABLE IF EXISTS "public"."configuracion_ventas";
CREATE TABLE "public"."configuracion_ventas" (
  "id" int8 NOT NULL DEFAULT nextval('configuracion_ventas_id_seq'::regclass),
  "contabilizar_albaran" varchar(255) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'PREGUNTAR'::character varying,
  "contabilizar_presupuesto" varchar(255) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'NO'::character varying,
  "actualizado_en" timestamp(6) NOT NULL DEFAULT now(),
  "estados_albaran" text COLLATE "pg_catalog"."default",
  "permitir_venta_multialmacen" bool DEFAULT false,
  "documento_descuenta_stock" varchar(255) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'ALBARAN'::character varying,
  "permitir_venta_sin_stock" bool NOT NULL DEFAULT false,
  "permitir_multitarifa" bool NOT NULL DEFAULT false
)
;

-- ----------------------------
-- Records of configuracion_ventas
-- ----------------------------
INSERT INTO "public"."configuracion_ventas" VALUES (1, 'PREGUNTAR', 'NO', '2026-02-24 12:50:59.933156', '[{"nombre":"Pendiente","colorClaro":"#FDE68A55","colorOscuro":"#92400E55"},{"nombre":"Emitido","colorClaro":"#BBF7D055","colorOscuro":"#14532D55"},{"nombre":"Entregado","colorClaro":"#C7D2FE55","colorOscuro":"#312E8155"},{"nombre":"Facturado","colorClaro":"#FBCFE855","colorOscuro":"#701A7555"},{"nombre":"Cancelado","colorClaro":"#FECACA55","colorOscuro":"#7F1D1D55"}]', 't', 'FACTURA', 't', 't');

-- ----------------------------
-- Table structure for direcciones
-- ----------------------------
DROP TABLE IF EXISTS "public"."direcciones";
CREATE TABLE "public"."direcciones" (
  "id" int8 NOT NULL DEFAULT nextval('direcciones_id_seq'::regclass),
  "tipo_tercero" varchar(20) COLLATE "pg_catalog"."default" NOT NULL,
  "id_tercero" int8 NOT NULL,
  "pais" varchar(56) COLLATE "pg_catalog"."default" NOT NULL,
  "codigo_postal" varchar(12) COLLATE "pg_catalog"."default",
  "provincia" varchar(100) COLLATE "pg_catalog"."default",
  "poblacion" varchar(100) COLLATE "pg_catalog"."default",
  "direccion" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "tipo_direccion" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'ENVIO'::character varying
)
;

-- ----------------------------
-- Records of direcciones
-- ----------------------------
INSERT INTO "public"."direcciones" VALUES (13, 'PROVEEDOR', 12, 'España', '05000', 'asdddd', 'asddd', 'asdddd', 'ENVIO');
INSERT INTO "public"."direcciones" VALUES (14, 'PROVEEDOR', 12, 'España', '123123', '1asd', '123asd', '123asd', 'ENVIO');
INSERT INTO "public"."direcciones" VALUES (16, 'FABRICANTE', 5, 'España', '06300', 'badajoz', 'zafra', 'asd', 'ENVIO');
INSERT INTO "public"."direcciones" VALUES (17, 'FABRICANTE', 5, 'España', '03060', 'merida', 'merida', 'asdasd', 'ENVIO');
INSERT INTO "public"."direcciones" VALUES (9, 'CLIENTE', 1, 'España', '06300', 'Badajoz', 'zafra', 'calle vistacastellar 5', 'FACTURACION');
INSERT INTO "public"."direcciones" VALUES (18, 'CLIENTE', 2, 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'FACTURACION');
INSERT INTO "public"."direcciones" VALUES (19, 'CLIENTE', 2, 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', 'ENVIO');
INSERT INTO "public"."direcciones" VALUES (25, 'CLIENTE', 16, 'España', '06010', 'BADAJOZ', 'BADAJOZ', 'Carretera de Valverde KM 2', 'ENVIO');
INSERT INTO "public"."direcciones" VALUES (24, 'CLIENTE', 16, 'España', 'BADAJOZ', 'BADAJOZ', 'BADAJOZ', 'Servando González Becerra 5, Entreplanta Oficinas H-J', 'FACTURACION');
INSERT INTO "public"."direcciones" VALUES (50, 'PROVEEDOR', 112, 'España', '06011', 'BADAJOZ', 'BADAJOZ', 'Servando González Becerra 5, Entreplanta Oficinas H-J', 'FACTURACION');
INSERT INTO "public"."direcciones" VALUES (51, 'PROVEEDOR', 112, 'España', '06010', 'BADAJOZ', 'BADAJOZ', 'Carretera de Valverde KM 2', 'ENVIO');

-- ----------------------------
-- Table structure for documento_transformaciones
-- ----------------------------
DROP TABLE IF EXISTS "public"."documento_transformaciones";
CREATE TABLE "public"."documento_transformaciones" (
  "id" int8 NOT NULL DEFAULT nextval('documento_transformaciones_id_seq'::regclass),
  "tipo_origen" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "id_origen" int8 NOT NULL,
  "numero_origen" varchar(100) COLLATE "pg_catalog"."default",
  "tipo_destino" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "id_destino" int8 NOT NULL,
  "numero_destino" varchar(100) COLLATE "pg_catalog"."default",
  "tipo_transformacion" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "fecha_transformacion" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "usuario_id" int8,
  "observaciones" text COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of documento_transformaciones
-- ----------------------------
INSERT INTO "public"."documento_transformaciones" VALUES (1, 'ALBARAN', 11075, 'AV26-00009', 'ALBARAN', 11076, 'AV26-00010', 'DUPLICAR', '2026-01-09 12:02:02.884056', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (2, 'ALBARAN', 11075, 'AV26-00009', 'ALBARAN', 11077, 'AV26-00011', 'DUPLICAR', '2026-01-09 12:04:17.138187', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (3, 'ALBARAN', 11077, 'AV26-00011', 'ALBARAN', 11078, 'AV26-00012', 'DUPLICAR', '2026-01-09 12:06:12.632487', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (4, 'ALBARAN', 11078, 'AV26-00012', 'ALBARAN', 11079, 'AV26-00013', 'DUPLICAR', '2026-01-09 12:27:16.653771', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (5, 'ALBARAN', 11086, 'AV26-00021', 'FACTURA', 2, 'VF25-02', 'CONVERTIR', '2026-02-12 16:13:54.982447', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (6, 'ALBARAN', 11087, 'AV26-00022', 'FACTURA', 3, 'VF25-03', 'CONVERTIR', '2026-02-13 11:23:32.10938', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (7, 'FACTURA', 3, 'VF25-03', 'FACTURA_RECTIFICATIVA', 2, 'FR25-00002', 'CONVERTIR', '2026-02-16 16:36:49.211037', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (11, 'FACTURA_RECTIFICATIVA', 2, 'FR25-00002', 'FACTURA_PROFORMA', 2, 'FP25-00006', 'CONVERTIR', '2026-02-18 14:15:15.983238', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (12, 'FACTURA_RECTIFICATIVA', 2, 'FR25-00002', 'ALBARAN', 11088, 'AB-03', 'CONVERTIR', '2026-02-18 14:15:23.737571', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (13, 'FACTURA_RECTIFICATIVA', 1, 'FR25-00001', 'FACTURA_RECTIFICATIVA', 4, 'FR25-00004', 'DUPLICAR', '2026-02-18 14:15:28.102336', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (16, 'PRESUPUESTO', 3, 'PR25-0003', 'FACTURA_RECTIFICATIVA', 5, 'FR25-00005', 'CONVERTIR', '2026-02-18 14:22:39.218357', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (17, 'PRESUPUESTO', 3, 'PR25-0003', 'PRESUPUESTO', 4, 'PR26-00001', 'DUPLICAR', '2026-02-18 14:37:27.150217', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (18, 'PRESUPUESTO', 4, 'PR26-00001', 'ALBARAN', 11089, 'AV26-00023', 'CONVERTIR', '2026-02-18 14:37:38.29501', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (19, 'PRESUPUESTO', 4, 'PR26-00001', 'FACTURA', 6, 'VF25-06', 'CONVERTIR', '2026-02-18 14:37:43.036254', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (21, 'PRESUPUESTO', 4, 'PR26-00001', 'FACTURA_PROFORMA', 3, 'FP25-00007', 'CONVERTIR', '2026-02-18 14:37:53.571014', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (22, 'PRESUPUESTO', 4, 'PR26-00001', 'FACTURA_RECTIFICATIVA', 6, 'FR25-00006', 'CONVERTIR', '2026-02-18 14:37:58.411555', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (23, 'PEDIDO', 6, 'PV-00006', 'PEDIDO', 7, 'PV-00007', 'DUPLICAR', '2026-02-18 14:38:04.32434', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (24, 'PEDIDO', 7, 'PV-00007', 'ALBARAN', 11090, 'AV26-00024', 'CONVERTIR', '2026-02-18 14:38:09.296818', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (25, 'PEDIDO', 6, 'PV-00006', 'FACTURA', 7, 'VF25-07', 'CONVERTIR', '2026-02-18 14:38:15.568608', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (26, 'PEDIDO', 6, 'PV-00006', 'FACTURA', 8, 'VF25-08', 'CONVERTIR', '2026-02-18 14:38:20.962044', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (31, 'PEDIDO', 5, 'PV-00005', 'FACTURA_PROFORMA', 6, 'FP25-00010', 'CONVERTIR', '2026-02-18 14:44:52.853005', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (32, 'PEDIDO', 7, 'PV-00007', 'FACTURA_RECTIFICATIVA', 7, 'FR25-00007', 'CONVERTIR', '2026-02-18 14:44:59.597661', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (33, 'FACTURA_PROFORMA', 1, 'FP25-00004', 'FACTURA_PROFORMA', 7, 'FP25-00011', 'DUPLICAR', '2026-02-18 14:45:08.452031', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (37, 'FACTURA_PROFORMA', 5, 'FP25-00009', 'FACTURA_RECTIFICATIVA', 8, 'FR25-00008', 'CONVERTIR', '2026-02-18 14:46:03.523983', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (38, 'FACTURA_PROFORMA', 3, 'FP25-00007', 'ALBARAN', 11091, 'AV26-00025', 'CONVERTIR', '2026-02-18 14:51:37.775685', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (39, 'FACTURA_PROFORMA', 3, 'FP25-00007', 'FACTURA', 9, 'VF25-09', 'CONVERTIR', '2026-02-18 14:51:43.380273', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (40, 'FACTURA_RECTIFICATIVA', 8, 'FR25-00008', 'FACTURA_RECTIFICATIVA', 9, 'FR25-00009', 'DUPLICAR', '2026-02-18 14:51:52.209374', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (42, 'FACTURA_RECTIFICATIVA', 6, 'FR25-00006', 'FACTURA_PROFORMA', 8, 'FP25-00012', 'CONVERTIR', '2026-02-18 14:52:04.954119', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (43, 'FACTURA_RECTIFICATIVA', 7, 'FR25-00007', 'FACTURA_RECTIFICATIVA', 10, 'FR25-00010', 'DUPLICAR', '2026-02-18 14:52:09.546867', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (44, 'ALBARAN', 11085, 'AV26-00020', 'ALBARAN', 11092, 'AB-04', 'DUPLICAR', '2026-02-18 15:40:10.51263', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (45, 'ALBARAN', 11092, 'AB-04', 'ALBARAN', 11093, 'AV26-00026', 'DUPLICAR', '2026-02-19 08:17:52.088157', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (46, 'FACTURA', 3, 'VF25-03', 'PRESUPUESTO', 17, 'PR26-00009', 'CONVERTIR', '2026-02-19 13:54:15.913991', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (47, 'FACTURA', 9, 'VF25-09', 'PEDIDO', 12, 'PV-00012', 'CONVERTIR', '2026-02-19 13:55:30.624296', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (48, 'FACTURA', 9, 'VF25-09', 'FACTURA_RECTIFICATIVA', 12, 'FR25-00012', 'CONVERTIR', '2026-02-19 14:00:00.029083', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (49, 'PRESUPUESTO', 2, 'PR25-0002', 'ALBARAN', 11098, 'AB-05', 'CONVERTIR', '2026-02-20 11:52:39.499822', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (50, 'ALBARAN', 11098, 'AB-05', 'FACTURA', 11, 'VF25-11', 'CONVERTIR', '2026-02-20 11:52:58.461899', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (51, 'FACTURA_RECTIFICATIVA', 6, 'FR25-00006', 'ALBARAN', 11099, 'AV26-00031', 'CONVERTIR', '2026-02-20 11:55:49.340828', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (52, 'PRESUPUESTO', 2, 'PR25-0002', 'ALBARAN', 11100, 'AB-06', 'CONVERTIR', '2026-02-20 13:03:46.432162', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (53, 'PRESUPUESTO', 18, 'PR26-00010', 'ALBARAN', 11101, 'AV26-00032', 'CONVERTIR', '2026-02-24 11:21:32.036624', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (54, 'PRESUPUESTO', 18, 'PR26-00010', 'FACTURA', 12, 'VF25-12', 'CONVERTIR', '2026-02-24 11:21:37.025399', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (56, 'PRESUPUESTO', 18, 'PR26-00010', 'FACTURA_PROFORMA', 11, 'FP25-00016', 'CONVERTIR', '2026-02-24 11:21:48.725159', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (57, 'PRESUPUESTO', 18, 'PR26-00010', 'FACTURA_RECTIFICATIVA', 13, 'FR25-00013', 'CONVERTIR', '2026-02-24 11:21:56.661881', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (92, 'PRESUPUESTO', 18, 'PR26-00010', 'PEDIDO', 48, 'PV-00016', 'CONVERTIR', '2026-02-24 11:33:38.570761', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (8, 'FACTURA_RECTIFICATIVA', 1, 'FR25-00001', 'PEDIDO', 2, 'PV-00002', 'CONVERTIR', '2026-02-18 14:14:58.573929', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (9, 'FACTURA_RECTIFICATIVA', 1, 'FR25-00001', 'PEDIDO', 3, 'PV-00003', 'CONVERTIR', '2026-02-18 14:15:04.339291', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (10, 'FACTURA_RECTIFICATIVA', 2, 'FR25-00002', 'PRESUPUESTO', 3, 'PR25-0003', 'CONVERTIR', '2026-02-18 14:15:10.801887', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (14, 'PRESUPUESTO', 3, 'PR25-0003', 'PEDIDO', 4, 'PV-00004', 'CONVERTIR', '2026-02-18 14:21:47.277595', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (15, 'PRESUPUESTO', 3, 'PR25-0003', 'PEDIDO', 5, 'PV-00005', 'CONVERTIR', '2026-02-18 14:22:01.871872', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (20, 'PRESUPUESTO', 4, 'PR26-00001', 'PEDIDO', 6, 'PV-00006', 'CONVERTIR', '2026-02-18 14:37:48.98641', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (27, 'PEDIDO', 6, 'PV-00006', 'PRESUPUESTO', 5, 'PR26-00002', 'CONVERTIR', '2026-02-18 14:39:01.331618', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (28, 'PEDIDO', 6, 'PV-00006', 'PRESUPUESTO', 6, 'PR25-0004', 'CONVERTIR', '2026-02-18 14:39:06.738982', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (34, 'FACTURA_PROFORMA', 1, 'FP25-00004', 'PEDIDO', 8, 'PV-00008', 'CONVERTIR', '2026-02-18 14:45:39.085631', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (35, 'FACTURA_PROFORMA', 3, 'FP25-00007', 'PEDIDO', 9, 'PV-00009', 'CONVERTIR', '2026-02-18 14:45:54.11247', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (36, 'FACTURA_PROFORMA', 4, 'FP25-00008', 'PRESUPUESTO', 7, 'PR26-00003', 'CONVERTIR', '2026-02-18 14:45:58.846885', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (41, 'FACTURA_RECTIFICATIVA', 9, 'FR25-00009', 'PRESUPUESTO', 8, 'PR26-00004', 'CONVERTIR', '2026-02-18 14:52:00.65098', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (55, 'PRESUPUESTO', 18, 'PR26-00010', 'PEDIDO', 13, 'PV-00013', 'CONVERTIR', '2026-02-24 11:21:42.954935', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (58, 'PRESUPUESTO', 18, 'PR26-00010', 'PEDIDO', 14, 'PV-00014', 'CONVERTIR', '2026-02-24 11:25:59.981363', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (59, 'PRESUPUESTO', 18, 'PR26-00010', 'PEDIDO', 15, 'PV-00015', 'CONVERTIR', '2026-02-24 11:28:02.397291', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (93, 'ALBARAN', 11102, 'AV26-00033', 'FACTURA', 13, 'VF25-13', 'CONVERTIR', '2026-02-24 12:49:59.725705', NULL, NULL);
INSERT INTO "public"."documento_transformaciones" VALUES (94, 'ALBARAN', 11103, 'AV26-00034', 'FACTURA', 14, 'VF25-14', 'CONVERTIR', '2026-02-24 13:02:41.909103', NULL, NULL);

-- ----------------------------
-- Table structure for empresa
-- ----------------------------
DROP TABLE IF EXISTS "public"."empresa";
CREATE TABLE "public"."empresa" (
  "nombre comercial" varchar(255) COLLATE "pg_catalog"."default",
  "razon" varchar(255) COLLATE "pg_catalog"."default",
  "cif" varchar(255) COLLATE "pg_catalog"."default",
  "direccion" varchar(255) COLLATE "pg_catalog"."default",
  "codigo postal" varchar(255) COLLATE "pg_catalog"."default",
  "id" int8 NOT NULL GENERATED BY DEFAULT AS IDENTITY (
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1
),
  "telefono" varchar(255) COLLATE "pg_catalog"."default",
  "email" varchar(255) COLLATE "pg_catalog"."default",
  "poblacion" varchar(255) COLLATE "pg_catalog"."default",
  "provincia" varchar(255) COLLATE "pg_catalog"."default",
  "pais" varchar(255) COLLATE "pg_catalog"."default",
  "logo" varchar(255) COLLATE "pg_catalog"."default",
  "empresa_colores_id" int4,
  "smtp_auth" bool,
  "smtp_host" varchar(255) COLLATE "pg_catalog"."default",
  "smtp_password" varchar(255) COLLATE "pg_catalog"."default",
  "smtp_port" int4,
  "smtp_starttls" bool,
  "smtp_username" varchar(255) COLLATE "pg_catalog"."default",
  "modo_visual" varchar(255) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'claro'::character varying
)
;
COMMENT ON COLUMN "public"."empresa"."logo" IS 'ID del archivo de logo en disco_virtual (tabla archivos_empresa)';

-- ----------------------------
-- Records of empresa
-- ----------------------------
INSERT INTO "public"."empresa" VALUES ('DOSCAR', 'DOSCAR S.L.U.', 'B12345678', 'C/ Ejemplo 123', '28001', 1, '+34 910 000 000', 'info@doscar.local', 'Madrid', 'Madrid', 'España', '10', NULL, 't', 'smtp.gmail.com', 'gmvz kpqt zsth ztst', 587, 't', 'programacion@grupodoscar.es', 'claro');

-- ----------------------------
-- Table structure for empresa_colores
-- ----------------------------
DROP TABLE IF EXISTS "public"."empresa_colores";
CREATE TABLE "public"."empresa_colores" (
  "navigation_fondo" varchar(255) COLLATE "pg_catalog"."default",
  "boton_fondo" varchar(255) COLLATE "pg_catalog"."default",
  "boton_hover" varchar(255) COLLATE "pg_catalog"."default",
  "id" int4,
  "texto_titulo" varchar(255) COLLATE "pg_catalog"."default",
  "panel_cabecera_fondo" varchar(255) COLLATE "pg_catalog"."default",
  "nombre_del_tema" varchar(255) COLLATE "pg_catalog"."default",
  "boton_fondo_menu" varchar(255) COLLATE "pg_catalog"."default",
  "boton_hover_menu" varchar(255) COLLATE "pg_catalog"."default",
  "modo_visual" varchar(255) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'claro'::character varying
)
;

-- ----------------------------
-- Records of empresa_colores
-- ----------------------------
INSERT INTO "public"."empresa_colores" VALUES ('#0B3B60', '#1F78B4', '#FFFFFF', 1, '#0B3B60', '#E4F1FB', 'Atlántico', '#FFFFFF', '#B9D7F2', 'claro');
INSERT INTO "public"."empresa_colores" VALUES ('#1B4D3E', '#33A07A', '#FFFFFF', 2, '#1B4D3E', '#E6F4EA', 'Aurora', '#FFFFFF', '#B8E0C9', 'claro');
INSERT INTO "public"."empresa_colores" VALUES ('#5A3312', '#C16428', '#FFFBF7', 3, '#5A3312', '#F7E9DD', 'Tierra Cálida', '#FFFFFF', '#E4C9B1', 'claro');
INSERT INTO "public"."empresa_colores" VALUES ('#2D2F36', '#4C5568', '#FFFFFF', 4, '#2D2F36', '#F3F5F9', 'Granito', '#FFFFFF', '#D3DAE6', 'claro');
INSERT INTO "public"."empresa_colores" VALUES ('#13233F', '#244A82', '#FFFFFF', 5, '#13233F', '#E3EAF9', 'Lago Noche', '#FFFFFF', '#C2D2F2', 'claro');
INSERT INTO "public"."empresa_colores" VALUES ('#3E2D4F', '#7A4BA1', '#FFFFFF', 6, '#3E2D4F', '#F1E9FA', 'Bruma', '#FFFFFF', '#D9C5F0', 'claro');
INSERT INTO "public"."empresa_colores" VALUES ('#4A1F1B', '#B74F3F', '#FFFDFB', 7, '#4A1F1B', '#FBE9E6', 'Cobre', '#FFFFFF', '#F1C9C0', 'claro');
INSERT INTO "public"."empresa_colores" VALUES ('#0E2A21', '#1F5C4A', '#FFFFFF', 8, '#0E2A21', '#E0F2EC', 'Selva', '#FFFFFF', '#B6DFCF', 'claro');
INSERT INTO "public"."empresa_colores" VALUES ('#5B1E36', '#D64574', '#FFF9FB', 9, '#5B1E36', '#FBE7EF', 'Coral', '#FFFFFF', '#F3C5D6', 'claro');
INSERT INTO "public"."empresa_colores" VALUES ('#2C2B2A', '#C2A15A', '#FFFFFF', 10, '#2C2B2A', '#FFF5E6', 'Marfil', '#FFFFFF', '#F0D9B8', 'claro');
INSERT INTO "public"."empresa_colores" VALUES ('#233041', '#4F6786', '#FFFFFF', 11, '#233041', '#E9EEF5', 'Acero', '#FFFFFF', '#CBD4E4', 'claro');
INSERT INTO "public"."empresa_colores" VALUES ('#0C2C3F', '#1F6C8C', '#FFFFFF', 12, '#0C2C3F', '#E2F1F8', 'Bosque Azul', '#FFFFFF', '#BFD9ED', 'claro');
INSERT INTO "public"."empresa_colores" VALUES ('#14406A', '#1F7DD4', '#FFFFFF', 13, '#0F2740', '#EDF4FF', 'Céfiro', '#FFFFFF', '#CFE4FF', 'claro');
INSERT INTO "public"."empresa_colores" VALUES ('#24502A', '#3CA761', '#FFFFFF', 14, '#1A3820', '#F4FBF6', 'Sabana', '#FFFFFF', '#D4F5E3', 'claro');
INSERT INTO "public"."empresa_colores" VALUES ('#071A2B', '#1C5C9B', '#D2ECFF', 21, '#F5FBFF', '#102034', 'Atlántico Noche', '#0C243A', '#18476E', 'oscuro');
INSERT INTO "public"."empresa_colores" VALUES ('#111217', '#3D465B', '#E8ECF7', 22, '#F4F5F7', '#181A21', 'Granito Deep', '#1C1E25', '#343B4F', 'oscuro');
INSERT INTO "public"."empresa_colores" VALUES ('#1F0C0A', '#A64232', '#FFD9CF', 23, '#FFEFEA', '#2E1210', 'Cobre Obsidiana', '#2B120F', '#4A1F1B', 'oscuro');

-- ----------------------------
-- Table structure for fabricantes
-- ----------------------------
DROP TABLE IF EXISTS "public"."fabricantes";
CREATE TABLE "public"."fabricantes" (
  "id" int8 NOT NULL GENERATED BY DEFAULT AS IDENTITY (
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1
),
  "email" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "bloquear_ventas" bool,
  "cuenta_ccc_dc" varchar(255) COLLATE "pg_catalog"."default",
  "cuenta_ccc_entidad" varchar(255) COLLATE "pg_catalog"."default",
  "cuenta_ccc_numero" varchar(255) COLLATE "pg_catalog"."default",
  "cuenta_ccc_oficina" varchar(255) COLLATE "pg_catalog"."default",
  "cuenta_iban" varchar(255) COLLATE "pg_catalog"."default",
  "cuenta_iban_pais" varchar(255) COLLATE "pg_catalog"."default",
  "dias_pago_1" int4,
  "dias_pago_2" int4,
  "fax" varchar(255) COLLATE "pg_catalog"."default",
  "fecha_nacimiento" date,
  "forma_pago" varchar(255) COLLATE "pg_catalog"."default",
  "modo_impuesto" varchar(255) COLLATE "pg_catalog"."default",
  "nif_cif" varchar(255) COLLATE "pg_catalog"."default",
  "nombre_entidad_bancaria" varchar(255) COLLATE "pg_catalog"."default",
  "nombre_fiscal" varchar(255) COLLATE "pg_catalog"."default",
  "observaciones" text COLLATE "pg_catalog"."default",
  "retencion" varchar(255) COLLATE "pg_catalog"."default",
  "riesgo_autorizado" float8,
  "tarifa" varchar(255) COLLATE "pg_catalog"."default",
  "telefono_fijo" varchar(255) COLLATE "pg_catalog"."default",
  "telefono_movil" varchar(255) COLLATE "pg_catalog"."default",
  "web" varchar(255) COLLATE "pg_catalog"."default",
  "agrupacion_id" int8,
  "nombre_comercial" varchar(255) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "descuento" float8 DEFAULT 0
)
;

-- ----------------------------
-- Records of fabricantes
-- ----------------------------
INSERT INTO "public"."fabricantes" VALUES (5, 'asd@doscar.com', 'f', 'as', 'asd', 'asd', 'asd', 'asd', 'ES', 2, 2, '924229230', '1111-11-11', 'CONTADO', 'Normal', 'Z3239792V', 'asd', 'AAAAAAAAAAAAA', 'fdfc', 'Retención 21%', 2, 'Normal', '924229230', '924229230', 'asd@doscar.com', 2, 'AAAAAAAAAAAAA', 2);

-- ----------------------------
-- Table structure for factura_lineas
-- ----------------------------
DROP TABLE IF EXISTS "public"."factura_lineas";
CREATE TABLE "public"."factura_lineas" (
  "id" int8 NOT NULL GENERATED BY DEFAULT AS IDENTITY (
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1
),
  "cantidad" int4 NOT NULL,
  "descuento" float8 NOT NULL,
  "observaciones" text COLLATE "pg_catalog"."default",
  "precio_unitario" float8 NOT NULL,
  "factura_id" int8,
  "producto_id" int8
)
;

-- ----------------------------
-- Records of factura_lineas
-- ----------------------------

-- ----------------------------
-- Table structure for familias
-- ----------------------------
DROP TABLE IF EXISTS "public"."familias";
CREATE TABLE "public"."familias" (
  "id" int8 NOT NULL GENERATED BY DEFAULT AS IDENTITY (
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1
),
  "descripcion" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "nombre" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "colortpv" varchar(255) COLLATE "pg_catalog"."default",
  "imagen" varchar(255) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of familias
-- ----------------------------
INSERT INTO "public"."familias" VALUES (1, 'Familia de carnes
', 'Carnes', '#B12A12', '1.jpg');
INSERT INTO "public"."familias" VALUES (2, 'familia de bebidas
', 'Bebidas', '#0088C7', '2.jpg');
INSERT INTO "public"."familias" VALUES (3, 'pescados
', 'Pescados', '#0A8FA0', '3.jpg');
INSERT INTO "public"."familias" VALUES (4, 'Platos combinados', 'Platos combinados', '#F18F01', '4.jpg');
INSERT INTO "public"."familias" VALUES (5, 'Alcoholes', 'Alcoholes', '#6B2C8E', '5.jpg');
INSERT INTO "public"."familias" VALUES (6, 'Entrantes', 'Entrantes', '#F0C419', '6.jpg');
INSERT INTO "public"."familias" VALUES (7, 'Extras', 'Extras', '#7C4DFF', '7.jpg');
INSERT INTO "public"."familias" VALUES (8, 'Desayunos', 'Desayunos', '#FFB347', '8.avif');
INSERT INTO "public"."familias" VALUES (9, 'Menus infantiles', 'Menu infantil', '#FF6FA5', '9.png');
INSERT INTO "public"."familias" VALUES (10, 'Menus Veganos', 'Menus Veganos', '#2DAA48', '10.png');
INSERT INTO "public"."familias" VALUES (11, 'Postres', 'Postres', '#D87093', '11.jpg');

-- ----------------------------
-- Table structure for modulos
-- ----------------------------
DROP TABLE IF EXISTS "public"."modulos";
CREATE TABLE "public"."modulos" (
  "id_usuario" int8,
  "modulo_terceros" bool,
  "modulo_almacen" bool,
  "modulo_empresa" bool,
  "modulo_ventas" bool,
  "modulo_configuracion" bool,
  "modulo_tpv" bool
)
;

-- ----------------------------
-- Records of modulos
-- ----------------------------
INSERT INTO "public"."modulos" VALUES (2, 't', 't', 't', 't', 't', 't');
INSERT INTO "public"."modulos" VALUES (1, 't', 't', 't', 't', 't', 't');

-- ----------------------------
-- Table structure for movimientos_stock
-- ----------------------------
DROP TABLE IF EXISTS "public"."movimientos_stock";
CREATE TABLE "public"."movimientos_stock" (
  "id" int8 NOT NULL DEFAULT nextval('movimientos_stock_id_seq'::regclass),
  "fecha" timestamp(6) NOT NULL,
  "producto_id" int8 NOT NULL,
  "almacen_id" int8 NOT NULL,
  "cantidad" int4 NOT NULL,
  "stock_anterior" int4 NOT NULL,
  "stock_nuevo" int4 NOT NULL,
  "tipo_movimiento" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "descripcion" text COLLATE "pg_catalog"."default" NOT NULL,
  "documento_tipo" varchar(50) COLLATE "pg_catalog"."default",
  "documento_id" int8,
  "documento_numero" varchar(50) COLLATE "pg_catalog"."default",
  "usuario_id" int8,
  "created_at" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
)
;
COMMENT ON COLUMN "public"."movimientos_stock"."cantidad" IS 'Cantidad del movimiento (positivo para incrementos, negativo para decrementos)';
COMMENT ON COLUMN "public"."movimientos_stock"."tipo_movimiento" IS 'Tipo: EMISION_ALBARAN, REVERSION_ALBARAN, EMISION_FACTURA, REVERSION_FACTURA, MODIFICACION_EMITIDO, DIFERENCIA_ALBARAN_FACTURA, AJUSTE_MANUAL, etc.';
COMMENT ON COLUMN "public"."movimientos_stock"."descripcion" IS 'Descripción detallada del motivo del movimiento';
COMMENT ON COLUMN "public"."movimientos_stock"."documento_tipo" IS 'Tipo de documento origen: ALBARAN, FACTURA, FACTURA_RECTIFICATIVA, etc.';
COMMENT ON TABLE "public"."movimientos_stock" IS 'Registro histórico de todos los movimientos de stock del sistema';

-- ----------------------------
-- Records of movimientos_stock
-- ----------------------------
INSERT INTO "public"."movimientos_stock" VALUES (1, '2026-02-16 15:22:57.531816', 4, 1, 2, 33, 35, 'DIFERENCIA_ALBARAN_FACTURA', 'Diferencia entre albarán AV26-00022 (5 uds) y factura VF25-03 (3 uds)', 'FACTURA', 3, 'VF25-03', NULL, '2026-02-16 15:22:57.531823');
INSERT INTO "public"."movimientos_stock" VALUES (2, '2026-02-16 15:39:06.632842', 4, 1, -2, 35, 33, 'DIFERENCIA_ALBARAN_FACTURA', 'Reversión de diferencia entre albarán AV26-00022 y factura VF25-03', 'FACTURA', 3, 'VF25-03', NULL, '2026-02-16 15:39:06.632848');
INSERT INTO "public"."movimientos_stock" VALUES (3, '2026-02-16 15:40:26.919413', 4, 1, 2, 33, 35, 'DIFERENCIA_ALBARAN_FACTURA', 'Diferencia entre albarán AV26-00022 (5 uds) y factura VF25-03 (3 uds)', 'FACTURA', 3, 'VF25-03', NULL, '2026-02-16 15:40:26.919414');
INSERT INTO "public"."movimientos_stock" VALUES (4, '2026-02-18 08:26:29.185828', 2, 1, 1, 12, 13, 'EMISION_FACTURA_RECTIFICATIVA', 'Emisión de factura rectificativa FR25-00001 (devolución)', 'FACTURA_RECTIFICATIVA', 1, 'FR25-00001', NULL, '2026-02-18 08:26:29.185833');
INSERT INTO "public"."movimientos_stock" VALUES (5, '2026-02-18 08:26:29.193766', 1, 1, 1, 0, 1, 'EMISION_FACTURA_RECTIFICATIVA', 'Emisión de factura rectificativa FR25-00001 (devolución)', 'FACTURA_RECTIFICATIVA', 1, 'FR25-00001', NULL, '2026-02-18 08:26:29.193767');
INSERT INTO "public"."movimientos_stock" VALUES (6, '2026-02-18 08:27:04.21823', 2, 1, -1, 13, 12, 'REVERSION_FACTURA_RECTIFICATIVA', 'Reversión de factura rectificativa FR25-00001', 'FACTURA_RECTIFICATIVA', 1, 'FR25-00001', NULL, '2026-02-18 08:27:04.218231');
INSERT INTO "public"."movimientos_stock" VALUES (7, '2026-02-18 08:27:04.225385', 1, 1, -1, 1, 0, 'REVERSION_FACTURA_RECTIFICATIVA', 'Reversión de factura rectificativa FR25-00001', 'FACTURA_RECTIFICATIVA', 1, 'FR25-00001', NULL, '2026-02-18 08:27:04.225386');
INSERT INTO "public"."movimientos_stock" VALUES (8, '2026-02-19 13:53:57.267204', 4, 3, 2, 1, 3, 'DIFERENCIA_ALBARAN_FACTURA', 'Diferencia entre albarán AV26-00022 (5 uds) y factura VF25-03 (3 uds)', 'FACTURA', 3, 'VF25-03', NULL, '2026-02-19 13:53:57.267209');
INSERT INTO "public"."movimientos_stock" VALUES (9, '2026-02-20 10:09:35.65542', 4, 1, -3, 35, 32, 'EMISION_FACTURA', 'Emisión de factura VF25-09', 'FACTURA', 9, 'VF25-09', NULL, '2026-02-20 10:09:35.655428');
INSERT INTO "public"."movimientos_stock" VALUES (10, '2026-02-20 10:09:55.265519', 4, 1, 3, 32, 35, 'REVERSION_FACTURA', 'Reversión de factura VF25-09 (cambio de estado desde Emitido)', 'FACTURA', 9, 'VF25-09', NULL, '2026-02-20 10:09:55.265523');
INSERT INTO "public"."movimientos_stock" VALUES (11, '2026-02-20 10:12:11.219645', 4, 1, -3, 35, 32, 'EMISION_FACTURA', 'Emisión de factura VF25-09', 'FACTURA', 9, 'VF25-09', NULL, '2026-02-20 10:12:11.219646');
INSERT INTO "public"."movimientos_stock" VALUES (12, '2026-02-20 10:12:17.549292', 4, 1, 3, 32, 35, 'REVERSION_FACTURA', 'Reversión de factura VF25-09 (cambio de estado desde Emitido)', 'FACTURA', 9, 'VF25-09', NULL, '2026-02-20 10:12:17.549293');
INSERT INTO "public"."movimientos_stock" VALUES (13, '2026-02-20 10:13:43.283847', 4, 1, -3, 35, 32, 'EMISION_FACTURA', 'Emisión de factura VF25-09', 'FACTURA', 9, 'VF25-09', NULL, '2026-02-20 10:13:43.283848');
INSERT INTO "public"."movimientos_stock" VALUES (14, '2026-02-20 10:13:56.579676', 4, 1, 3, 32, 35, 'REVERSION_FACTURA', 'Reversión de factura VF25-09 (cambio de estado desde Emitido)', 'FACTURA', 9, 'VF25-09', NULL, '2026-02-20 10:13:56.579677');
INSERT INTO "public"."movimientos_stock" VALUES (15, '2026-02-20 10:16:29.764287', 4, 1, -3, 35, 32, 'EMISION_FACTURA', 'Emisión de factura VF25-09', 'FACTURA', 9, 'VF25-09', NULL, '2026-02-20 10:16:29.764289');
INSERT INTO "public"."movimientos_stock" VALUES (16, '2026-02-20 10:16:34.306469', 4, 1, 3, 32, 35, 'REVERSION_FACTURA', 'Reversión de factura VF25-09 (cambio de estado desde Emitido)', 'FACTURA', 9, 'VF25-09', NULL, '2026-02-20 10:16:34.30647');
INSERT INTO "public"."movimientos_stock" VALUES (17, '2026-02-20 10:17:12.918921', 4, 1, -3, 35, 32, 'EMISION_FACTURA', 'Emisión de factura VF25-09', 'FACTURA', 9, 'VF25-09', NULL, '2026-02-20 10:17:12.918922');
INSERT INTO "public"."movimientos_stock" VALUES (18, '2026-02-20 10:17:23.453304', 4, 1, 3, 32, 35, 'REVERSION_FACTURA', 'Reversión de factura VF25-09 (cambio de estado desde Emitido)', 'FACTURA', 9, 'VF25-09', NULL, '2026-02-20 10:17:23.453306');
INSERT INTO "public"."movimientos_stock" VALUES (19, '2026-02-20 10:19:28.150992', 4, 1, -3, 35, 32, 'EMISION_FACTURA', 'Emisión de factura VF25-09', 'FACTURA', 9, 'VF25-09', NULL, '2026-02-20 10:19:28.150994');
INSERT INTO "public"."movimientos_stock" VALUES (20, '2026-02-20 10:19:32.604243', 4, 1, 3, 32, 35, 'REVERSION_FACTURA', 'Reversión de factura VF25-09 (cambio de estado desde Emitido)', 'FACTURA', 9, 'VF25-09', NULL, '2026-02-20 10:19:32.604244');
INSERT INTO "public"."movimientos_stock" VALUES (21, '2026-02-20 10:20:33.128487', 4, 1, -3, 35, 32, 'EMISION_FACTURA', 'Emisión de factura VF25-09', 'FACTURA', 9, 'VF25-09', NULL, '2026-02-20 10:20:33.128488');
INSERT INTO "public"."movimientos_stock" VALUES (22, '2026-02-20 10:20:37.182631', 4, 1, 3, 32, 35, 'REVERSION_FACTURA', 'Reversión de factura VF25-09 (cambio de estado desde Emitido)', 'FACTURA', 9, 'VF25-09', NULL, '2026-02-20 10:20:37.182632');
INSERT INTO "public"."movimientos_stock" VALUES (23, '2026-02-20 10:22:20.7916', 4, 1, -3, 35, 32, 'EMISION_FACTURA', 'Emisión de factura VF25-09', 'FACTURA', 9, 'VF25-09', NULL, '2026-02-20 10:22:20.791601');
INSERT INTO "public"."movimientos_stock" VALUES (24, '2026-02-20 10:22:24.792133', 4, 1, 3, 32, 35, 'REVERSION_FACTURA', 'Reversión de factura VF25-09 (cambio de estado desde Emitido)', 'FACTURA', 9, 'VF25-09', NULL, '2026-02-20 10:22:24.792134');
INSERT INTO "public"."movimientos_stock" VALUES (25, '2026-02-20 10:23:58.154233', 4, 1, -3, 35, 32, 'EMISION_FACTURA', 'Emisión de factura VF25-09', 'FACTURA', 9, 'VF25-09', NULL, '2026-02-20 10:23:58.154235');
INSERT INTO "public"."movimientos_stock" VALUES (26, '2026-02-20 10:24:02.746079', 4, 1, 3, 32, 35, 'REVERSION_FACTURA', 'Reversión de factura VF25-09 (cambio de estado desde Emitido)', 'FACTURA', 9, 'VF25-09', NULL, '2026-02-20 10:24:02.74608');
INSERT INTO "public"."movimientos_stock" VALUES (27, '2026-02-20 10:25:13.227642', 4, 1, -3, 35, 32, 'EMISION_FACTURA', 'Emisión de factura VF25-09', 'FACTURA', 9, 'VF25-09', NULL, '2026-02-20 10:25:13.227652');
INSERT INTO "public"."movimientos_stock" VALUES (28, '2026-02-20 10:25:20.088388', 4, 1, 3, 32, 35, 'REVERSION_FACTURA', 'Reversión de factura VF25-09 (cambio de estado desde Emitido)', 'FACTURA', 9, 'VF25-09', NULL, '2026-02-20 10:25:20.088389');
INSERT INTO "public"."movimientos_stock" VALUES (29, '2026-02-20 11:35:47.767649', 28, 3, -1, 0, -1, 'EMISION_ALBARAN', 'Emisión de albarán AV26-00030', 'ALBARAN', 11097, 'AV26-00030', NULL, '2026-02-20 11:35:47.76765');
INSERT INTO "public"."movimientos_stock" VALUES (30, '2026-02-20 11:35:52.529765', 28, 3, 1, -1, 0, 'REVERSION_ALBARAN', 'Reversión de albarán (cambio de estado desde Emitido)', 'ALBARAN', NULL, NULL, NULL, '2026-02-20 11:35:52.529766');
INSERT INTO "public"."movimientos_stock" VALUES (31, '2026-02-20 11:41:01.37556', 28, 3, -1, 0, -1, 'EMISION_ALBARAN', 'Emisión de albarán AV26-00030', 'ALBARAN', 11097, 'AV26-00030', NULL, '2026-02-20 11:41:01.375567');
INSERT INTO "public"."movimientos_stock" VALUES (32, '2026-02-20 11:41:06.101191', 28, 3, 1, -1, 0, 'REVERSION_ALBARAN', 'Reversión de albarán (cambio de estado desde Emitido)', 'ALBARAN', 11097, 'AV26-00030', NULL, '2026-02-20 11:41:06.101193');
INSERT INTO "public"."movimientos_stock" VALUES (33, '2026-02-24 12:49:13.798139', 18, 1, -1, 15, 14, 'EMISION_ALBARAN', 'Emisión de albarán AV26-00033', 'ALBARAN', 11102, 'AV26-00033', NULL, '2026-02-24 12:49:13.798147');
INSERT INTO "public"."movimientos_stock" VALUES (34, '2026-02-24 13:04:52.071825', 18, 1, -1, 14, 13, 'EMISION_FACTURA', 'Emisión de factura VF25-14', 'FACTURA', 14, 'VF25-14', NULL, '2026-02-24 13:04:52.071827');

-- ----------------------------
-- Table structure for plantilla_pdf
-- ----------------------------
DROP TABLE IF EXISTS "public"."plantilla_pdf";
CREATE TABLE "public"."plantilla_pdf" (
  "id" int8 NOT NULL DEFAULT nextval('plantilla_pdf_id_seq'::regclass),
  "nombre" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "mostrar_logo" bool NOT NULL DEFAULT true,
  "mostrar_empresa" bool NOT NULL DEFAULT true,
  "mostrar_cliente" bool NOT NULL DEFAULT true,
  "mostrar_datos_albaran" bool NOT NULL DEFAULT true,
  "mostrar_observaciones" bool NOT NULL DEFAULT true,
  "mostrar_pie_pagina" bool NOT NULL DEFAULT true,
  "empresa_mostrar_razon" bool NOT NULL DEFAULT true,
  "empresa_mostrar_cif" bool NOT NULL DEFAULT true,
  "empresa_mostrar_direccion" bool NOT NULL DEFAULT true,
  "empresa_mostrar_telefono" bool NOT NULL DEFAULT true,
  "empresa_mostrar_email" bool NOT NULL DEFAULT true,
  "cliente_mostrar_nif" bool NOT NULL DEFAULT true,
  "cliente_mostrar_direccion" bool NOT NULL DEFAULT true,
  "cliente_mostrar_telefono" bool NOT NULL DEFAULT true,
  "cliente_mostrar_email" bool NOT NULL DEFAULT true,
  "producto_mostrar_referencia" bool NOT NULL DEFAULT true,
  "producto_mostrar_descuento" bool NOT NULL DEFAULT true,
  "producto_mostrar_subtotal" bool NOT NULL DEFAULT true,
  "producto_mostrar_observaciones" bool NOT NULL DEFAULT true,
  "layout_empresa_cliente" varchar(255) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'horizontal'::character varying,
  "layout_tabla_productos" varchar(255) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'completa'::character varying,
  "color_primario" varchar(255) COLLATE "pg_catalog"."default" NOT NULL DEFAULT '#1a3161'::character varying,
  "tamano_fuente" varchar(255) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'normal'::character varying,
  "estilo_tabla" varchar(255) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'lineas'::character varying,
  "texto_titulo" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'ALBARÁN DE ENTREGA'::text,
  "texto_pie_pagina" text COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'Gracias por su confianza'::text,
  "repetir_encabezados" bool NOT NULL DEFAULT true,
  "activa" bool NOT NULL DEFAULT false
)
;

-- ----------------------------
-- Records of plantilla_pdf
-- ----------------------------
INSERT INTO "public"."plantilla_pdf" VALUES (44, 'plantilla rosa', 't', 't', 't', 't', 't', 't', 't', 't', 't', 't', 't', 't', 't', 't', 't', 't', 't', 't', 't', 'cliente_arriba', 'completa', '#9496d6', 'normal', 'lineas', 'ALBARÁN DE ENTREGA', 'Gracias por su confianza', 't', 'f');
INSERT INTO "public"."plantilla_pdf" VALUES (27, 'Plantilla azul', 't', 't', 'f', 't', 't', 't', 't', 'f', 't', 't', 't', 't', 't', 't', 't', 't', 't', 't', 't', 'vertical', 'completa', '#fa7900', 'grande', 'minimalista', 'Albaran', 'Gracias por su confianza', 't', 'f');
INSERT INTO "public"."plantilla_pdf" VALUES (2, 'Plantilla roja', 't', 't', 't', 't', 't', 't', 't', 't', 't', 'f', 't', 't', 't', 'f', 't', 't', 'f', 't', 'f', 'cliente_arriba', 'completa', '#ff0000', 'normal', 'lineas', 'ALBARÁN', 'Gracias', 't', 'f');

-- ----------------------------
-- Table structure for preferencias_series_usuario
-- ----------------------------
DROP TABLE IF EXISTS "public"."preferencias_series_usuario";
CREATE TABLE "public"."preferencias_series_usuario" (
  "id" int8 NOT NULL DEFAULT nextval('preferencias_series_usuario_id_seq'::regclass),
  "usuario_id" int8 NOT NULL,
  "tipo_documento" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "serie_id" int8 NOT NULL,
  "creado_en" timestamp(6) DEFAULT now(),
  "actualizado_en" timestamp(6) DEFAULT now()
)
;

-- ----------------------------
-- Records of preferencias_series_usuario
-- ----------------------------
INSERT INTO "public"."preferencias_series_usuario" VALUES (2, 1, 'ALBARAN_VENTA', 1, '2026-01-08 16:26:37.592712', '2026-01-08 16:26:37.592719');
INSERT INTO "public"."preferencias_series_usuario" VALUES (3, 2, 'PRESUPUESTO', 5, '2026-02-11 13:11:49.286374', '2026-02-11 13:11:49.286377');
INSERT INTO "public"."preferencias_series_usuario" VALUES (4, 2, 'FACTURA_VENTA', 6, '2026-02-16 15:39:02.109567', '2026-02-16 15:39:02.109576');

-- ----------------------------
-- Table structure for producto_almacen
-- ----------------------------
DROP TABLE IF EXISTS "public"."producto_almacen";
CREATE TABLE "public"."producto_almacen" (
  "id" int8 NOT NULL GENERATED BY DEFAULT AS IDENTITY (
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1
),
  "created_at" timestamp(6),
  "stock" int4 NOT NULL,
  "stock_maximo" int4,
  "stock_minimo" int4,
  "ubicacion" varchar(50) COLLATE "pg_catalog"."default",
  "updated_at" timestamp(6),
  "almacen_id" int8 NOT NULL,
  "producto_id" int8 NOT NULL
)
;

-- ----------------------------
-- Records of producto_almacen
-- ----------------------------
INSERT INTO "public"."producto_almacen" VALUES (2, NULL, 4, NULL, NULL, NULL, NULL, 3, 5);
INSERT INTO "public"."producto_almacen" VALUES (6, NULL, 37, NULL, NULL, NULL, NULL, 3, 18);
INSERT INTO "public"."producto_almacen" VALUES (7, NULL, 15, NULL, NULL, NULL, NULL, 3, 23);
INSERT INTO "public"."producto_almacen" VALUES (8, NULL, 53, NULL, NULL, NULL, NULL, 3, 9);
INSERT INTO "public"."producto_almacen" VALUES (9, NULL, 143, NULL, NULL, NULL, NULL, 3, 10);
INSERT INTO "public"."producto_almacen" VALUES (10, NULL, 0, NULL, NULL, NULL, NULL, 3, 2);
INSERT INTO "public"."producto_almacen" VALUES (11, NULL, 112, NULL, NULL, NULL, NULL, 3, 6);
INSERT INTO "public"."producto_almacen" VALUES (12, NULL, 17, NULL, NULL, NULL, NULL, 3, 21);
INSERT INTO "public"."producto_almacen" VALUES (13, NULL, 79, NULL, NULL, NULL, NULL, 3, 11);
INSERT INTO "public"."producto_almacen" VALUES (14, NULL, 20, NULL, NULL, NULL, NULL, 3, 25);
INSERT INTO "public"."producto_almacen" VALUES (15, NULL, 67, NULL, NULL, NULL, NULL, 3, 24);
INSERT INTO "public"."producto_almacen" VALUES (16, NULL, 192, NULL, NULL, NULL, NULL, 3, 16);
INSERT INTO "public"."producto_almacen" VALUES (17, NULL, 21, NULL, NULL, NULL, NULL, 3, 20);
INSERT INTO "public"."producto_almacen" VALUES (18, NULL, 140, NULL, NULL, NULL, NULL, 3, 17);
INSERT INTO "public"."producto_almacen" VALUES (19, NULL, 70, NULL, NULL, NULL, NULL, 3, 8);
INSERT INTO "public"."producto_almacen" VALUES (20, NULL, 76, NULL, NULL, NULL, NULL, 3, 15);
INSERT INTO "public"."producto_almacen" VALUES (21, NULL, 38, NULL, NULL, NULL, NULL, 3, 7);
INSERT INTO "public"."producto_almacen" VALUES (22, NULL, 30, NULL, NULL, NULL, NULL, 3, 19);
INSERT INTO "public"."producto_almacen" VALUES (23, NULL, 104, NULL, NULL, NULL, NULL, 3, 13);
INSERT INTO "public"."producto_almacen" VALUES (24, NULL, 56, NULL, NULL, NULL, NULL, 3, 12);
INSERT INTO "public"."producto_almacen" VALUES (26, '2026-01-12 16:24:15.702557', 0, NULL, 0, NULL, '2026-01-15 12:30:55.848934', 1, 28);
INSERT INTO "public"."producto_almacen" VALUES (27, '2026-01-15 12:26:29.831337', 0, NULL, 0, NULL, '2026-01-15 12:30:55.852423', 3, 28);
INSERT INTO "public"."producto_almacen" VALUES (38, '2026-02-12 15:36:17.431231', 13, NULL, 0, NULL, '2026-02-12 15:36:17.431231', 1, 18);
INSERT INTO "public"."producto_almacen" VALUES (35, '2026-02-10 13:21:17.102871', 0, NULL, 0, NULL, '2026-02-10 14:46:05.550555', 1, 30);
INSERT INTO "public"."producto_almacen" VALUES (36, '2026-02-10 13:21:17.109804', 0, NULL, 0, NULL, '2026-02-10 14:46:14.802114', 3, 30);
INSERT INTO "public"."producto_almacen" VALUES (42, '2026-02-12 15:36:17.431231', 12, NULL, 0, NULL, '2026-02-12 15:36:17.431231', 1, 2);
INSERT INTO "public"."producto_almacen" VALUES (28, '2026-01-15 13:38:21.432047', 3, NULL, 0, NULL, '2026-01-15 13:38:21.43205', 1, 22);
INSERT INTO "public"."producto_almacen" VALUES (3, '2026-01-30 12:56:56.536497', 58, NULL, 0, NULL, '2026-01-30 12:56:56.536498', 3, 14);
INSERT INTO "public"."producto_almacen" VALUES (33, '2026-02-02 09:11:02.425036', 0, NULL, 0, NULL, '2026-02-02 09:11:02.425036', 1, 1);
INSERT INTO "public"."producto_almacen" VALUES (5, '2026-02-10 09:05:30.277351', 3, NULL, 0, NULL, '2026-02-25 15:51:49.659306', 3, 4);
INSERT INTO "public"."producto_almacen" VALUES (37, '2026-02-12 15:36:17.431231', 20, NULL, 0, NULL, '2026-02-12 15:36:17.431231', 1, 5);
INSERT INTO "public"."producto_almacen" VALUES (34, '2026-02-10 09:05:30.286582', 35, NULL, 0, NULL, '2026-02-25 15:51:49.665019', 1, 4);
INSERT INTO "public"."producto_almacen" VALUES (29, '2026-01-30 12:56:56.542201', 0, NULL, 0, NULL, '2026-01-30 12:56:56.542202', 1, 14);
INSERT INTO "public"."producto_almacen" VALUES (39, '2026-02-12 15:36:17.431231', 10, NULL, 0, NULL, '2026-02-12 15:36:17.431231', 1, 23);
INSERT INTO "public"."producto_almacen" VALUES (40, '2026-02-12 15:36:17.431231', 25, NULL, 0, NULL, '2026-02-12 15:36:17.431231', 1, 9);
INSERT INTO "public"."producto_almacen" VALUES (41, '2026-02-12 15:36:17.431231', 40, NULL, 0, NULL, '2026-02-12 15:36:17.431231', 1, 10);
INSERT INTO "public"."producto_almacen" VALUES (43, '2026-02-12 15:36:17.431231', 30, NULL, 0, NULL, '2026-02-12 15:36:17.431231', 1, 6);
INSERT INTO "public"."producto_almacen" VALUES (44, '2026-02-12 15:36:17.431231', 18, NULL, 0, NULL, '2026-02-12 15:36:17.431231', 1, 21);
INSERT INTO "public"."producto_almacen" VALUES (45, '2026-02-12 15:36:17.431231', 22, NULL, 0, NULL, '2026-02-12 15:36:17.431231', 1, 11);
INSERT INTO "public"."producto_almacen" VALUES (46, '2026-02-12 15:36:17.431231', 16, NULL, 0, NULL, '2026-02-12 15:36:17.431231', 1, 25);
INSERT INTO "public"."producto_almacen" VALUES (47, '2026-02-12 15:36:17.431231', 35, NULL, 0, NULL, '2026-02-12 15:36:17.431231', 1, 24);
INSERT INTO "public"."producto_almacen" VALUES (48, '2026-02-12 15:36:17.431231', 50, NULL, 0, NULL, '2026-02-12 15:36:17.431231', 1, 16);
INSERT INTO "public"."producto_almacen" VALUES (49, '2026-02-12 15:36:17.431231', 28, NULL, 0, NULL, '2026-02-12 15:36:17.431231', 1, 20);
INSERT INTO "public"."producto_almacen" VALUES (50, '2026-02-12 15:36:17.431231', 60, NULL, 0, NULL, '2026-02-12 15:36:17.431231', 1, 17);
INSERT INTO "public"."producto_almacen" VALUES (51, '2026-02-12 15:36:17.431231', 32, NULL, 0, NULL, '2026-02-12 15:36:17.431231', 1, 8);
INSERT INTO "public"."producto_almacen" VALUES (52, '2026-02-12 15:36:17.431231', 18, NULL, 0, NULL, '2026-02-12 15:36:17.431231', 1, 15);
INSERT INTO "public"."producto_almacen" VALUES (53, '2026-02-12 15:36:17.431231', 14, NULL, 0, NULL, '2026-02-12 15:36:17.431231', 1, 7);
INSERT INTO "public"."producto_almacen" VALUES (54, '2026-02-12 15:36:17.431231', 26, NULL, 0, NULL, '2026-02-12 15:36:17.431231', 1, 19);
INSERT INTO "public"."producto_almacen" VALUES (55, '2026-02-12 15:36:17.431231', 12, NULL, 0, NULL, '2026-02-12 15:36:17.431231', 1, 13);
INSERT INTO "public"."producto_almacen" VALUES (56, '2026-02-12 15:36:17.431231', 24, NULL, 0, NULL, '2026-02-12 15:36:17.431231', 1, 12);
INSERT INTO "public"."producto_almacen" VALUES (4, '2026-01-30 12:57:10.175283', 956, NULL, 0, NULL, '2026-02-02 08:56:48.169732', 3, 3);
INSERT INTO "public"."producto_almacen" VALUES (30, '2026-01-30 12:57:10.181511', 0, NULL, 0, NULL, '2026-02-02 08:56:48.183895', 1, 3);
INSERT INTO "public"."producto_almacen" VALUES (31, '2026-02-02 08:59:36.349698', 2, NULL, 1, NULL, '2026-02-02 08:59:36.349699', 1, 29);
INSERT INTO "public"."producto_almacen" VALUES (32, '2026-02-02 08:59:36.352341', 2, NULL, 1, NULL, '2026-02-02 08:59:36.352343', 3, 29);
INSERT INTO "public"."producto_almacen" VALUES (25, '2026-02-02 09:11:02.420749', 1207, NULL, 0, NULL, '2026-02-02 09:11:02.42075', 3, 1);
INSERT INTO "public"."producto_almacen" VALUES (1, '2026-01-15 13:38:21.413214', 287, NULL, 0, NULL, '2026-01-15 13:38:21.413215', 3, 22);

-- ----------------------------
-- Table structure for producto_codigo_barra
-- ----------------------------
DROP TABLE IF EXISTS "public"."producto_codigo_barra";
CREATE TABLE "public"."producto_codigo_barra" (
  "id" int8 NOT NULL DEFAULT nextval('producto_codigo_barra_id_seq'::regclass),
  "producto_id" int8 NOT NULL,
  "codigo_barra_tipo_id" int8 NOT NULL,
  "valor" varchar(128) COLLATE "pg_catalog"."default" NOT NULL,
  "es_principal" bool NOT NULL DEFAULT false,
  "origen" varchar(50) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'interno'::character varying,
  "activo" bool NOT NULL DEFAULT true,
  "notas" text COLLATE "pg_catalog"."default",
  "created_at" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" varchar(255) COLLATE "pg_catalog"."default",
  "updated_at" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "validacion_omitida" bool NOT NULL DEFAULT false,
  "patron" varchar(128) COLLATE "pg_catalog"."default"
)
;
COMMENT ON COLUMN "public"."producto_codigo_barra"."producto_id" IS 'ID del producto al que pertenece este código';
COMMENT ON COLUMN "public"."producto_codigo_barra"."codigo_barra_tipo_id" IS 'ID del tipo/formato de código de barras';
COMMENT ON COLUMN "public"."producto_codigo_barra"."valor" IS 'Valor del código de barras (único globalmente)';
COMMENT ON COLUMN "public"."producto_codigo_barra"."es_principal" IS 'Indica si es el código principal del producto';
COMMENT ON COLUMN "public"."producto_codigo_barra"."origen" IS 'Origen del código: GS1, proveedor, interno, balanza';
COMMENT ON COLUMN "public"."producto_codigo_barra"."activo" IS 'Indica si el código está activo o desactivado';
COMMENT ON COLUMN "public"."producto_codigo_barra"."notas" IS 'Notas adicionales sobre el código';
COMMENT ON COLUMN "public"."producto_codigo_barra"."created_at" IS 'Fecha de creación del código';
COMMENT ON COLUMN "public"."producto_codigo_barra"."created_by" IS 'Usuario que creó el código';
COMMENT ON COLUMN "public"."producto_codigo_barra"."updated_at" IS 'Fecha de última actualización';
COMMENT ON COLUMN "public"."producto_codigo_barra"."patron" IS 'Patrón con comodines para códigos de balanza. X = cualquier dígito, números fijos identifican el producto. Ej: XX00020XXXXXX';
COMMENT ON TABLE "public"."producto_codigo_barra" IS 'Códigos de barras asignados a productos. Soporta múltiples códigos por producto con uno marcado como principal.';

-- ----------------------------
-- Records of producto_codigo_barra
-- ----------------------------
INSERT INTO "public"."producto_codigo_barra" VALUES (1, 4, 3, '8480000679512', 't', 'interno', 't', '', '2026-02-10 12:34:51.474605', NULL, '2026-02-10 14:41:15.673407', 't', NULL);
INSERT INTO "public"."producto_codigo_barra" VALUES (2, 30, 1, '026', 't', 'balanza', 't', '', '2026-02-10 14:15:41.5592', NULL, '2026-02-10 15:02:44.177735', 'f', 'XXXX026XXXXXX');

-- ----------------------------
-- Table structure for producto_familias
-- ----------------------------
DROP TABLE IF EXISTS "public"."producto_familias";
CREATE TABLE "public"."producto_familias" (
  "producto_id" int8 NOT NULL,
  "familia_id" int8 NOT NULL
)
;
COMMENT ON TABLE "public"."producto_familias" IS 'Relación muchos a muchos entre productos y familias';

-- ----------------------------
-- Records of producto_familias
-- ----------------------------
INSERT INTO "public"."producto_familias" VALUES (1, 1);
INSERT INTO "public"."producto_familias" VALUES (2, 1);
INSERT INTO "public"."producto_familias" VALUES (3, 2);
INSERT INTO "public"."producto_familias" VALUES (4, 2);
INSERT INTO "public"."producto_familias" VALUES (5, 1);
INSERT INTO "public"."producto_familias" VALUES (6, 2);
INSERT INTO "public"."producto_familias" VALUES (7, 3);
INSERT INTO "public"."producto_familias" VALUES (8, 4);
INSERT INTO "public"."producto_familias" VALUES (11, 8);
INSERT INTO "public"."producto_familias" VALUES (12, 9);
INSERT INTO "public"."producto_familias" VALUES (13, 5);
INSERT INTO "public"."producto_familias" VALUES (9, 6);
INSERT INTO "public"."producto_familias" VALUES (10, 7);
INSERT INTO "public"."producto_familias" VALUES (14, 10);
INSERT INTO "public"."producto_familias" VALUES (15, 11);
INSERT INTO "public"."producto_familias" VALUES (20, 6);
INSERT INTO "public"."producto_familias" VALUES (19, 4);
INSERT INTO "public"."producto_familias" VALUES (22, 2);
INSERT INTO "public"."producto_familias" VALUES (23, 4);
INSERT INTO "public"."producto_familias" VALUES (24, 8);
INSERT INTO "public"."producto_familias" VALUES (17, 2);
INSERT INTO "public"."producto_familias" VALUES (18, 4);
INSERT INTO "public"."producto_familias" VALUES (21, 4);
INSERT INTO "public"."producto_familias" VALUES (16, 2);
INSERT INTO "public"."producto_familias" VALUES (25, 11);
INSERT INTO "public"."producto_familias" VALUES (29, 9);

-- ----------------------------
-- Table structure for producto_referencias
-- ----------------------------
DROP TABLE IF EXISTS "public"."producto_referencias";
CREATE TABLE "public"."producto_referencias" (
  "id" int8 NOT NULL DEFAULT nextval('producto_referencias_id_seq'::regclass),
  "producto_id" int8 NOT NULL,
  "referencia" varchar(15) COLLATE "pg_catalog"."default" NOT NULL,
  "es_principal" bool NOT NULL DEFAULT false,
  "orden" int4 NOT NULL DEFAULT 0
)
;
COMMENT ON COLUMN "public"."producto_referencias"."producto_id" IS 'ID del producto al que pertenece esta referencia';
COMMENT ON COLUMN "public"."producto_referencias"."referencia" IS 'Referencia alternativa (máximo 15 caracteres, única globalmente)';
COMMENT ON COLUMN "public"."producto_referencias"."es_principal" IS 'Indica si es la referencia principal (normalmente false para alternativas)';
COMMENT ON COLUMN "public"."producto_referencias"."orden" IS 'Orden de visualización de las referencias alternativas';
COMMENT ON TABLE "public"."producto_referencias" IS 'Referencias alternativas para productos. Permite que un producto tenga múltiples referencias de búsqueda.';

-- ----------------------------
-- Records of producto_referencias
-- ----------------------------
INSERT INTO "public"."producto_referencias" VALUES (1, 4, 'REF41', 'f', 1);
INSERT INTO "public"."producto_referencias" VALUES (2, 4, 'REF42', 'f', 2);
INSERT INTO "public"."producto_referencias" VALUES (3, 4, 'REF43', 'f', 3);
INSERT INTO "public"."producto_referencias" VALUES (4, 4, 'REF44', 'f', 4);

-- ----------------------------
-- Table structure for producto_subfamilias
-- ----------------------------
DROP TABLE IF EXISTS "public"."producto_subfamilias";
CREATE TABLE "public"."producto_subfamilias" (
  "producto_id" int8 NOT NULL,
  "subfamilia_id" int8 NOT NULL
)
;
COMMENT ON TABLE "public"."producto_subfamilias" IS 'Relación muchos a muchos entre productos y subfamilias';

-- ----------------------------
-- Records of producto_subfamilias
-- ----------------------------
INSERT INTO "public"."producto_subfamilias" VALUES (1, 4);
INSERT INTO "public"."producto_subfamilias" VALUES (2, 2);
INSERT INTO "public"."producto_subfamilias" VALUES (3, 5);
INSERT INTO "public"."producto_subfamilias" VALUES (4, 6);
INSERT INTO "public"."producto_subfamilias" VALUES (6, 5);
INSERT INTO "public"."producto_subfamilias" VALUES (7, 7);
INSERT INTO "public"."producto_subfamilias" VALUES (10, 8);
INSERT INTO "public"."producto_subfamilias" VALUES (14, 9);
INSERT INTO "public"."producto_subfamilias" VALUES (15, 10);
INSERT INTO "public"."producto_subfamilias" VALUES (5, 3);

-- ----------------------------
-- Table structure for productos
-- ----------------------------
DROP TABLE IF EXISTS "public"."productos";
CREATE TABLE "public"."productos" (
  "id" int8 NOT NULL GENERATED BY DEFAULT AS IDENTITY (
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1
),
  "nombre" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "precio" float8 NOT NULL,
  "descripcion_corta" text COLLATE "pg_catalog"."default",
  "etiquetas" varchar(255) COLLATE "pg_catalog"."default",
  "notas" text COLLATE "pg_catalog"."default",
  "precio_con_impuestos" float8,
  "descuento" float8 NOT NULL,
  "margen" float4 NOT NULL,
  "peso" float8 NOT NULL,
  "precio_bloqueado" bool NOT NULL,
  "referencia" varchar(15) COLLATE "pg_catalog"."default" NOT NULL,
  "titulo" varchar(60) COLLATE "pg_catalog"."default" NOT NULL,
  "ultimo_coste" float8 NOT NULL,
  "fabricante_id" int8,
  "imagen" varchar(255) COLLATE "pg_catalog"."default",
  "tipo_iva_id" int8,
  "magnitudporunidad" varchar(255) COLLATE "pg_catalog"."default",
  "unidadmedida" varchar(255) COLLATE "pg_catalog"."default",
  "unidadmedidareferencia" varchar(255) COLLATE "pg_catalog"."default",
  "almacen_predeterminado_id" int8
)
;

-- ----------------------------
-- Records of productos
-- ----------------------------
INSERT INTO "public"."productos" VALUES (18, 'Bocadillo de jamón', 4.5, 'Bocadillo clásico de jamón serrano', 'bocadillo,comida', '', 4.95, 0, 2, 0.25, 'f', 'BOC001', 'Bocadillo de jamón', 2.1, NULL, '18.jpg', NULL, '', 'Unidades', '', NULL);
INSERT INTO "public"."productos" VALUES (23, 'Ensalada mixta', 6.2, 'Ensalada fresca con verduras', 'ensalada,comida', '', 6.82, 0, 3, 0.3, 'f', 'ENS001', 'Ensalada mixta', 2.8, NULL, '23.jpg', NULL, '', 'Unidades', '', NULL);
INSERT INTO "public"."productos" VALUES (5, 'Chuletón premium', 24.9, 'Carne roja madurada', 'carne,chuletón', 'Corte seleccionado vacuno', 30.13, 60, 35, 1.2, 'f', 'CAR-CHU-001', 'Chuletón de vaca vieja', 16.5, NULL, '5.jpg', 2, NULL, NULL, NULL, NULL);
INSERT INTO "public"."productos" VALUES (9, 'Tabla de entrantes', 8.9, 'Selección de tapas frías', 'entrantes,tapas', 'Incluye pan artesano', 10.77, 0, 28, 0.45, 'f', 'ENT-TAB-003', 'Tabla degustación', 5.4, NULL, '9.jpg', 1, NULL, NULL, NULL, NULL);
INSERT INTO "public"."productos" VALUES (10, 'Ración de patatas deluxe', 4.5, 'Patatas especiadas al horno', 'extras,patas', 'Apta para veganos', 5.45, 0, 40, 0.3, 'f', 'EXT-PAT-011', 'Patatas Deluxe', 2.1, NULL, '10.jpg', 1, NULL, NULL, NULL, NULL);
INSERT INTO "public"."productos" VALUES (2, 'Pollo teriyaki', 12, '', '', '', 0, 0, 0, 0, 'f', 'REF2', 'Pollo teriyaki', 0, NULL, '2.webp', 1, NULL, NULL, NULL, NULL);
INSERT INTO "public"."productos" VALUES (6, 'Zumo detox verde', 3.8, 'Zumo natural de verduras', 'bebida,zumo', 'Ingredientes ecológicos', 4.6, 0, 25, 0.35, 'f', 'BEB-ZUM-010', 'Zumo Detox', 2.1, NULL, '6.jpg', 1, NULL, NULL, NULL, NULL);
INSERT INTO "public"."productos" VALUES (21, 'Hamburguesa clásica', 8.9, 'Hamburguesa de ternera con patatas', 'hamburguesa,comida', '', 9.79, 0, 5, 0.45, 'f', 'HAM001', 'Hamburguesa clásica', 4.5, NULL, '21.webp', NULL, '', 'Unidades', '', NULL);
INSERT INTO "public"."productos" VALUES (28, 'asd', 0, '', '', '', 0, 0, 0, 0, 'f', 'asd', 'asd', 0, NULL, NULL, NULL, '', 'Unidades', '', 3);
INSERT INTO "public"."productos" VALUES (11, 'Desayuno continental', 6.2, 'Café + bollería + zumo', 'desayuno,combo', 'Disponible hasta las 12:00', 6.82, 0, 22, 0.28, 'f', 'DES-CON-004', 'Desayuno Completo', 3.9, NULL, '11.jpg', 1, NULL, NULL, NULL, NULL);
INSERT INTO "public"."productos" VALUES (25, 'Flan casero', 3, 'Flan casero tradicional', 'postre,flan', '', 3.3, 0, 1, 0.12, 'f', 'POS001', 'Flan casero', 1.2, NULL, '25.jpg', NULL, '', 'Unidades', '', NULL);
INSERT INTO "public"."productos" VALUES (24, 'Tostada con tomate', 2.2, 'Tostada de pan con tomate y aceite', 'desayuno,tostada', '', 2.42, 0, 1, 0.15, 'f', 'DES001', 'Tostada con tomate', 0.9, NULL, '24.webp', NULL, '', 'Unidades', '', NULL);
INSERT INTO "public"."productos" VALUES (16, 'Café solo', 1.3, 'Café expreso solo', 'café,bebida', '', 1.43, 0, 1, 0.05, 'f', 'CAF001', 'Café solo', 0.65, NULL, '16.jpg', NULL, '', 'Unidades', '', NULL);
INSERT INTO "public"."productos" VALUES (20, 'Croquetas caseras', 5.5, 'Croquetas caseras variadas', 'croquetas,tapas', '', 6.05, 0, 3, 0.18, 'f', 'TAP002', 'Croquetas caseras', 2.6, NULL, '20.jpg', NULL, '', 'Unidades', '', NULL);
INSERT INTO "public"."productos" VALUES (17, 'Cerveza barril 33cl', 2.5, 'Cerveza de barril fría', 'cerveza,bebida', '', 2.75, 0, 1, 0.33, 'f', 'CER001', 'Cerveza de barril', 1.2, NULL, '17.jpg', 1, '', 'Unidades', '', NULL);
INSERT INTO "public"."productos" VALUES (8, 'Menú combinado clásico', 11.5, 'Plato principal + guarnición', 'menú,combinado', 'Incluye bebida estándar', 13.92, 0, 32, 0.6, 'f', 'PLA-COM-002', 'Menú combinado 1', 7.8, NULL, '8.jpg', 1, NULL, NULL, NULL, NULL);
INSERT INTO "public"."productos" VALUES (15, 'Tarta de queso basque', 4.8, 'Porción horno tradicional', 'postre,tarta', 'Glaseado de frutos rojos', 5.81, 0, 38, 0.18, 'f', 'POS-TAR-006', 'Tarta de queso', 2.6, NULL, '15.jpg', 1, NULL, NULL, NULL, NULL);
INSERT INTO "public"."productos" VALUES (22, 'Agua mineral 50cl', 1.5, 'Botella de agua mineral', 'agua,bebida', '', 1.65, 0, 1, 0.5, 'f', 'AGU001', 'Agua mineral', 0.6, NULL, '22.jpg', NULL, '', 'Unidades', '', 1);
INSERT INTO "public"."productos" VALUES (7, 'Filete de dorada', 9.9, 'Pescado fresco diario', 'pescado,dorada', 'Ideal para plancha', 12, 0, 30, 0.4, 'f', 'PES-DOR-005', 'Dorada limpia', 6.2, NULL, '7.webp', 1, NULL, NULL, NULL, NULL);
INSERT INTO "public"."productos" VALUES (19, 'Tortilla española', 3.8, 'Pincho de tortilla de patatas', 'tortilla,tapa', '', 4.18, 0, 2, 0.2, 'f', 'TAP001', 'Tortilla española', 1.7, 5, '19.jpg', 3, '', 'Unidades', '', NULL);
INSERT INTO "public"."productos" VALUES (13, 'Gin premium 50ml', 5.5, 'Gin tonic preparado', 'alcohol,gin', 'Servido con cítricos', 6.65, 0, 45, 0.2, 'f', 'ALC-GIN-009', 'Gin Premium', 2.9, 5, '13.jpg', 1, '', 'Unidades', '', NULL);
INSERT INTO "public"."productos" VALUES (12, 'Menú infantil pirata', 7.8, 'Mini burger + patatas + zumo', 'infantil,menu', 'Incluye sorpresa', 8.92, 0, 27, 0.35, 'f', 'MIN-PIR-007', 'Menú Infantil Pirata', 4.8, NULL, '12.jpg', 1, NULL, NULL, NULL, NULL);
INSERT INTO "public"."productos" VALUES (1, 'Costillar BBQ iberico', 100, '', '', '', 0, 0, 0, 0, 'f', 'REF1', 'Costillar BBQ iberico', 0, NULL, '1.jpeg', 2, '', 'Unidades', '', NULL);
INSERT INTO "public"."productos" VALUES (14, 'Bowl vegano thai', 10.9, 'Tofu con verduras thai', 'vegano,bowl', 'Salsa de coco ligera', 13.19, 0, 33, 0.5, 'f', 'VEG-THA-008', 'Bowl Vegano Thai', 6.9, NULL, '14.jpg', 1, '', 'Unidades', '', NULL);
INSERT INTO "public"."productos" VALUES (3, 'Coca-cola', 1.2, '', '', '', 0, 0, 0, 0, 'f', 'REF3', 'Coca-cola', 0, NULL, '3.jpeg', 1, '', 'Unidades', '', NULL);
INSERT INTO "public"."productos" VALUES (29, 'Tarifas', 15, '', '', '', 0, 0, 0, 0, 't', 'REF5', 'Prueba Tarifas', 20, NULL, NULL, 1, '', 'Unidades', '', 3);
INSERT INTO "public"."productos" VALUES (30, 'POLLO', 0, '', '', '', 0, 0, 0, 0, 'f', '026', 'POLLO', 0, NULL, NULL, NULL, '', 'Unidades', '', NULL);
INSERT INTO "public"."productos" VALUES (4, 'Blanco Dulce Eva', 95, '', '', '', 0, 0, 0, 0, 'f', 'REF4', 'Blanco Dulce Eva', 10, NULL, '4.jpg', 3, '', 'Unidades', '', NULL);

-- ----------------------------
-- Table structure for proveedores
-- ----------------------------
DROP TABLE IF EXISTS "public"."proveedores";
CREATE TABLE "public"."proveedores" (
  "id" int8 NOT NULL GENERATED BY DEFAULT AS IDENTITY (
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1
),
  "email" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "nombre_comercial" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "bloquear_ventas" bool,
  "cuenta_ccc_dc" varchar(255) COLLATE "pg_catalog"."default",
  "cuenta_ccc_entidad" varchar(255) COLLATE "pg_catalog"."default",
  "cuenta_ccc_numero" varchar(255) COLLATE "pg_catalog"."default",
  "cuenta_ccc_oficina" varchar(255) COLLATE "pg_catalog"."default",
  "cuenta_iban" varchar(255) COLLATE "pg_catalog"."default",
  "cuenta_iban_pais" varchar(255) COLLATE "pg_catalog"."default",
  "dias_pago_1" int4,
  "dias_pago_2" int4,
  "fax" varchar(255) COLLATE "pg_catalog"."default",
  "fecha_nacimiento" date,
  "forma_pago" varchar(255) COLLATE "pg_catalog"."default",
  "modo_impuesto" varchar(255) COLLATE "pg_catalog"."default",
  "nif_cif" varchar(255) COLLATE "pg_catalog"."default",
  "nombre_entidad_bancaria" varchar(255) COLLATE "pg_catalog"."default",
  "nombre_fiscal" varchar(255) COLLATE "pg_catalog"."default",
  "observaciones" text COLLATE "pg_catalog"."default",
  "retencion" varchar(255) COLLATE "pg_catalog"."default",
  "riesgo_autorizado" float8,
  "tarifa" varchar(255) COLLATE "pg_catalog"."default",
  "telefono_fijo" varchar(255) COLLATE "pg_catalog"."default",
  "telefono_movil" varchar(255) COLLATE "pg_catalog"."default",
  "web" varchar(255) COLLATE "pg_catalog"."default",
  "agrupacion_id" int8,
  "descuento" float8 NOT NULL,
  "recargo_equivalencia" bool DEFAULT false
)
;
COMMENT ON COLUMN "public"."proveedores"."recargo_equivalencia" IS 'Indica si el proveedor está sujeto a recargo de equivalencia';

-- ----------------------------
-- Records of proveedores
-- ----------------------------
INSERT INTO "public"."proveedores" VALUES (112, 'web@doscar.com', 'proveedor 1 ejemplo', 't', 'dc', 'enti', 'ncuenta', 'ofic', 'iban', 'ES', 2, 2, '924229230', '2025-12-02', 'CONTADO', 'Normal', 'Z3239792V', 'entidad', 'proveedor 1 ejemplo', 'asdasdasd', 'Exento 0%', 2, 'Normal', '924229230', '924229230', 'asd.com', 1, 2, 't');

-- ----------------------------
-- Table structure for series_documento
-- ----------------------------
DROP TABLE IF EXISTS "public"."series_documento";
CREATE TABLE "public"."series_documento" (
  "id" int8 NOT NULL DEFAULT nextval('series_documento_id_seq'::regclass),
  "tipo_documento" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "prefijo" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "descripcion" varchar(255) COLLATE "pg_catalog"."default",
  "longitud_correlativo" int4 NOT NULL DEFAULT 5,
  "activo" bool NOT NULL DEFAULT true,
  "default_sistema" bool NOT NULL DEFAULT false,
  "permite_seleccion_usuario" bool NOT NULL DEFAULT true,
  "creado_en" timestamp(6) DEFAULT now(),
  "actualizado_en" timestamp(6) DEFAULT now(),
  "almacen_predeterminado_id" int8
)
;
COMMENT ON TABLE "public"."series_documento" IS 'Configura prefijos y numeración por tipo de documento.';

-- ----------------------------
-- Records of series_documento
-- ----------------------------
INSERT INTO "public"."series_documento" VALUES (1, 'ALBARAN_VENTA', 'AV26', 'Albaranes de venta', 5, 't', 'f', 't', '2026-01-08 08:14:47.697438', '2026-01-30 13:14:05.833172', 1);
INSERT INTO "public"."series_documento" VALUES (2, 'ALBARAN_VENTA', 'AB', 'Prueba', 2, 't', 'f', 'f', '2026-01-08 08:37:24.241743', '2026-01-30 13:14:11.243359', 3);
INSERT INTO "public"."series_documento" VALUES (4, 'PEDIDO_VENTA', 'PV', 'Pedidos de venta', 5, 't', 't', 't', '2026-02-10 15:18:21.617291', '2026-02-10 15:18:21.617298', NULL);
INSERT INTO "public"."series_documento" VALUES (6, 'FACTURA_VENTA', 'VF25', 'Facturas Ventas', 2, 't', 'f', 't', '2026-02-11 08:30:02.43611', '2026-02-11 08:30:02.436114', 1);
INSERT INTO "public"."series_documento" VALUES (7, 'FACTURA_PROFORMA', 'FP25', 'Proforma', 5, 't', 't', 't', '2026-02-11 08:37:04.209807', '2026-02-11 08:37:04.209812', NULL);
INSERT INTO "public"."series_documento" VALUES (8, 'FACTURA_RECTIFICATIVA', 'FR25', 'FR', 5, 't', 'f', 't', '2026-02-11 08:37:24.782518', '2026-02-11 08:37:24.782523', NULL);
INSERT INTO "public"."series_documento" VALUES (5, 'PRESUPUESTO', 'PR25', 'Presupuestos de venta 25', 4, 't', 'f', 't', '2026-02-11 08:07:29.631578', '2026-02-11 08:07:29.631584', NULL);
INSERT INTO "public"."series_documento" VALUES (9, 'PRESUPUESTO', 'PR26', '26', 5, 't', 't', 't', '2026-02-11 12:55:36.16304', '2026-02-11 12:55:36.163044', 3);
INSERT INTO "public"."series_documento" VALUES (10, 'PEDIDO_COMPRA', 'PC', 'Pedido de compra', 5, 't', 't', 't', '2026-02-24 14:22:42.436073', '2026-02-24 14:22:42.436079', 1);

-- ----------------------------
-- Table structure for series_secuencia
-- ----------------------------
DROP TABLE IF EXISTS "public"."series_secuencia";
CREATE TABLE "public"."series_secuencia" (
  "id" int8 NOT NULL DEFAULT nextval('series_secuencia_id_seq'::regclass),
  "serie_id" int8 NOT NULL,
  "anio" int4 NOT NULL,
  "siguiente_numero" int8 NOT NULL DEFAULT 1,
  "actualizado_en" timestamp(6) DEFAULT now()
)
;

-- ----------------------------
-- Records of series_secuencia
-- ----------------------------
INSERT INTO "public"."series_secuencia" VALUES (1, 2, 2026, 7, '2026-02-20 12:03:46.384998');
INSERT INTO "public"."series_secuencia" VALUES (8, 9, 2026, 11, '2026-02-24 10:21:20.898004');
INSERT INTO "public"."series_secuencia" VALUES (5, 7, 2026, 17, '2026-02-24 10:21:48.712601');
INSERT INTO "public"."series_secuencia" VALUES (4, 8, 2026, 14, '2026-02-24 10:21:56.650722');
INSERT INTO "public"."series_secuencia" VALUES (3, 4, 2026, 17, '2026-02-24 10:33:38.53358');
INSERT INTO "public"."series_secuencia" VALUES (2, 1, 2026, 35, '2026-02-24 12:01:46.174346');
INSERT INTO "public"."series_secuencia" VALUES (6, 6, 2026, 15, '2026-02-24 12:02:41.901309');
INSERT INTO "public"."series_secuencia" VALUES (9, 10, 2026, 8, '2026-02-26 11:23:22.261264');
INSERT INTO "public"."series_secuencia" VALUES (7, 5, 2026, 9, '2026-02-19 09:12:43.197919');

-- ----------------------------
-- Table structure for subfamilias
-- ----------------------------
DROP TABLE IF EXISTS "public"."subfamilias";
CREATE TABLE "public"."subfamilias" (
  "id" int8 NOT NULL GENERATED BY DEFAULT AS IDENTITY (
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1
),
  "descripcion" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "nombre" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "familia_id" int8,
  "imagen" varchar(255) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of subfamilias
-- ----------------------------
INSERT INTO "public"."subfamilias" VALUES (5, 'sub refrescos
', 'Refrescos', 2, NULL);
INSERT INTO "public"."subfamilias" VALUES (6, 'sub vinos', 'Vinos', 2, NULL);
INSERT INTO "public"."subfamilias" VALUES (7, 'Preparaciones de pescado blanco', 'Pescados blancos', 3, NULL);
INSERT INTO "public"."subfamilias" VALUES (8, 'Guarniciones y acompañamientos', 'Guarniciones', 7, NULL);
INSERT INTO "public"."subfamilias" VALUES (9, 'Platos 100% vegetales', 'Veganos', 10, NULL);
INSERT INTO "public"."subfamilias" VALUES (10, 'Postres al horno', 'Dulces horno', 11, NULL);
INSERT INTO "public"."subfamilias" VALUES (2, 'sub pollo
', 'Pollo', 1, '2.jpg');
INSERT INTO "public"."subfamilias" VALUES (4, 'Sub cerdo', 'Cerdo', 1, '4.avif');
INSERT INTO "public"."subfamilias" VALUES (3, 'sub ternera', 'Ternera', 1, '3.jpg');

-- ----------------------------
-- Table structure for tarifa_productos
-- ----------------------------
DROP TABLE IF EXISTS "public"."tarifa_productos";
CREATE TABLE "public"."tarifa_productos" (
  "id" int8 NOT NULL DEFAULT nextval('tarifa_productos_id_seq'::regclass),
  "tarifa_id" int8 NOT NULL,
  "producto_id" int8 NOT NULL,
  "precio" float8 NOT NULL DEFAULT 0,
  "descuento" float8 DEFAULT 0,
  "precio_bloqueado" bool DEFAULT false,
  "margen" float8 DEFAULT 0,
  "precio_con_impuestos" float8 DEFAULT 0,
  "created_at" timestamp(6) NOT NULL DEFAULT now(),
  "updated_at" timestamp(6) NOT NULL DEFAULT now(),
  "tipo_calculo_precio" varchar(30) COLLATE "pg_catalog"."default" DEFAULT 'PRECIO_FIJO'::character varying,
  "valor_calculo" float8,
  "precio_compra" float8,
  "descuento_compra" float8,
  "tipo_calculo_precio_compra" varchar(30) COLLATE "pg_catalog"."default",
  "valor_calculo_compra" float8
)
;
COMMENT ON COLUMN "public"."tarifa_productos"."tipo_calculo_precio" IS 'Método de cálculo: PRECIO_FIJO, PORCENTAJE_SOBRE_COSTE, CANTIDAD_SOBRE_COSTE, PORCENTAJE_SOBRE_PRECIO, CANTIDAD_SOBRE_PRECIO';
COMMENT ON COLUMN "public"."tarifa_productos"."valor_calculo" IS 'Valor usado en el cálculo (porcentaje o cantidad según tipo_calculo_precio)';
COMMENT ON COLUMN "public"."tarifa_productos"."precio_compra" IS 'Precio específico para compras en esta tarifa';
COMMENT ON COLUMN "public"."tarifa_productos"."descuento_compra" IS 'Descuento aplicable en compras';
COMMENT ON COLUMN "public"."tarifa_productos"."tipo_calculo_precio_compra" IS 'Método de cálculo para precio de compra';
COMMENT ON COLUMN "public"."tarifa_productos"."valor_calculo_compra" IS 'Valor usado en el cálculo de precio de compra';

-- ----------------------------
-- Records of tarifa_productos
-- ----------------------------
INSERT INTO "public"."tarifa_productos" VALUES (1, 1, 14, 10.9, 0, 'f', 33, 13.19, '2026-01-27 15:58:18.653174', '2026-01-27 15:58:18.653174', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (4, 1, 18, 4.5, 0, 'f', 2, 4.95, '2026-01-27 15:58:18.653174', '2026-01-27 15:58:18.653174', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (5, 1, 23, 6.2, 0, 'f', 3, 6.82, '2026-01-27 15:58:18.653174', '2026-01-27 15:58:18.653174', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (6, 1, 5, 24.9, 60, 'f', 35, 30.13, '2026-01-27 15:58:18.653174', '2026-01-27 15:58:18.653174', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (7, 1, 9, 8.9, 0, 'f', 28, 10.77, '2026-01-27 15:58:18.653174', '2026-01-27 15:58:18.653174', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (8, 1, 10, 4.5, 0, 'f', 40, 5.45, '2026-01-27 15:58:18.653174', '2026-01-27 15:58:18.653174', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (9, 1, 2, 12, 0, 'f', 0, 0, '2026-01-27 15:58:18.653174', '2026-01-27 15:58:18.653174', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (10, 1, 6, 3.8, 0, 'f', 25, 4.6, '2026-01-27 15:58:18.653174', '2026-01-27 15:58:18.653174', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (11, 1, 21, 8.9, 0, 'f', 5, 9.79, '2026-01-27 15:58:18.653174', '2026-01-27 15:58:18.653174', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (12, 1, 28, 0, 0, 'f', 0, 0, '2026-01-27 15:58:18.653174', '2026-01-27 15:58:18.653174', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (13, 1, 11, 6.2, 0, 'f', 22, 6.82, '2026-01-27 15:58:18.653174', '2026-01-27 15:58:18.653174', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (14, 1, 25, 3, 0, 'f', 1, 3.3, '2026-01-27 15:58:18.653174', '2026-01-27 15:58:18.653174', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (15, 1, 24, 2.2, 0, 'f', 1, 2.42, '2026-01-27 15:58:18.653174', '2026-01-27 15:58:18.653174', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (16, 1, 16, 1.3, 0, 'f', 1, 1.43, '2026-01-27 15:58:18.653174', '2026-01-27 15:58:18.653174', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (17, 1, 20, 5.5, 0, 'f', 3, 6.05, '2026-01-27 15:58:18.653174', '2026-01-27 15:58:18.653174', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (18, 1, 17, 2.5, 0, 'f', 1, 2.75, '2026-01-27 15:58:18.653174', '2026-01-27 15:58:18.653174', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (19, 1, 8, 11.5, 0, 'f', 32, 13.92, '2026-01-27 15:58:18.653174', '2026-01-27 15:58:18.653174', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (20, 1, 15, 4.8, 0, 'f', 38, 5.81, '2026-01-27 15:58:18.653174', '2026-01-27 15:58:18.653174', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (21, 1, 22, 1.5, 0, 'f', 1, 1.65, '2026-01-27 15:58:18.653174', '2026-01-27 15:58:18.653174', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (22, 1, 7, 9.9, 0, 'f', 30, 12, '2026-01-27 15:58:18.653174', '2026-01-27 15:58:18.653174', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (23, 1, 19, 3.8, 0, 'f', 2, 4.18, '2026-01-27 15:58:18.653174', '2026-01-27 15:58:18.653174', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (24, 1, 13, 5.5, 0, 'f', 45, 6.65, '2026-01-27 15:58:18.653174', '2026-01-27 15:58:18.653174', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (25, 1, 12, 7.8, 0, 'f', 27, 8.92, '2026-01-27 15:58:18.653174', '2026-01-27 15:58:18.653174', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (46, 36, 4, 99.75, 0, 'f', 0, 0, '2026-02-06 08:43:22.574014', '2026-02-25 15:51:49.754687', 'PRECIO_FIJO', NULL, 6, NULL, 'PRECIO_FIJO', NULL);
INSERT INTO "public"."tarifa_productos" VALUES (37, 35, 3, 2, 0, 'f', 0, 0, '2026-02-02 08:56:48.245518', '2026-02-02 08:56:48.245519', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (38, 34, 3, 3, 0, 'f', 0, 0, '2026-02-02 08:56:48.263406', '2026-02-02 08:56:48.263407', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (2, 1, 3, 1.2, 0, 'f', 0, 0, '2026-01-27 15:58:18.653174', '2026-02-02 08:56:48.244568', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (39, 1, 29, 4, 0, 'f', 0, 0, '2026-02-02 08:59:36.449209', '2026-02-02 08:59:36.44921', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (40, 35, 29, 4.98, 0, 'f', 0, 0, '2026-02-02 08:59:36.451315', '2026-02-02 08:59:36.451317', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (41, 34, 29, 6, 0, 'f', 0, 0, '2026-02-02 08:59:36.452591', '2026-02-02 08:59:36.452592', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (42, 35, 1, 101, 0, 'f', 0, 0, '2026-02-02 09:11:02.523078', '2026-02-02 09:11:02.523079', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (43, 34, 1, 102, 0, 'f', 0, 0, '2026-02-02 09:11:02.525088', '2026-02-02 09:11:02.525089', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (26, 1, 1, 100, 0, 'f', 0, 0, '2026-01-27 15:58:18.653174', '2026-02-02 09:11:02.522478', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (44, 36, 14, 11.445, 0, 'f', 33, 13.19, '2026-02-06 08:43:22.566058', '2026-02-06 08:43:22.56606', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (45, 36, 3, 1.26, 0, 'f', 0, 0, '2026-02-06 08:43:22.572583', '2026-02-06 08:43:22.572588', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (47, 36, 18, 4.725, 0, 'f', 2, 4.95, '2026-02-06 08:43:22.57557', '2026-02-06 08:43:22.575572', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (48, 36, 23, 6.51, 0, 'f', 3, 6.82, '2026-02-06 08:43:22.576442', '2026-02-06 08:43:22.576444', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (49, 36, 5, 26.145, 60, 'f', 35, 30.13, '2026-02-06 08:43:22.578061', '2026-02-06 08:43:22.578062', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (50, 36, 9, 9.345, 0, 'f', 28, 10.77, '2026-02-06 08:43:22.579164', '2026-02-06 08:43:22.579166', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (51, 36, 10, 4.725, 0, 'f', 40, 5.45, '2026-02-06 08:43:22.580236', '2026-02-06 08:43:22.580238', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (52, 36, 2, 12.6, 0, 'f', 0, 0, '2026-02-06 08:43:22.581308', '2026-02-06 08:43:22.58131', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (53, 36, 6, 3.9899999999999998, 0, 'f', 25, 4.6, '2026-02-06 08:43:22.583053', '2026-02-06 08:43:22.583055', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (54, 36, 21, 9.345, 0, 'f', 5, 9.79, '2026-02-06 08:43:22.584074', '2026-02-06 08:43:22.584076', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (55, 36, 28, 0, 0, 'f', 0, 0, '2026-02-06 08:43:22.584712', '2026-02-06 08:43:22.584714', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (56, 36, 11, 6.51, 0, 'f', 22, 6.82, '2026-02-06 08:43:22.585255', '2026-02-06 08:43:22.585257', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (57, 36, 25, 3.15, 0, 'f', 1, 3.3, '2026-02-06 08:43:22.586036', '2026-02-06 08:43:22.586037', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (58, 36, 24, 2.31, 0, 'f', 1, 2.42, '2026-02-06 08:43:22.586629', '2026-02-06 08:43:22.586634', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (59, 36, 16, 1.365, 0, 'f', 1, 1.43, '2026-02-06 08:43:22.58743', '2026-02-06 08:43:22.587432', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (60, 36, 20, 5.775, 0, 'f', 3, 6.05, '2026-02-06 08:43:22.588012', '2026-02-06 08:43:22.588013', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (61, 36, 17, 2.625, 0, 'f', 1, 2.75, '2026-02-06 08:43:22.588661', '2026-02-06 08:43:22.588662', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (62, 36, 8, 12.075, 0, 'f', 32, 13.92, '2026-02-06 08:43:22.589797', '2026-02-06 08:43:22.589798', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (63, 36, 15, 5.04, 0, 'f', 38, 5.81, '2026-02-06 08:43:22.590756', '2026-02-06 08:43:22.590758', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (64, 36, 22, 1.575, 0, 'f', 1, 1.65, '2026-02-06 08:43:22.591421', '2026-02-06 08:43:22.591423', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (65, 36, 7, 10.395, 0, 'f', 30, 12, '2026-02-06 08:43:22.592113', '2026-02-06 08:43:22.592115', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (66, 36, 19, 3.9899999999999998, 0, 'f', 2, 4.18, '2026-02-06 08:43:22.592837', '2026-02-06 08:43:22.592839', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (67, 36, 13, 5.775, 0, 'f', 45, 6.65, '2026-02-06 08:43:22.593465', '2026-02-06 08:43:22.593471', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (68, 36, 12, 8.19, 0, 'f', 27, 8.92, '2026-02-06 08:43:22.594071', '2026-02-06 08:43:22.594072', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (69, 36, 1, 105, 0, 'f', 0, 0, '2026-02-06 08:43:22.594677', '2026-02-06 08:43:22.594678', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (70, 36, 29, 4.2, 0, 'f', 0, 0, '2026-02-06 08:43:22.595584', '2026-02-06 08:43:22.595586', 'PRECIO_FIJO', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifa_productos" VALUES (179, 35, 4, 0, 0, 'f', 0, 0, '2026-02-25 15:51:49.755095', '2026-02-25 15:51:49.755096', 'PRECIO_FIJO', NULL, 0, NULL, 'PRECIO_FIJO', NULL);
INSERT INTO "public"."tarifa_productos" VALUES (3, 1, 4, 95, 0, 'f', 0, 0, '2026-01-27 15:58:18.653174', '2026-02-25 15:51:49.754067', 'PRECIO_FIJO', NULL, 12, NULL, 'PRECIO_FIJO', NULL);

-- ----------------------------
-- Table structure for tarifas
-- ----------------------------
DROP TABLE IF EXISTS "public"."tarifas";
CREATE TABLE "public"."tarifas" (
  "id" int8 NOT NULL DEFAULT nextval('tarifas_id_seq'::regclass),
  "nombre" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "descripcion" text COLLATE "pg_catalog"."default",
  "activa" bool NOT NULL DEFAULT true,
  "es_general" bool NOT NULL DEFAULT false,
  "created_at" timestamp(6) NOT NULL DEFAULT now(),
  "updated_at" timestamp(6) NOT NULL DEFAULT now(),
  "tipo_tarifa" varchar(10) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'VENTA'::character varying,
  "ajuste_venta_porcentaje" float8,
  "ajuste_venta_cantidad" float8,
  "ajuste_compra_porcentaje" float8,
  "ajuste_compra_cantidad" float8
)
;
COMMENT ON COLUMN "public"."tarifas"."tipo_tarifa" IS 'Tipo de tarifa: VENTA (solo ventas), COMPRA (solo compras), AMBAS (ventas y compras)';
COMMENT ON COLUMN "public"."tarifas"."ajuste_venta_porcentaje" IS 'Porcentaje adicional aplicado al copiar precios para ventas';
COMMENT ON COLUMN "public"."tarifas"."ajuste_venta_cantidad" IS 'Cantidad fija adicional aplicada al copiar precios para ventas';
COMMENT ON COLUMN "public"."tarifas"."ajuste_compra_porcentaje" IS 'Porcentaje adicional aplicado al copiar precios para compras';
COMMENT ON COLUMN "public"."tarifas"."ajuste_compra_cantidad" IS 'Cantidad fija adicional aplicada al copiar precios para compras';

-- ----------------------------
-- Records of tarifas
-- ----------------------------
INSERT INTO "public"."tarifas" VALUES (34, 'WEB', 'TARIFA DE LA WEB', 't', 'f', '2026-01-27 16:59:14.250487', '2026-02-25 12:01:58.151568', 'VENTA', NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifas" VALUES (35, 'Tarifa tienda BADAJOZ', 'BADAJOZ', 't', 'f', '2026-01-30 12:58:55.759706', '2026-02-25 12:05:20.752855', 'COMPRA', NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifas" VALUES (36, '5%', '5% mas que general', 't', 'f', '2026-02-06 08:43:22.522398', '2026-02-25 12:05:29.315294', 'AMBAS', NULL, NULL, NULL, NULL);
INSERT INTO "public"."tarifas" VALUES (1, 'General', 'Tarifa general del sistema', 't', 't', '2026-01-27 15:58:18.614188', '2026-02-25 13:09:32.222806', 'AMBAS', NULL, NULL, NULL, NULL);

-- ----------------------------
-- Table structure for tipos_iva
-- ----------------------------
DROP TABLE IF EXISTS "public"."tipos_iva";
CREATE TABLE "public"."tipos_iva" (
  "id" int8 NOT NULL DEFAULT nextval('tipos_iva_id_seq'::regclass),
  "nombre" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "porcentaje_iva" float8 NOT NULL,
  "porcentaje_recargo" float8 NOT NULL DEFAULT 0,
  "activo" bool NOT NULL DEFAULT true,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now()
)
;

-- ----------------------------
-- Records of tipos_iva
-- ----------------------------
INSERT INTO "public"."tipos_iva" VALUES (1, 'General 21%', 21, 5.2, 't', '2025-12-26 12:17:55.903407+00', '2025-12-26 12:17:55.903407+00');
INSERT INTO "public"."tipos_iva" VALUES (2, 'Reducido 10%', 10, 1.4, 't', '2025-12-26 12:17:55.903407+00', '2025-12-26 12:17:55.903407+00');
INSERT INTO "public"."tipos_iva" VALUES (3, 'Superreducido 4%', 4, 0.5, 't', '2025-12-26 12:17:55.903407+00', '2025-12-26 12:17:55.903407+00');
INSERT INTO "public"."tipos_iva" VALUES (4, 'Exento 0%', 0, 0, 't', '2025-12-26 12:17:55.903407+00', '2025-12-26 12:17:55.903407+00');

-- ----------------------------
-- Table structure for tpv_configuracion_tickets
-- ----------------------------
DROP TABLE IF EXISTS "public"."tpv_configuracion_tickets";
CREATE TABLE "public"."tpv_configuracion_tickets" (
  "id" int8 NOT NULL GENERATED BY DEFAULT AS IDENTITY (
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1
),
  "activa" bool NOT NULL,
  "actualizado_en" timestamp(6),
  "alinear_cabecera" varchar(255) COLLATE "pg_catalog"."default",
  "alinear_pie" varchar(255) COLLATE "pg_catalog"."default",
  "ancho_ticket" int4 NOT NULL,
  "creado_en" timestamp(6),
  "espaciado_lineas" int4 NOT NULL,
  "fuente_familia" varchar(255) COLLATE "pg_catalog"."default",
  "fuente_tamano_cabecera" int4 NOT NULL,
  "fuente_tamano_normal" int4 NOT NULL,
  "fuente_tamano_pie" int4 NOT NULL,
  "mostrar_base_imponible" bool NOT NULL,
  "mostrar_cambio" bool NOT NULL,
  "mostrar_cantidad" bool NOT NULL,
  "mostrar_cif" bool NOT NULL,
  "mostrar_cliente" bool NOT NULL,
  "mostrar_codigo_postal" bool NOT NULL,
  "mostrar_cuota_iva" bool NOT NULL,
  "mostrar_descripcion_producto" bool NOT NULL,
  "mostrar_descuento" bool NOT NULL,
  "mostrar_descuento_total" bool NOT NULL,
  "mostrar_desglose_iva" bool NOT NULL,
  "mostrar_direccion" bool NOT NULL,
  "mostrar_fecha_hora" bool NOT NULL,
  "mostrar_importe_entregado" bool NOT NULL,
  "mostrar_logo" bool NOT NULL,
  "mostrar_metodo_pago" bool NOT NULL,
  "mostrar_nombre_empresa" bool NOT NULL,
  "mostrar_numero_factura" bool NOT NULL,
  "mostrar_porcentaje_iva" bool NOT NULL,
  "mostrar_precio_unitario" bool NOT NULL,
  "mostrar_provincia" bool NOT NULL,
  "mostrar_referencia_producto" bool NOT NULL,
  "mostrar_subtotal" bool NOT NULL,
  "mostrar_subtotal_linea" bool NOT NULL,
  "mostrar_telefono" bool NOT NULL,
  "mostrar_total" bool NOT NULL,
  "nombre_configuracion" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "separador_linea" varchar(255) COLLATE "pg_catalog"."default",
  "texto_base" varchar(255) COLLATE "pg_catalog"."default",
  "texto_cabecera" text COLLATE "pg_catalog"."default",
  "texto_cambio" varchar(255) COLLATE "pg_catalog"."default",
  "texto_cantidad" varchar(255) COLLATE "pg_catalog"."default",
  "texto_cliente" varchar(255) COLLATE "pg_catalog"."default",
  "texto_descripcion" varchar(255) COLLATE "pg_catalog"."default",
  "texto_descuento" varchar(255) COLLATE "pg_catalog"."default",
  "texto_despedida" text COLLATE "pg_catalog"."default",
  "texto_entregado" varchar(255) COLLATE "pg_catalog"."default",
  "texto_fecha" varchar(255) COLLATE "pg_catalog"."default",
  "texto_importe" varchar(255) COLLATE "pg_catalog"."default",
  "texto_iva" varchar(255) COLLATE "pg_catalog"."default",
  "texto_metodo_pago" varchar(255) COLLATE "pg_catalog"."default",
  "texto_pie" text COLLATE "pg_catalog"."default",
  "texto_precio" varchar(255) COLLATE "pg_catalog"."default",
  "texto_subtotal" varchar(255) COLLATE "pg_catalog"."default",
  "texto_ticket" varchar(255) COLLATE "pg_catalog"."default",
  "texto_total" varchar(255) COLLATE "pg_catalog"."default",
  "formato_impresora" varchar(255) COLLATE "pg_catalog"."default" DEFAULT '80mm'::character varying
)
;

-- ----------------------------
-- Records of tpv_configuracion_tickets
-- ----------------------------
INSERT INTO "public"."tpv_configuracion_tickets" VALUES (3, 't', '2025-12-29 16:58:21.90846', 'center', 'center', 30, '2025-12-29 08:57:45.924719', 3, 'monospace', 15, 10, 10, 't', 't', 't', 't', 't', 't', 't', 't', 'f', 't', 't', 't', 't', 't', 't', 't', 't', 't', 't', 't', 't', 'f', 't', 't', 't', 't', 'Configuración por defecto', '=', 'Base', 'TPV DOSCAR', 'Cambio:', 'Cant.', 'Cliente:', 'Desc.', 'Descuento', 'Vuelva pronto', 'Entregado:', 'Fecha:', 'Impor.', 'IVA', 'Método de pago:', 'Este es el texto gracias por comprar', 'Precio', 'Subtotal', 'Fact. Simplificada:', 'Total', '80mm');

-- ----------------------------
-- Table structure for usuario_inicio_panel
-- ----------------------------
DROP TABLE IF EXISTS "public"."usuario_inicio_panel";
CREATE TABLE "public"."usuario_inicio_panel" (
  "id" int8 NOT NULL DEFAULT nextval('usuario_inicio_panel_id_seq'::regclass),
  "usuario_id" int8 NOT NULL,
  "tipo" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "target" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "titulo" varchar(255) COLLATE "pg_catalog"."default",
  "descripcion" varchar(255) COLLATE "pg_catalog"."default",
  "size_w" int4 NOT NULL DEFAULT 1,
  "size_h" int4 NOT NULL DEFAULT 1,
  "posicion" int4 NOT NULL DEFAULT 0,
  "meta" jsonb DEFAULT '{}'::jsonb,
  "creado_en" timestamp(6) DEFAULT now(),
  "actualizado_en" timestamp(6) DEFAULT now()
)
;

-- ----------------------------
-- Records of usuario_inicio_panel
-- ----------------------------
INSERT INTO "public"."usuario_inicio_panel" VALUES (66, 2, 'acceso-rapido', 'acceso-rapido-1767364462284', 'Acceso rápido', 'Fija accesos a módulos del menú lateral.', 1, 1, 1, '{"shortcutId": "albaranes", "shortcutLabel": "Albaranes"}', '2026-01-02 14:34:22.6278', '2026-01-08 17:04:44.492677');
INSERT INTO "public"."usuario_inicio_panel" VALUES (65, 2, 'acceso-rapido', 'acceso-rapido-1767364445979', 'Acceso rápido', 'Fija accesos a módulos del menú lateral.', 1, 1, 0, '{"shortcutId": "clientes", "shortcutLabel": "Clientes"}', '2026-01-02 14:34:06.367934', '2026-01-02 14:34:10.085279');
INSERT INTO "public"."usuario_inicio_panel" VALUES (73, 2, 'acceso-rapido', 'acceso-rapido-1768235603511', 'Acceso rápido', 'Fija accesos a módulos del menú lateral.', 1, 1, 2, '{"shortcutId": "productos", "shortcutLabel": "Productos"}', '2026-01-12 16:33:23.483496', '2026-01-12 16:33:23.483496');
INSERT INTO "public"."usuario_inicio_panel" VALUES (71, 1, 'acceso-rapido', 'acceso-rapido-1767611346213', 'Acceso rápido', 'Fija accesos a módulos del menú lateral.', 1, 1, 8, '{"shortcutId": "config-tpv", "shortcutLabel": "Configuración TPV"}', '2026-01-05 11:09:07.437978', '2026-01-14 23:40:38.71542');
INSERT INTO "public"."usuario_inicio_panel" VALUES (69, 1, 'acceso-rapido', 'acceso-rapido-1767609921049', 'Acceso rápido', 'Fija accesos a módulos del menú lateral.', 1, 1, 2, '{"shortcutId": "tpv", "shortcutLabel": "Terminal TPV"}', '2026-01-05 10:45:21.158539', '2026-01-20 15:22:18.315523');
INSERT INTO "public"."usuario_inicio_panel" VALUES (75, 1, 'acceso-rapido', 'acceso-rapido-1771258861820', 'Acceso rápido', 'Fija accesos a módulos del menú lateral.', 1, 1, 12, '{"shortcutId": "tipos-codigo-barra", "shortcutLabel": "Formatos códigos de barras"}', '2026-02-16 16:21:02.758168', '2026-02-16 16:21:06.854206');
INSERT INTO "public"."usuario_inicio_panel" VALUES (70, 1, 'acceso-rapido', 'acceso-rapido-1767609925697', 'Acceso rápido', 'Fija accesos a módulos del menú lateral.', 1, 1, 5, '{"shortcutId": "facturas-simplificadas", "shortcutLabel": "Facturas Simplificadas"}', '2026-01-05 10:45:25.760202', '2026-01-14 23:40:51.350343');
INSERT INTO "public"."usuario_inicio_panel" VALUES (74, 1, 'acceso-rapido', 'acceso-rapido-1768434062307', 'Acceso rápido', 'Fija accesos a módulos del menú lateral.', 1, 1, 3, '{"shortcutId": "tpv", "shortcutLabel": "Terminal TPV"}', '2026-01-14 23:40:56.342875', '2026-01-14 23:40:56.342875');
INSERT INTO "public"."usuario_inicio_panel" VALUES (61, 1, 'ultimos-albaranes', 'ultimos-albaranes-1767360492871', 'Últimos Albaranes', 'Muestra los últimos 4 albaranes registrados.', 2, 2, 0, '{}', '2026-01-02 13:28:13.619556', '2026-01-14 23:41:09.276258');
INSERT INTO "public"."usuario_inicio_panel" VALUES (72, 1, 'acceso-rapido', 'acceso-rapido-1767611382490', 'Acceso rápido', 'Fija accesos a módulos del menú lateral.', 1, 1, 4, '{"shortcutId": "tipos-codigo-barra", "shortcutLabel": "Tipos Código Barras"}', '2026-01-05 11:09:43.678223', '2026-01-20 15:22:16.960236');
INSERT INTO "public"."usuario_inicio_panel" VALUES (68, 2, 'ultimos-albaranes', 'ultimos-albaranes-1767364480600', 'Últimos Albaranes', 'Muestra los últimos 4 albaranes registrados.', 2, 2, 3, '{}', '2026-01-02 14:34:40.937934', '2026-01-02 14:36:34.467054');

-- ----------------------------
-- Table structure for usuarios
-- ----------------------------
DROP TABLE IF EXISTS "public"."usuarios";
CREATE TABLE "public"."usuarios" (
  "id" int8 NOT NULL GENERATED BY DEFAULT AS IDENTITY (
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1
),
  "contrasena" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "dni" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "usuario" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "email" varchar(255) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of usuarios
-- ----------------------------
INSERT INTO "public"."usuarios" VALUES (1, '1234', '45968199P', 'ruben', 'programacion@grupodoscar.es');
INSERT INTO "public"."usuarios" VALUES (2, 'tomaquetomacaracola1]', '21015323Q', 'manolo', 'manuel@grupodoscar.es');

-- ----------------------------
-- Table structure for ventas_albaran_lineas
-- ----------------------------
DROP TABLE IF EXISTS "public"."ventas_albaran_lineas";
CREATE TABLE "public"."ventas_albaran_lineas" (
  "id" int8 NOT NULL GENERATED BY DEFAULT AS IDENTITY (
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1
),
  "cantidad" int4 NOT NULL,
  "descuento" float8 NOT NULL,
  "observaciones" text COLLATE "pg_catalog"."default",
  "precio_unitario" float8 NOT NULL,
  "albaran_id" int8,
  "producto_id" int8,
  "tipo_iva_id" int8,
  "porcentaje_iva" float8 NOT NULL DEFAULT 0,
  "porcentaje_recargo" float8 NOT NULL DEFAULT 0,
  "importe_iva" float8 NOT NULL DEFAULT 0,
  "importe_recargo" float8 NOT NULL DEFAULT 0,
  "referencia" varchar(255) COLLATE "pg_catalog"."default",
  "nombre_producto" varchar(255) COLLATE "pg_catalog"."default" DEFAULT ''::character varying,
  "almacen_id" int8
)
;

-- ----------------------------
-- Records of ventas_albaran_lineas
-- ----------------------------
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11303, 1, 12, '', 100, 11098, 1, 2, 10, 1.4, 8.8, 1.2319999999999998, 'REF1', 'Costillar BBQ iberico', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11304, 1, 0, '', 12, 11098, 2, 1, 21, 5.2, 2.52, 0.6240000000000001, 'REF2', 'Pollo teriyaki', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11306, 1, 12, '', 100, 11100, 1, 2, 10, 1.4, 8.8, 1.2319999999999998, 'REF1', 'Costillar BBQ iberico', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11132, 1, 0, '', 1.5, 11066, 22, 1, 21, 0, 0.315, 0, 'AGU001', 'Agua mineral', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11135, 1, 0, '', 24.9, 11068, 5, 2, 10, 0, 2.49, 0, 'CAR-CHU-001', '', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11141, 1, 0, '', 24.9, 11069, 5, 2, 10, 1.4, 2.4402, 0.34162799999999993, 'CAR-CHU-001', '', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11143, 1, 0, '', 1.5, 11072, 22, NULL, 0, 0, 0, 0, 'AGU001', '', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11144, 1, 0, '', 1.5, 11073, 22, NULL, 0, 0, 0, 0, 'AGU001', '', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11146, 1, 0, '', 1.5, 11074, 22, NULL, 0, 0, 0, 0, 'AGU001', '', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11147, 1, 0, '', 1.5, 11071, 22, NULL, 0, 0, 0, 0, 'AGU001', '', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11148, 1, 0, '', 24.9, 11067, 5, 2, 10, 0, 0.02489999999999988, 0, 'CAR-CHU-001', 'Chuletón de vaca vieja', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11150, 1, 0, '', 24.9, 11075, 5, 2, 10, 0, 2.49, 0, 'CAR-CHU-001', '', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11152, 1, 0, '', 24.9, 11077, 5, 2, 10, 0, 2.49, 0, 'CAR-CHU-001', '', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11153, 1, 0, '', 24.9, 11078, 5, 2, 10, 0, 2.49, 0, 'CAR-CHU-001', '', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11157, 1, 0, '', 24.9, 11079, 5, 2, 10, 0, 0.02489999999999988, 0, 'CAR-CHU-001', '', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11170, 1, 0, '', 0, 11080, 28, 2, 10, 0, 0, 0, 'asd', 'asd', 1);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11171, 1, 0, '', 1.5, 11080, 22, 1, 21, 0, 0.315, 0, 'AGU001', 'Agua mineral', 3);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11174, 1, 0, '', 0, 11081, 28, 2, 10, 1.4, 0, 0, 'asd', 'asd', 3);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11175, 1, 0, '', 1.5, 11081, 22, 1, 21, 5.2, 0.3087, 0.07644000000000001, 'AGU001', 'Agua mineral', 1);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11181, 1, 0, '', 1.5, 11082, 22, NULL, 0, 0, 0, 0, 'AGU001', 'Agua mineral', 3);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11184, 1, 0, '', 1.5, 11083, 22, NULL, 0, 0, 0, 0, 'AGU001', 'Agua mineral', 3);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11252, 3, 0, '', 1.5, 11085, 22, 3, 4, 0, 0.162, 0, 'AGU001', 'Agua mineraladacfUIGGYUHFYUFFYUFFYU', 3);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11253, 1, 99.99, '', 99999999.99, 11085, 1, 2, 10, 0, 899.9999999114871, 0, 'REF1', 'Costillar BBQ iberico', 1);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11254, 1, 0, '', 95, 11085, 4, 3, 4, 0, 3.42, 0, 'REF41', 'Blanco Dulce Eva', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11257, 1, 10, '', 1.5, 11084, 22, 1, 21, 5.2, 0.27783, 0.06879600000000001, 'AGU001', 'Agua mineral', 1);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11258, 1, 0, '', 10.9, 11084, 14, 2, 10, 1.4, 1.0682, 0.149548, 'VEG-THA-008', 'Bowl Vegano Thai', 3);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11262, 5, 0, '', 95, 11086, 4, 3, 4, 0.5, 18.62, 2.3275, 'REF4', 'Blanco Dulce Eva', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11264, 5, 0, '', 95, 11087, 4, 3, 4, 0.5, 18.62, 2.3275, 'REF4', 'Blanco Dulce Eva', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11265, 3, 0, '', 95, 11088, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11266, 3, 0, '', 95, 11089, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11267, 3, 0, '', 95, 11090, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11268, 3, 0, '', 95, 11091, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11269, 3, 0, '', 1.5, 11092, 22, 3, 4, 0, 0.162, 0, 'AGU001', 'Agua mineraladacfUIGGYUHFYUFFYUFFYU', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11270, 1, 99.99, '', 99999999.99, 11092, 1, 2, 10, 0, 899.9999999114871, 0, 'REF1', 'Costillar BBQ iberico', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11271, 1, 0, '', 95, 11092, 4, 3, 4, 0, 3.42, 0, 'REF41', 'Blanco Dulce Eva', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11275, 3, 0, '', 1.5, 11093, 22, 3, 4, 0, 0.162, 0, 'AGU001', 'Agua mineraladacfUIGGYUHFYUFFYUFFYU', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11276, 1, 99.99, '', 99999999.99, 11093, 1, 2, 10, 0, 899.9999999114871, 0, 'REF1', 'Costillar BBQ iberico', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11277, 1, 0, '', 95, 11093, 4, 3, 4, 0, 3.42, 0, 'REF41', 'Blanco Dulce Eva', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11281, 3, 0, '', 1.5, 11094, 22, 3, 4, 0, 0.162, 0, 'AGU001', 'Agua mineraladacfUIGGYUHFYUFFYUFFYU', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11282, 1, 99.99, '', 99999999.99, 11094, 1, 2, 10, 0, 899.9999999114871, 0, 'REF1', 'Costillar BBQ iberico', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11283, 1, 0, '', 95, 11094, 4, 3, 4, 0, 3.42, 0, 'REF41', 'Blanco Dulce Eva', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11290, 3, 0, '', 1.5, 11095, 22, 3, 4, 0, 0.162, 0, 'AGU001', 'Agua mineraladacfUIGGYUHFYUFFYUFFYU', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11291, 1, 99.99, '', 99999999.99, 11095, 1, 2, 10, 0, 899.9999999114871, 0, 'REF1', 'Costillar BBQ iberico', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11292, 1, 0, '', 95, 11095, 4, 3, 4, 0, 3.42, 0, 'REF41', 'Blanco Dulce Eva', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11293, 3, 0, '', 1.5, 11096, 22, 3, 4, 0, 0.162, 0, 'AGU001', 'Agua mineraladacfUIGGYUHFYUFFYUFFYU', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11294, 1, 99.99, '', 99999999.99, 11096, 1, 2, 10, 0, 899.9999999114871, 0, 'REF1', 'Costillar BBQ iberico', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11295, 1, 0, '', 95, 11096, 4, 3, 4, 0, 3.42, 0, 'REF41', 'Blanco Dulce Eva', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11302, 1, 0, '', 2, 11097, 28, 2, 10, 1.4, 0.2, 0.027999999999999997, 'asd', 'asd', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11307, 1, 0, '', 12, 11100, 2, 1, 21, 5.2, 2.52, 0.6240000000000001, 'REF2', 'Pollo teriyaki', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11308, 3, 0, '', 95, 11099, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11309, 1, 0, '', 100, 11101, 1, 2, 10, 1.4, 9.8, 1.3719999999999999, 'REF1', 'Costillar BBQ iberico', 1);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11312, 1, 0, '', 4.5, 11102, 18, NULL, 0, 0, 0, 0, 'BOC001', 'Bocadillo de jamón', NULL);
INSERT INTO "public"."ventas_albaran_lineas" VALUES (11313, 1, 0, '', 4.5, 11103, 18, NULL, 0, 0, 0, 0, 'BOC001', 'Bocadillo de jamón', NULL);

-- ----------------------------
-- Table structure for ventas_albaranes
-- ----------------------------
DROP TABLE IF EXISTS "public"."ventas_albaranes";
CREATE TABLE "public"."ventas_albaranes" (
  "id" int8 NOT NULL DEFAULT nextval('albaranes_id_seq'::regclass),
  "numero" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "cliente_id" int8,
  "observaciones" text COLLATE "pg_catalog"."default",
  "estado" varchar(255) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'Pendiente'::character varying,
  "subtotal" float8 NOT NULL DEFAULT 0,
  "descuento_total" float8 NOT NULL DEFAULT 0,
  "total" float8 NOT NULL DEFAULT 0,
  "factura_id" int8,
  "pedido_id" int8,
  "presupuesto_id" int8,
  "factura_proforma_origen_id" int8,
  "factura_rectificativa_origen_id" int8,
  "contabilizado" bool NOT NULL DEFAULT false,
  "descuentototal" float8 NOT NULL,
  "descuento_agrupacion" float8 NOT NULL DEFAULT 0,
  "notas" text COLLATE "pg_catalog"."default",
  "direccion_id" int8,
  "serie_id" int8,
  "anio_documento" int4,
  "numero_secuencial" int8,
  "codigo_documento" varchar(255) COLLATE "pg_catalog"."default",
  "cliente_nombre_comercial" varchar(255) COLLATE "pg_catalog"."default",
  "cliente_nombre_fiscal" varchar(255) COLLATE "pg_catalog"."default",
  "cliente_nif_cif" varchar(255) COLLATE "pg_catalog"."default",
  "cliente_email" varchar(255) COLLATE "pg_catalog"."default",
  "cliente_telefono" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_facturacion_pais" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_facturacion_codigo_postal" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_facturacion_provincia" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_facturacion_poblacion" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_facturacion_direccion" text COLLATE "pg_catalog"."default",
  "direccion_envio_pais" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_envio_codigo_postal" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_envio_provincia" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_envio_poblacion" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_envio_direccion" text COLLATE "pg_catalog"."default",
  "almacen_id" int8,
  "venta_multialmacen" bool NOT NULL DEFAULT false,
  "tarifa_id" int8,
  "fecha" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
)
;
COMMENT ON COLUMN "public"."ventas_albaranes"."contabilizado" IS 'Indica si el albarán ha sido contabilizado (stock restado)';
COMMENT ON COLUMN "public"."ventas_albaranes"."cliente_nombre_comercial" IS 'Snapshot del nombre comercial del cliente en el momento de creación';
COMMENT ON COLUMN "public"."ventas_albaranes"."cliente_nombre_fiscal" IS 'Snapshot del nombre fiscal del cliente en el momento de creación';
COMMENT ON COLUMN "public"."ventas_albaranes"."cliente_nif_cif" IS 'Snapshot del NIF/CIF del cliente en el momento de creación';
COMMENT ON COLUMN "public"."ventas_albaranes"."cliente_email" IS 'Snapshot del email del cliente en el momento de creación';
COMMENT ON COLUMN "public"."ventas_albaranes"."cliente_telefono" IS 'Snapshot del teléfono del cliente en el momento de creación';
COMMENT ON COLUMN "public"."ventas_albaranes"."direccion_facturacion_pais" IS 'Snapshot del país de la dirección de facturación';
COMMENT ON COLUMN "public"."ventas_albaranes"."direccion_facturacion_codigo_postal" IS 'Snapshot del código postal de la dirección de facturación';
COMMENT ON COLUMN "public"."ventas_albaranes"."direccion_facturacion_provincia" IS 'Snapshot de la provincia de la dirección de facturación';
COMMENT ON COLUMN "public"."ventas_albaranes"."direccion_facturacion_poblacion" IS 'Snapshot de la población de la dirección de facturación';
COMMENT ON COLUMN "public"."ventas_albaranes"."direccion_facturacion_direccion" IS 'Snapshot de la dirección completa de facturación';
COMMENT ON COLUMN "public"."ventas_albaranes"."direccion_envio_pais" IS 'Snapshot del país de la dirección de envío';
COMMENT ON COLUMN "public"."ventas_albaranes"."direccion_envio_codigo_postal" IS 'Snapshot del código postal de la dirección de envío';
COMMENT ON COLUMN "public"."ventas_albaranes"."direccion_envio_provincia" IS 'Snapshot de la provincia de la dirección de envío';
COMMENT ON COLUMN "public"."ventas_albaranes"."direccion_envio_poblacion" IS 'Snapshot de la población de la dirección de envío';
COMMENT ON COLUMN "public"."ventas_albaranes"."direccion_envio_direccion" IS 'Snapshot de la dirección completa de envío';

-- ----------------------------
-- Records of ventas_albaranes
-- ----------------------------
INSERT INTO "public"."ventas_albaranes" VALUES (11078, 'AV26-00012', 1, '', 'Pendiente', 24.9, 0, 27.39, NULL, NULL, NULL, NULL, NULL, 'f', 0, 0, '', NULL, 1, 2026, 12, 'AV26-00012', 'Cliente Uno', 'Cliente Uno S.L.2', '45968199P', 'cliente1@demo.local', '+34 910 101 010', 'España', '06300', 'Badajoz', 'zafra', 'calle vistacastellar 5', 'España', NULL, NULL, NULL, NULL, NULL, 'f', NULL, '2026-01-09 00:10:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11079, 'AV26-00013', 1, '', 'Pendiente', 24.9, 0, 0.27389999999999864, NULL, NULL, NULL, NULL, NULL, 't', 24.651, 99, '', NULL, 1, 2026, 13, 'AV26-00013', 'Cliente Uno', 'Cliente Uno S.L.2', '45968199P', 'cliente1@demo.local', '+34 910 101 010', 'España', '06300', 'Badajoz', 'zafra', 'calle vistacastellar 5', 'España', NULL, NULL, NULL, NULL, 1, 'f', NULL, '2026-01-09 00:11:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11080, 'AV26-00014', NULL, '', 'Pendiente', 1.5, 0, 1.815, NULL, NULL, NULL, NULL, NULL, 'f', 0, 0, '', NULL, 1, 2026, 14, 'AV26-00014', NULL, NULL, NULL, NULL, NULL, 'España', NULL, NULL, NULL, NULL, 'España', NULL, NULL, NULL, NULL, NULL, 't', NULL, '2026-01-15 00:01:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11081, 'AV26-00015', 2, 'asd', 'Pendiente', 1.5, 0, 1.85514, NULL, NULL, NULL, NULL, NULL, 'f', 0.03, 2, '', NULL, 1, 2026, 15, 'AV26-00015', 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', 'SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', NULL, 't', NULL, '2026-01-15 00:02:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11088, 'AB-03', 2, 'asd', 'Pendiente', 285, 0, 297.825, NULL, NULL, NULL, NULL, NULL, 'f', 0, 0, '', NULL, 2, 2026, 3, 'AB-03', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f', NULL, '2026-02-18 00:01:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11084, 'AV26-00018', 2, 'asd', 'Pendiente', 12.4, 0, 13.569374, NULL, NULL, NULL, NULL, NULL, 'f', 0.15000000000000002, 2, 'asd', NULL, 1, 2026, 18, 'AV26-00018', 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', 'SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'BADAJOZ', 'Badajoz', 'SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', NULL, 't', 1, '2026-01-20 00:03:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11085, 'AV26-00020', 16, '', 'Pendiente', 100000099.49, 0, 9993.131999026358, NULL, NULL, NULL, NULL, NULL, 'f', 99989999.99000098, 10, 'saqdaswdasddddddddddddda
a
a
a
a

', NULL, 1, 2026, 19, 'AV26-00019', 'asd', 'asd', '20715455E', 'web@doscar.com', '924229230', 'España', 'BADAJOZ', 'BADAJOZ', 'BADAJOZ', 'Servando González Becerra 5, Entreplanta Oficinas H-J', 'España', '06010', 'BADAJOZ', 'BADAJOZ', 'Carretera de Valverde KM 2', NULL, 't', 1, '2026-01-20 00:04:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11086, 'AV26-00021', 2, '', 'Emitido', 475, 0, 486.4475, NULL, NULL, NULL, NULL, NULL, 'f', 0, 2, '', NULL, 1, 2026, 21, 'AV26-00021', 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', 'SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', 1, 'f', 1, '2026-02-12 00:01:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11087, 'AV26-00022', 2, 'asd', 'Emitido', 475, 0, 486.4475, NULL, NULL, NULL, NULL, NULL, 'f', 0, 2, 'asd', NULL, 1, 2026, 22, 'AV26-00022', 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', 'SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', 1, 'f', 1, '2026-02-13 00:01:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11091, 'AV26-00025', 2, 'asd', 'Pendiente', 285, 0, 297.825, NULL, NULL, NULL, NULL, NULL, 'f', 0, 0, '', NULL, 1, 2026, 25, 'AV26-00025', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f', NULL, '2026-02-18 00:04:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11097, 'AV26-00030', 2, 'asd', 'Pendiente', 2, 0, 2.228, NULL, NULL, NULL, NULL, NULL, 'f', 0, 0, 'asd', NULL, 1, 2026, 30, 'AV26-00030', 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', 'SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', 3, 'f', 1, '2026-02-20 00:01:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11099, 'AV26-00031', 2, 'asd', 'Pendiente', 285, 0, 297.825, NULL, NULL, NULL, NULL, NULL, 'f', 0, 0, '', NULL, 1, 2026, 31, 'AV26-00031', 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', NULL, 'f', 1, '2026-02-20 00:03:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11101, 'AV26-00032', 2, 'hg', 'Pendiente', 100, 0, 109.172, NULL, NULL, NULL, NULL, NULL, 'f', 0, 2, '', NULL, 1, 2026, 32, 'AV26-00032', 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', 'SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', 1, 'f', 1, '2026-02-24 00:01:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11102, 'AV26-00033', 2, '', 'Emitido', 4.5, 0, 4.41, NULL, NULL, NULL, NULL, NULL, 'f', 0, 2, '', NULL, 1, 2026, 33, 'AV26-00033', 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', 'SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', 1, 'f', 1, '2026-02-24 00:02:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11069, 'AV26-00003', 2, '', 'Facturado', 24.9, 0, 27.183828, NULL, NULL, NULL, NULL, NULL, 'f', 0.498, 2, '', NULL, 1, 2026, 3, 'AV26-00003', 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', NULL, 'f', NULL, '2026-01-09 00:03:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11073, 'AV26-00007', 16, 'Llamar antes', 'Pendiente', 1.5, 0, 1.5, NULL, NULL, NULL, NULL, NULL, 'f', 0, 0, '', NULL, 1, 2026, 7, 'AV26-00007', 'asd', 'asd', '20715455E', 'web@doscar.com', '924229230', 'España', 'BADAJOZ', 'BADAJOZ', 'BADAJOZ', 'Servando González Becerra 5, Entreplanta Oficinas H-J', 'España', '06010', 'BADAJOZ', 'BADAJOZ', 'Carretera de Valverde KM 2', NULL, 'f', NULL, '2026-01-09 00:06:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11082, 'AV26-00016', NULL, '', 'Emitido', 1.5, 0, 1.5, NULL, NULL, NULL, NULL, NULL, 'f', 0, 0, '', NULL, 1, 2026, 16, 'AV26-00016', NULL, NULL, NULL, NULL, NULL, 'España', NULL, NULL, NULL, NULL, 'España', NULL, NULL, NULL, NULL, 1, 'f', NULL, '2026-01-20 00:01:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11093, 'AV26-00026', 16, '', 'Pendiente', 100000099.49, 0, 9993.131999026358, NULL, NULL, NULL, NULL, NULL, 'f', 99989999.99000098, 10, 'saqdaswdasddddddddddddda
a
a
a
a

', NULL, 1, 2026, 26, 'AV26-00026', 'asd', 'asd', '20715455E', 'web@doscar.com', '924229230', 'España', 'BADAJOZ', 'BADAJOZ', 'BADAJOZ', 'Servando González Becerra 5, Entreplanta Oficinas H-J', 'España', '06010', 'BADAJOZ', 'BADAJOZ', 'Carretera de Valverde KM 2', 1, 'f', 1, '2026-02-19 00:01:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11095, 'AV26-00028', 16, '', 'Pendiente', 100000099.49, 0, 9993.131999026358, NULL, NULL, NULL, NULL, NULL, 'f', 99989999.99000098, 10, 'saqdaswdasddddddddddddda
a
a
a
a

', NULL, 1, 2026, 28, 'AV26-00028', 'asd', 'asd', '20715455E', 'web@doscar.com', '924229230', 'España', 'BADAJOZ', 'BADAJOZ', 'BADAJOZ', 'Servando González Becerra 5, Entreplanta Oficinas H-J', 'España', '06010', 'BADAJOZ', 'BADAJOZ', 'Carretera de Valverde KM 2', 1, 'f', 1, '2026-02-19 00:03:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11083, 'AV26-00017', NULL, '', 'Emitido', 1.5, 0, 1.5, NULL, NULL, NULL, NULL, NULL, 'f', 0, 0, '', NULL, 1, 2026, 17, 'AV26-00017', NULL, NULL, NULL, NULL, NULL, 'España', NULL, NULL, NULL, NULL, 'España', NULL, NULL, NULL, NULL, 1, 'f', NULL, '2026-01-20 00:02:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11067, 'AV26-00001', 1, '', 'Emitido', 24.9, 0, 0.27389999999999864, NULL, NULL, NULL, NULL, NULL, 'f', 24.651, 99, '', NULL, 1, 2026, 1, 'AV26-00001', 'Cliente Uno', 'Cliente Uno S.L.2', '45968199P', 'cliente1@demo.local', '+34 910 101 010', 'España', '06300', 'Badajoz', 'zafra', 'calle vistacastellar 5', 'España', NULL, NULL, NULL, NULL, NULL, 'f', NULL, '2026-01-09 00:01:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11071, 'AV26-00005', 16, 'Llamar antes', 'Facturado', 1.5, 0, 1.5, NULL, NULL, NULL, NULL, NULL, 'f', 0, 0, '', NULL, 1, 2026, 5, 'AV26-00005', 'asd', 'asd', '20715455E', 'web@doscar.com', '924229230', 'España', 'BADAJOZ', 'BADAJOZ', 'BADAJOZ', 'Servando González Becerra 5, Entreplanta Oficinas H-J', 'España', '06010', 'BADAJOZ', 'BADAJOZ', 'Carretera de Valverde KM 2', NULL, 'f', NULL, '2026-01-09 00:04:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11072, 'AV26-00006', 16, 'Llamar antes', 'Pendiente', 1.5, 0, 1.5, NULL, NULL, NULL, NULL, NULL, 'f', 0, 0, '', NULL, 1, 2026, 6, 'AV26-00006', 'asd', 'asd', '20715455E', 'web@doscar.com', '924229230', 'España', 'BADAJOZ', 'BADAJOZ', 'BADAJOZ', 'Servando González Becerra 5, Entreplanta Oficinas H-J', 'España', '06010', 'BADAJOZ', 'BADAJOZ', 'Carretera de Valverde KM 2', NULL, 'f', NULL, '2026-01-09 00:05:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11074, 'AV26-00008', 16, 'Llamar antes', 'Cancelado', 1.5, 0, 1.5, NULL, NULL, NULL, NULL, NULL, 'f', 0, 0, '', NULL, 1, 2026, 8, 'AV26-00008', 'asd', 'asd', '20715455E', 'web@doscar.com', '924229230', 'España', 'BADAJOZ', 'BADAJOZ', 'BADAJOZ', 'Servando González Becerra 5, Entreplanta Oficinas H-J', 'España', '06010', 'BADAJOZ', 'BADAJOZ', 'Carretera de Valverde KM 2', NULL, 'f', NULL, '2026-01-09 00:07:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11075, 'AV26-00009', 1, '', 'Emitido', 24.9, 0, 27.39, NULL, NULL, NULL, NULL, NULL, 'f', 0, 0, '', NULL, 1, 2026, 9, 'AV26-00009', 'Cliente Uno', 'Cliente Uno S.L.2', '45968199P', 'cliente1@demo.local', '+34 910 101 010', 'España', '06300', 'Badajoz', 'zafra', 'calle vistacastellar 5', 'España', NULL, NULL, NULL, NULL, NULL, 'f', NULL, '2026-01-09 00:08:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11077, 'AV26-00011', 1, '', 'Pendiente', 24.9, 0, 27.39, NULL, NULL, NULL, NULL, NULL, 'f', 0, 0, '', NULL, 1, 2026, 11, 'AV26-00011', 'Cliente Uno', 'Cliente Uno S.L.2', '45968199P', 'cliente1@demo.local', '+34 910 101 010', 'España', '06300', 'Badajoz', 'zafra', 'calle vistacastellar 5', 'España', NULL, NULL, NULL, NULL, NULL, 'f', NULL, '2026-01-09 00:09:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11066, 'AB-02', 16, 'Llamar antes', 'Emitido', 1.5, 0, 1.815, NULL, NULL, NULL, NULL, NULL, 'f', 0, 0, 'Si no está se entrega en el bar de abajo', 24, 2, 2026, 2, 'AB-02', 'asd', 'asd', '20715455E', 'web@doscar.com', '924229230', 'España', '06011', 'BADAJOZ', 'BADAJOZ', 'Servando González Becerra 5, Entreplanta Oficinas H-J', 'España', '06011', 'BADAJOZ', 'BADAJOZ', 'Servando González Becerra 5, Entreplanta Oficinas H-J', NULL, 'f', NULL, '2026-01-08 00:01:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11068, 'AV26-00002', 16, '', 'Entregado', 24.9, 0, 27.39, NULL, NULL, NULL, NULL, NULL, 'f', 0, 0, '', NULL, 1, 2026, 2, 'AV26-00002', 'asd', 'asd', '20715455E', 'web@doscar.com', '924229230', 'España', 'BADAJOZ', 'BADAJOZ', 'BADAJOZ', 'Servando González Becerra 5, Entreplanta Oficinas H-J', 'España', '06010', 'BADAJOZ', 'BADAJOZ', 'Carretera de Valverde KM 2', NULL, 'f', NULL, '2026-01-09 00:02:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11089, 'AV26-00023', 2, 'asd', 'Pendiente', 285, 0, 297.825, NULL, NULL, NULL, NULL, NULL, 'f', 0, 0, '', NULL, 1, 2026, 23, 'AV26-00023', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f', NULL, '2026-02-18 00:02:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11090, 'AV26-00024', 2, 'asd', 'Pendiente', 285, 0, 297.825, NULL, NULL, NULL, NULL, NULL, 'f', 0, 0, '', NULL, 1, 2026, 24, 'AV26-00024', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f', NULL, '2026-02-18 00:03:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11092, 'AB-04', 16, '', 'Pendiente', 100000099.49, 0, 9993.131999026358, NULL, NULL, NULL, NULL, NULL, 'f', 99989999.99000098, 10, 'saqdaswdasddddddddddddda
a
a
a
a

', NULL, 2, 2026, 4, 'AB-04', 'asd', 'asd', '20715455E', 'web@doscar.com', '924229230', 'España', 'BADAJOZ', 'BADAJOZ', 'BADAJOZ', 'Servando González Becerra 5, Entreplanta Oficinas H-J', 'España', '06010', 'BADAJOZ', 'BADAJOZ', 'Carretera de Valverde KM 2', NULL, 'f', 1, '2026-02-18 00:05:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11094, 'AV26-00027', 16, '', 'Pendiente', 100000099.49, 0, 9993.131999026358, NULL, NULL, NULL, NULL, NULL, 'f', 99989999.99000098, 10, 'saqdaswdasddddddddddddda
a
a
a
a

', NULL, 1, 2026, 27, 'AV26-00027', 'asd', 'asd', '20715455E', 'web@doscar.com', '924229230', 'España', 'BADAJOZ', 'BADAJOZ', 'BADAJOZ', 'Servando González Becerra 5, Entreplanta Oficinas H-J', 'España', '06010', 'BADAJOZ', 'BADAJOZ', 'Carretera de Valverde KM 2', 1, 'f', 1, '2026-02-19 00:02:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11096, 'AV26-00029', 16, '', 'Pendiente', 100000099.49, 0, 9993.131999026358, NULL, NULL, NULL, NULL, NULL, 'f', 99989999.99000098, 10, 'saqdaswdasddddddddddddda
a
a
a
a

', NULL, 1, 2026, 29, 'AV26-00029', 'asd', 'asd', '20715455E', 'web@doscar.com', '924229230', 'España', 'BADAJOZ', 'BADAJOZ', 'BADAJOZ', 'Servando González Becerra 5, Entreplanta Oficinas H-J', 'España', '06010', 'BADAJOZ', 'BADAJOZ', 'Carretera de Valverde KM 2', 1, 'f', 1, '2026-02-19 00:04:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11098, 'AB-05', 2, 'zx x', 'Pendiente', 112, 0, 113.176, NULL, NULL, NULL, NULL, NULL, 'f', 12, 0, '', NULL, 2, 2026, 5, 'AB-05', 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', NULL, 'f', 1, '2026-02-20 00:02:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11100, 'AB-06', 2, 'zx x', 'Pendiente', 112, 0, 113.176, NULL, NULL, NULL, NULL, NULL, 'f', 12, 0, '', NULL, 2, 2026, 6, 'AB-06', 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', NULL, 'f', 1, '2026-02-20 00:04:00');
INSERT INTO "public"."ventas_albaranes" VALUES (11103, 'AV26-00034', 2, '', 'Pendiente', 4.5, 0, 4.41, NULL, NULL, NULL, NULL, NULL, 'f', 0, 2, '', NULL, 1, 2026, 34, 'AV26-00034', 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', 'SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', 1, 'f', 1, '2026-02-24 00:03:00');

-- ----------------------------
-- Table structure for ventas_factura_lineas
-- ----------------------------
DROP TABLE IF EXISTS "public"."ventas_factura_lineas";
CREATE TABLE "public"."ventas_factura_lineas" (
  "id" int8 NOT NULL DEFAULT nextval('ventas_factura_lineas_id_seq'::regclass),
  "cantidad" int4 NOT NULL,
  "descuento" float8 NOT NULL DEFAULT 0,
  "observaciones" text COLLATE "pg_catalog"."default",
  "precio_unitario" float8 NOT NULL,
  "factura_id" int8,
  "producto_id" int8,
  "tipo_iva_id" int8,
  "porcentaje_iva" float8 NOT NULL DEFAULT 0,
  "porcentaje_recargo" float8 NOT NULL DEFAULT 0,
  "importe_iva" float8 NOT NULL DEFAULT 0,
  "importe_recargo" float8 NOT NULL DEFAULT 0,
  "referencia" varchar(255) COLLATE "pg_catalog"."default",
  "nombre_producto" varchar(255) COLLATE "pg_catalog"."default" DEFAULT ''::character varying,
  "almacen_id" int8
)
;

-- ----------------------------
-- Records of ventas_factura_lineas
-- ----------------------------
INSERT INTO "public"."ventas_factura_lineas" VALUES (68, 3, 0, '', 95, 6, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_factura_lineas" VALUES (69, 3, 0, '', 95, 7, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_factura_lineas" VALUES (70, 3, 0, '', 95, 8, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_factura_lineas" VALUES (11, 1, 10, '', 12, 1, 2, 1, 21, 5.2, 2.1319199999999996, 0.527904, 'REF2', 'Pollo teriyaki', NULL);
INSERT INTO "public"."ventas_factura_lineas" VALUES (12, 1, 0, '', 100, 1, 1, 2, 10, 1.4, 9.4, 1.3159999999999998, 'REF1', 'Costillar BBQ iberico', NULL);
INSERT INTO "public"."ventas_factura_lineas" VALUES (15, 5, 0, '', 95, 2, 4, 3, 4, 0.5, 18.62, 2.3275, 'REF4', 'Blanco Dulce Eva', NULL);
INSERT INTO "public"."ventas_factura_lineas" VALUES (74, 3, 0, '', 95, 10, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_factura_lineas" VALUES (75, 3, 0, '', 95, 3, 4, 3, 4, 0.5, 11.286, 1.41075, 'REF4', 'Blanco Dulce Eva', 3);
INSERT INTO "public"."ventas_factura_lineas" VALUES (98, 3, 0, '', 95, 9, 4, 3, 4, 0.5, 10.601999999999999, 1.3252499999999998, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_factura_lineas" VALUES (41, 5, 0, '', 95, 5, 4, 3, 4, 0.5, 18.62, 2.3275, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_factura_lineas" VALUES (101, 1, 12, '', 100, 11, 1, 2, 10, 1.4, 8.8, 1.2319999999999998, 'REF1', 'Costillar BBQ iberico', 1);
INSERT INTO "public"."ventas_factura_lineas" VALUES (102, 1, 0, '', 12, 11, 2, 1, 21, 5.2, 2.52, 0.6240000000000001, 'REF2', 'Pollo teriyaki', 1);
INSERT INTO "public"."ventas_factura_lineas" VALUES (103, 1, 0, '', 100, 12, 1, 2, 10, 1.4, 9.8, 1.3719999999999999, 'REF1', 'Costillar BBQ iberico', 1);
INSERT INTO "public"."ventas_factura_lineas" VALUES (104, 1, 0, '', 4.5, 13, 18, NULL, 0, 0, 0, 0, 'BOC001', 'Bocadillo de jamón', NULL);
INSERT INTO "public"."ventas_factura_lineas" VALUES (106, 1, 0, '', 4.5, 14, 18, NULL, 0, 0, 0, 0, 'BOC001', 'Bocadillo de jamón', 1);

-- ----------------------------
-- Table structure for ventas_factura_proforma_lineas
-- ----------------------------
DROP TABLE IF EXISTS "public"."ventas_factura_proforma_lineas";
CREATE TABLE "public"."ventas_factura_proforma_lineas" (
  "id" int8 NOT NULL DEFAULT nextval('ventas_factura_proforma_lineas_id_seq'::regclass),
  "cantidad" int4 NOT NULL,
  "descuento" float8 NOT NULL DEFAULT 0,
  "observaciones" text COLLATE "pg_catalog"."default",
  "precio_unitario" float8 NOT NULL,
  "factura_proforma_id" int8,
  "producto_id" int8,
  "tipo_iva_id" int8,
  "porcentaje_iva" float8 NOT NULL DEFAULT 0,
  "porcentaje_recargo" float8 NOT NULL DEFAULT 0,
  "importe_iva" float8 NOT NULL DEFAULT 0,
  "importe_recargo" float8 NOT NULL DEFAULT 0,
  "referencia" varchar(255) COLLATE "pg_catalog"."default",
  "nombre_producto" varchar(255) COLLATE "pg_catalog"."default" DEFAULT ''::character varying,
  "almacen_id" int8
)
;

-- ----------------------------
-- Records of ventas_factura_proforma_lineas
-- ----------------------------
INSERT INTO "public"."ventas_factura_proforma_lineas" VALUES (81, 1, 0, '', 100, 1, 1, 2, 10, 1.4, 9.4, 1.3159999999999998, 'REF1', 'Costillar BBQ iberico', 1);
INSERT INTO "public"."ventas_factura_proforma_lineas" VALUES (82, 1, 10, '', 12, 1, 2, 1, 21, 5.2, 2.1319199999999996, 0.527904, 'REF2', 'Pollo teriyaki', 1);
INSERT INTO "public"."ventas_factura_proforma_lineas" VALUES (83, 3, 0, '', 95, 2, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_factura_proforma_lineas" VALUES (84, 3, 0, '', 95, 3, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_factura_proforma_lineas" VALUES (86, 3, 2, '', 95, 5, 4, 3, 4, 0.5, 11.06028, 1.382535, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_factura_proforma_lineas" VALUES (87, 3, 0, '', 95, 6, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_factura_proforma_lineas" VALUES (88, 1, 0, '', 100, 7, 1, 2, 10, 1.4, 10, 1.4, 'REF1', 'Costillar BBQ iberico', 1);
INSERT INTO "public"."ventas_factura_proforma_lineas" VALUES (89, 1, 10, '', 12, 7, 2, 1, 21, 5.2, 2.2680000000000002, 0.5616000000000001, 'REF2', 'Pollo teriyaki', 1);
INSERT INTO "public"."ventas_factura_proforma_lineas" VALUES (111, 1, 0, '', 100, 9, 1, 2, 10, 1.4, 9.700000000000001, 1.3579999999999999, 'REF1', 'Costillar BBQ iberico', 1);
INSERT INTO "public"."ventas_factura_proforma_lineas" VALUES (112, 1, 10, '', 12, 9, 2, 1, 21, 5.2, 2.19996, 0.5447520000000001, 'REF2', 'Pollo teriyaki', 1);
INSERT INTO "public"."ventas_factura_proforma_lineas" VALUES (113, 1, 0, '', 100, 10, 1, 2, 10, 1.4, 9.700000000000001, 1.3579999999999999, 'REF1', 'Costillar BBQ iberico', 1);
INSERT INTO "public"."ventas_factura_proforma_lineas" VALUES (114, 1, 10, '', 12, 10, 2, 1, 21, 5.2, 2.19996, 0.5447520000000001, 'REF2', 'Pollo teriyaki', 1);
INSERT INTO "public"."ventas_factura_proforma_lineas" VALUES (115, 3, 0, '', 95, 4, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_factura_proforma_lineas" VALUES (117, 3, 0, '', 95, 8, 4, 3, 4, 0.5, 11.172, 1.3965, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_factura_proforma_lineas" VALUES (118, 1, 0, '', 100, 11, 1, 2, 10, 1.4, 9.8, 1.3719999999999999, 'REF1', 'Costillar BBQ iberico', NULL);

-- ----------------------------
-- Table structure for ventas_factura_rectificativa_lineas
-- ----------------------------
DROP TABLE IF EXISTS "public"."ventas_factura_rectificativa_lineas";
CREATE TABLE "public"."ventas_factura_rectificativa_lineas" (
  "id" int8 NOT NULL DEFAULT nextval('ventas_factura_rectificativa_lineas_id_seq'::regclass),
  "cantidad" int4 NOT NULL,
  "descuento" float8 NOT NULL DEFAULT 0,
  "observaciones" text COLLATE "pg_catalog"."default",
  "precio_unitario" float8 NOT NULL,
  "factura_rectificativa_id" int8,
  "producto_id" int8,
  "tipo_iva_id" int8,
  "porcentaje_iva" float8 NOT NULL DEFAULT 0,
  "porcentaje_recargo" float8 NOT NULL DEFAULT 0,
  "importe_iva" float8 NOT NULL DEFAULT 0,
  "importe_recargo" float8 NOT NULL DEFAULT 0,
  "referencia" varchar(255) COLLATE "pg_catalog"."default",
  "nombre_producto" varchar(255) COLLATE "pg_catalog"."default" DEFAULT ''::character varying,
  "almacen_id" int8
)
;

-- ----------------------------
-- Records of ventas_factura_rectificativa_lineas
-- ----------------------------
INSERT INTO "public"."ventas_factura_rectificativa_lineas" VALUES (68, 3, 0, '', 95, 12, 4, 3, 4, 0.5, 11.172, 1.3965, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_factura_rectificativa_lineas" VALUES (69, 3, 0, '', 95, 6, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_factura_rectificativa_lineas" VALUES (70, 1, 0, '', 100, 13, 1, 2, 10, 1.4, 9.8, 1.3719999999999999, 'REF1', 'Costillar BBQ iberico', NULL);
INSERT INTO "public"."ventas_factura_rectificativa_lineas" VALUES (25, 3, 0, '', 95, 2, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_factura_rectificativa_lineas" VALUES (38, 1, 0, '', 12, 1, 2, 1, 21, 5.2, 2.3436, 0.5803200000000001, 'REF2', 'Pollo teriyaki', 1);
INSERT INTO "public"."ventas_factura_rectificativa_lineas" VALUES (39, 1, 10, '', 100, 1, 1, 2, 10, 1.4, 8.37, 1.1717999999999997, 'REF1', 'Costillar BBQ iberico', 1);
INSERT INTO "public"."ventas_factura_rectificativa_lineas" VALUES (40, 1, 0, '', 12, 4, 2, 1, 21, 5.2, 2.3436, 0.5803200000000001, 'REF2', 'Pollo teriyaki', 1);
INSERT INTO "public"."ventas_factura_rectificativa_lineas" VALUES (41, 1, 10, '', 100, 4, 1, 2, 10, 1.4, 8.37, 1.1717999999999997, 'REF1', 'Costillar BBQ iberico', 1);
INSERT INTO "public"."ventas_factura_rectificativa_lineas" VALUES (42, 3, 0, '', 95, 5, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_factura_rectificativa_lineas" VALUES (44, 3, 0, '', 95, 7, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_factura_rectificativa_lineas" VALUES (45, 3, 0, '', 95, 8, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_factura_rectificativa_lineas" VALUES (46, 3, 0, '', 95, 9, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_factura_rectificativa_lineas" VALUES (49, 3, 0, '', 95, 10, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_factura_rectificativa_lineas" VALUES (51, 3, 0, '', 95, 11, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);

-- ----------------------------
-- Table structure for ventas_facturas
-- ----------------------------
DROP TABLE IF EXISTS "public"."ventas_facturas";
CREATE TABLE "public"."ventas_facturas" (
  "id" int8 NOT NULL DEFAULT nextval('ventas_facturas_id_seq'::regclass),
  "numero" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "cliente_id" int8,
  "observaciones" text COLLATE "pg_catalog"."default",
  "estado" varchar(255) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'Pendiente'::character varying,
  "subtotal" float8 NOT NULL DEFAULT 0,
  "descuento_total" float8 NOT NULL DEFAULT 0,
  "total" float8 NOT NULL DEFAULT 0,
  "descuento_agrupacion" float8 NOT NULL DEFAULT 0,
  "notas" text COLLATE "pg_catalog"."default",
  "serie_id" int8,
  "anio_documento" int4,
  "numero_secuencial" int8,
  "codigo_documento" varchar(255) COLLATE "pg_catalog"."default",
  "contabilizado" bool NOT NULL DEFAULT false,
  "cliente_nombre_comercial" varchar(255) COLLATE "pg_catalog"."default",
  "cliente_nombre_fiscal" varchar(255) COLLATE "pg_catalog"."default",
  "cliente_nif_cif" varchar(255) COLLATE "pg_catalog"."default",
  "cliente_email" varchar(255) COLLATE "pg_catalog"."default",
  "cliente_telefono" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_facturacion_pais" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_facturacion_codigo_postal" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_facturacion_provincia" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_facturacion_poblacion" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_facturacion_direccion" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_envio_pais" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_envio_codigo_postal" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_envio_provincia" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_envio_poblacion" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_envio_direccion" varchar(255) COLLATE "pg_catalog"."default",
  "tarifa_id" int8,
  "almacen_id" int8,
  "venta_multialmacen" bool NOT NULL DEFAULT false,
  "presupuesto_id" int8,
  "pedido_id" int8,
  "albaran_id" int8,
  "factura_proforma_id" int8,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "fecha" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Records of ventas_facturas
-- ----------------------------
INSERT INTO "public"."ventas_facturas" VALUES (1, 'VF25-01', 2, 'a', 'Pendiente', 112, 1.2000000000000002, 117.52782400000001, 6, 'a', 6, 2026, 1, 'VF25-01', 'f', 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', 1, NULL, 'f', NULL, NULL, NULL, NULL, '2026-02-11 08:54:13.474261', '2026-02-11 09:51:01.339269', '2026-02-11 08:54:13.474261');
INSERT INTO "public"."ventas_facturas" VALUES (2, 'VF25-02', 2, '', 'Emitido', 475, 0, 486.4475, 2, '', 6, 2026, 2, 'VF25-02', 'f', 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', 1, 1, 'f', NULL, NULL, 11086, NULL, '2026-02-12 16:13:54.951277', '2026-02-13 11:10:10.717824', '2026-02-12 16:13:54.951277');
INSERT INTO "public"."ventas_facturas" VALUES (5, 'VF25-05', 2, '', 'Emitido', 475, 0, 486.4475, 2, '', 6, 2026, 5, 'VF25-05', 't', 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', 1, 1, 'f', NULL, NULL, NULL, NULL, '2026-02-13 11:43:00.031012', '2026-02-13 12:32:53.186626', '2026-02-13 11:43:00.031012');
INSERT INTO "public"."ventas_facturas" VALUES (6, 'VF25-06', 2, 'asd', 'Pendiente', 285, 0, 297.825, 0, '', 6, 2026, 6, 'VF25-06', 'f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f', NULL, NULL, NULL, NULL, '2026-02-18 14:37:43.013342', '2026-02-18 14:37:43.013347', '2026-02-18 14:37:43.013342');
INSERT INTO "public"."ventas_facturas" VALUES (7, 'VF25-07', 2, 'asd', 'Pendiente', 285, 0, 297.825, 0, '', 6, 2026, 7, 'VF25-07', 'f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f', NULL, NULL, NULL, NULL, '2026-02-18 14:38:15.562943', '2026-02-18 14:38:15.562944', '2026-02-18 14:38:15.562943');
INSERT INTO "public"."ventas_facturas" VALUES (8, 'VF25-08', 2, 'asd', 'Pendiente', 285, 0, 297.825, 0, '', 6, 2026, 8, 'VF25-08', 'f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f', NULL, NULL, NULL, NULL, '2026-02-18 14:38:20.95617', '2026-02-18 14:38:20.956171', '2026-02-18 14:38:20.95617');
INSERT INTO "public"."ventas_facturas" VALUES (10, 'VF25-10', 2, 'asd', 'Pendiente', 285, 0, 297.825, 0, 'asd', 6, 2026, 10, 'VF25-10', 'f', 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', 1, 1, 'f', NULL, NULL, NULL, NULL, '2026-02-19 11:02:31.609917', '2026-02-19 11:02:31.609917', '2026-02-19 11:02:31.609917');
INSERT INTO "public"."ventas_facturas" VALUES (3, 'VF25-03', 2, 'asd', 'Emitido', 285, 0, 294.84675, 1, 'asd', 6, 2026, 3, 'VF25-03', 'f', 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', 1, NULL, 't', NULL, NULL, 11087, NULL, '2026-02-13 11:23:32.104746', '2026-02-19 13:53:57.181162', '2026-02-13 11:23:32.104746');
INSERT INTO "public"."ventas_facturas" VALUES (9, 'VF25-09', 2, 'asd', 'Pendiente', 285, 0, 276.97725, 7, 'asd', 6, 2026, 9, 'VF25-09', 'f', 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', 'SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', 1, 1, 'f', NULL, NULL, NULL, NULL, '2026-02-18 14:51:43.374411', '2026-02-20 10:25:20.089583', '2026-02-18 14:51:43.374411');
INSERT INTO "public"."ventas_facturas" VALUES (11, 'VF25-11', 2, 'zx x', 'Pendiente', 112, 12, 113.176, 0, '', 6, 2026, 11, 'VF25-11', 'f', 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', 'SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', 1, 1, 'f', NULL, NULL, 11098, NULL, '2026-02-20 11:52:58.450146', '2026-02-20 13:37:37.825271', '2026-02-20 11:52:58.450146');
INSERT INTO "public"."ventas_facturas" VALUES (12, 'VF25-12', 2, 'hg', 'Pendiente', 100, 0, 109.172, 2, '', 6, 2026, 12, 'VF25-12', 'f', 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', 'SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', 1, 1, 'f', NULL, NULL, NULL, NULL, '2026-02-24 11:21:37.013518', '2026-02-24 11:21:37.01352', '2026-02-24 11:21:37.013518');
INSERT INTO "public"."ventas_facturas" VALUES (13, 'VF25-13', 2, '', 'Emitido', 4.5, 0, 4.41, 2, '', 6, 2026, 13, 'VF25-13', 'f', 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', 'SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', 1, 1, 'f', NULL, NULL, 11102, NULL, '2026-02-24 12:49:59.715144', '2026-02-24 12:49:59.715147', '2026-02-24 12:49:59.715144');
INSERT INTO "public"."ventas_facturas" VALUES (14, 'VF25-14', 2, '', 'Emitido', 4.5, 0, 4.41, 2, '', 6, 2026, 14, 'VF25-14', 't', 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', 'SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', 1, 1, 'f', NULL, NULL, 11103, NULL, '2026-02-24 13:02:41.903274', '2026-02-24 13:04:52.068057', '2026-02-24 13:02:41.903274');

-- ----------------------------
-- Table structure for ventas_facturas_proforma
-- ----------------------------
DROP TABLE IF EXISTS "public"."ventas_facturas_proforma";
CREATE TABLE "public"."ventas_facturas_proforma" (
  "id" int8 NOT NULL DEFAULT nextval('ventas_facturas_proforma_id_seq'::regclass),
  "numero" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "cliente_id" int8,
  "observaciones" text COLLATE "pg_catalog"."default",
  "estado" varchar(255) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'Pendiente'::character varying,
  "subtotal" float8 NOT NULL DEFAULT 0,
  "descuento_total" float8 NOT NULL DEFAULT 0,
  "total" float8 NOT NULL DEFAULT 0,
  "descuento_agrupacion" float8 NOT NULL DEFAULT 0,
  "notas" text COLLATE "pg_catalog"."default",
  "serie_id" int8,
  "anio_documento" int4,
  "numero_secuencial" int8,
  "codigo_documento" varchar(255) COLLATE "pg_catalog"."default",
  "cliente_nombre_comercial" varchar(255) COLLATE "pg_catalog"."default",
  "cliente_nombre_fiscal" varchar(255) COLLATE "pg_catalog"."default",
  "cliente_nif_cif" varchar(255) COLLATE "pg_catalog"."default",
  "cliente_email" varchar(255) COLLATE "pg_catalog"."default",
  "cliente_telefono" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_facturacion_pais" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_facturacion_codigo_postal" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_facturacion_provincia" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_facturacion_poblacion" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_facturacion_direccion" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_envio_pais" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_envio_codigo_postal" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_envio_provincia" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_envio_poblacion" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_envio_direccion" varchar(255) COLLATE "pg_catalog"."default",
  "tarifa_id" int8,
  "almacen_id" int8,
  "venta_multialmacen" bool NOT NULL DEFAULT false,
  "presupuesto_id" int8,
  "pedido_id" int8,
  "albaran_id" int8,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "fecha" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Records of ventas_facturas_proforma
-- ----------------------------
INSERT INTO "public"."ventas_facturas_proforma" VALUES (9, 'FP25-00013', 2, 'asd', 'Pendiente', 112, 1.2000000000000002, 121.278712, 3, 'asd', 7, 2026, 13, 'FP25-00013', NULL, NULL, NULL, NULL, NULL, 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', NULL, 1, 'f', NULL, NULL, NULL, '2026-02-19 11:01:06.887884', '2026-02-19 11:01:06.887886', '2026-02-19 11:01:06.887884');
INSERT INTO "public"."ventas_facturas_proforma" VALUES (10, 'FP25-00014', 2, 'asd', 'Pendiente', 112, 1.2000000000000002, 121.278712, 3, 'asd', 7, 2026, 14, 'FP25-00014', NULL, NULL, NULL, NULL, NULL, 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', NULL, 1, 'f', NULL, NULL, NULL, '2026-02-19 15:23:52.966296', '2026-02-19 15:23:52.966307', '2026-02-19 15:23:52.966296');
INSERT INTO "public"."ventas_facturas_proforma" VALUES (4, 'FP25-00008', 2, 'asd', 'Pendiente', 285, 0, 297.825, 0, 'ASD', 7, 2026, 8, 'FP25-00008', NULL, NULL, NULL, NULL, NULL, 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', NULL, 1, 'f', NULL, 5, NULL, '2026-02-18 14:39:10.785733', '2026-02-18 14:39:10.785734', '2026-02-18 14:39:10.785733');
INSERT INTO "public"."ventas_facturas_proforma" VALUES (8, 'FP25-00012', 2, 'asd', 'Pendiente', 285, 0, 291.86850000000004, 2, 's', 7, 2026, 12, 'FP25-00012', NULL, NULL, NULL, NULL, NULL, 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', NULL, 1, 'f', NULL, NULL, NULL, '2026-02-18 14:52:04.94943', '2026-02-18 14:52:04.949431', '2026-02-18 14:52:04.94943');
INSERT INTO "public"."ventas_facturas_proforma" VALUES (11, 'FP25-00016', 2, 'hg', 'Pendiente', 100, 0, 109.172, 2, '', 7, 2026, 16, 'FP25-00016', 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', 'SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', 1, 1, 'f', NULL, NULL, NULL, '2026-02-24 11:21:48.713587', '2026-02-24 11:21:48.713589', '2026-02-24 11:21:48.713587');
INSERT INTO "public"."ventas_facturas_proforma" VALUES (1, 'FP25-00004', 2, 'asd', 'Cancelada', 112, 1.2000000000000002, 117.52782400000001, 6, 'as', 7, 2026, 4, 'FP25-00004', NULL, NULL, NULL, NULL, NULL, 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', NULL, 1, 'f', NULL, NULL, NULL, '2026-02-11 09:11:37.140895', '2026-02-11 09:11:37.140898', '2026-02-11 09:11:37.140895');
INSERT INTO "public"."ventas_facturas_proforma" VALUES (2, 'FP25-00006', 2, 'asd', 'Pendiente', 285, 0, 297.825, 0, '', 7, 2026, 6, 'FP25-00006', NULL, NULL, NULL, NULL, NULL, 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', NULL, 1, 'f', NULL, NULL, NULL, '2026-02-18 14:15:15.974218', '2026-02-18 14:15:15.974218', '2026-02-18 14:15:15.974218');
INSERT INTO "public"."ventas_facturas_proforma" VALUES (3, 'FP25-00007', 2, 'asd', 'Pendiente', 285, 0, 297.825, 0, '', 7, 2026, 7, 'FP25-00007', NULL, NULL, NULL, NULL, NULL, '', '', '', '', '', '', '', '', '', '', NULL, 1, 'f', NULL, NULL, NULL, '2026-02-18 14:37:53.562443', '2026-02-18 14:37:53.562444', '2026-02-18 14:37:53.562443');
INSERT INTO "public"."ventas_facturas_proforma" VALUES (5, 'FP25-00009', 2, 'asd', 'Pendiente', 285, 5.7, 288.949815, 1, 'g', 7, 2026, 9, 'FP25-00009', NULL, NULL, NULL, NULL, NULL, 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', NULL, 1, 'f', NULL, 5, NULL, '2026-02-18 14:39:13.932395', '2026-02-18 14:39:13.932396', '2026-02-18 14:39:13.932395');
INSERT INTO "public"."ventas_facturas_proforma" VALUES (6, 'FP25-00010', 2, 'asd', 'Pendiente', 285, 0, 297.825, 0, 'a', 7, 2026, 10, 'FP25-00010', NULL, NULL, NULL, NULL, NULL, 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', NULL, 1, 'f', NULL, 5, NULL, '2026-02-18 14:44:52.811733', '2026-02-18 14:44:52.811754', '2026-02-18 14:44:52.811733');
INSERT INTO "public"."ventas_facturas_proforma" VALUES (7, 'FP25-00011', 2, 'asd', 'Pendiente', 112, 1.2000000000000002, 125.0296, 0, 'asd', 7, 2026, 11, 'FP25-00011', NULL, NULL, NULL, NULL, NULL, 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', NULL, 1, 'f', NULL, NULL, NULL, '2026-02-18 14:45:08.448159', '2026-02-18 14:45:08.448159', '2026-02-18 14:45:08.448159');

-- ----------------------------
-- Table structure for ventas_facturas_rectificativas
-- ----------------------------
DROP TABLE IF EXISTS "public"."ventas_facturas_rectificativas";
CREATE TABLE "public"."ventas_facturas_rectificativas" (
  "id" int8 NOT NULL DEFAULT nextval('ventas_facturas_rectificativas_id_seq'::regclass),
  "numero" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "cliente_id" int8,
  "observaciones" text COLLATE "pg_catalog"."default",
  "estado" varchar(255) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'Pendiente'::character varying,
  "subtotal" float8 NOT NULL DEFAULT 0,
  "descuento_total" float8 NOT NULL DEFAULT 0,
  "total" float8 NOT NULL DEFAULT 0,
  "descuento_agrupacion" float8 NOT NULL DEFAULT 0,
  "notas" text COLLATE "pg_catalog"."default",
  "serie_id" int8,
  "anio_documento" int4,
  "numero_secuencial" int8,
  "codigo_documento" varchar(255) COLLATE "pg_catalog"."default",
  "contabilizado" bool NOT NULL DEFAULT false,
  "cliente_nombre_comercial" varchar(255) COLLATE "pg_catalog"."default",
  "cliente_nombre_fiscal" varchar(255) COLLATE "pg_catalog"."default",
  "cliente_nif_cif" varchar(255) COLLATE "pg_catalog"."default",
  "cliente_email" varchar(255) COLLATE "pg_catalog"."default",
  "cliente_telefono" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_facturacion_pais" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_facturacion_codigo_postal" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_facturacion_provincia" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_facturacion_poblacion" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_facturacion_direccion" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_envio_pais" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_envio_codigo_postal" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_envio_provincia" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_envio_poblacion" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_envio_direccion" varchar(255) COLLATE "pg_catalog"."default",
  "tarifa_id" int8,
  "almacen_id" int8,
  "venta_multialmacen" bool NOT NULL DEFAULT false,
  "factura_origen_id" int8,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "fecha" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
)
;
COMMENT ON COLUMN "public"."ventas_facturas_rectificativas"."contabilizado" IS 'Indica si la factura rectificativa ha sumado stock (solo una vez).';
COMMENT ON COLUMN "public"."ventas_facturas_rectificativas"."factura_origen_id" IS 'Factura que se está rectificando.';

-- ----------------------------
-- Records of ventas_facturas_rectificativas
-- ----------------------------
INSERT INTO "public"."ventas_facturas_rectificativas" VALUES (7, 'FR25-00007', 2, 'asd', 'Pendiente', 285, 0, 297.825, 0, '', 8, 2026, 7, 'FR25-00007', 'f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f', NULL, '2026-02-18 14:44:59.589729', '2026-02-18 14:44:59.58973', '2026-02-18 14:44:59.589729');
INSERT INTO "public"."ventas_facturas_rectificativas" VALUES (8, 'FR25-00008', 2, 'asd', 'Pendiente', 285, 0, 285, 0, '', 8, 2026, 8, 'FR25-00008', 'f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f', NULL, '2026-02-18 14:46:03.520021', '2026-02-18 14:46:03.520023', '2026-02-18 14:46:03.520021');
INSERT INTO "public"."ventas_facturas_rectificativas" VALUES (2, 'FR25-00002', 2, 'asd', 'Pendiente', 285, 0, 297.825, 0, '', 8, 2026, 2, 'FR25-00002', 'f', NULL, NULL, NULL, NULL, NULL, 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', NULL, NULL, 'f', NULL, '2026-02-16 16:36:49.158417', '2026-02-16 16:36:49.158419', '2026-02-16 16:36:49.158417');
INSERT INTO "public"."ventas_facturas_rectificativas" VALUES (9, 'FR25-00009', 2, 'asd', 'Pendiente', 285, 0, 285, 0, '', 8, 2026, 9, 'FR25-00009', 'f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f', NULL, '2026-02-18 14:51:52.204869', '2026-02-18 14:51:52.204871', '2026-02-18 14:51:52.204869');
INSERT INTO "public"."ventas_facturas_rectificativas" VALUES (1, 'FR25-00001', 2, 'a', 'Pendiente', 112, 10, 107.32571999999999, 7, 'asd', 8, 2026, 1, 'FR25-00001', 'f', NULL, NULL, NULL, NULL, NULL, 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', NULL, 1, 'f', NULL, '2026-02-11 08:45:11.107095', '2026-02-11 08:45:11.107099', '2026-02-11 08:45:11.107095');
INSERT INTO "public"."ventas_facturas_rectificativas" VALUES (4, 'FR25-00004', 2, 'a', 'Pendiente', 112, 10, 107.32571999999999, 0, '', 8, 2026, 4, 'FR25-00004', 'f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f', NULL, '2026-02-18 14:15:28.093356', '2026-02-18 14:15:28.093357', '2026-02-18 14:15:28.093356');
INSERT INTO "public"."ventas_facturas_rectificativas" VALUES (5, 'FR25-00005', 2, 'asd', 'Pendiente', 285, 0, 297.825, 0, '', 8, 2026, 5, 'FR25-00005', 'f', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f', NULL, '2026-02-18 14:22:39.213718', '2026-02-18 14:22:39.213719', '2026-02-18 14:22:39.213718');
INSERT INTO "public"."ventas_facturas_rectificativas" VALUES (10, 'FR25-00010', 2, 'asd', 'Pendiente', 285, 0, 297.825, 0, 'asd', 8, 2026, 10, 'FR25-00010', 'f', NULL, NULL, NULL, NULL, NULL, 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', NULL, 1, 'f', NULL, '2026-02-18 14:52:09.543816', '2026-02-18 14:52:09.543817', '2026-02-18 14:52:09.543816');
INSERT INTO "public"."ventas_facturas_rectificativas" VALUES (11, 'FR25-00011', 2, 'asd', 'Pendiente', 285, 0, 297.825, 0, 'asd', 8, 2026, 11, 'FR25-00011', 'f', NULL, NULL, NULL, NULL, NULL, 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', NULL, 1, 'f', NULL, '2026-02-19 11:02:53.616874', '2026-02-19 11:02:53.616876', '2026-02-19 11:02:53.616874');
INSERT INTO "public"."ventas_facturas_rectificativas" VALUES (12, 'FR25-00012', 2, 'asd', 'Pendiente', 285, 0, 291.86850000000004, 2, 'asd', 8, 2026, 12, 'FR25-00012', 'f', 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 1, 1, 'f', NULL, '2026-02-19 14:00:00.018986', '2026-02-19 14:00:00.018988', '2026-02-19 14:00:00.018986');
INSERT INTO "public"."ventas_facturas_rectificativas" VALUES (6, 'FR25-00006', 2, 'asd', 'Pendiente', 285, 0, 297.825, 0, '', 8, 2026, 6, 'FR25-00006', 'f', NULL, NULL, NULL, NULL, NULL, 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', NULL, 1, 'f', NULL, '2026-02-18 14:37:58.403805', '2026-02-18 14:37:58.403807', '2026-02-18 14:37:58.403805');
INSERT INTO "public"."ventas_facturas_rectificativas" VALUES (13, 'FR25-00013', 2, 'hg', 'Pendiente', 100, 0, 109.172, 2, '', 8, 2026, 13, 'FR25-00013', 'f', 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', 'SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', 1, 1, 'f', NULL, '2026-02-24 11:21:56.651391', '2026-02-24 11:21:56.651393', '2026-02-24 11:21:56.651391');

-- ----------------------------
-- Table structure for ventas_facturas_simplificadas
-- ----------------------------
DROP TABLE IF EXISTS "public"."ventas_facturas_simplificadas";
CREATE TABLE "public"."ventas_facturas_simplificadas" (
  "id" int8 NOT NULL GENERATED BY DEFAULT AS IDENTITY (
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1
),
  "numero" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "fecha" timestamp(6) NOT NULL,
  "cliente_id" int8,
  "observaciones" text COLLATE "pg_catalog"."default",
  "estado" varchar(255) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'Pendiente'::character varying,
  "subtotal" float8 NOT NULL DEFAULT 0,
  "descuento_total" float8 NOT NULL DEFAULT 0,
  "total" float8 NOT NULL DEFAULT 0,
  "contabilizado" bool NOT NULL DEFAULT false,
  "albaran_id" int8,
  "ticket_id" int8
)
;
COMMENT ON COLUMN "public"."ventas_facturas_simplificadas"."contabilizado" IS 'Indica si el ticket/factura simplificada ha descontado stock.';

-- ----------------------------
-- Records of ventas_facturas_simplificadas
-- ----------------------------
INSERT INTO "public"."ventas_facturas_simplificadas" VALUES (199, 'TPV-00000001', '2026-01-05 13:47:01.127', NULL, 'Ticket aplazado - pendiente de cobro', 'Pendiente', 330.00000000000006, 0, 330.00000000000006, 'f', NULL, NULL);
INSERT INTO "public"."ventas_facturas_simplificadas" VALUES (202, 'TPV-00000002', '2026-01-08 10:12:41.56', NULL, 'Método de pago: Efectivo. Importe entregado: 110.00€', 'Cobrada', 110.00000000000001, 0, 110.00000000000001, 't', NULL, NULL);
INSERT INTO "public"."ventas_facturas_simplificadas" VALUES (204, 'TPV-00000003', '2026-01-15 00:40:38.026', NULL, 'Método de pago: Efectivo. Importe entregado: 30.00€', 'Cobrada', 25.2, 0, 25.2, 't', NULL, NULL);
INSERT INTO "public"."ventas_facturas_simplificadas" VALUES (205, 'TPV-00000004', '2026-01-15 00:53:22.399', NULL, 'Método de pago: Efectivo. Importe entregado: 21111.00€', 'Cobrada', 200.83, 0, 200.83, 't', NULL, NULL);

-- ----------------------------
-- Table structure for ventas_facturas_simplificadas_lineas
-- ----------------------------
DROP TABLE IF EXISTS "public"."ventas_facturas_simplificadas_lineas";
CREATE TABLE "public"."ventas_facturas_simplificadas_lineas" (
  "id" int8 NOT NULL GENERATED BY DEFAULT AS IDENTITY (
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1
),
  "cantidad" float8 NOT NULL,
  "descripcion" varchar(255) COLLATE "pg_catalog"."default",
  "descuento" float8 NOT NULL,
  "importe_iva" float8 NOT NULL,
  "importe_recargo" float8 NOT NULL,
  "importe_total_linea" float8 NOT NULL,
  "porcentaje_iva" float8 NOT NULL,
  "porcentaje_recargo" float8 NOT NULL,
  "precio_unitario" float8 NOT NULL,
  "factura_simplificada_id" int8,
  "producto_id" int8,
  "tipo_iva_id" int8
)
;

-- ----------------------------
-- Records of ventas_facturas_simplificadas_lineas
-- ----------------------------
INSERT INTO "public"."ventas_facturas_simplificadas_lineas" VALUES (133, 3, 'Costillar BBQ iberico', 0, 30, 0, 330, 10, 0, 100, 199, 1, 2);
INSERT INTO "public"."ventas_facturas_simplificadas_lineas" VALUES (137, 1, 'Costillar BBQ iberico', 0, 10, 0, 110, 10, 0, 100, 202, 1, 2);
INSERT INTO "public"."ventas_facturas_simplificadas_lineas" VALUES (143, 4, 'Coca-cola', 0, 0, 0, 4.8, 0, 0, 1.2, 205, NULL, NULL);
INSERT INTO "public"."ventas_facturas_simplificadas_lineas" VALUES (144, 2, 'Blanco Dulce Eva', 0, 0, 0, 190, 0, 0, 95, 205, NULL, NULL);
INSERT INTO "public"."ventas_facturas_simplificadas_lineas" VALUES (145, 1, 'Zumo Detox', 0, 0, 0, 4.6, 0, 0, 4.6, 205, NULL, NULL);
INSERT INTO "public"."ventas_facturas_simplificadas_lineas" VALUES (146, 1, 'Café solo', 0, 0, 0, 1.43, 0, 0, 1.43, 205, NULL, NULL);

-- ----------------------------
-- Table structure for ventas_pedido_lineas
-- ----------------------------
DROP TABLE IF EXISTS "public"."ventas_pedido_lineas";
CREATE TABLE "public"."ventas_pedido_lineas" (
  "id" int8 NOT NULL DEFAULT nextval('ventas_pedido_lineas_id_seq'::regclass),
  "cantidad" int4 NOT NULL,
  "descuento" float8 NOT NULL DEFAULT 0,
  "observaciones" text COLLATE "pg_catalog"."default",
  "precio_unitario" float8 NOT NULL,
  "pedido_id" int8,
  "producto_id" int8,
  "tipo_iva_id" int8,
  "porcentaje_iva" float8 NOT NULL DEFAULT 0,
  "porcentaje_recargo" float8 NOT NULL DEFAULT 0,
  "importe_iva" float8 NOT NULL DEFAULT 0,
  "importe_recargo" float8 NOT NULL DEFAULT 0,
  "referencia" varchar(255) COLLATE "pg_catalog"."default",
  "nombre_producto" varchar(255) COLLATE "pg_catalog"."default" DEFAULT ''::character varying,
  "almacen_id" int8
)
;

-- ----------------------------
-- Records of ventas_pedido_lineas
-- ----------------------------
INSERT INTO "public"."ventas_pedido_lineas" VALUES (13, 12, 0, '', 12, 1, 30, 2, 10, 1.4, 13.392, 1.8748799999999997, '026', 'POLLO', NULL);
INSERT INTO "public"."ventas_pedido_lineas" VALUES (14, 1, 0, '', 12, 2, 2, 1, 21, 5.2, 2.3436, 0.5803200000000001, 'REF2', 'Pollo teriyaki', 1);
INSERT INTO "public"."ventas_pedido_lineas" VALUES (15, 1, 10, '', 100, 2, 1, 2, 10, 1.4, 8.37, 1.1717999999999997, 'REF1', 'Costillar BBQ iberico', 1);
INSERT INTO "public"."ventas_pedido_lineas" VALUES (16, 1, 0, '', 12, 3, 2, 1, 21, 5.2, 2.3436, 0.5803200000000001, 'REF2', 'Pollo teriyaki', 1);
INSERT INTO "public"."ventas_pedido_lineas" VALUES (17, 1, 10, '', 100, 3, 1, 2, 10, 1.4, 8.37, 1.1717999999999997, 'REF1', 'Costillar BBQ iberico', 1);
INSERT INTO "public"."ventas_pedido_lineas" VALUES (18, 3, 0, '', 95, 4, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_pedido_lineas" VALUES (19, 3, 0, '', 95, 5, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_pedido_lineas" VALUES (20, 3, 0, '', 95, 6, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_pedido_lineas" VALUES (21, 3, 0, '', 95, 7, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_pedido_lineas" VALUES (22, 1, 0, '', 100, 8, 1, 2, 10, 1.4, 9.4, 1.3159999999999998, 'REF1', 'Costillar BBQ iberico', NULL);
INSERT INTO "public"."ventas_pedido_lineas" VALUES (23, 1, 10, '', 12, 8, 2, 1, 21, 5.2, 2.1319199999999996, 0.527904, 'REF2', 'Pollo teriyaki', NULL);
INSERT INTO "public"."ventas_pedido_lineas" VALUES (27, 3, 0, '', 95, 9, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_pedido_lineas" VALUES (28, 3, 0, '', 95, 11, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_pedido_lineas" VALUES (29, 3, 0, '', 95, 12, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_pedido_lineas" VALUES (30, 1, 0, '', 100, 13, 1, 2, 10, 1.4, 9.8, 1.3719999999999999, 'REF1', 'Costillar BBQ iberico', NULL);
INSERT INTO "public"."ventas_pedido_lineas" VALUES (31, 1, 0, '', 100, 14, 1, 2, 10, 1.4, 9.8, 1.3719999999999999, 'REF1', 'Costillar BBQ iberico', NULL);
INSERT INTO "public"."ventas_pedido_lineas" VALUES (32, 1, 0, '', 100, 15, 1, 2, 10, 1.4, 9.8, 1.3719999999999999, 'REF1', 'Costillar BBQ iberico', NULL);
INSERT INTO "public"."ventas_pedido_lineas" VALUES (66, 1, 0, '', 100, 48, 1, 2, 10, 1.4, 9.8, 1.3719999999999999, 'REF1', 'Costillar BBQ iberico', NULL);

-- ----------------------------
-- Table structure for ventas_pedidos
-- ----------------------------
DROP TABLE IF EXISTS "public"."ventas_pedidos";
CREATE TABLE "public"."ventas_pedidos" (
  "id" int8 NOT NULL DEFAULT nextval('ventas_pedidos_id_seq'::regclass),
  "numero" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "cliente_id" int8,
  "observaciones" text COLLATE "pg_catalog"."default",
  "estado" varchar(255) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'Pendiente'::character varying,
  "subtotal" float8 NOT NULL DEFAULT 0,
  "descuento_total" float8 NOT NULL DEFAULT 0,
  "total" float8 NOT NULL DEFAULT 0,
  "descuento_agrupacion" float8 NOT NULL DEFAULT 0,
  "notas" text COLLATE "pg_catalog"."default",
  "serie_id" int8,
  "anio_documento" int4,
  "numero_secuencial" int8,
  "codigo_documento" varchar(255) COLLATE "pg_catalog"."default",
  "cliente_nombre_comercial" varchar(255) COLLATE "pg_catalog"."default",
  "cliente_nombre_fiscal" varchar(255) COLLATE "pg_catalog"."default",
  "cliente_nif_cif" varchar(255) COLLATE "pg_catalog"."default",
  "cliente_email" varchar(255) COLLATE "pg_catalog"."default",
  "cliente_telefono" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_facturacion_pais" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_facturacion_codigo_postal" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_facturacion_provincia" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_facturacion_poblacion" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_facturacion_direccion" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_envio_pais" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_envio_codigo_postal" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_envio_provincia" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_envio_poblacion" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_envio_direccion" varchar(255) COLLATE "pg_catalog"."default",
  "tarifa_id" int8,
  "almacen_id" int8,
  "venta_multialmacen" bool NOT NULL DEFAULT false,
  "presupuesto_id" int8,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "fecha" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Records of ventas_pedidos
-- ----------------------------
INSERT INTO "public"."ventas_pedidos" VALUES (48, 'PV-00016', 2, 'hg', 'Pendiente', 100, 0, 109.172, 2, '', 4, NULL, NULL, NULL, 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', 'SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'BADAJOZ', 'Badajoz', 'SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 1, 1, 'f', NULL, '2026-02-24 11:33:38.536707', '2026-02-25 17:43:27.355507', '2026-02-24 00:00:00');
INSERT INTO "public"."ventas_pedidos" VALUES (9, 'PV-00009', 2, 'asd', 'Pendiente', 285, 0, 297.825, 0, '', 4, NULL, NULL, NULL, 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', 1, 1, 'f', NULL, '2026-02-18 14:45:54.108632', '2026-02-19 09:14:47.202478', '2026-02-18 14:45:54.108632');
INSERT INTO "public"."ventas_pedidos" VALUES (11, 'PV-00011', 2, 'asd', 'Pendiente', 285, 0, 297.825, 0, '', 4, 2026, 11, 'PV-00011', 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', 1, 1, 'f', NULL, '2026-02-19 09:14:52.807572', '2026-02-19 09:14:52.807573', '2026-02-19 09:14:52.807572');
INSERT INTO "public"."ventas_pedidos" VALUES (12, 'PV-00012', 2, 'asd', 'Pendiente', 285, 0, 297.825, 0, 'asd', 4, 2026, 12, 'PV-00012', 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', 1, 1, 'f', NULL, '2026-02-19 13:55:30.616734', '2026-02-19 13:55:30.616736', '2026-02-19 13:55:30.616734');
INSERT INTO "public"."ventas_pedidos" VALUES (13, 'PV-00013', 2, 'hg', 'Pendiente', 100, 0, 109.172, 2, '', 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f', NULL, '2026-02-24 11:21:42.940352', '2026-02-24 11:21:42.940354', '2026-02-24 11:21:42.940352');
INSERT INTO "public"."ventas_pedidos" VALUES (14, 'PV-00014', 2, 'hg', 'Pendiente', 100, 0, 109.172, 2, '', 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f', NULL, '2026-02-24 11:25:59.974612', '2026-02-24 11:25:59.974614', '2026-02-24 11:25:59.974612');
INSERT INTO "public"."ventas_pedidos" VALUES (15, 'PV-00015', 2, 'hg', 'Pendiente', 100, 0, 109.172, 2, '', 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f', NULL, '2026-02-24 11:28:02.392087', '2026-02-24 11:28:02.392089', '2026-02-24 11:28:02.392087');
INSERT INTO "public"."ventas_pedidos" VALUES (1, 'PV-00001', 2, 'a', 'Pendiente', 144, 0, 149.18687999999997, 7, 'a', 4, 2026, 1, 'PV-00001', 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', 1, NULL, 'f', NULL, '2026-02-10 15:36:44.544157', '2026-02-11 08:53:34.758804', '2026-02-10 15:36:44.544157');
INSERT INTO "public"."ventas_pedidos" VALUES (2, 'PV-00002', 2, 'a', 'Pendiente', 112, 10, 107.32571999999999, 7, '', 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f', NULL, '2026-02-18 14:14:58.525648', '2026-02-18 14:14:58.525653', '2026-02-18 14:14:58.525648');
INSERT INTO "public"."ventas_pedidos" VALUES (3, 'PV-00003', 2, 'a', 'Pendiente', 112, 10, 107.32571999999999, 7, '', 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f', NULL, '2026-02-18 14:15:04.332244', '2026-02-18 14:15:04.332245', '2026-02-18 14:15:04.332244');
INSERT INTO "public"."ventas_pedidos" VALUES (4, 'PV-00004', 2, 'asd', 'Pendiente', 285, 0, 297.825, 0, '', 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f', NULL, '2026-02-18 14:21:47.233223', '2026-02-18 14:21:47.233224', '2026-02-18 14:21:47.233223');
INSERT INTO "public"."ventas_pedidos" VALUES (5, 'PV-00005', 2, 'asd', 'Pendiente', 285, 0, 297.825, 0, '', 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f', NULL, '2026-02-18 14:22:01.864971', '2026-02-18 14:22:01.864972', '2026-02-18 14:22:01.864971');
INSERT INTO "public"."ventas_pedidos" VALUES (6, 'PV-00006', 2, 'asd', 'Pendiente', 285, 0, 297.825, 0, '', 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f', NULL, '2026-02-18 14:37:48.978996', '2026-02-18 14:37:48.978997', '2026-02-18 14:37:48.978996');
INSERT INTO "public"."ventas_pedidos" VALUES (7, 'PV-00007', 2, 'asd', 'Pendiente', 285, 0, 297.825, 0, '', 4, 2026, 7, 'PV-00007', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f', NULL, '2026-02-18 14:38:04.318808', '2026-02-18 14:38:04.318809', '2026-02-18 14:38:04.318808');
INSERT INTO "public"."ventas_pedidos" VALUES (8, 'PV-00008', 2, 'asd', 'Pendiente', 112, 1.2000000000000002, 117.52782400000001, 6, '', 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f', NULL, '2026-02-18 14:45:39.079423', '2026-02-18 14:45:39.079423', '2026-02-18 14:45:39.079423');

-- ----------------------------
-- Table structure for ventas_presupuesto_lineas
-- ----------------------------
DROP TABLE IF EXISTS "public"."ventas_presupuesto_lineas";
CREATE TABLE "public"."ventas_presupuesto_lineas" (
  "id" int8 NOT NULL DEFAULT nextval('ventas_presupuesto_lineas_id_seq'::regclass),
  "cantidad" int4 NOT NULL,
  "descuento" float8 NOT NULL DEFAULT 0,
  "observaciones" text COLLATE "pg_catalog"."default",
  "precio_unitario" float8 NOT NULL,
  "presupuesto_id" int8,
  "producto_id" int8,
  "tipo_iva_id" int8,
  "porcentaje_iva" float8 NOT NULL DEFAULT 0,
  "porcentaje_recargo" float8 NOT NULL DEFAULT 0,
  "importe_iva" float8 NOT NULL DEFAULT 0,
  "importe_recargo" float8 NOT NULL DEFAULT 0,
  "referencia" varchar(255) COLLATE "pg_catalog"."default",
  "nombre_producto" varchar(255) COLLATE "pg_catalog"."default" DEFAULT ''::character varying,
  "almacen_id" int8
)
;

-- ----------------------------
-- Records of ventas_presupuesto_lineas
-- ----------------------------
INSERT INTO "public"."ventas_presupuesto_lineas" VALUES (27, 1, 0, '', 12, 2, 2, 1, 21, 5.2, 2.52, 0.6240000000000001, 'REF2', 'Pollo teriyaki', NULL);
INSERT INTO "public"."ventas_presupuesto_lineas" VALUES (28, 1, 12, '', 100, 2, 1, 2, 10, 1.4, 8.8, 1.2319999999999998, 'REF1', 'Costillar BBQ iberico', NULL);
INSERT INTO "public"."ventas_presupuesto_lineas" VALUES (29, 1, 0, '', 12, 1, 2, 1, 21, 0, 2.3939999999999997, 0, 'REF2', 'Pollo teriyaki', NULL);
INSERT INTO "public"."ventas_presupuesto_lineas" VALUES (30, 1, 10, '', 100, 1, 1, 2, 10, 0, 8.55, 0, 'REF1', 'Costillar BBQ iberico', NULL);
INSERT INTO "public"."ventas_presupuesto_lineas" VALUES (31, 3, 0, '', 95, 3, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_presupuesto_lineas" VALUES (32, 3, 0, '', 95, 4, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_presupuesto_lineas" VALUES (33, 3, 0, '', 95, 5, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_presupuesto_lineas" VALUES (34, 3, 0, '', 95, 6, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_presupuesto_lineas" VALUES (37, 3, 0, '', 95, 8, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_presupuesto_lineas" VALUES (46, 3, 0, '', 95, 16, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_presupuesto_lineas" VALUES (47, 3, 0, '', 95, 17, 4, 3, 4, 0.5, 11.286, 1.41075, 'REF4', 'Blanco Dulce Eva', 3);
INSERT INTO "public"."ventas_presupuesto_lineas" VALUES (48, 3, 0, '', 95, 7, 4, 3, 4, 0.5, 11.4, 1.425, 'REF4', 'Blanco Dulce Eva', 1);
INSERT INTO "public"."ventas_presupuesto_lineas" VALUES (49, 1, 0, '', 100, 18, 1, 2, 10, 1.4, 9.8, 1.3719999999999999, 'REF1', 'Costillar BBQ iberico', NULL);

-- ----------------------------
-- Table structure for ventas_presupuestos
-- ----------------------------
DROP TABLE IF EXISTS "public"."ventas_presupuestos";
CREATE TABLE "public"."ventas_presupuestos" (
  "id" int8 NOT NULL DEFAULT nextval('ventas_presupuestos_id_seq'::regclass),
  "numero" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "cliente_id" int8,
  "observaciones" text COLLATE "pg_catalog"."default",
  "estado" varchar(255) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'Pendiente'::character varying,
  "subtotal" float8 NOT NULL DEFAULT 0,
  "descuento_total" float8 NOT NULL DEFAULT 0,
  "total" float8 NOT NULL DEFAULT 0,
  "descuento_agrupacion" float8 NOT NULL DEFAULT 0,
  "notas" text COLLATE "pg_catalog"."default",
  "serie_id" int8,
  "anio_documento" int4,
  "numero_secuencial" int8,
  "codigo_documento" varchar(255) COLLATE "pg_catalog"."default",
  "cliente_nombre_comercial" varchar(255) COLLATE "pg_catalog"."default",
  "cliente_nombre_fiscal" varchar(255) COLLATE "pg_catalog"."default",
  "cliente_nif_cif" varchar(255) COLLATE "pg_catalog"."default",
  "cliente_email" varchar(255) COLLATE "pg_catalog"."default",
  "cliente_telefono" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_facturacion_pais" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_facturacion_codigo_postal" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_facturacion_provincia" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_facturacion_poblacion" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_facturacion_direccion" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_envio_pais" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_envio_codigo_postal" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_envio_provincia" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_envio_poblacion" varchar(255) COLLATE "pg_catalog"."default",
  "direccion_envio_direccion" varchar(255) COLLATE "pg_catalog"."default",
  "tarifa_id" int8,
  "almacen_id" int8,
  "venta_multialmacen" bool NOT NULL DEFAULT false,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "fecha" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Records of ventas_presupuestos
-- ----------------------------
INSERT INTO "public"."ventas_presupuestos" VALUES (2, 'PR25-0002', 2, 'zx x', 'Pendiente', 112, 12, 113.176, 0, 'aasx', 5, 2026, 2, 'PR25-0002', 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', 1, NULL, 'f', '2026-02-11 14:19:55.757542', '2026-02-11 16:15:30.452459', '2026-02-11 14:19:55.757542');
INSERT INTO "public"."ventas_presupuestos" VALUES (1, 'PR25-0001', 16, 'a', 'Aceptado', 112, 10, 107.84400000000001, 5, 'dasd', 5, 2026, 1, 'PR25-0001', 'asd', 'asd', '20715455E', 'web@doscar.com', '924229230', 'España', 'BADAJOZ', 'BADAJOZ', 'BADAJOZ', 'Servando González Becerra 5, Entreplanta Oficinas H-J', 'España', '06010', 'BADAJOZ', 'BADAJOZ', 'Carretera de Valverde KM 2', 1, NULL, 'f', '2026-02-11 08:55:30.395389', '2026-02-11 16:15:35.655164', '2026-02-11 08:55:30.395389');
INSERT INTO "public"."ventas_presupuestos" VALUES (3, 'PR25-0003', 2, 'asd', 'Pendiente', 285, 0, 297.825, 0, '', 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f', '2026-02-18 14:15:10.793713', '2026-02-18 14:15:10.793714', '2026-02-18 14:15:10.793713');
INSERT INTO "public"."ventas_presupuestos" VALUES (4, 'PR26-00001', 2, 'asd', 'Pendiente', 285, 0, 297.825, 0, '', 9, 2026, 1, 'PR26-00001', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f', '2026-02-18 14:37:27.126987', '2026-02-18 14:37:27.126991', '2026-02-18 14:37:27.126987');
INSERT INTO "public"."ventas_presupuestos" VALUES (5, 'PR26-00002', 2, 'asd', 'Pendiente', 285, 0, 297.825, 0, '', 9, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f', '2026-02-18 14:39:01.316011', '2026-02-18 14:39:01.316012', '2026-02-18 14:39:01.316011');
INSERT INTO "public"."ventas_presupuestos" VALUES (6, 'PR25-0004', 2, 'asd', 'Pendiente', 285, 0, 297.825, 0, '', 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f', '2026-02-18 14:39:06.73133', '2026-02-18 14:39:06.731331', '2026-02-18 14:39:06.73133');
INSERT INTO "public"."ventas_presupuestos" VALUES (8, 'PR26-00004', 2, 'asd', 'Pendiente', 285, 0, 297.825, 0, '', 9, NULL, NULL, NULL, 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', 1, 1, 'f', '2026-02-18 14:52:00.645597', '2026-02-19 08:52:41.998357', '2026-02-18 14:52:00.645597');
INSERT INTO "public"."ventas_presupuestos" VALUES (16, 'PR26-00008', 2, 'asd', 'Pendiente', 285, 0, 297.825, 0, '', 9, 2026, 8, 'PR26-00008', 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', 1, 1, 'f', '2026-02-19 09:14:15.702154', '2026-02-19 09:14:15.702156', '2026-02-19 09:14:15.702154');
INSERT INTO "public"."ventas_presupuestos" VALUES (17, 'PR26-00009', 2, 'asd', 'Pendiente', 285, 0, 294.84675, 1, 'asd', 9, 2026, 9, 'PR26-00009', 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', 1, NULL, 't', '2026-02-19 13:54:15.905228', '2026-02-19 13:54:15.905232', '2026-02-19 13:54:15.905228');
INSERT INTO "public"."ventas_presupuestos" VALUES (7, 'PR26-00003', 2, 'asd', 'Pendiente', 285, 0, 297.825, 0, 'asd', 9, NULL, NULL, NULL, 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', ' SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', 1, NULL, 'f', '2026-02-18 14:45:58.841992', '2026-02-19 16:51:46.383912', '2026-02-18 14:45:58.841992');
INSERT INTO "public"."ventas_presupuestos" VALUES (18, 'PR26-00010', 2, 'hg', 'Pendiente', 100, 0, 109.172, 2, 'g', 9, 2026, 10, 'PR26-00010', 'Taller Martínez', 'Taller Martínez S.C.', 'Z3239792V', 'taller@demo.local', '+34 930 202 020', 'España', '06011', 'BADAJOZ', 'Badajoz', 'SERVANDO GONZALEZ BECERRA 5 ENTREPLANTA OFICINAS H-J', 'España', '06011', 'Badajoz', 'Badajoz', 'Calle Francisco Guerra, 14', 1, 1, 'f', '2026-02-24 11:21:20.918516', '2026-02-24 11:21:20.918519', '2026-02-24 11:21:20.918516');

-- ----------------------------
-- Function structure for set_updated_at
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."set_updated_at"();
CREATE OR REPLACE FUNCTION "public"."set_updated_at"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."agrupaciones_id_seq"', 4, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."albaran_lineas_id_seq"
OWNED BY "public"."ventas_albaran_lineas"."id";
SELECT setval('"public"."albaran_lineas_id_seq"', 136, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."albaran_lineas_id_seq1"
OWNED BY "public"."ventas_albaran_lineas"."id";
SELECT setval('"public"."albaran_lineas_id_seq1"', 11313, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."albaranes_id_seq"
OWNED BY "public"."ventas_albaranes"."id";
SELECT setval('"public"."albaranes_id_seq"', 11103, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."almacenes_id_seq"
OWNED BY "public"."almacenes"."id";
SELECT setval('"public"."almacenes_id_seq"', 3, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."archivos_empresa_id_seq"
OWNED BY "public"."archivos_empresa"."id";
SELECT setval('"public"."archivos_empresa_id_seq"', 32, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."archivos_empresa_id_seq1"
OWNED BY "public"."archivos_empresa"."id";
SELECT setval('"public"."archivos_empresa_id_seq1"', 55, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."clientes_id_seq"
OWNED BY "public"."clientes"."id";
SELECT setval('"public"."clientes_id_seq"', 16, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."codigo_barra_campos_id_seq"
OWNED BY "public"."codigo_barra_campos"."id";
SELECT setval('"public"."codigo_barra_campos_id_seq"', 61, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."codigo_barra_campos_id_seq1"
OWNED BY "public"."codigo_barra_campos"."id";
SELECT setval('"public"."codigo_barra_campos_id_seq1"', 13, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."codigo_barra_id_seq"
OWNED BY "public"."codigo_barra"."id";
SELECT setval('"public"."codigo_barra_id_seq"', 6, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."codigo_barra_id_seq1"
OWNED BY "public"."codigo_barra"."id";
SELECT setval('"public"."codigo_barra_id_seq1"', 6, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."compras_albaran_lineas_id_seq"
OWNED BY "public"."compras_albaranes_lineas"."id";
SELECT setval('"public"."compras_albaran_lineas_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."compras_albaranes_id_seq"
OWNED BY "public"."compras_albaranes"."id";
SELECT setval('"public"."compras_albaranes_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."compras_factura_lineas_id_seq"
OWNED BY "public"."compras_facturas_lineas"."id";
SELECT setval('"public"."compras_factura_lineas_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."compras_facturas_id_seq"
OWNED BY "public"."compras_facturas"."id";
SELECT setval('"public"."compras_facturas_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."compras_pedidos_id_seq"
OWNED BY "public"."compras_pedidos"."id";
SELECT setval('"public"."compras_pedidos_id_seq"', 5, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."compras_pedidos_lineas_id_seq"
OWNED BY "public"."compras_pedidos_lineas"."id";
SELECT setval('"public"."compras_pedidos_lineas_id_seq"', 39, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."condiciones_comerciales_id_seq"', 3, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."condiciones_comerciales_proveedor_id_seq"
OWNED BY "public"."condiciones_comerciales_proveedor"."id";
SELECT setval('"public"."condiciones_comerciales_proveedor_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."configuracion_ventas_id_seq"
OWNED BY "public"."configuracion_ventas"."id";
SELECT setval('"public"."configuracion_ventas_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."direcciones_id_seq"
OWNED BY "public"."direcciones"."id";
SELECT setval('"public"."direcciones_id_seq"', 51, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."documento_transformaciones_id_seq"
OWNED BY "public"."documento_transformaciones"."id";
SELECT setval('"public"."documento_transformaciones_id_seq"', 94, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."empresa_id_seq"
OWNED BY "public"."empresa"."id";
SELECT setval('"public"."empresa_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."empresa_id_seq1"
OWNED BY "public"."empresa"."id";
SELECT setval('"public"."empresa_id_seq1"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."fabricantes_id_seq"
OWNED BY "public"."fabricantes"."id";
SELECT setval('"public"."fabricantes_id_seq"', 12, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."fabricantes_id_seq1"
OWNED BY "public"."fabricantes"."id";
SELECT setval('"public"."fabricantes_id_seq1"', 5, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."factura_lineas_id_seq1"
OWNED BY "public"."factura_lineas"."id";
SELECT setval('"public"."factura_lineas_id_seq1"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."familias_id_seq"
OWNED BY "public"."familias"."id";
SELECT setval('"public"."familias_id_seq"', 11, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."familias_id_seq1"
OWNED BY "public"."familias"."id";
SELECT setval('"public"."familias_id_seq1"', 11, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."movimientos_stock_id_seq"
OWNED BY "public"."movimientos_stock"."id";
SELECT setval('"public"."movimientos_stock_id_seq"', 34, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."plantilla_pdf_id_seq"
OWNED BY "public"."plantilla_pdf"."id";
SELECT setval('"public"."plantilla_pdf_id_seq"', 44, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."preferencias_series_usuario_id_seq"
OWNED BY "public"."preferencias_series_usuario"."id";
SELECT setval('"public"."preferencias_series_usuario_id_seq"', 4, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."producto_almacen_id_seq"
OWNED BY "public"."producto_almacen"."id";
SELECT setval('"public"."producto_almacen_id_seq"', 56, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."producto_codigo_barra_id_seq"
OWNED BY "public"."producto_codigo_barra"."id";
SELECT setval('"public"."producto_codigo_barra_id_seq"', 3, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."producto_referencias_id_seq"
OWNED BY "public"."producto_referencias"."id";
SELECT setval('"public"."producto_referencias_id_seq"', 4, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."productos_id_seq"
OWNED BY "public"."productos"."id";
SELECT setval('"public"."productos_id_seq"', 26, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."productos_id_seq1"
OWNED BY "public"."productos"."id";
SELECT setval('"public"."productos_id_seq1"', 30, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."proveedores_id_seq"
OWNED BY "public"."proveedores"."id";
SELECT setval('"public"."proveedores_id_seq"', 11, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."proveedores_id_seq1"
OWNED BY "public"."proveedores"."id";
SELECT setval('"public"."proveedores_id_seq1"', 15, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."series_documento_id_seq"
OWNED BY "public"."series_documento"."id";
SELECT setval('"public"."series_documento_id_seq"', 10, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."series_secuencia_id_seq"
OWNED BY "public"."series_secuencia"."id";
SELECT setval('"public"."series_secuencia_id_seq"', 9, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."subfamilias_id_seq"
OWNED BY "public"."subfamilias"."id";
SELECT setval('"public"."subfamilias_id_seq"', 10, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."tarifa_productos_id_seq"
OWNED BY "public"."tarifa_productos"."id";
SELECT setval('"public"."tarifa_productos_id_seq"', 179, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."tarifas_id_seq"
OWNED BY "public"."tarifas"."id";
SELECT setval('"public"."tarifas_id_seq"', 38, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."tipos_iva_id_seq"
OWNED BY "public"."tipos_iva"."id";
SELECT setval('"public"."tipos_iva_id_seq"', 4, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."tpv_configuracion_tickets_id_seq"
OWNED BY "public"."tpv_configuracion_tickets"."id";
SELECT setval('"public"."tpv_configuracion_tickets_id_seq"', 3, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."usuario_inicio_panel_id_seq"
OWNED BY "public"."usuario_inicio_panel"."id";
SELECT setval('"public"."usuario_inicio_panel_id_seq"', 75, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."usuarios_id_seq"
OWNED BY "public"."usuarios"."id";
SELECT setval('"public"."usuarios_id_seq"', 2, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."usuarios_id_seq1"
OWNED BY "public"."usuarios"."id";
SELECT setval('"public"."usuarios_id_seq1"', 2, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."ventas_factura_lineas_id_seq"', 106, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."ventas_factura_proforma_lineas_id_seq"', 118, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."ventas_factura_rectificativa_lineas_id_seq"', 70, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."ventas_facturas_id_seq"', 14, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."ventas_facturas_proforma_id_seq"', 11, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."ventas_facturas_rectificativas_id_seq"', 13, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."ventas_facturas_simplificadas_id_seq"
OWNED BY "public"."ventas_facturas_simplificadas"."id";
SELECT setval('"public"."ventas_facturas_simplificadas_id_seq"', 205, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."ventas_facturas_simplificadas_lineas_id_seq"
OWNED BY "public"."ventas_facturas_simplificadas_lineas"."id";
SELECT setval('"public"."ventas_facturas_simplificadas_lineas_id_seq"', 146, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."ventas_pedido_lineas_id_seq"', 66, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."ventas_pedidos_id_seq"', 48, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."ventas_presupuesto_lineas_id_seq"', 49, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"public"."ventas_presupuestos_id_seq"', 18, true);

-- ----------------------------
-- Uniques structure for table agrupaciones
-- ----------------------------
ALTER TABLE "public"."agrupaciones" ADD CONSTRAINT "agrupaciones_nombre_key" UNIQUE ("nombre");

-- ----------------------------
-- Primary Key structure for table agrupaciones
-- ----------------------------
ALTER TABLE "public"."agrupaciones" ADD CONSTRAINT "agrupaciones_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Auto increment value for almacenes
-- ----------------------------
SELECT setval('"public"."almacenes_id_seq"', 3, true);

-- ----------------------------
-- Indexes structure for table almacenes
-- ----------------------------
CREATE INDEX "idx_almacenes_activo" ON "public"."almacenes" USING btree (
  "activo" "pg_catalog"."bool_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table almacenes
-- ----------------------------
ALTER TABLE "public"."almacenes" ADD CONSTRAINT "uk4ilm0f1weyncwuyyikn7rrlf4" UNIQUE ("nombre");

-- ----------------------------
-- Primary Key structure for table almacenes
-- ----------------------------
ALTER TABLE "public"."almacenes" ADD CONSTRAINT "almacenes_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Auto increment value for archivos_empresa
-- ----------------------------
SELECT setval('"public"."archivos_empresa_id_seq1"', 55, true);

-- ----------------------------
-- Indexes structure for table archivos_empresa
-- ----------------------------
CREATE INDEX "idx_archivos_doc" ON "public"."archivos_empresa" USING btree (
  "documento_origen" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "documento_origen_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table archivos_empresa
-- ----------------------------
ALTER TABLE "public"."archivos_empresa" ADD CONSTRAINT "archivos_empresa_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table clientes
-- ----------------------------
CREATE INDEX "idx_clientes_agrupacion" ON "public"."clientes" USING btree (
  "agrupacion_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_clientes_tarifa_id" ON "public"."clientes" USING btree (
  "tarifa_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table clientes
-- ----------------------------
ALTER TABLE "public"."clientes" ADD CONSTRAINT "clientes_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Auto increment value for codigo_barra
-- ----------------------------
SELECT setval('"public"."codigo_barra_id_seq1"', 6, true);

-- ----------------------------
-- Primary Key structure for table codigo_barra
-- ----------------------------
ALTER TABLE "public"."codigo_barra" ADD CONSTRAINT "codigo_barra_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Auto increment value for codigo_barra_campos
-- ----------------------------
SELECT setval('"public"."codigo_barra_campos_id_seq1"', 13, true);

-- ----------------------------
-- Primary Key structure for table codigo_barra_campos
-- ----------------------------
ALTER TABLE "public"."codigo_barra_campos" ADD CONSTRAINT "codigo_barra_campos_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table compras_albaranes
-- ----------------------------
CREATE INDEX "idx_albaran_compra_contabilizado" ON "public"."compras_albaranes" USING btree (
  "contabilizado" "pg_catalog"."bool_ops" ASC NULLS LAST
);
CREATE INDEX "idx_albaran_compra_estado" ON "public"."compras_albaranes" USING btree (
  "estado" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_albaran_compra_factura" ON "public"."compras_albaranes" USING btree (
  "factura_compra_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_albaran_compra_fecha" ON "public"."compras_albaranes" USING btree (
  "fecha" "pg_catalog"."timestamp_ops" ASC NULLS LAST
);
CREATE INDEX "idx_albaran_compra_numero" ON "public"."compras_albaranes" USING btree (
  "numero" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_albaran_compra_proveedor" ON "public"."compras_albaranes" USING btree (
  "proveedor_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table compras_albaranes
-- ----------------------------
ALTER TABLE "public"."compras_albaranes" ADD CONSTRAINT "albaran_compra_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table compras_albaranes_lineas
-- ----------------------------
CREATE INDEX "idx_albaran_compra_linea_albaran" ON "public"."compras_albaranes_lineas" USING btree (
  "albaran_compra_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_albaran_compra_linea_producto" ON "public"."compras_albaranes_lineas" USING btree (
  "producto_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table compras_albaranes_lineas
-- ----------------------------
ALTER TABLE "public"."compras_albaranes_lineas" ADD CONSTRAINT "albaran_compra_linea_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table compras_facturas
-- ----------------------------
CREATE INDEX "idx_factura_compra_albaran" ON "public"."compras_facturas" USING btree (
  "albaran_compra_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_factura_compra_contabilizado" ON "public"."compras_facturas" USING btree (
  "contabilizado" "pg_catalog"."bool_ops" ASC NULLS LAST
);
CREATE INDEX "idx_factura_compra_estado" ON "public"."compras_facturas" USING btree (
  "estado" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_factura_compra_fecha" ON "public"."compras_facturas" USING btree (
  "fecha" "pg_catalog"."timestamp_ops" ASC NULLS LAST
);
CREATE INDEX "idx_factura_compra_numero" ON "public"."compras_facturas" USING btree (
  "numero" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_factura_compra_pedido" ON "public"."compras_facturas" USING btree (
  "pedido_compra_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_factura_compra_proveedor" ON "public"."compras_facturas" USING btree (
  "proveedor_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table compras_facturas
-- ----------------------------
ALTER TABLE "public"."compras_facturas" ADD CONSTRAINT "factura_compra_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table compras_facturas_lineas
-- ----------------------------
CREATE INDEX "idx_factura_compra_linea_factura" ON "public"."compras_facturas_lineas" USING btree (
  "factura_compra_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_factura_compra_linea_producto" ON "public"."compras_facturas_lineas" USING btree (
  "producto_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table compras_facturas_lineas
-- ----------------------------
ALTER TABLE "public"."compras_facturas_lineas" ADD CONSTRAINT "factura_compra_linea_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table compras_pedidos
-- ----------------------------
CREATE INDEX "idx_compras_pedidos_estado" ON "public"."compras_pedidos" USING btree (
  "estado" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_compras_pedidos_fecha" ON "public"."compras_pedidos" USING btree (
  "fecha" "pg_catalog"."timestamp_ops" DESC NULLS FIRST
);
CREATE INDEX "idx_compras_pedidos_numero" ON "public"."compras_pedidos" USING btree (
  "numero" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_compras_pedidos_proveedor" ON "public"."compras_pedidos" USING btree (
  "proveedor_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_compras_pedidos_serie" ON "public"."compras_pedidos" USING btree (
  "serie_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table compras_pedidos
-- ----------------------------
ALTER TABLE "public"."compras_pedidos" ADD CONSTRAINT "compras_pedidos_numero_key" UNIQUE ("numero");

-- ----------------------------
-- Primary Key structure for table compras_pedidos
-- ----------------------------
ALTER TABLE "public"."compras_pedidos" ADD CONSTRAINT "compras_pedidos_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table compras_pedidos_lineas
-- ----------------------------
CREATE INDEX "idx_compras_pedidos_lineas_pedido" ON "public"."compras_pedidos_lineas" USING btree (
  "pedido_compra_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_compras_pedidos_lineas_producto" ON "public"."compras_pedidos_lineas" USING btree (
  "producto_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table compras_pedidos_lineas
-- ----------------------------
ALTER TABLE "public"."compras_pedidos_lineas" ADD CONSTRAINT "compras_pedidos_lineas_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table condiciones_comerciales
-- ----------------------------
CREATE INDEX "idx_condiciones_activa" ON "public"."condiciones_comerciales" USING btree (
  "activa" "pg_catalog"."bool_ops" ASC NULLS LAST
);
CREATE INDEX "idx_condiciones_agrupacion" ON "public"."condiciones_comerciales" USING btree (
  "agrupacion_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_condiciones_producto" ON "public"."condiciones_comerciales" USING btree (
  "producto_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_condiciones_tarifa_id" ON "public"."condiciones_comerciales" USING btree (
  "tarifa_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table condiciones_comerciales
-- ----------------------------
ALTER TABLE "public"."condiciones_comerciales" ADD CONSTRAINT "condiciones_comerciales_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table condiciones_comerciales_proveedor
-- ----------------------------
CREATE INDEX "idx_cond_com_prv_agrupacion" ON "public"."condiciones_comerciales_proveedor" USING btree (
  "agrupacion_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_cond_com_prv_producto" ON "public"."condiciones_comerciales_proveedor" USING btree (
  "producto_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table condiciones_comerciales_proveedor
-- ----------------------------
ALTER TABLE "public"."condiciones_comerciales_proveedor" ADD CONSTRAINT "condiciones_comerciales_proveedor_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table configuracion_ventas
-- ----------------------------
ALTER TABLE "public"."configuracion_ventas" ADD CONSTRAINT "configuracion_ventas_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table direcciones
-- ----------------------------
CREATE INDEX "idx_direcciones_tercero" ON "public"."direcciones" USING btree (
  "tipo_tercero" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "id_tercero" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Checks structure for table direcciones
-- ----------------------------
ALTER TABLE "public"."direcciones" ADD CONSTRAINT "chk_tipo_tercero" CHECK (tipo_tercero::text = ANY (ARRAY['CLIENTE'::character varying, 'PROVEEDOR'::character varying, 'FABRICANTE'::character varying]::text[]));

-- ----------------------------
-- Primary Key structure for table direcciones
-- ----------------------------
ALTER TABLE "public"."direcciones" ADD CONSTRAINT "direcciones_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table documento_transformaciones
-- ----------------------------
CREATE INDEX "idx_documento_transformaciones_destino" ON "public"."documento_transformaciones" USING btree (
  "tipo_destino" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "id_destino" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_documento_transformaciones_fecha" ON "public"."documento_transformaciones" USING btree (
  "fecha_transformacion" "pg_catalog"."timestamp_ops" ASC NULLS LAST
);
CREATE INDEX "idx_documento_transformaciones_origen" ON "public"."documento_transformaciones" USING btree (
  "tipo_origen" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "id_origen" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table documento_transformaciones
-- ----------------------------
ALTER TABLE "public"."documento_transformaciones" ADD CONSTRAINT "documento_transformaciones_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Auto increment value for empresa
-- ----------------------------
SELECT setval('"public"."empresa_id_seq1"', 1, false);

-- ----------------------------
-- Auto increment value for fabricantes
-- ----------------------------
SELECT setval('"public"."fabricantes_id_seq1"', 5, true);

-- ----------------------------
-- Primary Key structure for table fabricantes
-- ----------------------------
ALTER TABLE "public"."fabricantes" ADD CONSTRAINT "fabricantes_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Auto increment value for factura_lineas
-- ----------------------------
SELECT setval('"public"."factura_lineas_id_seq1"', 1, false);

-- ----------------------------
-- Primary Key structure for table factura_lineas
-- ----------------------------
ALTER TABLE "public"."factura_lineas" ADD CONSTRAINT "factura_lineas_pkey1" PRIMARY KEY ("id");

-- ----------------------------
-- Auto increment value for familias
-- ----------------------------
SELECT setval('"public"."familias_id_seq1"', 11, true);

-- ----------------------------
-- Uniques structure for table familias
-- ----------------------------
ALTER TABLE "public"."familias" ADD CONSTRAINT "uko0109v6msv9bcfkv16jl2r9hj" UNIQUE ("nombre");

-- ----------------------------
-- Primary Key structure for table familias
-- ----------------------------
ALTER TABLE "public"."familias" ADD CONSTRAINT "familias_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table movimientos_stock
-- ----------------------------
CREATE INDEX "idx_movimientos_stock_almacen" ON "public"."movimientos_stock" USING btree (
  "almacen_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_movimientos_stock_documento" ON "public"."movimientos_stock" USING btree (
  "documento_tipo" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "documento_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_movimientos_stock_fecha" ON "public"."movimientos_stock" USING btree (
  "fecha" "pg_catalog"."timestamp_ops" DESC NULLS FIRST
);
CREATE INDEX "idx_movimientos_stock_producto" ON "public"."movimientos_stock" USING btree (
  "producto_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_movimientos_stock_producto_almacen" ON "public"."movimientos_stock" USING btree (
  "producto_id" "pg_catalog"."int8_ops" ASC NULLS LAST,
  "almacen_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_movimientos_stock_tipo" ON "public"."movimientos_stock" USING btree (
  "tipo_movimiento" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table movimientos_stock
-- ----------------------------
ALTER TABLE "public"."movimientos_stock" ADD CONSTRAINT "movimientos_stock_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table plantilla_pdf
-- ----------------------------
ALTER TABLE "public"."plantilla_pdf" ADD CONSTRAINT "plantilla_pdf_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table preferencias_series_usuario
-- ----------------------------
CREATE INDEX "idx_pref_series_usuario" ON "public"."preferencias_series_usuario" USING btree (
  "usuario_id" "pg_catalog"."int8_ops" ASC NULLS LAST,
  "tipo_documento" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table preferencias_series_usuario
-- ----------------------------
ALTER TABLE "public"."preferencias_series_usuario" ADD CONSTRAINT "preferencias_series_usuario_unica" UNIQUE ("usuario_id", "tipo_documento");

-- ----------------------------
-- Primary Key structure for table preferencias_series_usuario
-- ----------------------------
ALTER TABLE "public"."preferencias_series_usuario" ADD CONSTRAINT "preferencias_series_usuario_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Auto increment value for producto_almacen
-- ----------------------------
SELECT setval('"public"."producto_almacen_id_seq"', 56, true);

-- ----------------------------
-- Indexes structure for table producto_almacen
-- ----------------------------
CREATE INDEX "idx_producto_almacen_almacen" ON "public"."producto_almacen" USING btree (
  "almacen_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_producto_almacen_producto" ON "public"."producto_almacen" USING btree (
  "producto_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table producto_almacen
-- ----------------------------
ALTER TABLE "public"."producto_almacen" ADD CONSTRAINT "producto_almacen_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table producto_codigo_barra
-- ----------------------------
CREATE INDEX "idx_producto_codigo_barra_activo" ON "public"."producto_codigo_barra" USING btree (
  "activo" "pg_catalog"."bool_ops" ASC NULLS LAST
);
CREATE INDEX "idx_producto_codigo_barra_origen" ON "public"."producto_codigo_barra" USING btree (
  "origen" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "idx_producto_codigo_barra_principal" ON "public"."producto_codigo_barra" USING btree (
  "producto_id" "pg_catalog"."int8_ops" ASC NULLS LAST
) WHERE es_principal = true;
CREATE INDEX "idx_producto_codigo_barra_producto_id" ON "public"."producto_codigo_barra" USING btree (
  "producto_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_producto_codigo_barra_valor" ON "public"."producto_codigo_barra" USING btree (
  "valor" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table producto_codigo_barra
-- ----------------------------
ALTER TABLE "public"."producto_codigo_barra" ADD CONSTRAINT "producto_codigo_barra_valor_key" UNIQUE ("valor");

-- ----------------------------
-- Primary Key structure for table producto_codigo_barra
-- ----------------------------
ALTER TABLE "public"."producto_codigo_barra" ADD CONSTRAINT "producto_codigo_barra_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table producto_familias
-- ----------------------------
CREATE INDEX "idx_producto_familias_familia" ON "public"."producto_familias" USING btree (
  "familia_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_producto_familias_producto" ON "public"."producto_familias" USING btree (
  "producto_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table producto_familias
-- ----------------------------
ALTER TABLE "public"."producto_familias" ADD CONSTRAINT "producto_familias_pkey" PRIMARY KEY ("producto_id", "familia_id");

-- ----------------------------
-- Indexes structure for table producto_referencias
-- ----------------------------
CREATE INDEX "idx_producto_referencias_producto_id" ON "public"."producto_referencias" USING btree (
  "producto_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_producto_referencias_referencia" ON "public"."producto_referencias" USING btree (
  "referencia" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table producto_referencias
-- ----------------------------
ALTER TABLE "public"."producto_referencias" ADD CONSTRAINT "producto_referencias_referencia_key" UNIQUE ("referencia");

-- ----------------------------
-- Primary Key structure for table producto_referencias
-- ----------------------------
ALTER TABLE "public"."producto_referencias" ADD CONSTRAINT "producto_referencias_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table producto_subfamilias
-- ----------------------------
CREATE INDEX "idx_producto_subfamilias_producto" ON "public"."producto_subfamilias" USING btree (
  "producto_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_producto_subfamilias_subfamilia" ON "public"."producto_subfamilias" USING btree (
  "subfamilia_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table producto_subfamilias
-- ----------------------------
ALTER TABLE "public"."producto_subfamilias" ADD CONSTRAINT "producto_subfamilias_pkey" PRIMARY KEY ("producto_id", "subfamilia_id");

-- ----------------------------
-- Auto increment value for productos
-- ----------------------------
SELECT setval('"public"."productos_id_seq1"', 30, true);

-- ----------------------------
-- Indexes structure for table productos
-- ----------------------------
CREATE INDEX "idx_productos_tipo_iva" ON "public"."productos" USING btree (
  "tipo_iva_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table productos
-- ----------------------------
ALTER TABLE "public"."productos" ADD CONSTRAINT "productos_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Auto increment value for proveedores
-- ----------------------------
SELECT setval('"public"."proveedores_id_seq1"', 15, true);

-- ----------------------------
-- Primary Key structure for table proveedores
-- ----------------------------
ALTER TABLE "public"."proveedores" ADD CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table series_documento
-- ----------------------------
CREATE INDEX "idx_series_doc_tipo" ON "public"."series_documento" USING btree (
  "tipo_documento" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table series_documento
-- ----------------------------
ALTER TABLE "public"."series_documento" ADD CONSTRAINT "series_documento_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table series_secuencia
-- ----------------------------
ALTER TABLE "public"."series_secuencia" ADD CONSTRAINT "series_secuencia_unica" UNIQUE ("serie_id", "anio");

-- ----------------------------
-- Primary Key structure for table series_secuencia
-- ----------------------------
ALTER TABLE "public"."series_secuencia" ADD CONSTRAINT "series_secuencia_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Auto increment value for subfamilias
-- ----------------------------
SELECT setval('"public"."subfamilias_id_seq"', 10, true);

-- ----------------------------
-- Uniques structure for table subfamilias
-- ----------------------------
ALTER TABLE "public"."subfamilias" ADD CONSTRAINT "uk7bqpygr4k5kwm487jns82k022" UNIQUE ("nombre");

-- ----------------------------
-- Primary Key structure for table subfamilias
-- ----------------------------
ALTER TABLE "public"."subfamilias" ADD CONSTRAINT "subfamilias_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table tarifa_productos
-- ----------------------------
CREATE INDEX "idx_tarifa_productos_producto_id" ON "public"."tarifa_productos" USING btree (
  "producto_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_tarifa_productos_tarifa_id" ON "public"."tarifa_productos" USING btree (
  "tarifa_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_tarifa_productos_tipo_calculo" ON "public"."tarifa_productos" USING btree (
  "tipo_calculo_precio" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table tarifa_productos
-- ----------------------------
ALTER TABLE "public"."tarifa_productos" ADD CONSTRAINT "uk_tarifa_producto" UNIQUE ("tarifa_id", "producto_id");

-- ----------------------------
-- Primary Key structure for table tarifa_productos
-- ----------------------------
ALTER TABLE "public"."tarifa_productos" ADD CONSTRAINT "tarifa_productos_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table tarifas
-- ----------------------------
CREATE INDEX "idx_tarifas_activa" ON "public"."tarifas" USING btree (
  "activa" "pg_catalog"."bool_ops" ASC NULLS LAST
);
CREATE INDEX "idx_tarifas_activa_tipo" ON "public"."tarifas" USING btree (
  "activa" "pg_catalog"."bool_ops" ASC NULLS LAST,
  "tipo_tarifa" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_tarifas_es_general" ON "public"."tarifas" USING btree (
  "es_general" "pg_catalog"."bool_ops" ASC NULLS LAST
);
CREATE INDEX "idx_tarifas_tipo_tarifa" ON "public"."tarifas" USING btree (
  "tipo_tarifa" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table tarifas
-- ----------------------------
ALTER TABLE "public"."tarifas" ADD CONSTRAINT "uk_tarifa_nombre" UNIQUE ("nombre");

-- ----------------------------
-- Primary Key structure for table tarifas
-- ----------------------------
ALTER TABLE "public"."tarifas" ADD CONSTRAINT "tarifas_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table tipos_iva
-- ----------------------------
CREATE INDEX "idx_tipos_iva_activo" ON "public"."tipos_iva" USING btree (
  "activo" "pg_catalog"."bool_ops" ASC NULLS LAST
);

-- ----------------------------
-- Triggers structure for table tipos_iva
-- ----------------------------
CREATE TRIGGER "trg_tipos_iva_updated" BEFORE UPDATE ON "public"."tipos_iva"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_updated_at"();

-- ----------------------------
-- Uniques structure for table tipos_iva
-- ----------------------------
ALTER TABLE "public"."tipos_iva" ADD CONSTRAINT "tipos_iva_nombre_key" UNIQUE ("nombre");

-- ----------------------------
-- Checks structure for table tipos_iva
-- ----------------------------
ALTER TABLE "public"."tipos_iva" ADD CONSTRAINT "tipos_iva_porcentaje_iva_check" CHECK (porcentaje_iva >= 0::numeric::double precision);
ALTER TABLE "public"."tipos_iva" ADD CONSTRAINT "tipos_iva_porcentaje_recargo_check" CHECK (porcentaje_recargo >= 0::numeric::double precision);

-- ----------------------------
-- Primary Key structure for table tipos_iva
-- ----------------------------
ALTER TABLE "public"."tipos_iva" ADD CONSTRAINT "tipos_iva_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Auto increment value for tpv_configuracion_tickets
-- ----------------------------
SELECT setval('"public"."tpv_configuracion_tickets_id_seq"', 3, true);

-- ----------------------------
-- Primary Key structure for table tpv_configuracion_tickets
-- ----------------------------
ALTER TABLE "public"."tpv_configuracion_tickets" ADD CONSTRAINT "tpv_configuracion_tickets_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Checks structure for table usuario_inicio_panel
-- ----------------------------
ALTER TABLE "public"."usuario_inicio_panel" ADD CONSTRAINT "usuario_inicio_panel_size_h_check" CHECK (size_h >= 1 AND size_h <= 4);
ALTER TABLE "public"."usuario_inicio_panel" ADD CONSTRAINT "usuario_inicio_panel_size_w_check" CHECK (size_w >= 1 AND size_w <= 4);

-- ----------------------------
-- Primary Key structure for table usuario_inicio_panel
-- ----------------------------
ALTER TABLE "public"."usuario_inicio_panel" ADD CONSTRAINT "usuario_inicio_panel_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Auto increment value for usuarios
-- ----------------------------
SELECT setval('"public"."usuarios_id_seq1"', 2, true);

-- ----------------------------
-- Uniques structure for table usuarios
-- ----------------------------
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "ukggd9d47p8x7m0ajavk1ayuyqs" UNIQUE ("dni");
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "uk3m5n1w5trapxlbo2s42ugwdmd" UNIQUE ("usuario");

-- ----------------------------
-- Primary Key structure for table usuarios
-- ----------------------------
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Auto increment value for ventas_albaran_lineas
-- ----------------------------
SELECT setval('"public"."albaran_lineas_id_seq1"', 11313, true);

-- ----------------------------
-- Indexes structure for table ventas_albaran_lineas
-- ----------------------------
CREATE INDEX "idx_ventas_albaran_lineas_tipo_iva" ON "public"."ventas_albaran_lineas" USING btree (
  "tipo_iva_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table ventas_albaran_lineas
-- ----------------------------
ALTER TABLE "public"."ventas_albaran_lineas" ADD CONSTRAINT "albaran_lineas_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table ventas_albaranes
-- ----------------------------
CREATE INDEX "idx_albaranes_tarifa_id" ON "public"."ventas_albaranes" USING btree (
  "tarifa_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ventas_albaranes_fecha" ON "public"."ventas_albaranes" USING btree (
  "fecha" "pg_catalog"."timestamp_ops" DESC NULLS FIRST
);
CREATE INDEX "idx_ventas_albaranes_serie" ON "public"."ventas_albaranes" USING btree (
  "serie_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table ventas_albaranes
-- ----------------------------
ALTER TABLE "public"."ventas_albaranes" ADD CONSTRAINT "albaranes_numero_key" UNIQUE ("numero");

-- ----------------------------
-- Primary Key structure for table ventas_albaranes
-- ----------------------------
ALTER TABLE "public"."ventas_albaranes" ADD CONSTRAINT "albaranes_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table ventas_factura_lineas
-- ----------------------------
ALTER TABLE "public"."ventas_factura_lineas" ADD CONSTRAINT "ventas_factura_lineas_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table ventas_factura_proforma_lineas
-- ----------------------------
ALTER TABLE "public"."ventas_factura_proforma_lineas" ADD CONSTRAINT "ventas_factura_proforma_lineas_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table ventas_factura_rectificativa_lineas
-- ----------------------------
ALTER TABLE "public"."ventas_factura_rectificativa_lineas" ADD CONSTRAINT "ventas_factura_rectificativa_lineas_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table ventas_facturas
-- ----------------------------
CREATE INDEX "idx_factura_albaran" ON "public"."ventas_facturas" USING btree (
  "albaran_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_factura_cliente" ON "public"."ventas_facturas" USING btree (
  "cliente_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_factura_estado" ON "public"."ventas_facturas" USING btree (
  "estado" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_factura_numero" ON "public"."ventas_facturas" USING btree (
  "numero" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ventas_facturas_fecha" ON "public"."ventas_facturas" USING btree (
  "fecha" "pg_catalog"."timestamp_ops" DESC NULLS FIRST
);

-- ----------------------------
-- Primary Key structure for table ventas_facturas
-- ----------------------------
ALTER TABLE "public"."ventas_facturas" ADD CONSTRAINT "ventas_facturas_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table ventas_facturas_proforma
-- ----------------------------
CREATE INDEX "idx_factura_proforma_cliente" ON "public"."ventas_facturas_proforma" USING btree (
  "cliente_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_factura_proforma_estado" ON "public"."ventas_facturas_proforma" USING btree (
  "estado" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_factura_proforma_numero" ON "public"."ventas_facturas_proforma" USING btree (
  "numero" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ventas_facturas_proforma_fecha" ON "public"."ventas_facturas_proforma" USING btree (
  "fecha" "pg_catalog"."timestamp_ops" DESC NULLS FIRST
);

-- ----------------------------
-- Primary Key structure for table ventas_facturas_proforma
-- ----------------------------
ALTER TABLE "public"."ventas_facturas_proforma" ADD CONSTRAINT "ventas_facturas_proforma_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table ventas_facturas_rectificativas
-- ----------------------------
CREATE INDEX "idx_factura_rectificativa_cliente" ON "public"."ventas_facturas_rectificativas" USING btree (
  "cliente_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_factura_rectificativa_estado" ON "public"."ventas_facturas_rectificativas" USING btree (
  "estado" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_factura_rectificativa_factura_origen" ON "public"."ventas_facturas_rectificativas" USING btree (
  "factura_origen_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_factura_rectificativa_numero" ON "public"."ventas_facturas_rectificativas" USING btree (
  "numero" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ventas_facturas_rectificativas_fecha" ON "public"."ventas_facturas_rectificativas" USING btree (
  "fecha" "pg_catalog"."timestamp_ops" DESC NULLS FIRST
);

-- ----------------------------
-- Primary Key structure for table ventas_facturas_rectificativas
-- ----------------------------
ALTER TABLE "public"."ventas_facturas_rectificativas" ADD CONSTRAINT "ventas_facturas_rectificativas_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Auto increment value for ventas_facturas_simplificadas
-- ----------------------------
SELECT setval('"public"."ventas_facturas_simplificadas_id_seq"', 205, true);

-- ----------------------------
-- Indexes structure for table ventas_facturas_simplificadas
-- ----------------------------
CREATE INDEX "idx_facturas_simplificadas_cliente" ON "public"."ventas_facturas_simplificadas" USING btree (
  "cliente_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_facturas_simplificadas_contabilizado" ON "public"."ventas_facturas_simplificadas" USING btree (
  "contabilizado" "pg_catalog"."bool_ops" ASC NULLS LAST
);
CREATE INDEX "idx_facturas_simplificadas_fecha" ON "public"."ventas_facturas_simplificadas" USING btree (
  "fecha" "pg_catalog"."timestamp_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table ventas_facturas_simplificadas
-- ----------------------------
ALTER TABLE "public"."ventas_facturas_simplificadas" ADD CONSTRAINT "ventas_facturas_simplificadas_numero_key" UNIQUE ("numero");

-- ----------------------------
-- Primary Key structure for table ventas_facturas_simplificadas
-- ----------------------------
ALTER TABLE "public"."ventas_facturas_simplificadas" ADD CONSTRAINT "ventas_facturas_simplificadas_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Auto increment value for ventas_facturas_simplificadas_lineas
-- ----------------------------
SELECT setval('"public"."ventas_facturas_simplificadas_lineas_id_seq"', 146, true);

-- ----------------------------
-- Primary Key structure for table ventas_facturas_simplificadas_lineas
-- ----------------------------
ALTER TABLE "public"."ventas_facturas_simplificadas_lineas" ADD CONSTRAINT "ventas_facturas_simplificadas_lineas_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table ventas_pedido_lineas
-- ----------------------------
ALTER TABLE "public"."ventas_pedido_lineas" ADD CONSTRAINT "ventas_pedido_lineas_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table ventas_pedidos
-- ----------------------------
CREATE INDEX "idx_pedido_cliente" ON "public"."ventas_pedidos" USING btree (
  "cliente_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_pedido_estado" ON "public"."ventas_pedidos" USING btree (
  "estado" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_pedido_numero" ON "public"."ventas_pedidos" USING btree (
  "numero" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_pedido_presupuesto" ON "public"."ventas_pedidos" USING btree (
  "presupuesto_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ventas_pedidos_fecha" ON "public"."ventas_pedidos" USING btree (
  "fecha" "pg_catalog"."timestamp_ops" DESC NULLS FIRST
);

-- ----------------------------
-- Primary Key structure for table ventas_pedidos
-- ----------------------------
ALTER TABLE "public"."ventas_pedidos" ADD CONSTRAINT "ventas_pedidos_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table ventas_presupuesto_lineas
-- ----------------------------
ALTER TABLE "public"."ventas_presupuesto_lineas" ADD CONSTRAINT "ventas_presupuesto_lineas_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table ventas_presupuestos
-- ----------------------------
CREATE INDEX "idx_presupuesto_cliente" ON "public"."ventas_presupuestos" USING btree (
  "cliente_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "idx_presupuesto_estado" ON "public"."ventas_presupuestos" USING btree (
  "estado" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_presupuesto_numero" ON "public"."ventas_presupuestos" USING btree (
  "numero" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_ventas_presupuestos_fecha" ON "public"."ventas_presupuestos" USING btree (
  "fecha" "pg_catalog"."timestamp_ops" DESC NULLS FIRST
);

-- ----------------------------
-- Primary Key structure for table ventas_presupuestos
-- ----------------------------
ALTER TABLE "public"."ventas_presupuestos" ADD CONSTRAINT "ventas_presupuestos_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Foreign Keys structure for table clientes
-- ----------------------------
ALTER TABLE "public"."clientes" ADD CONSTRAINT "fk_clientes_agrupacion" FOREIGN KEY ("agrupacion_id") REFERENCES "public"."agrupaciones" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."clientes" ADD CONSTRAINT "fk_clientes_tarifa" FOREIGN KEY ("tarifa_id") REFERENCES "public"."tarifas" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table codigo_barra_campos
-- ----------------------------
ALTER TABLE "public"."codigo_barra_campos" ADD CONSTRAINT "fkihjcbjxgroanik85v2em0mpum" FOREIGN KEY ("codigo_barra_id") REFERENCES "public"."codigo_barra" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table compras_albaranes
-- ----------------------------
ALTER TABLE "public"."compras_albaranes" ADD CONSTRAINT "fk_albaran_compra_almacen" FOREIGN KEY ("almacen_id") REFERENCES "public"."almacenes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."compras_albaranes" ADD CONSTRAINT "fk_albaran_compra_factura" FOREIGN KEY ("factura_compra_id") REFERENCES "public"."compras_facturas" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."compras_albaranes" ADD CONSTRAINT "fk_albaran_compra_proveedor" FOREIGN KEY ("proveedor_id") REFERENCES "public"."proveedores" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."compras_albaranes" ADD CONSTRAINT "fk_albaran_compra_serie" FOREIGN KEY ("serie_id") REFERENCES "public"."series_documento" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."compras_albaranes" ADD CONSTRAINT "fk_albaran_compra_tarifa" FOREIGN KEY ("tarifa_id") REFERENCES "public"."tarifas" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table compras_albaranes_lineas
-- ----------------------------
ALTER TABLE "public"."compras_albaranes_lineas" ADD CONSTRAINT "fk_albaran_compra_linea_albaran" FOREIGN KEY ("albaran_compra_id") REFERENCES "public"."compras_albaranes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."compras_albaranes_lineas" ADD CONSTRAINT "fk_albaran_compra_linea_almacen" FOREIGN KEY ("almacen_id") REFERENCES "public"."almacenes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."compras_albaranes_lineas" ADD CONSTRAINT "fk_albaran_compra_linea_producto" FOREIGN KEY ("producto_id") REFERENCES "public"."productos" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."compras_albaranes_lineas" ADD CONSTRAINT "fk_albaran_compra_linea_tipo_iva" FOREIGN KEY ("tipo_iva_id") REFERENCES "public"."tipos_iva" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table compras_facturas
-- ----------------------------
ALTER TABLE "public"."compras_facturas" ADD CONSTRAINT "fk_factura_compra_albaran" FOREIGN KEY ("albaran_compra_id") REFERENCES "public"."compras_albaranes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."compras_facturas" ADD CONSTRAINT "fk_factura_compra_almacen" FOREIGN KEY ("almacen_id") REFERENCES "public"."almacenes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."compras_facturas" ADD CONSTRAINT "fk_factura_compra_pedido" FOREIGN KEY ("pedido_compra_id") REFERENCES "public"."compras_pedidos" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."compras_facturas" ADD CONSTRAINT "fk_factura_compra_proveedor" FOREIGN KEY ("proveedor_id") REFERENCES "public"."proveedores" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."compras_facturas" ADD CONSTRAINT "fk_factura_compra_serie" FOREIGN KEY ("serie_id") REFERENCES "public"."series_documento" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."compras_facturas" ADD CONSTRAINT "fk_factura_compra_tarifa" FOREIGN KEY ("tarifa_id") REFERENCES "public"."tarifas" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table compras_facturas_lineas
-- ----------------------------
ALTER TABLE "public"."compras_facturas_lineas" ADD CONSTRAINT "fk_factura_compra_linea_almacen" FOREIGN KEY ("almacen_id") REFERENCES "public"."almacenes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."compras_facturas_lineas" ADD CONSTRAINT "fk_factura_compra_linea_factura" FOREIGN KEY ("factura_compra_id") REFERENCES "public"."compras_facturas" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."compras_facturas_lineas" ADD CONSTRAINT "fk_factura_compra_linea_producto" FOREIGN KEY ("producto_id") REFERENCES "public"."productos" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."compras_facturas_lineas" ADD CONSTRAINT "fk_factura_compra_linea_tipo_iva" FOREIGN KEY ("tipo_iva_id") REFERENCES "public"."tipos_iva" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table compras_pedidos
-- ----------------------------
ALTER TABLE "public"."compras_pedidos" ADD CONSTRAINT "fk_pedido_compra_almacen" FOREIGN KEY ("almacen_id") REFERENCES "public"."almacenes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."compras_pedidos" ADD CONSTRAINT "fk_pedido_compra_proveedor" FOREIGN KEY ("proveedor_id") REFERENCES "public"."proveedores" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."compras_pedidos" ADD CONSTRAINT "fk_pedido_compra_serie" FOREIGN KEY ("serie_id") REFERENCES "public"."series_documento" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."compras_pedidos" ADD CONSTRAINT "fk_pedido_compra_tarifa" FOREIGN KEY ("tarifa_id") REFERENCES "public"."tarifas" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table compras_pedidos_lineas
-- ----------------------------
ALTER TABLE "public"."compras_pedidos_lineas" ADD CONSTRAINT "fk_pedido_compra_linea_almacen" FOREIGN KEY ("almacen_id") REFERENCES "public"."almacenes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."compras_pedidos_lineas" ADD CONSTRAINT "fk_pedido_compra_linea_pedido" FOREIGN KEY ("pedido_compra_id") REFERENCES "public"."compras_pedidos" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."compras_pedidos_lineas" ADD CONSTRAINT "fk_pedido_compra_linea_producto" FOREIGN KEY ("producto_id") REFERENCES "public"."productos" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."compras_pedidos_lineas" ADD CONSTRAINT "fk_pedido_compra_linea_tipo_iva" FOREIGN KEY ("tipo_iva_id") REFERENCES "public"."tipos_iva" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table condiciones_comerciales
-- ----------------------------
ALTER TABLE "public"."condiciones_comerciales" ADD CONSTRAINT "fk_condiciones_agrupacion" FOREIGN KEY ("agrupacion_id") REFERENCES "public"."agrupaciones" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."condiciones_comerciales" ADD CONSTRAINT "fk_condiciones_producto" FOREIGN KEY ("producto_id") REFERENCES "public"."productos" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."condiciones_comerciales" ADD CONSTRAINT "fk_condiciones_tarifa" FOREIGN KEY ("tarifa_id") REFERENCES "public"."tarifas" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table condiciones_comerciales_proveedor
-- ----------------------------
ALTER TABLE "public"."condiciones_comerciales_proveedor" ADD CONSTRAINT "condiciones_comerciales_proveedor_agrupacion_id_fkey" FOREIGN KEY ("agrupacion_id") REFERENCES "public"."agrupaciones" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."condiciones_comerciales_proveedor" ADD CONSTRAINT "condiciones_comerciales_proveedor_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "public"."productos" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."condiciones_comerciales_proveedor" ADD CONSTRAINT "condiciones_comerciales_proveedor_tarifa_id_fkey" FOREIGN KEY ("tarifa_id") REFERENCES "public"."tarifas" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table fabricantes
-- ----------------------------
ALTER TABLE "public"."fabricantes" ADD CONSTRAINT "fk2lj6e6gmc8j3jp0rfqaorx7ap" FOREIGN KEY ("agrupacion_id") REFERENCES "public"."agrupaciones" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."fabricantes" ADD CONSTRAINT "fk_fabricantes_agrupacion" FOREIGN KEY ("agrupacion_id") REFERENCES "public"."agrupaciones" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table factura_lineas
-- ----------------------------
ALTER TABLE "public"."factura_lineas" ADD CONSTRAINT "fkheb07095vfhr4pps509vviq08" FOREIGN KEY ("producto_id") REFERENCES "public"."productos" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table movimientos_stock
-- ----------------------------
ALTER TABLE "public"."movimientos_stock" ADD CONSTRAINT "fk_movimiento_almacen" FOREIGN KEY ("almacen_id") REFERENCES "public"."almacenes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."movimientos_stock" ADD CONSTRAINT "fk_movimiento_producto" FOREIGN KEY ("producto_id") REFERENCES "public"."productos" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table preferencias_series_usuario
-- ----------------------------
ALTER TABLE "public"."preferencias_series_usuario" ADD CONSTRAINT "preferencias_series_usuario_serie_id_fkey" FOREIGN KEY ("serie_id") REFERENCES "public"."series_documento" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."preferencias_series_usuario" ADD CONSTRAINT "preferencias_series_usuario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table producto_almacen
-- ----------------------------
ALTER TABLE "public"."producto_almacen" ADD CONSTRAINT "fkg8rmpa67beeff6rqfbcpprmqd" FOREIGN KEY ("almacen_id") REFERENCES "public"."almacenes" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."producto_almacen" ADD CONSTRAINT "fklkyqhlkfgpuk7iyapjcwvf2rj" FOREIGN KEY ("producto_id") REFERENCES "public"."productos" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table producto_codigo_barra
-- ----------------------------
ALTER TABLE "public"."producto_codigo_barra" ADD CONSTRAINT "fk_producto_codigo_barra_producto" FOREIGN KEY ("producto_id") REFERENCES "public"."productos" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."producto_codigo_barra" ADD CONSTRAINT "fk_producto_codigo_barra_tipo" FOREIGN KEY ("codigo_barra_tipo_id") REFERENCES "public"."codigo_barra" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table producto_familias
-- ----------------------------
ALTER TABLE "public"."producto_familias" ADD CONSTRAINT "fkm3pm37m8shd9xkl4yvpvs8ytg" FOREIGN KEY ("producto_id") REFERENCES "public"."productos" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."producto_familias" ADD CONSTRAINT "fko66r035hw4uptkx7lia0it5u6" FOREIGN KEY ("familia_id") REFERENCES "public"."familias" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table producto_referencias
-- ----------------------------
ALTER TABLE "public"."producto_referencias" ADD CONSTRAINT "fk_producto_referencias_producto" FOREIGN KEY ("producto_id") REFERENCES "public"."productos" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table producto_subfamilias
-- ----------------------------
ALTER TABLE "public"."producto_subfamilias" ADD CONSTRAINT "fk475v0yhrlpy82g22hdvvpbxs6" FOREIGN KEY ("producto_id") REFERENCES "public"."productos" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."producto_subfamilias" ADD CONSTRAINT "fksea16uowgymyh7bwccmyhke2i" FOREIGN KEY ("subfamilia_id") REFERENCES "public"."subfamilias" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table productos
-- ----------------------------
ALTER TABLE "public"."productos" ADD CONSTRAINT "fk_productos_tipo_iva" FOREIGN KEY ("tipo_iva_id") REFERENCES "public"."tipos_iva" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."productos" ADD CONSTRAINT "fkk2f49rswf4xpqpjcp1riursj4" FOREIGN KEY ("fabricante_id") REFERENCES "public"."fabricantes" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."productos" ADD CONSTRAINT "productos_almacen_predeterminado_id_fkey" FOREIGN KEY ("almacen_predeterminado_id") REFERENCES "public"."almacenes" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table proveedores
-- ----------------------------
ALTER TABLE "public"."proveedores" ADD CONSTRAINT "fk40o9k6mnqj25xexjrk8es0ogj" FOREIGN KEY ("agrupacion_id") REFERENCES "public"."agrupaciones" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."proveedores" ADD CONSTRAINT "fk_proveedores_agrupacion" FOREIGN KEY ("agrupacion_id") REFERENCES "public"."agrupaciones" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table series_documento
-- ----------------------------
ALTER TABLE "public"."series_documento" ADD CONSTRAINT "series_documento_almacen_predeterminado_id_fkey" FOREIGN KEY ("almacen_predeterminado_id") REFERENCES "public"."almacenes" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table series_secuencia
-- ----------------------------
ALTER TABLE "public"."series_secuencia" ADD CONSTRAINT "series_secuencia_serie_id_fkey" FOREIGN KEY ("serie_id") REFERENCES "public"."series_documento" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table subfamilias
-- ----------------------------
ALTER TABLE "public"."subfamilias" ADD CONSTRAINT "fkosijd97vbn2o01o4ic452q94e" FOREIGN KEY ("familia_id") REFERENCES "public"."familias" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table tarifa_productos
-- ----------------------------
ALTER TABLE "public"."tarifa_productos" ADD CONSTRAINT "fk_tarifa_productos_producto" FOREIGN KEY ("producto_id") REFERENCES "public"."productos" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."tarifa_productos" ADD CONSTRAINT "fk_tarifa_productos_tarifa" FOREIGN KEY ("tarifa_id") REFERENCES "public"."tarifas" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table usuario_inicio_panel
-- ----------------------------
ALTER TABLE "public"."usuario_inicio_panel" ADD CONSTRAINT "usuario_inicio_panel_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table ventas_albaran_lineas
-- ----------------------------
ALTER TABLE "public"."ventas_albaran_lineas" ADD CONSTRAINT "fk1q5yb18ok81fc0atjfd2owpi5" FOREIGN KEY ("albaran_id") REFERENCES "public"."ventas_albaranes" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_albaran_lineas" ADD CONSTRAINT "fk6eibkpnsiiytfh9htvnwwhssy" FOREIGN KEY ("producto_id") REFERENCES "public"."productos" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_albaran_lineas" ADD CONSTRAINT "fk_albaran_linea_tipo_iva" FOREIGN KEY ("tipo_iva_id") REFERENCES "public"."tipos_iva" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_albaran_lineas" ADD CONSTRAINT "fk_ventas_albaran_lineas_tipo_iva" FOREIGN KEY ("tipo_iva_id") REFERENCES "public"."tipos_iva" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_albaran_lineas" ADD CONSTRAINT "ventas_albaran_lineas_almacen_id_fkey" FOREIGN KEY ("almacen_id") REFERENCES "public"."almacenes" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table ventas_albaranes
-- ----------------------------
ALTER TABLE "public"."ventas_albaranes" ADD CONSTRAINT "albaranes_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_albaranes" ADD CONSTRAINT "fk3pf22pu4m92pgyua0ry3wobqx" FOREIGN KEY ("factura_rectificativa_origen_id") REFERENCES "public"."ventas_facturas_rectificativas" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_albaranes" ADD CONSTRAINT "fk_albaran_tarifa" FOREIGN KEY ("tarifa_id") REFERENCES "public"."tarifas" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_albaranes" ADD CONSTRAINT "fkcm04tj3i1nw5fs25yhf0f8u40" FOREIGN KEY ("factura_id") REFERENCES "public"."ventas_facturas" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_albaranes" ADD CONSTRAINT "fkct7pkp1fvcn4b7mg33pxgf1ye" FOREIGN KEY ("direccion_id") REFERENCES "public"."direcciones" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_albaranes" ADD CONSTRAINT "fklow0df0jnoegpi1j4kqba4pya" FOREIGN KEY ("factura_proforma_origen_id") REFERENCES "public"."ventas_facturas_proforma" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_albaranes" ADD CONSTRAINT "ventas_albaranes_almacen_id_fkey" FOREIGN KEY ("almacen_id") REFERENCES "public"."almacenes" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_albaranes" ADD CONSTRAINT "ventas_albaranes_serie_id_fkey" FOREIGN KEY ("serie_id") REFERENCES "public"."series_documento" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table ventas_factura_lineas
-- ----------------------------
ALTER TABLE "public"."ventas_factura_lineas" ADD CONSTRAINT "fk_factura_linea_almacen" FOREIGN KEY ("almacen_id") REFERENCES "public"."almacenes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_factura_lineas" ADD CONSTRAINT "fk_factura_linea_factura" FOREIGN KEY ("factura_id") REFERENCES "public"."ventas_facturas" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_factura_lineas" ADD CONSTRAINT "fk_factura_linea_producto" FOREIGN KEY ("producto_id") REFERENCES "public"."productos" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_factura_lineas" ADD CONSTRAINT "fk_factura_linea_tipo_iva" FOREIGN KEY ("tipo_iva_id") REFERENCES "public"."tipos_iva" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table ventas_factura_proforma_lineas
-- ----------------------------
ALTER TABLE "public"."ventas_factura_proforma_lineas" ADD CONSTRAINT "fk_factura_proforma_linea_almacen" FOREIGN KEY ("almacen_id") REFERENCES "public"."almacenes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_factura_proforma_lineas" ADD CONSTRAINT "fk_factura_proforma_linea_factura_proforma" FOREIGN KEY ("factura_proforma_id") REFERENCES "public"."ventas_facturas_proforma" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_factura_proforma_lineas" ADD CONSTRAINT "fk_factura_proforma_linea_producto" FOREIGN KEY ("producto_id") REFERENCES "public"."productos" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_factura_proforma_lineas" ADD CONSTRAINT "fk_factura_proforma_linea_tipo_iva" FOREIGN KEY ("tipo_iva_id") REFERENCES "public"."tipos_iva" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table ventas_factura_rectificativa_lineas
-- ----------------------------
ALTER TABLE "public"."ventas_factura_rectificativa_lineas" ADD CONSTRAINT "fk_factura_rectificativa_linea_almacen" FOREIGN KEY ("almacen_id") REFERENCES "public"."almacenes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_factura_rectificativa_lineas" ADD CONSTRAINT "fk_factura_rectificativa_linea_factura_rectificativa" FOREIGN KEY ("factura_rectificativa_id") REFERENCES "public"."ventas_facturas_rectificativas" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_factura_rectificativa_lineas" ADD CONSTRAINT "fk_factura_rectificativa_linea_producto" FOREIGN KEY ("producto_id") REFERENCES "public"."productos" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_factura_rectificativa_lineas" ADD CONSTRAINT "fk_factura_rectificativa_linea_tipo_iva" FOREIGN KEY ("tipo_iva_id") REFERENCES "public"."tipos_iva" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table ventas_facturas
-- ----------------------------
ALTER TABLE "public"."ventas_facturas" ADD CONSTRAINT "fk_factura_albaran" FOREIGN KEY ("albaran_id") REFERENCES "public"."ventas_albaranes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_facturas" ADD CONSTRAINT "fk_factura_almacen" FOREIGN KEY ("almacen_id") REFERENCES "public"."almacenes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_facturas" ADD CONSTRAINT "fk_factura_cliente" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_facturas" ADD CONSTRAINT "fk_factura_factura_proforma" FOREIGN KEY ("factura_proforma_id") REFERENCES "public"."ventas_facturas_proforma" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_facturas" ADD CONSTRAINT "fk_factura_pedido" FOREIGN KEY ("pedido_id") REFERENCES "public"."ventas_pedidos" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_facturas" ADD CONSTRAINT "fk_factura_presupuesto" FOREIGN KEY ("presupuesto_id") REFERENCES "public"."ventas_presupuestos" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_facturas" ADD CONSTRAINT "fk_factura_serie" FOREIGN KEY ("serie_id") REFERENCES "public"."series_documento" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_facturas" ADD CONSTRAINT "fk_factura_tarifa" FOREIGN KEY ("tarifa_id") REFERENCES "public"."tarifas" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table ventas_facturas_proforma
-- ----------------------------
ALTER TABLE "public"."ventas_facturas_proforma" ADD CONSTRAINT "fk_factura_proforma_albaran" FOREIGN KEY ("albaran_id") REFERENCES "public"."ventas_albaranes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_facturas_proforma" ADD CONSTRAINT "fk_factura_proforma_almacen" FOREIGN KEY ("almacen_id") REFERENCES "public"."almacenes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_facturas_proforma" ADD CONSTRAINT "fk_factura_proforma_cliente" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_facturas_proforma" ADD CONSTRAINT "fk_factura_proforma_pedido" FOREIGN KEY ("pedido_id") REFERENCES "public"."ventas_pedidos" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_facturas_proforma" ADD CONSTRAINT "fk_factura_proforma_presupuesto" FOREIGN KEY ("presupuesto_id") REFERENCES "public"."ventas_presupuestos" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_facturas_proforma" ADD CONSTRAINT "fk_factura_proforma_serie" FOREIGN KEY ("serie_id") REFERENCES "public"."series_documento" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_facturas_proforma" ADD CONSTRAINT "fk_factura_proforma_tarifa" FOREIGN KEY ("tarifa_id") REFERENCES "public"."tarifas" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table ventas_facturas_rectificativas
-- ----------------------------
ALTER TABLE "public"."ventas_facturas_rectificativas" ADD CONSTRAINT "fk_factura_rectificativa_almacen" FOREIGN KEY ("almacen_id") REFERENCES "public"."almacenes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_facturas_rectificativas" ADD CONSTRAINT "fk_factura_rectificativa_cliente" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_facturas_rectificativas" ADD CONSTRAINT "fk_factura_rectificativa_factura_origen" FOREIGN KEY ("factura_origen_id") REFERENCES "public"."ventas_facturas" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_facturas_rectificativas" ADD CONSTRAINT "fk_factura_rectificativa_serie" FOREIGN KEY ("serie_id") REFERENCES "public"."series_documento" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_facturas_rectificativas" ADD CONSTRAINT "fk_factura_rectificativa_tarifa" FOREIGN KEY ("tarifa_id") REFERENCES "public"."tarifas" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table ventas_facturas_simplificadas
-- ----------------------------
ALTER TABLE "public"."ventas_facturas_simplificadas" ADD CONSTRAINT "fk_factura_simplificada_albaran" FOREIGN KEY ("albaran_id") REFERENCES "public"."ventas_albaranes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_facturas_simplificadas" ADD CONSTRAINT "fk_factura_simplificada_cliente" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table ventas_facturas_simplificadas_lineas
-- ----------------------------
ALTER TABLE "public"."ventas_facturas_simplificadas_lineas" ADD CONSTRAINT "fk3b9j9iikkjiu7rmu8q2q8i29u" FOREIGN KEY ("factura_simplificada_id") REFERENCES "public"."ventas_facturas_simplificadas" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_facturas_simplificadas_lineas" ADD CONSTRAINT "fkjdk0r620o5kv5gh3qthj8gpgw" FOREIGN KEY ("tipo_iva_id") REFERENCES "public"."tipos_iva" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_facturas_simplificadas_lineas" ADD CONSTRAINT "fkmmkuerswk7qixpaaxvjp51q36" FOREIGN KEY ("producto_id") REFERENCES "public"."productos" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table ventas_pedido_lineas
-- ----------------------------
ALTER TABLE "public"."ventas_pedido_lineas" ADD CONSTRAINT "fk_pedido_linea_almacen" FOREIGN KEY ("almacen_id") REFERENCES "public"."almacenes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_pedido_lineas" ADD CONSTRAINT "fk_pedido_linea_pedido" FOREIGN KEY ("pedido_id") REFERENCES "public"."ventas_pedidos" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_pedido_lineas" ADD CONSTRAINT "fk_pedido_linea_producto" FOREIGN KEY ("producto_id") REFERENCES "public"."productos" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_pedido_lineas" ADD CONSTRAINT "fk_pedido_linea_tipo_iva" FOREIGN KEY ("tipo_iva_id") REFERENCES "public"."tipos_iva" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table ventas_pedidos
-- ----------------------------
ALTER TABLE "public"."ventas_pedidos" ADD CONSTRAINT "fk_pedido_almacen" FOREIGN KEY ("almacen_id") REFERENCES "public"."almacenes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_pedidos" ADD CONSTRAINT "fk_pedido_cliente" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_pedidos" ADD CONSTRAINT "fk_pedido_presupuesto" FOREIGN KEY ("presupuesto_id") REFERENCES "public"."ventas_presupuestos" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_pedidos" ADD CONSTRAINT "fk_pedido_serie" FOREIGN KEY ("serie_id") REFERENCES "public"."series_documento" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_pedidos" ADD CONSTRAINT "fk_pedido_tarifa" FOREIGN KEY ("tarifa_id") REFERENCES "public"."tarifas" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table ventas_presupuesto_lineas
-- ----------------------------
ALTER TABLE "public"."ventas_presupuesto_lineas" ADD CONSTRAINT "fk_presupuesto_linea_almacen" FOREIGN KEY ("almacen_id") REFERENCES "public"."almacenes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_presupuesto_lineas" ADD CONSTRAINT "fk_presupuesto_linea_presupuesto" FOREIGN KEY ("presupuesto_id") REFERENCES "public"."ventas_presupuestos" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_presupuesto_lineas" ADD CONSTRAINT "fk_presupuesto_linea_producto" FOREIGN KEY ("producto_id") REFERENCES "public"."productos" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_presupuesto_lineas" ADD CONSTRAINT "fk_presupuesto_linea_tipo_iva" FOREIGN KEY ("tipo_iva_id") REFERENCES "public"."tipos_iva" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table ventas_presupuestos
-- ----------------------------
ALTER TABLE "public"."ventas_presupuestos" ADD CONSTRAINT "fk_presupuesto_almacen" FOREIGN KEY ("almacen_id") REFERENCES "public"."almacenes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_presupuestos" ADD CONSTRAINT "fk_presupuesto_cliente" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_presupuestos" ADD CONSTRAINT "fk_presupuesto_serie" FOREIGN KEY ("serie_id") REFERENCES "public"."series_documento" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."ventas_presupuestos" ADD CONSTRAINT "fk_presupuesto_tarifa" FOREIGN KEY ("tarifa_id") REFERENCES "public"."tarifas" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
