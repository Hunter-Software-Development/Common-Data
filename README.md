# Common-Data

## Purpose

- Provide common data sources that are subject to occasionally change in an easy-to-use predictable, cheap/free format

## Prototype Roadmap

- Back End
  - Find 7-10 good data sources that can be consistantly and easily scraped and create methods to scrape them.
  - Build methods to store to database, compare diffs, and update selectively as needed.
  - Make stored data available as API endpoints
- Front End
  - Implement simplest version of Auth0 or Google login.
  - Assign user a rate-limited but non-expiring token.
  - Allow user to refresh their token
  - Provide clear, consistent documentation for all endpoints.
- Put it all together
  - Protect endpoints with tokens
  - Implement simple admin controls to manage the data
  - Ensure licenses are good to go
  - Build out test suite

## Running Locally

- Install Node, NPM, MongoDB (Compass)
- Clone Repository
- Uncomment "getDataFunctions.upsertAllData(getData, Data);" in app.js.  This will run an Insert/Update to your local database with the scraped data.
- Run "npm run devs" to run a nodemon server.
- API endpoints should be available at localhost:8080/presidents etc..

## Available Endpoints

- Everything in scraping/get_data
  - Continents
  - Countries
  - States
  - Counties
  - Cities
  - Airports
  - Presidents
  - Waffle Houses
