# API docs

## Auth
POST /api/auth/login
- Purpose: Admin login
- Request body: { email, password }
- Success response: { message, user: { id, email } } 200
- Errors: 400 missing fields, 401 invalid credentials, 500 server error

## Volunteers
POST /api/volunteers
- Purpose: Register a new volunteer
- Request body: { name, email, phone }
- Success: created volunteer object 201
- Errors: 400 missing fields, 409 email already registered

GET /api/volunteers
- Purpose: List all volunteers (admin)
- Request: none
- Success: array of volunteer objects 200

GET /api/volunteers/{id}
- Purpose: Get a specific volunteer's profile
- Path param: id
- Success: volunteer object 200
- Errors: 404 not found

PUT /api/volunteers/{id}
- Purpose: Update a volunteer's info
- Path param: id
- Request body: fields to update
- Success: updated volunteer object 200
- Errors: 400 invalid data, 404 not found
