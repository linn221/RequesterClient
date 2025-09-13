# Context for Cursor Frontend Generation

## Project: Bug Hunting Record & Analysis Web Application

### Tech Stack

* Framework: Vue 3 with Option API
* State management: Vuex
* Routing: Vue Router
* Styling: Bootstrap
* HTTP: fetch API
* Components: .vue single file components
* Language: JavaScript

### UI Guidelines

* Minimal, simple, and clean design
* Tables/lists: clear and readable
* Forms: full-width input fields where appropriate
* Buttons: primary action buttons on the right-hand side
* Search bars: full-width
* Dropdowns: provide text suggestions that filter as user types

### UX Guidelines

* Provide loading states for all API calls
* Display errors from the API as plain text messages clearly
* Confirm delete actions with modal or prompt
* Render example/mock data from OpenAPI spec where available
* Session management handled via cookies; fetch requests should automatically include cookies

### Code Guidelines

* Keep JavaScript code simple and readable
* Avoid over-engineering; prefer clarity over clever tricks
* Modular and maintainable components
* Follow DRY. Example, The API url will change so store it in a constant, and reusing constant instead of hardcoding the url
* Include comments where necessary to clarify API integration or component purpose


### Authentication
* Authentication is done via a magic link with a secret. Frontend concern is to show Unauthenitcated page when the backend respond with 401 status code. There is no login or logout. If status code is not 401, the user is authenticated.

### Other Guidelines
* Note that not all resource has Create or Update. For example, requests will be created when importing .har file. There is no Create or Update form. The same for Jobs.
* CreatedAt, UpdatedAt should be displayed in format 'Jan 2 Friday 2025'
* Do not make additional API call if the existing API response already has it
* Request Listing Route, with a bunch of filters is the most critical part of the Application. Each request listing should have link to its related endpoint, program using endpoint_name,program_name as link text.
* Use npm