# TechStore Backend (Go + Gin)

## Run

```bash
cd backend
go mod tidy
go run .
```

Default port: `8080`.

## Endpoints

- `POST /register` -> `{ email, password, role }`
- `POST /login` -> `{ email, password }`
- `GET /products`
- `POST /products` (JWT, multipart: `name`, `description`, `price`, `categoryId`, `image`)
- `PUT /products/:id` (admin only)
- `DELETE /products/:id` (admin only)
- `GET /ws/products` (event `new_product`)

## JWT

- Header: `Authorization: Bearer <token>`
- Env override for secret: `JWT_SECRET`

