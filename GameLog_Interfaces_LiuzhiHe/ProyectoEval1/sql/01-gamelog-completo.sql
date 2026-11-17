
-- =====================================================
-- GAMELOG - INSTALACION DE LA BASE DE DATOS
-- Compatible con MariaDB 11.4
-- Ejecutar con una cuenta administradora.
-- No borra los videojuegos existentes.
-- =====================================================


-- 1. CREAR LA BASE DE DATOS

CREATE DATABASE IF NOT EXISTS gamelog
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE gamelog;


-- 2. CREAR LA TABLA DE VIDEOJUEGOS

CREATE TABLE IF NOT EXISTS videojuegos (
                                           id INT AUTO_INCREMENT PRIMARY KEY,
                                           titulo VARCHAR(100) NOT NULL,
                                           genero VARCHAR(30) NOT NULL,
                                           plataforma VARCHAR(30) NOT NULL,
                                           anio INT NOT NULL,
                                           descripcion TEXT,

                                           CONSTRAINT chk_titulo
                                               CHECK (CHAR_LENGTH(TRIM(titulo)) >= 2),

                                           CONSTRAINT chk_genero
                                               CHECK (CHAR_LENGTH(TRIM(genero)) > 0),

                                           CONSTRAINT chk_plataforma
                                               CHECK (CHAR_LENGTH(TRIM(plataforma)) > 0),

                                           CONSTRAINT chk_anio
                                               CHECK (anio >= 1950)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- 3. COMPATIBILIDAD CON VERSIONES ANTERIORES

-- Añade la columna descripcion solo si no existe.

ALTER TABLE videojuegos
    ADD COLUMN IF NOT EXISTS descripcion TEXT NULL;


-- 4. EVITAR VIDEOJUEGOS DUPLICADOS

-- Se permite el mismo titulo en distintas plataformas,
-- pero no repetirlo en una misma plataforma.

ALTER TABLE videojuegos
    ADD UNIQUE INDEX IF NOT EXISTS uq_videojuego_titulo_plataforma
        (titulo, plataforma);


-- 5. INSERTAR VIDEOJUEGOS DE EJEMPLO

-- Se insertan solamente si no existen previamente.
-- No se modifican los registros existentes.

INSERT INTO videojuegos
(titulo, genero, plataforma, anio, descripcion)

SELECT
    muestras.titulo,
    muestras.genero,
    muestras.plataforma,
    muestras.anio,
    muestras.descripcion

FROM (
         SELECT
             'Elden Ring' AS titulo,
             'Rol' AS genero,
             'PC' AS plataforma,
             2022 AS anio,
             'En Elden Ring encarnas a un Sinluz que regresa a las Tierras Intermedias. Puedes recorrer sus llanuras a caballo, explorar mazmorras y elegir armas y habilidades para afrontar cada encuentro.' AS descripcion

         UNION ALL SELECT
                       'Portal 2', 'Puzles', 'PC', 2011,
                       'Resuelve las cámaras de pruebas de Aperture Science creando portales entre dos puntos. Usa la física y el ingenio para superar obstáculos y juega pruebas cooperativas con otra persona.'

         UNION ALL SELECT
                       'Cyberpunk 2077', 'Rol', 'PC', 2020,
                       'En Night City interpretas a V, un mercenario atrapado en una trama relacionada con tecnología experimental. Personaliza tus implantes y elige entre sigilo, pirateo y combate.'

         UNION ALL SELECT
                       'Hollow Knight', 'Aventura', 'PC', 2017,
                       'Desciende a Hallownest, un reino subterráneo en ruinas. Explora cavernas conectadas, enfréntate a criaturas y desbloquea habilidades para acceder a nuevas zonas.'

         UNION ALL SELECT
                       'Hades', 'Acción', 'PC', 2020,
                       'Zagreo intenta escapar del inframundo griego. Cada intento combina armas con poderes concedidos por los dioses del Olimpo y permite descubrir más detalles de sus habitantes.'

         UNION ALL SELECT
                       'Minecraft', 'Sandbox', 'PC', 2011,
                       'Explora un mundo de bloques donde puedes recolectar materiales, construir y sobrevivir. Alterna entre la aventura del modo Supervivencia y la libertad del modo Creativo.'

     ) AS muestras

WHERE NOT EXISTS (
    SELECT 1
    FROM videojuegos AS existentes
    WHERE existentes.titulo = muestras.titulo
      AND existentes.plataforma = muestras.plataforma
);

SELECT * FROM videojuegos;
