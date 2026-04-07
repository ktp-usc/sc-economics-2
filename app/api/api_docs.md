# API docs

## Applications
POST /api/applications
- Purpose: Submit a volunteer application
- Request body: { firstName, lastName, email, phone, street, city, state, zip, availability (string[]), skills, experience?, motivation, backgroundConsent (bool), dataConsent (bool) }
- Success: { data: application object } 201
- Errors: 400 missing/invalid fields, 400 consent not given, 500 server error


## Auth
POST /api/auth/login
- Purpose: Admin login
- Request body: { email, password }
- Success response: { message, user: { id, email } } 200
- Errors: 400 missing fields, 401 invalid credentials, 500 server error

## Events

POST /api/events/[id]/signup
- Purpose: Volunteer signs up for an event
- Auth: requires userId cookie (volunteer role only), returns 401 otherwise
- Path param: id (event id)
- Request body: { why, fromTime, toTime, certificate, expertise? }
- Success: created signup object 201
- Errors: 400 missing fields, 401 unauthenticated or not volunteer, 404 event not found, 409 already signed up, 500 server error

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
