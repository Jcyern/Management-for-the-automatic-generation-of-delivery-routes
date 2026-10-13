# Frontend - Sistema de Gestión de Rutas de Reparto

Interfaz web del sistema para la generación automática de rutas de reparto en empresas de logística de última milla. Desarrollado como parte del proyecto conjunto de las asignaturas **Bases de Datos II** e **Ingeniería de Software** de la Facultad de Matemática y Computación, Universidad de La Habana, curso 2026-2027.

## Descripción

Este módulo implementa la capa de presentación del sistema. Permite a los distintos roles (coordinadores logísticos, repartidores, supervisores de operaciones y administradores) interactuar con la aplicación a través de una interfaz web moderna, intuitiva y multiplataforma.

Actualmente se encuentra en desarrollo activo. 

## Stack tecnológico

| Capa | Tecnología | Versión |
| :--- | :--- | :--- |
| Librería de UI | React | 19 |
| Lenguaje | TypeScript | 5.x |
| Herramienta de construcción | Vite | 7.x |
| Enrutamiento | React Router | 7.x |
| Estilos | CSS Modules + variables CSS | — |

## Requisitos previos

- **Node.js** 20.19+ o 22.12+ (recomendado: última LTS)
- **npm** 10+
- **Git**

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/Jcyern/Management-for-the-automatic-generation-of-delivery-routes.git
cd Management-for-the-automatic-generation-of-delivery-routes/Frontend

# 2. Instalar la versión correcta de Node.js (si usas NVM)
nvm install --lts
nvm use --lts

# 3. Instalar dependencias
npm install
```

## Uso en desarrollo
```bash
npm run dev
```
La aplicación estará disponible en http://localhost:5173.

