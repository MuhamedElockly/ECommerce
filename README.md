## ECommerce (Angular) — Features

### Admin Features

- **Product management**
  - View product list (`/admin/products`).
  - Add new product (`/admin/add-product`).
  - Edit product (`/admin/edit-product/:id`).
  - Delete product (from product list actions).

- **Category management**
  - View category list (`/admin/categories`).
  - Add new category (`/admin/add-category`).
  - Edit category (`/admin/edit-category/:id`).
  - Delete category (from category list actions).

- **Access control**
  - Admin-only access via `AdminGuard`.

### User Features

- **Browse products**
  - Product catalog at `/user/products`.

- **Shopping cart**
  - Add products to cart.
  - Update item quantity.
  - Remove item from cart.
  - Clear entire cart.
  - Cart summary (total items/price) in the layout header.
  - Cart persists in `localStorage`.

- **Access control**
  - Customer-only area via `CustomerGuard`.

### Authentication & Authorization

- **Login / Register**
  - Guest-only access to `/login` and `/register` via `GuestGuard`.

- **JWT access token**
  - Token stored locally and attached to API calls through an HTTP interceptor.
  - Token expiration is checked to determine authentication state.

- **Refresh token flow**
  - Refresh token stored locally when provided by the backend.
  - Token refresh endpoint called to obtain a new access token using the stored refresh token.
  - On successful refresh, tokens and user state are updated and persisted.
  - On refresh failure or missing refresh token, user is treated as unauthenticated.

### Routing

- Default redirect to `/login`.
- Wildcard redirect to `/login` for unknown routes.
- Role-based guards: `AdminGuard`, `CustomerGuard`, `GuestGuard`.

### Other Behavior

- Global auth HTTP interceptor attaches the bearer token to requests.
- Basic error handling in auth and API flows.
- Checkout is currently a placeholder action in the cart.


# ECommerce

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.2.0.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
