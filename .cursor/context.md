# Context for Cursor Frontend Generation

## Project: Bug Hunting Record & Analysis Web Application

### Tech Stack

* Framework: Vue 2 with Option API
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
* Include comments where necessary to clarify API integration or component purpose

