CREATE DATABASE BD_AirCastles;
USE BD_AirCastles;

CREATE TABLE ubicacion (
    id INT PRIMARY KEY IDENTITY(1,1),
    ciudad NVARCHAR(100),
    pais NVARCHAR(100)
);

CREATE TABLE usuario (
    id INT PRIMARY KEY IDENTITY(1,1),
    nombre NVARCHAR(100),
    email NVARCHAR(100) UNIQUE,
    contraseña NVARCHAR(255),
    telefono NVARCHAR(20),
    rol NVARCHAR(50),
    ubicacion_id INT,
    fecha_registro DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ubicacion_id) REFERENCES ubicacion(id)
);

CREATE TABLE servicio (
    id INT PRIMARY KEY IDENTITY(1,1),
    nombre NVARCHAR(100),
    descripcion NVARCHAR(255)
);


CREATE TABLE estado_orden (
    id INT PRIMARY KEY IDENTITY(1,1),
    nombre NVARCHAR(50) NOT NULL
);


CREATE TABLE producto (
    id INT PRIMARY KEY IDENTITY(1,1),
    nombre NVARCHAR(100),
    descripcion NVARCHAR(255),
    precio NUMERIC(10,2),
    duracion_aprox NVARCHAR(50),
    servicio_id INT,
    origen_id INT,
    destino_id INT,
    FOREIGN KEY (servicio_id) REFERENCES servicio(id),
    FOREIGN KEY (origen_id) REFERENCES ubicacion(id),
    FOREIGN KEY (destino_id) REFERENCES ubicacion(id)
);


CREATE TABLE orden (
    id INT PRIMARY KEY IDENTITY(1,1),
    usuario_id INT,
    fecha DATETIME DEFAULT GETDATE(),
    estado_id INT,
    total NUMERIC(10,2),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    FOREIGN KEY (estado_id) REFERENCES estado_orden(id)
);


CREATE TABLE detalleorden (
    id INT PRIMARY KEY IDENTITY(1,1),
    orden_id INT,
    producto_id INT,
    cantidad INT,
    precio_unitario NUMERIC(10,2),
    FOREIGN KEY (orden_id) REFERENCES orden(id),
    FOREIGN KEY (producto_id) REFERENCES producto(id)
);

CREATE TABLE reserva (
    id INT PRIMARY KEY IDENTITY(1,1),
    usuario_id INT,
    producto_id INT,
    fecha_reserva DATETIME DEFAULT GETDATE(),
    estado NVARCHAR(50),
    observaciones NVARCHAR(255),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    FOREIGN KEY (producto_id) REFERENCES producto(id)
);


