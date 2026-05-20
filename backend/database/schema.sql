
CREATE DATABASE PillarboxedDB;
GO

USE PillarboxedDB;
GO

-- ── USUARIOS ──────────────────────────────────────────────
CREATE TABLE Usuarios (
    Id            INT           IDENTITY(1,1) PRIMARY KEY,
    Nombre        NVARCHAR(120) NOT NULL,
    Email         NVARCHAR(120) NOT NULL UNIQUE,
    PasswordHash  NVARCHAR(256) NOT NULL,
    FechaRegistro DATETIME      NOT NULL DEFAULT GETUTCDATE()
);

-- ── HILOS DEL FORO ────────────────────────────────────────
CREATE TABLE Hilos (
    Id          INT            IDENTITY(1,1) PRIMARY KEY,
    UsuarioId   INT            NOT NULL REFERENCES Usuarios(Id) ON DELETE CASCADE,
    AutorNombre NVARCHAR(120)  NOT NULL,
    Titulo      NVARCHAR(200)  NOT NULL,
    Texto       NVARCHAR(MAX)  NULL,
    Fecha       DATETIME       NOT NULL DEFAULT GETUTCDATE()
);

-- ── RESPUESTAS DEL FORO ───────────────────────────────────
CREATE TABLE Respuestas (
    Id          INT           IDENTITY(1,1) PRIMARY KEY,
    HiloId      INT           NOT NULL REFERENCES Hilos(Id) ON DELETE CASCADE,
    UsuarioId   INT           NOT NULL REFERENCES Usuarios(Id),
    AutorNombre NVARCHAR(120) NOT NULL,
    Texto       NVARCHAR(MAX) NOT NULL,
    Fecha       DATETIME      NOT NULL DEFAULT GETUTCDATE()
);

-- ── EVENTOS ───────────────────────────────────────────────
CREATE TABLE Eventos (
    Id          INT            IDENTITY(1,1) PRIMARY KEY,
    Tipo        NVARCHAR(50)   NOT NULL,
    TipoLabel   NVARCHAR(80)   NOT NULL,
    Titulo      NVARCHAR(200)  NOT NULL,
    Descripcion NVARCHAR(MAX)  NULL,
    Fecha       DATE           NOT NULL,
    Hora        NVARCHAR(20)   NULL,
    Lugar       NVARCHAR(200)  NULL,
    Precio      NVARCHAR(50)   NULL
);

-- ── INSCRIPCIONES A EVENTOS ───────────────────────────────
CREATE TABLE Inscripciones (
    Id                INT      IDENTITY(1,1) PRIMARY KEY,
    UsuarioId         INT      NOT NULL REFERENCES Usuarios(Id) ON DELETE CASCADE,
    EventoId          INT      NOT NULL REFERENCES Eventos(Id) ON DELETE CASCADE,
    FechaInscripcion  DATETIME NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT UQ_Inscripcion UNIQUE (UsuarioId, EventoId)
);

-- ── RESEÑAS ───────────────────────────────────────────────
CREATE TABLE Resenas (
    Id              INT            IDENTITY(1,1) PRIMARY KEY,
    UsuarioId       INT            NOT NULL REFERENCES Usuarios(Id) ON DELETE CASCADE,
    AutorNombre     NVARCHAR(120)  NOT NULL,
    PeliculaId      INT            NOT NULL,
    TituloPelicula  NVARCHAR(300)  NOT NULL,
    ImagenPelicula  NVARCHAR(300)  NULL,
    Calificacion    INT            NOT NULL CHECK (Calificacion BETWEEN 1 AND 5),
    Texto           NVARCHAR(MAX)  NULL,
    Fecha           DATETIME       NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT UQ_Resena UNIQUE (UsuarioId, PeliculaId)
);

-- ── PELÍCULAS VISTAS ──────────────────────────────────────
CREATE TABLE Vistas (
    Id          INT           IDENTITY(1,1) PRIMARY KEY,
    UsuarioId   INT           NOT NULL REFERENCES Usuarios(Id) ON DELETE CASCADE,
    PeliculaId  INT           NOT NULL,
    Titulo      NVARCHAR(300) NOT NULL,
    Imagen      NVARCHAR(300) NULL,
    Anio        NVARCHAR(10)  NULL,
    FechaVista  DATETIME      NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT UQ_Vista UNIQUE (UsuarioId, PeliculaId)
);

-- ── WISHLIST ──────────────────────────────────────────────
CREATE TABLE WishlistItems (
    Id             INT            IDENTITY(1,1) PRIMARY KEY,
    UsuarioId      INT            NOT NULL REFERENCES Usuarios(Id) ON DELETE CASCADE,
    PeliculaId     INT            NOT NULL,
    Titulo         NVARCHAR(300)  NOT NULL,
    Imagen         NVARCHAR(300)  NULL,
    Calificacion   DECIMAL(4,1)   NULL,
    Anio           NVARCHAR(10)   NULL,
    FechaAgregada  DATETIME       NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT UQ_Wishlist UNIQUE (UsuarioId, PeliculaId)
);

-- ============================================================
--  Eventos 
-- ============================================================

INSERT INTO Eventos (Tipo, TipoLabel, Titulo, Descripcion, Fecha, Hora, Lugar, Precio) VALUES
('proyeccion', 'Proyección',  'Alien: Romulus',
 'Ciclo de ciencia ficción. Proyección seguida de análisis sobre el diseño de producción y la dirección de arte en el cine de terror espacial.',
 '2026-05-28', '6:00 PM', 'Auditorio Principal', 'Gratis'),

('cineforo',   'Cineforo',    'El nuevo cine colombiano',
 'Espacio de reflexión sobre las tendencias actuales del cine nacional. Proyección de cortometrajes seguida de conversatorio con el director invitado.',
 '2026-06-05', '4:00 PM', 'Sala de Arte 101', 'Gratis'),

('taller',     'Taller',      'Fotografía y composición para cine',
 'Taller práctico sobre encuadre, iluminación y lenguaje visual. Se trabaja con cámaras del laboratorio. Cupos limitados a 20 personas.',
 '2026-06-12', '8:00 AM', 'Laboratorio Multimedia', '$15.000'),

('festival',   'Festival',    'Muestra de Cortometrajes Pascual Bravo',
 'Primera muestra estudiantil de cortometrajes producidos durante el semestre. Participan proyectos de los programas de Comunicación y Diseño.',
 '2026-06-20', '2:00 PM', 'Campus Universitario', 'Gratis'),

('proyeccion', 'Proyección',  'Blade Runner 2049',
 'Ciclo de ciencia ficción distópica. Análisis de la fotografía de Roger Deakins y la construcción del mundo visual en el cine de autor contemporáneo.',
 '2026-07-03', '7:00 PM', 'Auditorio Principal', 'Gratis'),

('taller',     'Taller',      'Edición y montaje audiovisual',
 'Introducción a técnicas de corte, ritmo narrativo y uso de software de edición. Requiere laptop. Nivel básico, no se necesita experiencia previa.',
 '2026-07-10', '9:00 AM', 'Sala de Sistemas 203', '$20.000'),

('cineforo',   'Cineforo',    'Cine de terror latinoamericano',
 '¿Cómo se construye el miedo desde nuestra cultura e identidad? Proyección y análisis de películas de terror producidas en América Latina.',
 '2026-07-18', '5:00 PM', 'Sala de Arte 101', 'Gratis'),

('festival',   'Festival',    'Semana del Cine Europeo',
 'Selección de los mejores títulos europeos del último año, presentados por la Alianza Francesa y el Instituto Goethe en colaboración con la institución.',
 '2026-08-03', '3:00 PM', 'Auditorio Principal', 'Gratis');
GO
