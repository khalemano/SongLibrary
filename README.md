# SongLibrary
Welcome to SongLibrary, a single page application for maintaining your own personal song library.
Here is a link to the [SongLibrary app hosted on Github Pages](https://khalemano.github.io/SongLibrary/songlist.html).
You should also be able to run the songlist.html page locally by cloning the repository.
The following sections explain the structure of the app and the decisions that went into its creation.

## Frontend
The frontend was written using the [AngularJS framework](https://angularjs.org/).
I chose AngularJS because it provides a comprehensive model-view-controller system in the frontend.
This keeps the view (songlist.html) concerned with the html layout and allows the heavy lifting to be done by the controller (app.min.js).
This also makes it easy to reuse certain html elements, for example, the modal that adds a song uses the same html elements as the modal that updates an existing song.
Because so much of the logic is contained in the javascript file, I included the non-minimized version in this github repo (app.js) for your review.

## CSS
The style of the page was coded using [Bootstrap](https://getbootstrap.com/).
I decided to use Bootstrap because of its layout system and its widgets, such as the alerts, badges, and modals.
The Bootstrap modal was utilized to create a popup to gather song information from the user when the user wants to update or add a song.
Some modifications were made to the CSS to conform more to the style of the [PERA website](https://www.copera.org).

## Tests
The unit tests were written in [Jasmine](https://jasmine.github.io/index.html) using the standalone spec runner.
This was chosen so that the tests could be executed directly from Github Pages or locally in a browser.
You can see how the tests were written in the app.spec.js file.
You can run the tests by viewing the [SpecRunner page](https://khalemano.github.io/SongLibrary/test/SpecRunner.html).

## Backend
The backend of the app is a [Glassfish server](https://javaee.github.io/glassfish) hosted on [Amazon Web Services (AWS)](https://aws.amazon.com/) that serves a static song list, that way you can reset the song list by refreshing your browser.
In order for Github Pages to make asynchronous calls to my AWS server, I set up an HTTPS connection and used the [Access-Control-Allow-Origin HTTP header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin) to allow cross-origin requests.
As requested, the servlet was programmed to randomly fail 1/5 of the save attempts.
