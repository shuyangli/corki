# Development Plan

## Feature wishlist

- At a restaurant, the user should be able to:
    * describe their meal order, and the system should suggest broad types of wines to consider
    * describe their meal order and upload a photo of a wine menu, and the system should suggest specific wines to go with their order
    * or add a link to a menu (pdf or images) and the system should parse it similar to a photo when suggesting wines
- At a wine store, the user should be able to:
    * upload a photo of a wine shelf, and the system should suggest specific wines based on user's general preferences, with diversity and exploration in mind
- Online at a wine store:
    * at a specific wine listing page, the system should be able to tell how much a user would like that specific wine
    * the system should also be able to suggest wines to order
- The system should remember the user's past choices and feedback and use it to iteratively refine its suggestions

## System description

- The backend is built with FastAPI. Currently this only accepts one-shot requests, but we will build in conversation handling.
- We need to add a user authn layer.
- We need to add a user prompt and preference storage layer.
- We need to add a lightweight feedback layer - the server needs to keep track of any feedback the user provides and store them.
- We need to add monitoring and rate limiting.
- We need to robustly handle errors and log to somewhere observable.
